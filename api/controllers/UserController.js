/**
 * UserController
 *
 * @module :: Controller
 * @description :: Пользователи.
 */
var passport = require('passport');

var moment = require('moment');
moment.lang('ru');

module.exports = {

	profile: function (req, res) {
		sails.log.verbose('-> user.profile:');

		var findBy = {},
			whereBy = {},
			filterBy = {},
			filterByStatus = gct.getStatusByClass(req.query.status),
			filterByNoStatus = gct.getStatusByClass(req.query.nostatus),
			filterByVisibility = gct.getVisibilityByClass(req.query.visibility),
			currentPage = parseInt(req.param('param'), 10) || 1,
			sortBy,
			user = {
				login: req.param('user') || req.user.username,
				id: null,
				prefix: null
			};

		sails.log.verbose('currentPage:', currentPage);
		sails.log.verbose('filterByStatus:', filterByStatus);
		sails.log.verbose('filterByNoStatus:', filterByNoStatus);
		sails.log.verbose('filterByVisibility:', filterByVisibility);
		sails.log.verbose('user:', user);

		if (filterByStatus) {
			filterBy.status = filterByStatus
		}

		if (filterByNoStatus) {
			filterBy.nostatus = filterByNoStatus
		}

		if (filterByVisibility) {
			filterBy.visibility = filterByVisibility
		}

		if ((filterBy.visibility === 5 || filterBy.visibility === 6) && (!req.user || req.user.group < ugroup.mod)) {
			return res.json({
				status: 'err'
			});
		}

		sails.log.verbose('user:', user);
		sails.log.verbose('currentPage:', currentPage);

		async.waterfall([
			function checkData(callback) {
				if (user.login === req.user.username) {
					user.id = req.user.id;

					return callback(null);
				}

				gcdb.user.getByLogin(user.login, function (err, uid) {
					if (err) return callback(err);

					if (uid) {
						user.id = uid;

						callback(null);
					} else {
						res.notFound();
					}
				});
			},
			function getCapitalizedLogin(callback) {
				if (user.login !== req.user.username) {
					gcdb.user.getCapitalizedLogin(user.login, function(err, login) {
						if (err) return callback(err);

						user.login = login;

						callback(null);
					});
				} else {
					callback(null);
				}
			},
			function findTickets(callback) {
				findBy.owner = user.id;

				if (!filterBy.visibility && !filterBy.status) {
					whereBy = {
						status: {
							'!': 5,
							'!': 6
						}
					};

					if (!findBy.owner && (!req.user || req.user.group <= ugroup.mod)) {
						findBy.visiblity = 1;
					}
				}
				if (filterBy.status) {
					findBy.status = filterBy.status;

					if (!findBy.owner && (!req.user || req.user.group <= ugroup.mod)) {
						findBy.visiblity = 1;
					}
				}
				if (filterBy.nostatus) {
					whereBy = {
						status: {
							'!': 5,
							'!': 6,
							'!': filterBy.nostatus
						}
					};
				}
				if (filterBy.visibility && req.user && req.user.group >= ugroup.mod) {
					findBy.visiblity = filterBy.visibility;

					if (!filterByStatus) {
						whereBy = {
							status: {
								'!': 5,
								'!': 6
							}
						};
					}
				}

				sails.log.verbose('findBy: ', findBy);
				sails.log.verbose('whereBy: ', whereBy);

				if (req.param('byModifed')) {
					sortBy = 'updatedAt DESC';
				} else {
					sortBy = 'id DESC';
				}

				sails.log.verbose('sortBy:', sortBy);

				Ticket.find(findBy)
					.where(whereBy)
					.sort(sortBy)
					.done(function (err, tickets) {
						if (err) return callback(err);

						sails.log.verbose('tickets.length: ', tickets.length);

						callback(null, tickets);
					});
			},
			function getUserInfo(tickets, callback) {
				Rights.find({
					uid: user.id
				}).done(function(err, rights) {
					if (err) return callback(err);

					user.prefix = (rights[0]) ? rights[0].prefix : '';

					callback(null, tickets);
				});
			},
			function viewTickets(tickets, callback) {
				var lastPage =  Math.ceil(tickets.length / 20);
				var skipRows = (currentPage - 1) * 20;

				sails.log.verbose('lastPage: ', lastPage);
				sails.log.verbose('skipRows: ', skipRows);

				if (tickets.length <= skipRows) {
					return res.view('user/notickets', {
						user: user,
						type: {}
					});
				}

				tickets = tickets.slice(skipRows, skipRows + 20);

				var query = (req.originalUrl.split('?')[1]) ? '?' + req.originalUrl.split('?')[1] : '';

				gct.all.serializeList(tickets, function (err, result) {
					if (err) return callback(err);

					res.view('user/profile',{
						moment: moment,
						tickets: result,
						lastPage: lastPage,
						currentPage: currentPage,
						query: query,
						user: user,
						type: {}
					});

					callback(null);
				});
			}
		],
		function (err) {
			if (err) {
				if (err.msg) {
					return res.json({
						err: err.msg
					});
				}
				throw err;
			}
		});
	},

	loginTpl: function (req, res) {
		var message;
		if (req.query.errcode === '1') message = 'Требуется вход в систему';

		res.view('user/login', {
			layout: false,
			message: message
		});
	},

	login: function (req, res) {
		passport.authenticate('local', function (err, user, info) {
			if (!user) {
				if (info.message === 'Missing credentials') info.message = 'Введите логин/пароль';
				return res.json({
					error: info
				});
			}
			req.logIn(user, function (err) {
				if (err) {
					return new Error(err);
				}
				res.redirect('/');
				return;
			});
		})(req, res);
	},

	logout: function (req, res) {
		req.logout();
		res.redirect('/');
	}

};

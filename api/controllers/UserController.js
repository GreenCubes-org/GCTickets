/**
 * UserController
 *
 * @module :: Controller
 * @description :: Пользователи.
 */
var passport = require('passport');

var moment = require('moment');
module.exports = {

	profile: function (req, res) {
		moment.lang((req.user) ? req.user.locale : sails.userLocale);

		// GET /tickets?cake=isalie&visibility=1&status=1,5,10&product=1&type=3
		var sort = parseInt(req.param('sort'), 10),
			visibility = parseInt(req.param('visibility'), 10),
			/* On input: '1,2,3' on output: [1, 2, 3]
				'1,g,3' -> [1, NaN, 3] */
			status = ((req.param('status')) ? req.param('status').split(',').map(function (el) {
				el = parseInt(el, 10);
				if (el && (1 >= el <= 12)) {
					return parseInt(el, 10);
				} else {
					return;
				}
			}) : null),
			statusJoined = (status) ? status.join(',') : null,
			product = ((req.param('product')) ? req.param('product').split(',').map(function (el) {
				el = parseInt(el, 10);
				if (el && [1,2,5].indexOf(el) !== -1) {
					return parseInt(el, 10);
				} else {
					return;
				}
			}) : null),
			productJoined = (product) ? product.join(',') : null,
			type = ((req.param('type')) ? req.param('type').split(',').map(function (el) {
				el = parseInt(el, 10);
				if (el && (1 >= type <= 4)) {
					return el;
				} else {
					return;
				}
			}) : null),
			typeJoined = (type) ? type.join(',') : null,
			currentPage = parseInt(req.param('param'), 10) || ((req.param('page')) ? parseInt(req.param('page'), 10) : 1),
			user = {
				login: req.param('user') || req.user.username,
				id: null,
				prefix: null,
				pinfo: null,
				current: {
					id: (req.user) ? req.user.id : null,
					group: (req.user) ? req.user.group : null,
					canModerate: (req.user) ? req.user.canModerate : null
				}
			};

		sails.log.verbose('visibility: ', visibility);
		sails.log.verbose('req.param(\'visibility\'): ', req.param('visibility'));
		sails.log.verbose('sort: ', sort);
		sails.log.verbose('req.param(\'sort\'): ', req.param('sort'));
		sails.log.verbose('status: ', status);
		sails.log.verbose('req.param(\'status\'): ', req.param('status'));
		sails.log.verbose('product: ', product);
		sails.log.verbose('req.param(\'product\'): ', req.param('product'));
		sails.log.verbose('type: ', type);
		sails.log.verbose('req.param(\'type\'): ', req.param('type'));

		/* Check and convert data */

		if (sort && !(1 >= sort <= 3)) {
			return res.badRequest();
		}

		if (visibility && !(0 >= visibility <= 2)) {
			return res.badRequest();
		}

		// Undefined = Wrong input
		if ((status && status.indexOf(undefined) !== -1) || (product && product.indexOf(undefined) !== -1) || (type && type.indexOf(undefined) !== -1)) {
			return res.badRequest();
		}

		/* Perform user-specific checks */
		if (status && (status.indexOf(5) !== -1 || status.indexOf(6) !== -1) && (!req.user || req.user.group < ugroup.helper)) {
			return res.forbidden();
		}

		async.waterfall([
			function getUId(callback) {
				gcdb.user.getByLogin(user.login, function (err, uid) {
					if (err) return callback(err);

					if (uid) {
						user.id = uid;

						callback(null);
					} else {
						res.badRequest();
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
			function getUserInfo(callback) {
				User.find({
					uid: user.id
				}).exec(function(err, rights) {
					if (err) return callback(err);

					user.prefix = (rights[0]) ? rights[0].prefix : '';

					callback(null);
				});
			},
			function getPInfo(callback) {
				gct.user.getPInfo(user.login, function (err, result) {
					if (err) return callback(err);

					user.pinfo = result;

					callback(null);
				});
			},
			function findTickets(callback) {
				gct.getList({
					visibility: visibility,
					status: status,
					type: type,
					product: product,
					sort: sort,
					user: user
				}, function (err, tickets) {
					if (err) return callback(err);

					callback(null, tickets);
				});
			},
			function viewTickets(tickets, callback) {
				var lastPage = Math.ceil(tickets.length / 20);
				var skipRows = (currentPage - 1) * 20;

				sails.log.verbose('lastPage: ', lastPage);
				sails.log.verbose('skipRows: ', skipRows);

				if (tickets.length <= skipRows) {
					return res.view('user/notickets', {
						type: (type) ? type : [],
						product: (product) ? product : [],
						status: (status) ? status : [],
						sort: sort,
						visibility: visibility,
						user: user
					});
				}

				tickets = tickets.slice(skipRows, skipRows + 20);

				var query = (req.originalUrl.split('?')[1]) ? '?' + req.originalUrl.split('?')[1] : '';

				gct.all.serializeList(tickets, function (err, result) {
					if (err) return callback(err);

					res.view('user/profile', {
						moment: moment,
						tickets: result,
						lastPage: lastPage,
						currentPage: currentPage,
						query: query,
						type: (type) ? type : [],
						product: (product) ? product : [],
						status: (status) ? status : [],
						sort: sort,
						visibility: visibility,
						user: user
					});

					callback(null);
				});
			}
		], function (err) {
			if (err) {
				if (err.msg) {
					return res.json({
						err: err.msg
					});
				}
				return res.serverError(err);
			}
		});
	},

	profileOld: function (req, res) {
		sails.log.verbose('-> user.profile:');

		var findBy = {},
			whereBy = {},
			filterBy = {},
			filterByStatus = gct.getStatusByClass(req.query.status),
			filterByNoStatus = gct.getStatusByClass(req.query.nostatus),
			filterByVisibility = gct.getVisibilityByClass(req.query.visibility),
			currentPage = parseInt(req.param('page'), 10) || 1,
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

		if (filterByVisibility && req.user && req.user.group >= ugroup.helper) {
			filterBy.visibility = filterByVisibility;
		} else if (filterByVisibility && (!req.user || (req.user.group < ugroup.helper))) {
			return res.forbidden();
		}

		if ((filterBy.visibility === 5 || filterBy.visibility === 6) && (!req.user || req.user.group < ugroup.helper)) {
			return res.forbidden();
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

					if ((!req.user || req.user.group < ugroup.helper) && req.user.id !== user.id) {
						findBy.visiblity = 1;
					}
				}
				if (filterBy.status) {
					findBy.status = filterBy.status;

					if ((!req.user || req.user.group < ugroup.helper) && req.user.id !== user.id) {
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
				if (filterBy.visibility && req.user && req.user.group >= ugroup.helper) {
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
					.exec(function (err, tickets) {
						if (err) return callback(err);

						sails.log.verbose('tickets.length: ', tickets.length);

						callback(null, tickets);
					});
			},
			function getUserInfo(tickets, callback) {
				User.find({
					uid: user.id
				}).exec(function(err, rights) {
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
				return res.serverError(err);
			}
		});
	},

	settingsTpl: function (req, res) {
		User.findOne({uid: req.user.id}).exec(function(err, user) {
			if (err) return res.serverError(err);

			res.view('user/settings', {
				settings: {
					startPage: (user.startPage) ? user.startPage : '',
					prefix: (user.prefix) ? user.prefix : '—',
					role: (user.ugroup !== undefined) ? gct.user.getGroupString(user.ugroup) : '—',
					language: (req.language) ? sails.__({phrase: 'global.language.' + req.language,locale: req.language}) : '—',
				}
			});
		});
	},

	settings: function (req, res) {
		if (req.param('startPage') && req.param('startPage').split('.').length === 1) {
			User.findOne({uid: req.user.id}).exec(function(err, user) {
				if (err) return res.serverError(err);

				user.startPage = req.param('startPage');

				user.save(function (err) {
					if (err) return res.serverError(err);

					res.json({
						code: 'OK'
					});
				});
			});
		} else if (sails.config.i18n.locales.indexOf(req.param('language')) !== -1) {
			User.findOne({uid: req.user.id}).exec(function(err, user) {
				if (err) return res.serverError(err);

				user.locale = req.param('language');

				user.save(function (err) {
					if (err) return res.serverError(err);

					res.json({
						code: 'OK'
					});
				});
			});
		} else{
			res.badRequest();
		}
	},

	loginTpl: function (req, res) {
		var message;
		if (req.query.errcode === '1') message = sails.__('controller.user.loginTpl.needlogin');

		res.view('user/login', {
			layout: false,
			message: message,
			redirectto: (req.query.redirectto) ? req.query.redirectto : null
		});
	},

	login: function (req, res) {
		async.waterfall([
			function authenticate(callback) {
				passport.authenticate('local', function (err, user, info) {
					if (!user) {
						if (info.message === 'Missing credentials') info.message = sails.__('controller.user.login.missingcredentials');

						return res.json({
							error: info
						});
					}

					callback(null, user);
				})(req, res);
			},
			function logIn(user, callback) {
				req.logIn(user, function (err) {
					if (err) return callback(err);

					callback(null, user);
				});
			},
			function checkUserTable(origUser, callback) {
				User.findOrCreate({uid: origUser.id}).exec(function (err, user) {
					if (err) return callback(err);

					if (user.prefix === undefined && user.canModerate === undefined) {
						user.uid = origUser.id;
						user.canModerate = [];
						user.ugroup = 0;
						user.startPage = '/all';

						user.save(function (err) {
							if (err) return callback(err);
							callback(null);
						});

						return;
					}

					callback(null);
				});
			}
		], function (err) {
			if (err) return res.serverError(err);

			if (req.body.redirectto) {
				return res.json({
					redirectto: 'http://' + req.host + req.body.redirectto
				});
			}

			res.redirect('/');
		});
	},

	logout: function (req, res) {
		req.logout();
		res.redirect('/');
	}

};

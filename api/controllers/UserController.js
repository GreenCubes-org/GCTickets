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

		var whereBy,
			user = {
				login: req.param('user') || req.user.username,
				id: null,
				prefix: null
			},
			currentPage = parseInt(req.param('page'), 10) || 1;

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
			function findUserTickets(callback) {
				var whereBy = {};
				if (!req.user || req.user.group <= ugroup.mod) {
					whereBy = {
						status: {
							'!': 5,
							'!': 6
						},
						visiblity: {
							'!': 2
						}
					};
				}

				sails.log.verbose('whereBy: ', whereBy);

				Ticket.find({
					owner: user.id
				}).where(whereBy)
					.sort('id DESC')
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

					user.prefix = rights[0].prefix;

					callback(null, tickets);
				});
			},
			function viewTickets(tickets, callback) {
				var lastPage =  Math.ceil(tickets.length / 20);
				var skipRows = (currentPage - 1) * 20;

				sails.log.verbose('lastPage: ', lastPage);
				sails.log.verbose('skipRows: ', skipRows);

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
						user: user
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

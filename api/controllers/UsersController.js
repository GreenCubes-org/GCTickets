/**
 * UsersController
 *
 * @module :: Controller
 * @description :: Контроллер пользователей.
 */

var passport = require('passport'),
	moment = require('moment');

module.exports = {
	
	login: function (req, res) {
		res.redirect(appConfig.oauth2.loginURL);
	},
	
	logout: function (req, res) {
		req.logout();
		// TODO: Сделать flash-сообщение о том, что всё прошло успешно
		res.redirect('/');
	},
	
	callback: function (req, res) {
		passport.authenticate('oauth2', function (err, user, info) {
			if (!user) {
				return res.json({
					error: info
				});
			}
			req.logIn(user, function (err) {
				if (err) {
					throw err;
				}
				res.redirect('/');
			});
		})(req, res);
	},

	profile: function (req, res) {
		var user = {
				login: req.param('user') || req.user.username,
				id: null,
				prefix: null,
				pinfo: null,
				current: {
					id: (req.user) ? req.user.id : null,
					group: (req.user) ? req.user.group : null,
					canModerate: (req.user) ? req.user.canModerate : null
				}
			},
			statistics = {
				tickets: {
					all: {
						open: null,
						solved: null
					},
					lastMonth: {
						open: null,
						solved: null
					}
				},
				comments: {
					all: {
						count: null,
						withStatus: null
					},
					lastMonth: {
						count: null,
						withStatus: null
					}
				}
			},
			monthAgo = Date.now() - 2629800000; // 1 month in ms

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
				Users.find({
					uid: user.id
				}).exec(function(err, rights) {
					if (err) return callback(err);

					user.prefix = (rights[0]) ? rights[0].prefix : '';

					callback(null);
				});
			},
			function getPInfo(callback) {
				gch.user.getPInfo(user.login, function (err, result) {
					if (err) return callback(err);

					user.pinfo = result;

					callback(null);
				});
			},
			function getAllTicketsStatistics(callback) {
				gcdb.appdb.query('SELECT count(*) AS count FROM `tickets` WHERE `owner` = ?', user.id, function (err, result) {
					if (err) return callback(err);

					statistics.tickets.all.open = result[0].count;

					gcdb.appdb.query('SELECT count(*) AS count FROM `tickets` WHERE `owner` = ? AND `status` IN (10,12)', user.id, function (err, result) {
						if (err) return callback(err);

						statistics.tickets.all.solved = result[0].count;

						callback(null);
					});
				});
			},
			function getLastMonthTicketsStatistics(callback) {
				gcdb.appdb.query('SELECT count(*) AS count FROM `tickets` WHERE `owner` = ? AND UNIX_TIMESTAMP(`createdAt`) >= ' + monthAgo, user.id, function (err, result) {
					if (err) return callback(err);

					statistics.tickets.lastMonth.open = result[0].count;

					gcdb.appdb.query('SELECT count(*) AS count FROM `tickets` WHERE `owner` = ? AND `status` IN (10,12) AND UNIX_TIMESTAMP(`createdAt`) >= ' + monthAgo, user.id, function (err, result) {
						if (err) return callback(err);

						statistics.tickets.lastMonth.solved = result[0].count;

						callback(null);
					});
				});
			},
			function getAllCommentsStatistics(callback) {
				gcdb.appdb.query('SELECT count(*) AS count FROM `comments` WHERE `author` = ?', user.id, function (err, result) {
					if (err) return callback(err);

					statistics.comments.all.count = result[0].count;

					gcdb.appdb.query('SELECT count(*) AS count FROM `comments` WHERE `author` = ? AND `changedTo` IS NOT NULL', user.id, function (err, result) {
						if (err) return callback(err);

						statistics.comments.all.withStatus = result[0].count;

						callback(null);
					});
				});
			},
			function getLastMonthCommentsStatistics(callback) {
				gcdb.appdb.query('SELECT count(*) AS count FROM `comments` WHERE `author` = ? AND UNIX_TIMESTAMP(`createdAt`) >= ' + monthAgo, user.login, function (err, result) {
					if (err) return callback(err);

					statistics.comments.lastMonth.count = result[0].count;

					gcdb.appdb.query('SELECT count(*) AS count FROM `comments` WHERE `author` = ? AND `changedTo` IS NOT NULL AND UNIX_TIMESTAMP(`createdAt`) >= ' + monthAgo, user.login, function (err, result) {
						if (err) return callback(err);

						statistics.comments.lastMonth.withStatus = result[0].count;

						callback(null);
					});
				});
			},
			function findTickets(callback) {
				gch.ticket.getList({
					user: user
				}, function (err, tickets) {
					if (err) return callback(err);

					callback(null, tickets);
				});
			},
			function viewTickets(tickets, callback) {
				var lastPage = Math.ceil(tickets.length / 20);
				var skipRows = 0;

				sails.log.verbose('lastPage: ', lastPage);
				sails.log.verbose('skipRows: ', skipRows);

				if (tickets.length <= skipRows) {
					res.view('users/profile', {
						moment: moment,
						tickets: [],
						user: user,
						statistics: statistics
					});

					callback(null);
				}

				tickets = tickets.slice(skipRows, skipRows + 20);

				var query = (req.originalUrl.split('?')[1]) ? '?' + req.originalUrl.split('?')[1] : '';

				gch.ticket.serializeList(tickets, function (err, result) {
					if (err) return callback(err);

					res.view('users/profile', {
						moment: moment,
						tickets: result,
						user: user,
						statistics: statistics
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
	}
	
};

var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2').Strategy;
var mysql = require('mysql');
var crypto = require('crypto');
var flash = require('connect-flash');
var express = require('../node_modules/sails/node_modules/express');

var expressValidator = require('express-validator');

var cfg = require('./local.js');

appdbconn = mysql.createPool({
	host: cfg.appdb.host,
	database: cfg.appdb.database,
	user: cfg.appdb.user,
	password: cfg.appdb.password
});

passport.serializeUser(function (user, done) {
	done(null, user.uid);
});

passport.deserializeUser(function (id, done) {
	async.waterfall([

		function getUserCredentials(callback) {
				gcdbconn.query('SELECT login, password FROM users WHERE id = ?', [id], function (err, result, fields) {
					if (err) return callback(err);

					callback(null, {
						id: id,
						username: result[0].login,
						password: result[0].password
					});
				});
		},
		function getUserRights(user, callback) {
				appdbconn.query('SELECT * FROM user WHERE uid = ?', [id], function (err, result) {
					if (err) return callback(err);

					if (result.length !== 0) {
						user.group = result[0].ugroup;
						user.prefix = result[0].prefix;
						user.colorclass = result[0].colorclass;
						user.canModerate = result[0].canModerate;
						user.startPage = (result[0].startPage) ? result[0].startPage : '/all';
					} else {
						user.group = 0; // User have group 0 by default
						user.canModerate = [];
						user.startPage = '/all';
					}

					user.id = user.uid;

					callback(null, user);
				});
		}
	],
		function (err, user) {
			if (err) return done(err);

			done(null, user);
		})
});

module.exports = {

	// Init custom express middleware
	express: {
		customMiddleware: function (app) {
			passport.use(new OAuth2Strategy({
				authorizationURL: cfg.oauth2.authorizationURL,
				tokenURL: cfg.oauth2.tokenURL,
				clientID: cfg.oauth2.clientID,
				clientSecret: cfg.oauth2.clientSecret,
				callbackURL: cfg.oauth2.callbackURL
			}, function(accessToken, refreshToken, profile, done) {
					gcdb.user.getByLogin(accessToken.username, 'gcdb', function (err, uid) {
						User.findOrCreate({uid: uid}, function (err, user) {
							if (!user) {
								if (err) return done(err);

								user.uid = uid;

								user.group = 0; // User have group 0 by default
								user.canModerate = [];
								user.startPage = '/all';
								//user.locale = 'ru';

								user.save(function (err, user) {
									return done(err, user);
								});
							} else {
								return done(err, user);
							}
						});
					});
				}
			));

			app.use(passport.initialize());
			app.use(passport.session());

			app.use(expressValidator());

			app.use(flash());

			// Back button exceptions.
			app.use(function (req, res, next) {

				if (sails.history && ['/comments', '/csrfToken'].indexOf(req.path) === -1 && sails.history[0] !== req.url) {
					sails.history = [
						req.url,
						sails.history[0],
						sails.history[1],
						sails.history[2],
						sails.history[3],
					]
				} else if (!sails.history) {
					sails.history = [ req.url ];
				}


				if (['/comments', '/csrfToken'].indexOf(req.path) === -1 && ['all', 'bugreports','rempros','bans','unbans','admreqs','user','users'].indexOf(req.path.split('/')[1]) !== -1) {
					sails.historySpec = req.url;
				}

				next();
			});

			app.locals({
				version: require('../package.json').version,
				scripts: ['jquery.js', 'sem.js', 'uscore.js'],
				renderJSTags: function (all) {
					if (all !== undefined) {
						return all.map(function (scripts) {
							app.locals.scripts = ['jquery.js', 'sem.js', 'uscore.js'];
							return '<script src="/js/' + scripts + '" type="text/javascript"></script>';
						}).join('\n ');
					} else {
						return '';
					}
				},
				styles: ['sem.css', 'res.css'],
				renderCSSTags: function (all) {
					app.locals.styles = ['sem.css', 'res.css'];
					if (all !== undefined) {
						return all.map(function (styles) {
							return '<link href="/styles/' + styles + '" type="text/css" rel="stylesheet" />';
						}).join('\n ');
					} else {
						return '';
					}
				}
			});
		},

		bodyParser: function () {
			return express.bodyParser();
		}

	}
};

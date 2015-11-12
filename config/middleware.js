var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2').Strategy;
var mysql = require('mysql');
var crypto = require('crypto');

var expressValidator = require('express-validator');
var flash = require('connect-flash');

var appConfig = require('./local.js');

passport.serializeUser(function (user, done) {
	done(null, user.uid);
});

passport.deserializeUser(function (id, done) {
	var user = {
		id: null,
		gameId: id,
		username: null,
		group: null,
		canModerate: null,
		prefix: null
	};

	async.waterfall([
		function getUserId(callback) {
			gcdb.sitedb.query('SELECT id, login FROM users WHERE game_id = ?', [user.gameId], function (err, result) {
				if (err) return callback(err);

				user.id = result[0].id;
				user.username = result[0].login;

				callback(null, user);
			});
		},
		function getUserRights(user, callback) {
			gcdb.appdb.query('SELECT * FROM users WHERE uid = ?', [user.id], function (err, result) {
				if (err) return callback(err);

				if (result.length !== 0) {
					user.group = result[0].ugroup;
					user.prefix = result[0].prefix;
					user.canModerate = result[0].canModerate;
				} else {
					user.group = 0; // User have group 0 by default
					user.canModerate = [];
				}

				callback(null, user);
			});
		}
	],
	function (err, user) {
		if (err) return done(err);

		done(null, user);
	});
})

module.exports = {

	// Init custom express middleware
	express: {
		customMiddleware: function (app) {
			passport.use(new OAuth2Strategy({
				authorizationURL: appConfig.oauth2.authorizationURL,
				tokenURL: appConfig.oauth2.tokenURL,
				clientID: appConfig.oauth2.clientID,
				clientSecret: appConfig.oauth2.clientSecret,
				callbackURL: appConfig.oauth2.callbackURL
			}, function (accessToken, refreshToken, profile, done) {
				Users.findOrCreate({
					gameId: accessToken.userId
				}, function (err, user) {
					if (!user.uid) {
						if (err) return done(err);

						user.uid = accessToken.userId;

						user.group = 0; // User have group 0 by default
						user.canModerate = [];

						user.save(function (err, user) {
							return done(err, user);
						});
					} else {
						return done(err, user);
					}
				});
			}));

			app.use(passport.initialize());
			app.use(passport.session());

			app.use(expressValidator());

			app.use(flash());
		}
	}
};

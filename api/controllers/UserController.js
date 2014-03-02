/**
 * UserController
 *
 * @module :: Controller
 * @description :: Пользователи.
 */
var passport = require('passport'),
	gct = require('../../utils/gct');

var moment = require('moment');
moment.lang('ru');

module.exports = {

	loginTpl: function (req, res) {
		res.view('user/login');
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
	},

	profileTpl: function (req, res) {
		login = req.param('user');
		gct.user.getProfile(login, function (err, user) {
			if (err) throw err;

			res.view('user/profile', {
				user: user,
				moment: moment
			});
		});
	}

};
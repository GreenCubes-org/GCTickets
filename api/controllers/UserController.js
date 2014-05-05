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

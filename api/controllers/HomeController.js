/**
* HomeController
*
* @module :: Controller
* @description :: Logic of main page and auth.
*/
var passport = require('passport');

var HomeController = {

	index: function (req,res)
	{
		if (!req.user) {
			res.view({
				message: null || req.flash('error')
			})}
		else {
			res.redirect('/all')
		}
	},

	login: function (req,res){
		res.redirect('/');
		
	},

	doLogin: function(req, res) {
		passport.authenticate('local', { failureRedirect: '/', failureFlash: true},
		function (err, user) {
				req.logIn(user, function (err) {
					if (err) {
						console.log(err);
						res.view('500');
						return;
					}
					res.redirect('/');
					return;
				});
		})(req, res);
	},

	logout: function(req, res){
		req.logout();
		res.redirect('/');
	}

};
module.exports = HomeController;

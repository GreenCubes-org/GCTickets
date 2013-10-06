/**
* HomeController
*
* @module :: Controller
* @description :: Contains logic for handling requests.
*/
var passport = require('passport');

var HomeController = {

	index: function (req,res)
	{
		if (!req.user) {
			res.view({
				message: null 
			})}
		else {
			res.redirect('/all')
		}
	},
	
	list: function (req,res)
	{
		if (!req.user) {
			res.redirect('/')}
		else {
			res.view({user: req.user})
		}
		
	},

	create: function (req,res)
	{
		if (!req.user) {
			res.redirect('/')}
		else {
			res.view({user: req.user})
		}
		
	},

	'login': function(req, res) {
		passport.authenticate('local', { failureRedirect: '/'},
		function (err, user, next) {
				if(!user){ return res.view('home/index',{message: "Пустое имя пользователя"}); } 
				req.logIn(user, function (err) {
					if (err) {
						console.log(err);
						res.view('500');
						return;
					}
					res.redirect('/');
					return next();
				});
		},
		function(req, res) {
			if (!req.body.remember_me) { return; }

			var token = utils.generateToken(64);
			Token.save(token, { userId: req.user.id }, function(err) {
			  if (err) { return done(err); }
			  res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
			  return;
			});
		})(req, res);
	},

	'logout': function(req, res){
		req.logout();
		res.redirect('/');
	}


};
module.exports = HomeController;

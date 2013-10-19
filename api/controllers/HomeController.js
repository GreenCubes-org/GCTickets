/**
* HomeController
*
* @module :: Controller
* @description :: Logic of main page and auth.
*/
var passport = require('passport');

var HomeController = {

  index: function (req,res) {
    if (!req.user) {
      res.view({
        message: undefined
      })}
    else {
      res.redirect('/all')
    }
  },

  login: function (req,res){
    if (!req.user) {
      res.view('home/index', {
        message: req.flash('error')
      })}
    else {
      res.redirect('/all')
    }
  },

  doLogin: function (req, res) {
    passport.authenticate('local', { failureRedirect: '/login'}, function (err, user, info) {
        if (!user) {
          return res.view('home/index', {message: 'Неверный логин или пароль'})
        }
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

  logout: function (req, res) {
    req.logout();
    res.redirect('/');
  }

};
module.exports = HomeController;

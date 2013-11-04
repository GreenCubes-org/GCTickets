/**
* HomeController
*
* @module :: Controller
* @description :: Главная страница и авторизация.
*/
var passport = require('passport');

module.exports = {

  index: function (req,res) {
    res.redirect('/all')
  },

  login: function (req,res){
    if (!req.user) {
      res.view('home/index')
    } else {
      res.redirect('/all')
    }
  },

  doLogin: function (req, res) {
    passport.authenticate('local', function (err, user,info) {
        if (!user) {
          if (info.message === 'Missing credentials') info.message = 'Введите логин/пароль';
          return res.json({error: info});
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

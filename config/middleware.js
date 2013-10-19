var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var crypto = require('crypto');
var flash = require('connect-flash');

var local = require('./local.js');

var client = mysql.createConnection({
      host: local.userdb.host,
      database: local.userdb.database,
      user: local.userdb.user,
      password: local.userdb.password
   });

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
   client.query('SELECT login, passhash FROM users WHERE id = ?',
              [id], function(err, result, fields) {
       var user = {
           id : id,
           username : result[0].login,
           password : result[0].passhash};
       done(err, user);
       client.end();
  });
});

module.exports = {
  
  // Init custom express middleware
  express: {
    customMiddleware: function (app) {
      var local = require('./local.js');

      passport.use(new LocalStrategy(function(username, password, done) {
        username = username.replace(/[^a-zA-Z0-9_-]/g,'');
        client.query('SELECT id, passhash FROM users WHERE login = ?',
          [username], function (err, result, fields) {
            // database error
            if (err) {
              return done(err);
            // username not found
            } else if (result.length === 0) {
              return done(null, false, {message: 'Неизвестный пользователь'});
            // check password
            } else {
              var passwd  = result[0].passhash.split('$');
              if (passwd.length == 1) {
                var hash = crypto.createHash('md5')
                              .update(password)
                              .digest('hex');
              }
              else {
                var hash = crypto.createHash('sha1')
                              .update(passwd[0] + password)
                              .digest('hex');
              }
              // if md5 passwords match
              if (passwd.length === 1 && passwd[1] === hash) {
                  var user = {id : result[0].id,
                              username : username,
                              password : hash };
                  return done(null, user);
              // if sha1 passwords match
              } else if (passwd.length !== 1 && passwd[2] === hash) {
                var user = {id : result[0].id,
                              username : username,
                              password : hash };
                return done(null, user);
              } else {
                return done(null, false, {message: 'Неверный пароль'});
              }
           }
           client.end();
         });
      }));

      app.use(passport.initialize());
      app.use(passport.session());

      app.use(flash());
      
      app.locals({
        version: require('../package.json').version,
        scripts: [],
        renderJSTags: function (all) {
          app.locals.scripts = ['jquery.js','sem.js'];
          if (all != undefined) {
            return all.map(function(scripts) {
              return '<script src="/js/' + scripts + '"></script>';
            }).join('\n ');
          }
          else {
            return '';
          }
        },
        styles: [],
        renderCSSTags: function (all) {
          app.locals.styles = ['sem.css','main.css','res.css'];
          if (all != undefined) {
            return all.map(function(styles) {
              return '<link href="/styles/' + styles + '" type="text/css" rel="stylesheet" />';
            }).join('\n ');
          }
          else {
            return '';
          }
        }
      })
    }
  }

};

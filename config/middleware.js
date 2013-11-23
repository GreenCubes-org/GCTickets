var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var crypto = require('crypto');
var flash = require('connect-flash');

var expressValidator = require('express-validator');

//FIXME: Поменять на глобальную переменную
var cfg = require('./local');

var client = mysql.createConnection({
			 host: cfg.gcdb.host,
			 database: cfg.gcdb.database,
			 user: cfg.gcdb.user,
			 password: cfg.gcdb.password
		});

passport.serializeUser(function(user, done) {
	done(null, user.id);
});
passport.deserializeUser(function(id, done) {
	client.query('SELECT login, password FROM users WHERE id = ?',
								 [id], function(err, result, fields) {
		 if (err){
			 done(err);
		 } else {
			var user = {
						id : id,
						username : result[0].login,
						password : result[0].password
						};
			done(err, user);
		 }
	});
});

module.exports = {
	
	// Init custom express middleware
	express: {
		 customMiddleware: function (app) {

			 passport.use(new LocalStrategy(function(username, password, done) {
					username = username.replace(/[^a-zA-Z0-9_-]/g,'');
					client.query('SELECT id, password, activation_code FROM users WHERE login = ?',
						[username], function (err, result) {
							 // database error
							 if (err) {
								 return done(err);
							 // username not found
							 } else if (result.length === 0) {
								 return done(null, false, {message: 'Неизвестный пользователь'});
							 // check password
							 } else if (result[0].activation_code === undefined) {
								 return done(null, false, {message: 'Аккаунт не активирован'});
							 } else {
								 var passwd = result[0].password.split('$');
								 var hash;
								 if (passwd.length == 1) {
									hash = crypto.createHash('md5')
																	 .update(password)
																	 .digest('hex');
								 }
								 else {
									hash = crypto.createHash('sha1')
																	 .update(passwd[1] + password)
																	 .digest('hex');
								 }
								 // if md5 passwords match
								 if (passwd.length === 1 && passwd[0] === hash) {
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
					 });
			 }));

			 app.use(passport.initialize());
			 app.use(passport.session());

			 app.use(expressValidator());

			 app.use(flash());
			 
			 app.locals({
					version: require('../package.json').version,
					scripts: ['jquery.js','sem.js','uscore.js'],
					renderJSTags: function (all) {
						if (all !== undefined) {
							 return all.map(function(scripts) {
								 app.locals.scripts = ['jquery.js','sem.js','uscore.js'];
								 return '<script src="/js/' + scripts + '" type="text/javascript"></script>';
							 }).join('\n ');
						}
						else {
							 return '';
						}
					},
					styles: ['sem.css','res.css'],
					renderCSSTags: function (all) {
						app.locals.styles = ['sem.css','res.css'];
						if (all !== undefined) {
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

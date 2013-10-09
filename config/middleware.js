var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var users = [
	{id: 1, username: 'bob', password: 'secret', email: 'bob@example.com'},
	{id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com'}
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	findById(id, function (err, user) {
		done(err, user);
	});
});

module.exports = {
	
	// Init custom express middleware
	express: {
		customMiddleware: function (app) {

			var local = require('./local.js');

			passport.use(new LocalStrategy(
				function(username, password, done) {
					process.nextTick(function () {
					
					findByUsername(username, function(err, user) {//TODO: Make auth by mysql DB
						if (err) { return done(err); }
						if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
						if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
						return done(null, user);
						})
					});
				}
			));

			app.use(passport.initialize());
			app.use(passport.session());
			app.use(flash());
		}
	}

};

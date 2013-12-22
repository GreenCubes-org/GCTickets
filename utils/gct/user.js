var redis = require('../redis');
var gcdb = require('../gcdb');
var cfg = require('../../config/local.js');

function handleAPPDBDisconnect() {
	appdbconn = require('mysql').createConnection({
		host: cfg.appdb.host,
		database: cfg.appdb.database,
		user: cfg.appdb.user,
		password: cfg.appdb.password
	});
	appdbconn.connect(function (err) {
		if (err) {
			setTimeout(handleAPPDBDisconnect, 1000);
		}
	});

	appdbconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleAPPDBDisconnect();
		} else {
			throw err;
		}
	});
}

handleAPPDBDisconnect();

module.exports = {
	getGroup: function getGroup(user, cb) {
        if (typeof user === 'number') {
            appdbconn.query('SELECT ugroup FROM rights WHERE uid = ?', [user], function (err, result) {
                if (err) return cb(err);

                if (result.length !== 0) {
                    cb(null, result[0].ugroup);
                } else {
                    cb(null, 0); // User have group 0 by default
                }
            });
        } if (typeof user === 'string') {
            gcdb.getByID(user, function (err, uid) {
                if (err) return cb(err);

                appdbconn.query('SELECT ugroup FROM rights WHERE uid = ?', [user], function (err, result) {
                    if (err) return cb(err);

                    if (result.length !== 0) {
                        cb(null, result[0].ugroup);
                    } else {
                        cb(null, 0); // User have group 0 by default
                    }
                });
            });
        } else {
            cb('Incorrect variable!');
        }
	},

	getPrefix: function getPrefix(user, cb) {
        if (typeof(user) === 'number') {
            appdbconn.query('SELECT prefix FROM rights WHERE uid = ?', [user], function (err, result) {
                if (err) return cb(err);

                if (result.length !== 0) {
                    cb(null, result[0].prefix);
                } else {
                    cb(null, '');
                }
            });
        } else if (typeof(user) === 'string') {
            gcdb.user.getByLogin(user, function (err, uid) {
                if (err) return cb(err);

                appdbconn.query('SELECT prefix FROM rights WHERE uid = ?', [uid], function (err, result) {
                    if (err) return cb(err);

                    if (result.length !== 0) {
                        cb(null, result[0].prefix);
                    } else {
                        cb(null, '');
                    }
                });
            });
        } else {
            cb('Incorrect variable: ' + user + ' & ' + typeof user);
        }
	},

	getColorClass: function getColorClass(user, cb) {
        if (typeof user === 'number') {
            appdbconn.query('SELECT colorclass FROM rights WHERE id = ?', [user], function (err, result) {
                if (err) return cb(err);

                if (result.length !== 0) {
                    cb(null, result[0].colorclass);
                } else {
                    cb(null, '');
                }
            });
        } else if (typeof user === 'string') {
            gcdb.getByID(user, function (err, uid) {
                if (err) return cb(err);

                appdbconn.query('SELECT colorclass FROM rights WHERE uid = ?', [user], function (err, result) {
                    if (err) return cb(err);

                    if (result.length !== 0) {
                        cb(null, result[0].colorclass);
                    } else {
                        cb(null, '');
                    }
                });
            });
        } else {
            cb('Incorrect variable!');
        }
	},

	getProfile: function getProfile(login, cb) {
		async.waterfall([
			function initObj (callback) {
				callback(null, {
					login: login,
					prefix: null,
					lastseen: null,
					regdate: null
				});
			},
			function getCapitalizedLogin (obj, callback) {
				gcdb.user.getCapitalizedLogin (obj.login, function (err, login) {
					if (err) return callback(err);

					obj.login = login;

					callback(null, obj);
				});
			},
			function getPrefix (obj, callback) {
				user.getPrefix (obj.login, function (err, prefix) {
					if (err) return callback(err);

					obj.prefix = prefix;

					callback(null, obj);
				});
			},
			function getRegDate (obj, callback) {
				gcdb.user.getRegDate(obj.login, function (err, regDate) {
					if (err) return callback(err);

					obj.regdate = regDate;

					callback(null, obj);
				});
			}
		],
		function (err, obj) {
			if (err) return cb(err);

			cb(null, obj);
		});
	}
};

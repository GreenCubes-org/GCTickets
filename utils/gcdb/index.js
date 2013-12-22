/**
 * GCT -
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */
//FIXME: Поменять на глобальную переменную
var redis = require('../redis');
var cfg = require('../../config/local');

function handleGCDBDisconnect() {
	gcdbconn = require('mysql').createConnection({
		host: cfg.gcdb.host,
		database: cfg.gcdb.database,
		user: cfg.gcdb.user,
		password: cfg.gcdb.password
	});
	gcdbconn.connect(function (err) {
		if (err) {
			setTimeout(handleGCDBDisconnect, 1000);
		}
	});

	gcdbconn.on('error', function (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleGCDBDisconnect();
		} else {
			throw err;
		}
	});
}

handleGCDBDisconnect();

module.exports.user = user = {

	getByID: function (id, cb) {
		redis.get('user.login:' + id, function (err, reply) {
			if (err) return cb(err);

			if (!reply) {
				altCb()
			} else
				cb(null, reply);
		});

		function altCb() {
			async.waterfall([

					function getFromMySQL(callback) {
						if (!gcdbconn) return cb('You\'re not connected to GC MySQL DB');

						gcdbconn.query('SELECT login FROM users WHERE id = ?', [id], function (err, result) {
							if (err) return callback(err);

							if (result.length !== 0) {
								callback(null, result[0].login);
							} else {
								cb('Can\'t search login with this id');
							}
						})
					},
					function setIdToRedis(login, callback) {
						redis.set('user.login:' + id, login, function (err) {
							if (err) return callback(err);

							callback(null, login);
						});
					}
			 ],
				function (err, result) {
					if (err) return cb(err);

					cb(null, result);
				})
		}
	},

	getByLogin: function (login, cb) {
		redis.get('user.id:' + login, function (err, reply) {
			if (err) return cb(err);

			if (!reply) {
				altCb()
			} else
				cb(null, reply);
		});

		function altCb() {
			async.waterfall([

					function getFromMySQL(callback) {
						if (!gcdbconn) return cb('You\'re not connected to GC MySQL DB');

						gcdbconn.query('SELECT id FROM users WHERE login = ?', [login], function (err, result) {
							if (err) return cb(err);

							if (result.length !== 0) {
								callback(result[0].id);
							} else {
								cb('Can\'t search id with this login');
							}
						});
					},
					function setIdToRedis(result) {
						redis.set('user.id:' + id, result, function (err) {
							if (err) return callback(err);

							callback(null, result);
						});
					}
			 ])
		}
	},

	getCapitalizedLogin: function getCapitalizedLogin(login, cb) {
		if (!gcdbconn) return cb('You\'re not connected to GC MySQL DB');

		gcdbconn.query('SELECT login, id FROM users WHERE login = ?', [login], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].login);
			} else {
				cb('Can\'t search login with this login');
			}
		});
	},

	getRegDate: function getRegDate(user, cb) {
		if (typeof user === 'number') {
			gcdbconn.query('SELECT reg_date FROM users WHERE id = ?', [user], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result[0].reg_date);
				}
			});
		} else if (typeof user === 'string') {
			gcdbconn.query('SELECT reg_date FROM users WHERE login = ?', [user], function (err, result) {
				if (err) return cb(err);

				cb(null, result[0].reg_date);
			});
		} else {
			cb('Incorrect variable!');
		}
	}
};

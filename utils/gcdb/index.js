/**
 * GCT -
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */
//FIXME: Поменять на глобальную переменную
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
		if (!gcdbconn) return cb('You\'re not connected to GC MySQL DB');

		gcdbconn.query('SELECT login FROM users WHERE id = ?', [id], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].login);
			} else {
				cb('Can\'t search login with this id');
			}
		});
	},

	getByLogin: function (login, cb) {
		if (!gcdbconn) return cb('You\'re not connected to GC MySQL DB');

		gcdbconn.query('SELECT id FROM users WHERE login = ?', [login], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(result[0].id);
			} else {
				cb('Can\'t search id with this login');
			}
		});
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

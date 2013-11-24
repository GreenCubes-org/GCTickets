/**
 * GCT - 
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */
//FIXME: Поменять на глобальную переменную
var redis = require('./redis');
var cfg = require('../config/local')
		
function handleDisconnect() {
  mysql = require('mysql').createConnection({
			 host: cfg.gcdb.host,
			 database: cfg.gcdb.database,
			 user: cfg.gcdb.user,
			 password: cfg.gcdb.password
		});
  mysql.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      setTimeout(handleDisconnect, 1000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  mysql.on('error', function(err) {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();


module.exports.user = {

	/* function getByID(id, cb)
		* 
		* Get login by ID.
		* 
		* id = Var with ID of user
		* cb = function (err,result)
		* 
		*/
	getByID: function(id, cb) {
		 redis.get('user.login:' + id, function(err, reply) {
			 if (err) cb(err);
			 
			 if (!reply) { 
					altCb() 
			 } else cb(null, reply); 
		 });
		 
		 function altCb() { 
			 async.waterfall([
					function getFromMySQL(callback) {
						if (!mysql) return cb('You\'re not connected to GC MySQL DB');

						mysql.query('SELECT login FROM users WHERE id = ?',
							[id], function (err, result) {
								if (err) return callback(err);
								
								if (result) {
									callback(null, result[0].login);
								} else {
									cb('Can\'t search login with this id');
								}
							})
					},
					function setIdToRedis(login, callback) {
						redis.set('user.login:'+ id, login, function(err) {
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

	getByLogin: function(login, cb) {
		 redis.get('user.id:' + login, function(err, reply) {
			 if (err) cb(err);
			 
			 if (!reply) { 
					altCb() 
			 } else cb(null, reply); 
		 });
		 
		 function altCb() { 
			 async.waterfall([
					function getFromMySQL() {
						if (!mysql) return cb('You\'re not connected to GC MySQL DB');

						mysql.query('SELECT id FROM users WHERE login = ?',
											 [login], function(err, result) {
							 if (err) cb(err);

							 if (result) {
								 this(result[0].id);
							 } else {
								 cb('Can\'t search id with this login');
							 }
						});
					}, 
					function setIdToRedis(result) {
						redis.set('user.id:'+ id, result, function(err) {
							if (err) return callback(err);
							
							callback(null, result);
						});
					}
			 ])
		 }
	}
};

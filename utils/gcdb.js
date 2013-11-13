/**
 * GCT - 
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */
//FIXME: Поменять на глобальную переменную
var redis = require('./redis');
var cfg = require('../config/local')

// Init mysql stuff
var mysql = require('mysql').createConnection({
			 host: cfg.gcdb.host,
			 database: cfg.gcdb.database,
			 user: cfg.gcdb.user,
			 password: cfg.gcdb.password
		});

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
					function isConnect(callback) {
						if (!mysql) return cb('You\'re not connected to GC MySQL DB');

						mysql.query('SELECT login FROM users WHERE id = ?',
											 [id], function (err, result) {
												 if (err) return callback(err);

												 callback(null, result)
												 });
					},
					function getFromMySQL(result, callback) {
						if (result) {
							 callback(null, result[0].id);
						} else {
							 cb('Can\'t search login with this id');
						}
					},
					function setIdToRedis(result, callback) {
						redis.set('user.login:'+ id, result);
						callback(null, result);
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
						redis.set('user.id:'+ id, result);
						cb(null, result);
					}
			 ])
		 }
	},/*,

	getGroup: function(id) {
		 if (!connect) return new Error('You\'re not connected to GCDB!');

		 var groupID;
		 connect.query('SELECT group FROM users WHERE id = ?',
								 [id], function(err, result, fields) {
			 if (err) return new Error(err);
			 
			 if (result) {
					groupID = result[0].group;
			 } else {
					return null;
			 }
		 });
		 switch (groupID) {
			 case 1:
					return 'administrator';
					break;
			 case 2:
					return 'user';
					break;
			 case 3:
					return 'moderator';
			 case 4:
					return 'drbadnick';
			 case 5:
					return 'xitaly';
			 case 6:
					return 'mushrooms';
			 default:
					return null;
		 }
	}*/
	
};

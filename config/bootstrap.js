/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
var mysql = require('mysql');

module.exports.bootstrap = function (cb) {

	// Init globals
	global.appPath = __dirname.replace(/\b\/config\b/g, '');

	global.cfg = require('./local');

	global.gcdb = require('../libs/gcdb');
	global.gct = require('../libs/gct');

	global.ugroup = {
		user: 0,
		helper: 1,
		mod: 2,
		staff: 3
	};

	global.staffs = [
		'rena4ka',
		'feyola',
		'kernel',
		'mushroomkiller',
		'mushro_om',
		'fluffy',
		'tort32',
		'destr'
	];

	global.gcdbconn = mysql.createPool({
		host: cfg.gcdb.host,
		database: cfg.gcdb.database,
		user: cfg.gcdb.user,
		password: cfg.gcdb.password
	});

	global.maindbconn = mysql.createPool({
		host: cfg.maindb.host,
		database: cfg.maindb.database,
		user: cfg.maindb.user,
		password: cfg.maindb.password
	});

	global.gcmainconn = mysql.createPool({
		host: cfg.gcmain.host,
		database: cfg.gcmain.database,
		user: cfg.gcmain.user,
		password: cfg.gcmain.password
	});

	global.appdbconn = mysql.createPool({
		host: cfg.appdb.host,
		database: cfg.appdb.database,
		user: cfg.appdb.user,
		password: cfg.appdb.password
	});


	var redis = require('redis').createClient();

	if (cfg.redis.pass) redis.auth(cfg.redis.pass);

	redis.select(cfg.redis.db.session);

	redis.on('error', function (err) {
	  console.log("[REDIS][ERR]: " + err);
	});

	global.redis = redis;

	// Get GC Items
	maindbconn.query('SELECT `id`, `data`, `name`, `image` FROM `items`', function (err, result) {
		if (err) throw err;

		global.gcitems = result;

		cb();
	});
};

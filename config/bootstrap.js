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

	global.gcdbconn = mysql.createPool({
		host: cfg.gcdb.host,
		database: cfg.gcdb.database,
		user: cfg.gcdb.user,
		password: cfg.gcdb.password
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

	cb();
};

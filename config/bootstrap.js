/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var GCDB = require('../../node-gcdb'),//require('gcdb'),
	mysql = require('mysql');

module.exports.bootstrap = function (cb) {

	// Init global vars
	
	global.appConfig = require('./local.js');
	
	global.gcdb = new GCDB({
		sitedb: appConfig.db.site,
		usersdb: appConfig.db.users,
		mainsrvdb: appConfig.db.mainsrv,
		orgdb: appConfig.db.org
	});
	
	global.gcdb.appdb = mysql.createPool(appConfig.db.app);
	
	global.gch = require('../libs/gch');
	
	global.ugroup = {
		user: 0,
		helper: 1,
		moderator: 2,
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

	// It's very important to trigger this callback method when you are finished
	// with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
	cb();
};
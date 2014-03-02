/* _waterline_dummy02492 fix */
console.log('[FIX-DB] Start script');

var async = require('../node_modules/sails/node_modules/async'),
	mysql = require('mysql'),
	cfg = cfg = require('../config/local');

console.log('[FIX-DB] Start connection to DB');
var appdbconn = require('mysql').createConnection({
		host: cfg.appdb.host,
		database: cfg.appdb.database,
		user: cfg.appdb.user,
		password: cfg.appdb.password
	});

console.log('[FIX-DB] Processing commands:');

async.waterfall([
	function a(callback) {
		appdbconn.query('ALTER TABLE `admreq` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN admreq - ALREADY REMOVED');
					return callback(null)
				} else {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}
						
			console.log('[FIX-DB] DROP _waterline_dummy02492 IN admreq - SUCCESS');
			callback(null);
		});
	},
	function b(callback) {
		appdbconn.query('ALTER TABLE `ban` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN ban - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}
			
			console.log('[FIX-DB] DROP _waterline_dummy02492 IN ban - SUCCESS');
			callback(null);
		});
	},
	function c(callback) {
		appdbconn.query('ALTER TABLE `banlist` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN banlist - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}
			
			console.log('[FIX-DB] DROP _waterline_dummy02492 IN banlist - SUCCESS');
			callback(null);
		});
	},
	function d(callback) {
		appdbconn.query('ALTER TABLE `bugreport` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN bugreport - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}
			console.log('[FIX-DB] DROP _waterline_dummy02492 IN bugreport - SUCCESS');
			callback(null);
		});
	},
	function f(callback) {
		appdbconn.query('ALTER TABLE `regen` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN regen - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}
			
			console.log('[FIX-DB] DROP _waterline_dummy02492 IN regen - SUCCESS');
			callback(null);
		});
	},
	function e(callback) {
		appdbconn.query('ALTER TABLE `rempro` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN rempro - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}
			
			console.log('[FIX-DB] DROP _waterline_dummy02492 IN rempro - SUCCESS');
			callback(null);
		});
	},
	function g(callback) {
		appdbconn.query('ALTER TABLE `rights` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN rights - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}
			
			console.log('[FIX-DB] DROP _waterline_dummy02492 IN rights - SUCCESS');
			callback(null);
		});
	},
	function j(callback) {
		appdbconn.query('ALTER TABLE `ticket` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN ticket - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}
			
			console.log('[FIX-DB] DROP _waterline_dummy02492 IN ticket - SUCCESS');
			callback(null);
		});
	},
	function h(callback) {
		appdbconn.query('ALTER TABLE `unban` DROP `_waterline_dummy02492`; ', function (err, result) {
			if (err) {
				if (err.errno === 1091) {
					console.log('[FIX-DB] DROP _waterline_dummy02492 IN unban - ALREADY REMOVED');
					return callback(null)
				} else if (err) {
					console.error('[FIX-DB] ERROR. I\'M SO SORRY.');
					return callback(err);
				}
			}
			console.log('[FIX-DB] DROP _waterline_dummy02492 IN unban - SUCCESS');
			callback(null);
		});
	}
], function (err) {
	if (err) throw err;
	
	console.log('[FIX-DB] EXIT. GOODBYE.');
	process.exit(0);
})
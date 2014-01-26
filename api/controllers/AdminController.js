/**
* AdminController
*
* @module :: Controller
* @description :: Контроллер админфункций.
*/

var gcdb = require('../../utils/gcdb');

module.exports = {
	main: function(req,res) {
		res.view('admin/dashboard');
	},
	
	usersRights: function(req,res) {
		async.waterfall([
			function getRights(cb) {
				Rights.find().done(function(err, rights) {
					if (err) return callback(err);
					
					cb(null, rights);
				});
			},
			function getByID(rights, cb) {
				async.map(rights, function(right, callback) {
						gcdb.user.getByID(right.uid, function(err, login) {
							if (err) return callback(err);
							
							right.login = login;
							callback(null, right);
						});
					}, function(err, results) {
						if (err) return callback(err);
						
						cb(null, results);
				});
			}
		], function (err, rights) {
			if (err) throw err;
			
			res.view('admin/users/roles', {rights: rights});
		});
	},
	
	debug: function(req,res) {
		res.view('admin/debug');
	}
};

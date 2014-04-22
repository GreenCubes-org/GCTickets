/**
 * AdminController
 *
 * @module :: Controller
 * @description :: Контроллер админфункций.
 */

module.exports = {
	main: function (req, res) {
		res.view('admin/dashboard');
	},

	usersRights: function (req, res) {
		async.waterfall([
			function getRights(cb) {
				Rights.find().done(function (err, rights) {
					if (err) return callback(err);

					cb(null, rights);
				});
			},
			function serializeCanModerate(rights, callback) {
				async.map(rights, function(element, callback) {
					if (element.canModerate) {
						async.map(element.canModerate, function(element, callback) {
							serializedCanModerate = gct.getProductByID(element);
							element = serializedCanModerate.adminText;

							callback(null, element);
						}, function(err, result) {
							element.canModerate = result;
							callback(null, rights);
						});
					} else {
						element.canModerate = null;
						callback(null, rights);
					}
				}, function(err, result) {
					callback(null, rights);
				});
			},
			function getByID(rights, cb) {
				async.map(rights, function (right, callback) {
					gcdb.user.getByID(right.uid, function (err, login) {
						if (err) return callback(err);

						right.login = login;
						callback(null, right);
					});
				}, function (err, results) {
					if (err) throw err;

					cb(null, results);
				});
			}
		], function (err, rights) {
			if (err) throw err;

			res.view('admin/users/roles', {
				rights: rights
			});
		});
	},

	setRights: function (req, res) {
		if(!req.body.username) {
			res.json(400, {
				msg: 'Некорректный запрос'
			});
		}
		
		async.waterfall([
			function setData(callback) {
				callback(null, {
					uid: null,
					username: req.body.username,
					ugroup: parseInt(req.body.ugroup, 10),
					prefix: req.body.prefix,
					colorclass: req.body.colorclass,
					canModerate: []
				});
			},
			function checkData(obj, callback) {
				if (!obj.username) {
					return callback({
						show: true, msg: 'Введите никнейм'
					});
				}
				if (isNaN(obj.ugroup)) {
					return callback({
						show: true, msg: 'Выберите группу пользователя'
					});
				}
				
				callback(null, obj);
			},
			function findUserID(obj, callback) {
				gcdbconn.query('SELECT id FROM users WHERE login = ?',
						[obj.username], function (err, result) {
					if (err) return callback(err);
					
					if (result.length === 0) {
						return callback(null, {
							show: true, msg: 'Такого пользователя нет'
						});
					}
					
					delete obj.username;
					obj.uid = result[0].id;
					
					callback(null, obj);
				});
			},
			function canModerate(obj, callback) {
				if (req.body['mod-main']) {
					obj.canModerate.push(2,12, 3);
				}
				
				if (req.body['mod-rpg']) {
					obj.canModerate.push(8, 9);
				}
				
				if (req.body['mod-rpg']) {
					obj.canModerate.push(10, 11);
				}
				
				callback(null, obj);
			},
			function saveToDB(obj, callback) {
				Rights.findOrCreate({
					uid: obj.uid
				}).done(function (err, rights) {
					if (err) return callback(err);
					
					rights.uid = obj.uid;
					rights.ugroup = obj.ugroup;
					rights.colorclass = obj.colorclass;
					rights.prefix = obj.prefix;
					rights.canModerate = obj.canModerate;
					
					rights.save(function(err) {
						if (err) return callback(err);
						
						callback(null);
					});
				});
			}
		], function(err) {
			if (err) {
				if (!err.show) {
					res.json({
						 err: 'Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.'
					});
					
					throw err;
				} else {
					return res.json({
						err: err.msg
					});
				}
			} else {
				res.json({
					status: 'OK'
				});
			}
		});
	},
	
	removeRights: function (req, res) {
		var uid = parseInt(req.params.uid, 10);
		
		if (!req.params.uid) {
			return res.json(400, {
				msg: 'Некорректный запрос'
			});
		}
		
		Rights.findOne({
			uid: uid
		}).done(function (err, rights) {
			if (err) throw err;
			
			if (rights.length === 0) {
				res.redirect('/admin/users/rights');
			} else {
				rights.destroy(function(err) {
					if (err) throw err;

					res.redirect('/admin/users/rights');
				});
			}
		});
	},

	debug: function (req, res) {
		res.view('admin/debug');
	}
};

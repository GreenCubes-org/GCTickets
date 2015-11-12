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
				Users.find().where({
					ugroup: {
						'>': 0
					}
				}).exec(function (err, rights) {
					if (err) return callback(err);

					cb(null, rights);
				});
			},
			function serializeCanModerate(rights, callback) {
				async.map(rights, function(element, callback) {
					if (element.canModerate) {
						async.map(element.canModerate, function(element, callback) {
							serializedCanModerate = gch.getProductByID(element);
							element = serializedCanModerate.techText;

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
					gcdb.user.getByID(right.uid, 'sitedb', function (err, login) {
						if (err) return callback(err);

						right.login = login;
						callback(null, right);
					});
				}, function (err, results) {
					if (err) return res.serverError(err);

					cb(null, results);
				});
			}
		], function (err, rights) {
			if (err) return res.serverError(err);

			res.view('admin/users/roles', {
				rights: rights
			});
		});
	},

	setRights: function (req, res) {
		if(!req.body.username) {
			res.badRequest();
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
						show: true, msg: sails.__('controller.admin.setRights.enternickname')
					});
				}
				if (isNaN(obj.ugroup)) {
					return callback({
						show: true, msg: sails.__('controller.admin.setRights.enterugroup')
					});
				}

				callback(null, obj);
			},
			function findUserID(obj, callback) {
				gcdbconn.query('SELECT id FROM users WHERE login = ?',
						[obj.username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						return callback({
							show: true, msg: sails.__('controller.admin.nouser')
						});
					}

					delete obj.username;
					obj.uid = result[0].id;

					callback(null, obj);
				});
			},
			function canModerate(obj, callback) {
				if (req.body['mod-main']) {
					obj.canModerate.push(2);
				}

				if (req.body['mod-rpg']) {
					obj.canModerate.push(3);
				}

				if (req.body['mod-apo']) {
					obj.canModerate.push(4);
				}

				callback(null, obj);
			},
			function saveToDB(obj, callback) {
				Users.findOrCreate({
					uid: obj.uid
				}).exec(function (err, rights) {
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
						 err: sails.__('global.suddenerror')
					});

					return res.serverError(err);
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
			return res.badRequest();
		}

		Users.findOne({
			uid: uid
		}).exec(function (err, rights) {
			if (err) return res.serverError(err);

			if (rights.length === 0) {
				res.redirect('/admin/users/roles');
			} else {
				rights.destroy(function(err) {
					if (err) return res.serverError(err);

					res.redirect('/admin/users/roles');
				});
			}
		});
	},

	usersBans: function (req, res) {
		async.waterfall([
			function getRights(cb) {
				Banlist.find().exec(function (err, banlist) {
					if (err) return callback(err);

					cb(null, banlist);
				});
			},
			function serialize(banlist, cb) {
				async.map(banlist, function (ban, callback) {
					gcdb.user.getByID(ban.uid, function (err, login) {
						if (err) return callback(err);

						ban.login = login;
						gcdb.user.getByID(ban.by, function (err, login) {
							if (err) return callback(err);

							ban.by = login;
							callback(null, ban);
						});
					});
				}, function (err, results) {
					if (err) return res.serverError(err);

					cb(null, results);
				});
			}
		], function (err, banlist) {
			if (err) return res.serverError(err);

			res.view('admin/users/bans', {
				banlist: banlist
			});
		});
	},

	setBan: function (req, res) {
		if(!req.body.username) {
			res.badRequest();
		}

		async.waterfall([
			function setData(callback) {
				callback(null, {
					uid: null,
					by: req.user.id,
					username: req.body.username,
					ip: req.body.ip,
					message: req.body.message
				});
			},
			function checkData(obj, callback) {
				if (!obj.ip && !obj.username) {
					return callback({
						show: true, msg: sails.__('controller.admin.setBan.enternickorip')
					});
				}

				callback(null, obj);
			},
			function findUserID(obj, callback) {
				if (!obj.username) {
					return callback(null, obj);
				}

				gcdbconn.query('SELECT id FROM users WHERE login = ?',
						[obj.username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						return callback({
							show: true, msg: sails.__('controller.admin.nouser')
						});
					}

					delete obj.username;
					obj.uid = result[0].id;

					callback(null, obj);
				});
			},
			function saveToDB(obj, callback) {
				Banlist.findOrCreate({
					uid: obj.uid,
					ip: obj.ip
				}).exec(function (err, ban) {
					if (err) return callback(err);

					ban.uid = obj.uid;
					ban.ip = obj.ip;
					ban.by = obj.by;
					ban.message = obj.message;

					ban.save(function(err) {
						if (err) return callback(err);

						callback(null);
					});
				});
			}
		], function(err) {
			if (err) {
				if (!err.show) {
					res.json({
						 err: sails.__('global.suddenerror')
					});

					return res.serverError(err);
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

	removeBan: function (req, res) {
		var id = parseInt(req.params.id, 10);

		if (!req.params.id) {
			return res.badRequest();
		}

		Banlist.findOne({
			id: id
		}).exec(function (err, ban) {
			if (err) return res.serverError(err);

			if (ban.length === 0) {
				res.redirect('/admin/users/bans');
			} else {
				ban.destroy(function(err) {
					if (err) return res.serverError(err);

					res.redirect('/admin/users/bans');
				});
			}
		});
	},

	debug: function (req, res) {
		res.view('admin/debug');
	}
};


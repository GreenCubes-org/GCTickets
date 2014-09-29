/**
 * GameinfoController
 *
 * @module :: Controller
 * @description :: Панель игровой информации
 */
module.exports = {

	main: function (req, res) {
		res.view('gameinfo/dashboard');
	},

	playerInfo: function (req, res) {
		if (!req.param('nickname')) {
			res.view('gameinfo/player/info', {
				pinfo: null
			});
			return;
		}

		gct.user.getPInfo(req.param('nickname'), function (err, pinfo) {
			if (err) {
				res.serverError();
				sails.log.error(err);
				throw err;
			}

			if (!pinfo) {
				return res.view('gameinfo/player/info', {
					pinfo: {nouser:true}
				});
			}

			res.view('gameinfo/player/info', {
				pinfo: pinfo
			});
		});
	},

	playerInventory: function (req, res) {
		if (!req.param('nickname')) {
			res.view('gameinfo/player/inventory', {
				inventory: null
			});
			return;
		}

		async.waterfall([

			function getUID(callback) {
				gcdb.user.getByLogin(req.param('nickname').replace(/[^a-zA-Z0-9_-]/g, ''), 'maindb', function (err, uid) {
					if (err) return callback(err);

					callback(null, uid);
				});
			},
			function getInventory(uid, callback) {
				gcmainconn.query('SELECT `count`, `itemDamage`, `itemId`, `slot` FROM `inventories` WHERE `userid` = ?', [uid], function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeInventory(inventory, callback) {
				async.map(inventory, function (element, callback) {
					var obj = _.find(gcitems, function (obj) {

						return ((obj.id === element.itemId) && (obj.data === element.itemDamage));
					});

					callback(null, {
						count: element.count,
						itemDamage: element.itemDamage,
						itemId: element.itemId,
						slot: element.slot,
						image: 'https://greencubes.org/img/items/' + ((obj) ? obj.image : ''),
						name: ((obj) ? obj.name : '&mdash;')
					});
				}, function (err, inventory) {
					if (err) return callback(err);

					callback(null, inventory);
				});
			}
		], function (err, inventory) {
			if (err) {
				res.serverError();
				sails.log.error(err);
				throw err;
			}

			res.view('gameinfo/player/inventory', {
				inventory: inventory
			});
		});

	},

	worldRegioninfo: function (req, res) {
		if (!req.param('regionname')) {
			res.view('gameinfo/world/regioninfo', {
				rinfo: null
			});
			return;
		}

		gct.getRegionsInfo([{name:req.param('regionname')}], req.user.group, function (err, rinfo) {
			if (err) {
				res.serverError();
				sails.log.error(err);
				throw err;
			}
			rinfo = rinfo[0];

			async.waterfall([
				function serializeCreator(callback) {
					gcdb.user.getByID(rinfo.creator, 'maindb', function (err, login) {
						if (err) return callback(err);

						rinfo.creator = login;

						callback(null);
					});
				},
				function serializeFull_accessPlayers(callback) {
					async.map(rinfo.full_access.players, function (element, callback) {
						gcdb.user.getByID(element.uid, 'maindb', function (err, login) {
							if (err) return callback(err);

							callback(null, {
								name: login,
								lastseen: moment(element.lastseenLocale).format('D MMM YYYY, H:mm')
							});
						});
					}, function (err, array) {
						if (err) return callback(err);

						rinfo.full_access.players = array;

						callback(null);
					});
				},
				function serializeBuild_accessPlayers(callback) {
					async.map(rinfo.build_access.players, function (element, callback) {
						gcdb.user.getByID(element.uid, 'maindb', function (err, login) {
							if (err) return callback(err);

							callback(null, {
								name: login,
								lastseen: moment(element.lastseenLocale).format('D MMM YYYY, H:mm')
							});
						});
					}, function (err, array) {
						if (err) return callback(err);

						rinfo.build_access.players = array;

						callback(null);
					});
				},
				function serializeFull_accessOrgs(callback) {
					async.map(rinfo.full_access.orgs, function (element, callback) {
						callback(null, 'Организация #' + element);
					}, function (err, array) {
						if (err) return callback(err);

						rinfo.full_access.orgs = array;

						callback(null);
					});
				},
				function serializeBuild_accessOrgs(callback) {
					async.map(rinfo.build_access.orgs, function (element, callback) {
						callback(null, 'Организация #' + element);
					}, function (err, array) {
						if (err) return callback(err);

						rinfo.build_access.orgs = array;

						callback(null);
					});
				}
			], function (err) {
				if (err) callback(err);

				res.view('gameinfo/world/regioninfo', {
					rinfo: rinfo
				});
			});
		});
	}

};

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

	playerLoginlog: function (req, res) {
		if (!req.param('nickname') && !req.param('ip') && !req.param('hwid')) {
			res.view('gameinfo/player/loginlog', {
				log: null
			});
			return;
		}

		var query = 'SELECT * FROM `login_log` WHERE ',
			nickname = (req.param('nickname')) ? req.param('nickname').replace(/[^a-zA-Z0-9_-]/g, '') : null,
			ip = (req.param('ip')) ? req.param('ip').replace(/[^0-9\.]/g, '') : null,
			hwid = (req.param('hwid')) ? req.param('hwid').replace(/[^a-zA-Z0-9]/g, '') : null;

		if (nickname) {
			query += '`login` = "' + nickname + '"';
		}

		if (ip) {
			query += ((nickname) ? 'AND ' : '') + '`ip` = "' + ip + '"';
		}

		if (req.param('hwid')) {
			query += ((nickname || ip) ? 'AND ' : '') + '`hardware` = "' + hwid + '"';
		}

		query += ' ORDER BY `id` DESC';

		async.waterfall([
			function getLog(callback) {
				gcmainconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeStatus(log, callback) {
				async.map(log, function (element, callback) {
					element.status = gct.serializeLoginLogStatus(element.status);

					callback(null, element);
				}, function (err, log) {
					if (err) return callback(err);

					callback(null, log);
				});
			}
		], function (err, log) {
			if (err) throw err;

			res.view('gameinfo/player/loginlog', {
				log: log
			});
		});
	},

	playerChestslog: function (req, res) {

	},

	playerChatlog: function (req, res) {

	},

	playerCommandslog: function (req, res) {

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
						callback(null, sails.__('global.organizationid', element));
					}, function (err, array) {
						if (err) return callback(err);

						rinfo.full_access.orgs = array;

						callback(null);
					});
				},
				function serializeBuild_accessOrgs(callback) {
					async.map(rinfo.build_access.orgs, function (element, callback) {
						callback(null, sails.__('global.organizationid', element));
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
	},

	worldChestlog: function (req, res) {

	},

	worldBlockslog: function (req, res) {
		if (!req.param('xyz') && !req.param('firstxyz') && !req.param('secondxyz') && !req.param('firsttime') && !req.param('secondtime')) {
			res.view('gameinfo/world/blockslog', {
				logs: null
			});
			return;
		}

		if (isNaN(req.param('block')) || [10, 8, 51, 63, 19].indexOf(parseInt(req.param('block'), 10)) === -1) {
			res.view('gameinfo/world/blockslog', {
				logs: {code:'wrongblock'}
			});
			return;
		}

		async.waterfall([
			function getLogs(callback) {
				if (req.param('xyz')) {
					// ['-1337','42','420']
					var xyzMatch = req.param('xyz').match(/^(-?[0-9]*) (\-?[0-9]*) (\-?[0-9]*)/g),
						xyzSplited = req.param('xyz').split(' ');

					if (!xyzMatch){
						res.view('gameinfo/world/blockslog', {
							logs: {code: 'wrongxyz'}
						});
						return;
					}

					gcmainconn.query('SELECT * FROM `blocks_log` WHERE `x` = ? AND `y` = ? AND `z` = ? AND `block` = ?', [xyzSplited[0], xyzSplited[1], xyzSplited[2], req.param('block')], function (err, result) {
						if (err) return callback(err);

						callback(null, result);
					});
				} else if (req.param('firstxyz') && req.param('secondxyz') && req.param('firsttime') && req.param('secondtime')) {
					//TODO: Сделать как в админке, если нет коорд, но есть время, то фигачить по времени. Ну и вот.
					// ['-1337','42','420']
					var firstxyzMatch = req.param('firstxyz').match(/^(-?[0-9]*) (\-?[0-9]*) (\-?[0-9]*)/g),
						firstxyzSplited = req.param('firstxyz').split(' '),
						secondxyzMatch = req.param('secondxyz').match(/^(-?[0-9]*) (\-?[0-9]*) (\-?[0-9]*)/g),
						secondxyzSplited = req.param('secondxyz').split(' ');

					var firsttime = Date.parse(req.param('firsttime')) / 1000,
						secondtime = Date.parse(req.param('secondtime')) / 1000;

					if (!firstxyzMatch || !secondxyzMatch) {
						res.view('gameinfo/world/blockslog', {
							logs: {code: 'wrongxyz'}
						});
						return;
					}

					if (firsttime && isNaN(firsttime) || secondtime && isNaN(secondtime)) {
						res.view('gameinfo/world/blockslog', {
							logs: {code: 'wrongtime'}
						});
						return;
					}

					gcmainconn.query('SELECT * FROM `blocks_log` WHERE `x` >= ? AND `x` <= ? AND `y` >= ? AND `y` <= ? AND `z` >= ? AND `z` <= ? AND UNIX_TIMESTAMP(`time`) >= ? AND UNIX_TIMESTAMP(`time`) <= ? AND `block` = ? ORDER BY `id` DESC', [firstxyzSplited[0], secondxyzSplited[0], firstxyzSplited[1], secondxyzSplited[1], firstxyzSplited[2], secondxyzSplited[2], firsttime, secondtime, req.param('block')], function (err, result) {
						if (err) return callback(err);

						callback(null, result);
					});
				} else {
					res.view('gameinfo/world/blockslog', {
						logs: null
					});
				}
			},
			function serializeUsers(logs, callback) {
				async.map(logs, function (element, callback) {
					gcdb.user.getByID(element.user, 'maindb', function (err, login) {
						if (err) return callback(err);

						element.user = login;

						callback(null, element);
					});
				}, function (err, logs) {
					if (err) return callback(err);

					callback(null, logs);
				});
			}
		], function (err, logs) {
			if (err) throw err;

			res.view('gameinfo/world/blockslog', {
				logs: logs
			});
		});
	},

	worldMoneylog: function (req, res) {
		if (!req.param('sender')) {
			res.view('gameinfo/world/moneylog', {
				log: null
			});
			return;
		}

		var sender = req.param('sender'),
			firstTime = Date.parse(req.param('firsttime')) / 1000,
			secondTime = Date.parse(req.param('secondtime')) / 1000;

		async.waterfall([
			function getType(callback) {
				// If org: 'o:'
				if (sender[0] === 'o' && sender[1] === ':') {
					callback(null, 2);
				} else {
					callback(null, 1);
				}
			},
			function setUID(type, callback) {
				if (type === 1) {
					gcdb.user.getByLogin(sender, 'maindb', function (err, uid) {
						if (err) return callback(err);

						sender = uid;

						callback(null, uid, type);
					});
				} else {
					sender = parseInt(sender.split(':')[1], 10);

					if (isNaN(sender)) {
						res.view('gameinfo/player/moneylog', {
							log: {code: 'wrongorg'}
						});
					} else {
						callback(null, sender, type);
					}
				}
			},
			function getLog(uid, type, callback) {
				gcmainconn.query('SELECT * FROM `money_log` WHERE ((`sender` = ? AND `senderType` = ?) OR (`reciever` = ? AND `recieverType` = ?)) AND UNIX_TIMESTAMP(`time`) >= ? AND UNIX_TIMESTAMP(`time`) <= ? ORDER BY `id` DESC', [uid, type, uid, type, firstTime, secondTime], function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeLog(log, callback) {
				async.map(log, function (element, callback) {
					async.waterfall([
						function getUID4Sender(callback) {
							if (element.senderType === 1) {
								gcdb.user.getByID(element.sender, 'maindb', function (err, login) {
									if (err) return callback(err);

									element.sender = login;

									callback(null, element);
								});
							} else if (element.senderType === 2) {
								element.sender = sails.__('global.organizationid', element.sender);

								callback(null, element);
							} else {
								callback(null, element);
							}
						},
						function getUID4Reciever(element, callback) {
							if (element.recieverType === 1) {
								gcdb.user.getByID(element.reciever, 'maindb', function (err, login) {
									if (err) return callback(err);

									element.reciever = login;

									callback(null, element);
								});
							} else if (element.recieverType === 2) {
								element.reciever = sails.__('global.organizationid', element.reciever);

								callback(null, element);
							} else {
								callback(null, element);
							}
						},
						function serializeData(element, callback) {
							if (element.recieverType === 3) {
								element.data = JSON.parse(element.data);

								switch (element.data.type) {
									case 0:
										element.data = sails.__('view.gameinfo.player.moneylog.boughtchannel', element.data.name);
										break;

									case 1:
										element.data = sails.__('view.gameinfo.player.moneylog.boughtregion', element.data.name);
										break;
								}

								callback(null, element);
							} else {
								callback(null, element);
							}
						}
					], function (err, log) {
						if (err) return callback(err);

						callback(null, log);
					});
				}, function (err, logs) {
					if (err) return callback(err);

					callback(null, logs);
				});
			}
		], function (err, log) {
			if (err) {
				res.serverError();
				sails.log.error(err);
				throw err;
			}

			res.view('gameinfo/world/moneylog', {
				log: log
			});
		});
	}

};

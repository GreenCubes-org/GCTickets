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
				//res.serverError();
				res.json(err);
				sails.log.error(err);
				//throw err;
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
			whereQuery = '';
			nickname = (req.param('nickname')) ? req.param('nickname').replace(/[^a-zA-Z0-9_-]/g, '') : null,
			ip = (req.param('ip')) ? req.param('ip').replace(/[^0-9\.]/g, '') : null,
			hwid = (req.param('hwid')) ? req.param('hwid').replace(/[^a-zA-Z0-9\:]/g, '') : null,
			page = (parseInt(req.param('page'), 10)) ? parseInt(req.param('page'), 10) : 1;

		if (nickname) {
			query += '`login` = "' + nickname + '"';
			whereQuery += '`login` = "' + nickname + '"';
		}

		if (ip) {
			query += ((nickname) ? 'AND ' : '') + '`ip` = "' + ip + '"';
			whereQuery += ((nickname) ? 'AND ' : '') + '`ip` = "' + ip + '"';
		}

		if (req.param('hwid')) {
			query += ((nickname || ip) ? 'AND ' : '') + '`hardware` = "' + hwid + '"';
			whereQuery += ((nickname || ip) ? 'AND ' : '') + '`hardware` = "' + hwid + '"';
		}

		query += ' ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100;

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
			},
			function getPageCount(log, callback) {
				gcmainconn.query('SELECT count(*) AS count FROM `login_log` WHERE ' + whereQuery, function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) throw err;

			res.view('gameinfo/player/loginlog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	},

	playerChestslog: function (req, res) {
		req.status(403).view('403-hf');

		if (!req.param('nickname')) {
			res.view('gameinfo/player/chestslog', {
				log: null
			});
			return;
		}

		var firsttime = Date.parse(req.param('firsttime')) / 1000,
			secondtime = Date.parse(req.param('secondtime')) / 1000,
			page = (parseInt(req.param('page'), 10)) ? parseInt(req.param('page'), 10) : 1,
			userId;

		if (firsttime && isNaN(firsttime) || secondtime && isNaN(secondtime)) {
			res.view('gameinfo/player/chatlog', {
				logs: {code: 'wrongtime'}
			});
			return;
		}


		async.waterfall([
			function getUID(callback) {
				gcdb.user.getByLogin(req.param('nickname').replace(/[^a-zA-Z0-9_-]/g, ''), 'maindb', function (err, uid) {
					if (err) return callback(err);

					userId = uid;

					callback(null);
				});
			},
			function getLog(callback) {
				gcmainconn.query('SELECT * FROM `chest_log` WHERE `user` = "' + uid +  '" AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '" ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeSession(log, callback) {
				async.map(log, function (element, callback) {
					async.map(element.session.split(';'), function (element, callback) {
						var session = element.substr(0, 1),
							i = 1;

						if (session === '-') {
							session = element.substr(0, 2);
							i = 2;
						}

						if (session === '<') {
							var tempSession = element.substr(0, 2);

							if (tempSession === '<-') {
								session = tempSession;
								i = 2;
							}
						}

						if (session === 'C' || session === 'I') {
							session = element.substr(0, 2);
							i = 2;
						}
					}, function (err, session) {

					});

				}, function (err, log) {
					if (err) return callback(err);

					callback(null, log);
				});
			}
		], function (err, log) {
			if (err) throw err;

			res.view('gameinfo/player/chestslog', {
				log: log
			});
		});

	},

	playerChatlog: function (req, res) {
		var firsttime = Date.parse(req.param('firsttime')) / 1000,
			secondtime = Date.parse(req.param('secondtime')) / 1000,
			query,
			page = (parseInt(req.param('page'), 10)) ? parseInt(req.param('page'), 10) : 1,
			userId,
			nickname = (req.param('nickname')) ? req.param('nickname').replace(/[^a-zA-Z0-9_-]/g, '') : null;

		if (!nickname && !req.param('channelid')) {
			res.view('gameinfo/player/chatlog', {
				log: null
			});
			return;
		}

		if (req.user.group === ugroup.mod && staffs.indexOf(nickname.toLowerCase()) !== -1) {
			res.view('gameinfo/player/chatlog', {
				log: {code: 'staffblock'}
			});
			return;
		}

		if (firsttime && isNaN(firsttime) || secondtime && isNaN(secondtime) || firsttime > secondtime) {
			res.view('gameinfo/player/chatlog', {
				log: {code: 'wrongtime'}
			});
			return;
		}

		if ((secondtime - firsttime) > 432000) {
			res.view('gameinfo/player/chatlog', {
				log: {code: 'bigtime'}
			});
			return;
		}

		if (req.param('channelid') && isNaN(req.param('channelid'))) {
			res.view('gameinfo/player/chatlog', {
				log: {code: 'wrongchannelid'}
			});
			return;
		}

		async.waterfall([
			function getUIDNBuildQuery(callback) {
				if (nickname) {
					gcdb.user.getByLogin(nickname, 'maindb', function (err, uid) {
						if (err) return callback(err);

						query = 'SELECT * FROM `chat_log` WHERE UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '" AND (`player` = "' + uid +  '" OR `targetPlayer` = "' + uid +  '")';

						if (req.param('channelid') && !isNaN(req.param('channelid'))) {
							query += ' AND `channel` = "' + req.param('channelid') + '"';
						}

						query += ' ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100;

						userId = uid;

						callback(null);
					});
				} else {
					query = 'SELECT * FROM `chat_log` WHERE UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"';

					if (req.param('channelid') && !isNaN(req.param('channelid'))) {
						query += ' AND `channel` = "' + req.param('channelid') + '"';
					}

					query += ' ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100;

					callback(null);
				}
			},
			function getLog(callback) {
				gcmainconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeChat(log, callback) {
				async.map(log, function (element, callback) {
					// MOD can see only local, world, trade chats;
					if (req.user.group == ugroup.mod && ([1, 2, 4].indexOf(element.channel) === -1 || element.targetPlayer)) {
						element.message = null;
					}

					gcdb.user.getByID(element.player, 'maindb', function (err, playerLogin) {
						if (err) return callback(err);

						element.player = playerLogin;

						if (element.targetPlayer ) {
							gcdb.user.getByID(element.targetPlayer, 'maindb', function (err, targetPlayerLogin) {
								if (err) return callback(err);

								element.targetPlayer = targetPlayerLogin;

								callback(null, element);
							});
						} else {
							callback(null, element);
						}
					});
				}, function (err, log) {
					if (err) return callback(err);

					callback(null, log);
				});
			},
			function getPageCount(log, callback) {
				if (nickname) {
					query = 'SELECT count(*) FROM `chat_log` WHERE UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '" AND (`player` = "' + userId +  '" OR `targetPlayer` = "' + userId +  '")';

					if (req.param('channelid') && !isNaN(req.param('channelid'))) {
						query += ' AND `channel` = "' + req.param('channelid') + '"';
					}

					query += ' ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100;
				} else {
					query = 'SELECT count(*) FROM `chat_log` WHERE UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"';

					if (req.param('channelid') && !isNaN(req.param('channelid'))) {
						query += ' AND `channel` = "' + req.param('channelid') + '"';
					}

					query += ' ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100;
				}

				gcmainconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) throw err;

			res.view('gameinfo/player/chatlog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	},

	playerCommandslog: function (req, res) {
		if (!req.param('nickname')) {
			res.view('gameinfo/player/commandslog', {
				log: null
			});
			return;
		}

		if (req.user.group === ugroup.mod && staffs.indexOf(req.param('nickname').toLowerCase()) !== -1) {
			res.view('gameinfo/player/commandslog', {
				log: {code: 'staffblock'}
			});
			return;
		}

		var firsttime = Date.parse(req.param('firsttime')) / 1000,
			secondtime = Date.parse(req.param('secondtime')) / 1000,
			query,
			page = (parseInt(req.param('page'), 10)) ? parseInt(req.param('page'), 10) : 1,
			userId;

		if (firsttime && isNaN(firsttime) || secondtime && isNaN(secondtime) || firsttime > secondtime) {
			res.view('gameinfo/player/commandslog', {
				log: {code: 'wrongtime'}
			});
			return;
		}

		if ((secondtime - firsttime) > 432000) {
			res.view('gameinfo/player/commandslog', {
				log: {code: 'bigtime'}
			});
			return;
		}

		async.waterfall([
			function getUIDNBuildQuery(callback) {
				gcdb.user.getByLogin(req.param('nickname').replace(/[^a-zA-Z0-9_-]/g, ''), 'maindb', function (err, uid) {
					if (err) return callback(err);

					query = 'SELECT * FROM `commands_log` WHERE `player` = "' + uid +  '" AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '" ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100;

					userId = uid;

					callback(null);
				});
			},
			function getLog(callback) {
				gcmainconn.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeChat(log, callback) {
				async.map(log, function (element, callback) {
					if (req.user.group === ugroup.mod && (element.command[1] === 'm' && element.command[2] === ' ')) {
						element.command = '/m ';
					}

					if (element.command.substr(1,5) === 'login') {
						element.command = null;
					}

					gcdb.user.getByID(element.player, 'maindb', function (err, login) {
						if (err) return callback(err);

						element.player = login;

						callback(null, element);
					});
				}, function (err, log) {
					if (err) return callback(err);

					callback(null, log);
				});
			},
			function getPageCount(log, callback) {
				gcmainconn.query('SELECT count(*) AS count FROM `commands_log` WHERE `player` = "' + userId +  '" AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"', function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) throw err;

			res.view('gameinfo/player/commandslog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
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
		req.status(403).view('403-hf');
	},

	worldBlockslog: function (req, res) {
		if (!req.param('xyz') && !req.param('firstxyz') && !req.param('secondxyz') && !req.param('firsttime') && !req.param('secondtime')) {
			res.view('gameinfo/world/blockslog', {
				log: null
			});
			return;
		}

		if (isNaN(req.param('block')) || [10, 8, 51, 63, 19].indexOf(parseInt(req.param('block'), 10)) === -1) {
			res.view('gameinfo/world/blockslog', {
				log: {code:'wrongblock'}
			});
			return;
		}

		var page = (parseInt(req.param('page'), 10)) ? parseInt(req.param('page'), 10) : 1,
			queryWhere,
			queryParams;

		async.waterfall([
			function getLogs(callback) {
				if (req.param('xyz')) {
					// ['-1337','42','420']
					var xyzMatch = req.param('xyz').match(/^(-?[0-9]*) (\-?[0-9]*) (\-?[0-9]*)/g),
						xyzSplited = req.param('xyz').split(' ');

					if (!xyzMatch){
						res.view('gameinfo/world/blockslog', {
							log: {code: 'wrongxyz'}
						});
						return;
					}

					queryWhere = '`x` = ? AND `y` = ? AND `z` = ? AND `block` = ?';
					queryParams = [xyzSplited[0], xyzSplited[1], xyzSplited[2], req.param('block')];


					gcmainconn.query('SELECT * FROM `blocks_log` WHERE ' + queryWhere  + ' ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100, queryParams, function (err, result) {
						if (err) return callback(err);

						callback(null, result);
					});
				} else if (req.param('firstxyz') && req.param('secondxyz') && req.param('firsttime') && req.param('secondtime')) {
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

					queryWhere = '`x` >= ? AND `x` <= ? AND `y` >= ? AND `y` <= ? AND `z` >= ? AND `z` <= ? AND UNIX_TIMESTAMP(`time`) >= ? AND UNIX_TIMESTAMP(`time`) <= ? AND `block` = ?';
					queryParams = [firstxyzSplited[0], secondxyzSplited[0], firstxyzSplited[1], secondxyzSplited[1], firstxyzSplited[2], secondxyzSplited[2], firsttime, secondtime, req.param('block')];

					gcmainconn.query('SELECT * FROM `blocks_log` WHERE ' + queryWhere + ' ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100, queryParams, function (err, result) {
						if (err) return callback(err);

						callback(null, result);
					});
				} else {
					res.view('gameinfo/world/blockslog', {
						log: null
					});
				}
			},
			function serializeUsers(log, callback) {
				async.map(log, function (element, callback) {
					gcdb.user.getByID(element.user, 'maindb', function (err, login) {
						if (err) return callback(err);

						element.user = login;

						callback(null, element);
					});
				}, function (err, log) {
					if (err) return callback(err);

					callback(null, log);
				});
			},
			function getPageCount(log, callback) {
				gcmainconn.query('SELECT count(*) AS count FROM `blocks_log` WHERE ' + queryWhere, queryParams, function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) throw err;

			res.view('gameinfo/world/blockslog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
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

		if (req.user.group === ugroup.mod && staffs.indexOf(req.param('sender').toLowerCase()) !== -1) {
			res.view('gameinfo/world/moneylog', {
				log: {code: 'staffblock'}
			});
			return;
		}

		var sender = req.param('sender'),
			firstTime = Date.parse(req.param('firsttime')) / 1000,
			secondTime = Date.parse(req.param('secondtime')) / 1000,
			type,
			page = (parseInt(req.param('page'), 10)) ? parseInt(req.param('page'), 10) : 1;

		async.waterfall([
			function getType(callback) {
				// If org: 'o:'
				if (sender[0] === 'o' && sender[1] === ':') {
					type = 2;

					callback(null, 2);
				} else {
					type = 1;

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
				gcmainconn.query('SELECT * FROM `money_log` WHERE ((`sender` = ? AND `senderType` = ?) OR (`reciever` = ? AND `recieverType` = ?)) AND UNIX_TIMESTAMP(`time`) >= ? AND UNIX_TIMESTAMP(`time`) <= ? ORDER BY `id` DESC LIMIT ' + (page - 1) + ',' + page * 100, [uid, type, uid, type, firstTime, secondTime], function (err, result) {
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
										element.data = sails.__('view.gameinfo.player.moneylog.boughtregion', element.data.name, element.data.name);
										break;

									case 1:
										element.data = sails.__('view.gameinfo.player.moneylog.boughtchannel', element.data.name, element.data.name);
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
			},
			function getPageCount(log, callback) {
				gcmainconn.query('SELECT count(*) AS count FROM `money_log` WHERE ((`sender` = ? AND `senderType` = ?) OR (`reciever` = ? AND `recieverType` = ?)) AND UNIX_TIMESTAMP(`time`) >= ? AND UNIX_TIMESTAMP(`time`) <= ? ORDER BY `id` DESC', [sender, type, sender, type, firstTime, secondTime], function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) {
				res.serverError();
				sails.log.error(err);
				throw err;
			}

			res.view('gameinfo/world/moneylog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	}

};

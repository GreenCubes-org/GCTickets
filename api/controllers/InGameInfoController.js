/**
 * InGameInfoController
 *
 * @module :: Controller
 * @description :: Контроллер игровой информации.
 */

module.exports = {

	main: function (req, res) {
		res.view('ingameinfo/dashboard');
	},

	playerInfo: function (req, res) {
		if (!req.param('nickname')) {
			res.view('ingameinfo/player/info', {
				pinfo: null
			});
			return;
		}

		gch.user.getPInfo(req.param('nickname'), function (err, pinfo) {
			if (err) {
				return res.serverError(err);
			}

			if (!pinfo) {
				return res.view('ingameinfo/player/info', {
					pinfo: {nouser:true}
				});
			}

			res.view('ingameinfo/player/info', {
				pinfo: pinfo
			});
		});
	},

	playerInventory: function (req, res) {
		if (!req.param('nickname')) {
			res.view('ingameinfo/player/inventory', {
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
				gcdb.mainsrvdb.query('SELECT `count`, `itemDamage`, `itemId`, `slot` FROM `inventories` WHERE `userid` = ?', [uid], function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeInventory(inventory, callback) {
				async.map(inventory, function (element, callback) {
					var item = _.find(gcitems, function (obj) {
						return ((obj.id === element.itemId) && (obj.data === element.itemDamage));
					});

					if (!item) {
						gch.updateItemCache();

						item = _.find(gcitems, function (obj) {
							return (obj.id == element.itemId) && (obj.data == element.itemDamage);
						});
					}

					if (!item) {
						item = _.find(gcitems, function (obj) {
							return (obj.id == element.itemId) && (obj.data == 0);
						});
					}

					callback(null, {
						count: element.count,
						itemDamage: element.itemDamage,
						itemId: element.itemId,
						slot: element.slot,
						image: 'https://greencubes.org/img/items/' + ((item) ? item.image : ''),
						name: ((item) ? item.name : '&mdash;')
					});
				}, function (err, inventory) {
					if (err) return callback(err);

					callback(null, inventory);
				});
			}
		], function (err, inventory) {
			if (err) {
				return res.serverError(err);
			}

			res.view('ingameinfo/player/inventory', {
				inventory: inventory
			});
		});

	},

	playerLoginlog: function (req, res) {
		if (!req.param('nickname') && !req.param('ip') && !req.param('hwid')) {
			res.view('ingameinfo/player/loginlog', {
				log: null
			});
			return;
		}

		var query = 'SELECT * FROM `login_log` WHERE ',
			whereQuery = '';
			nickname = (req.param('nickname')) ? req.param('nickname').replace(/[^a-zA-Z0-9_-]/g, '') : null,
			ip = (req.param('ip')) ? req.param('ip').replace(/[^0-9\.]/g, '') : null,
			hwid = (req.param('hwid')) ? req.param('hwid').replace(/[^a-zA-Z0-9\:]/g, '') : null,
			 page = (parseInt(req.param('page'), 10) >= 1) ? parseInt(req.param('page'), 10) : 1;

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

		query += ' ORDER BY `id` DESC LIMIT ' + (page - 1) * 100 + ',100';

		async.waterfall([
			function getLog(callback) {
				gcdb.mainsrvdb.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeStatus(log, callback) {
				async.map(log, function (element, callback) {
					element.status = gch.serializeLoginLogStatus(element.status);

					callback(null, element);
				}, function (err, log) {
					if (err) return callback(err);

					callback(null, log);
				});
			},
			function getPageCount(log, callback) {
				gcdb.mainsrvdb.query('SELECT count(*) AS count FROM `login_log` WHERE ' + whereQuery, function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) return res.serverError(err);

			res.view('ingameinfo/player/loginlog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	},


	/*
	IC3096,1,0;IC278,1,1180,{"UID":63,"title":"Сувенир с дня рождения GreenCubes 2012","NamePrefix":"Праздничная"}
	CI14,45,0;CI265,30,0;CI265,64,0;CI265,64,0;CI265,64,0;CI266,17,0;CI264,24,0;CI351,42,4
	*/
	playerChestslog: function (req, res) {
		if (!req.param('nickname')) {
			res.view('ingameinfo/player/chestslog', {
				log: null
			});
			return;
		}

		var time = (req.param('time') === 'true') ? true : false,
			firsttime = Date.parse(req.param('firsttime')) / 1000,
			secondtime = Date.parse(req.param('secondtime')) / 1000,
			page = (parseInt(req.param('page'), 10) >= 1) ? parseInt(req.param('page'), 10) : 1,
			userId,
			queryTime;


		if (time && firsttime && isNaN(firsttime) || secondtime && isNaN(secondtime) || firsttime > secondtime) {
			res.view('ingameinfo/player/chatlog', {
				logs: {code: 'wrongtime'}
			});
			return;
		}

		if (time && firsttime && secondtime) {
			queryTime = ' AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"';
		} else {
			queryTime = '';
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
				var query = 'SELECT * FROM `chest_logs` WHERE `user` = "' + userId + '"' + queryTime + ' ORDER BY `id` DESC LIMIT ' + (page - 1) * 100 + ',100';

				gcdb.mainsrvdb.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeLog(log, callback) {
				gch.serializeChestLog(log, function (err, log) {
					if (err) return callback(err);

					callback(null, log);
				});
			},
			function getPageCount(log, callback) {
				gcdb.mainsrvdb.query('SELECT count(*) as count FROM `chest_logs` WHERE `user` = "' + userId +  '" AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"', function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) return res.serverError(err);

			res.view('ingameinfo/player/chestslog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	},

	playerChatlog: function (req, res) {
		var firsttime = Date.parse(req.param('firsttime')) / 1000,
			secondtime = Date.parse(req.param('secondtime')) / 1000,
			query,
			 page = (parseInt(req.param('page'), 10) >= 1) ? parseInt(req.param('page'), 10) : 1,
			userId,
			nickname = (req.param('nickname')) ? req.param('nickname').replace(/[^a-zA-Z0-9_-]/g, '') : null;

		if (!nickname && !req.param('channelid')) {
			res.view('ingameinfo/player/chatlog', {
				log: null
			});
			return;
		}

		if (req.user.group === ugroup.mod && nickname && staffs.indexOf(nickname.toLowerCase()) !== -1) {
			res.view('ingameinfo/player/chatlog', {
				log: {code: 'staffblock'}
			});
			return;
		}

		if (firsttime && isNaN(firsttime) || secondtime && isNaN(secondtime) || firsttime > secondtime) {
			res.view('ingameinfo/player/chatlog', {
				log: {code: 'wrongtime'}
			});
			return;
		}

		if ((secondtime - firsttime) > 1209600) {
			res.view('ingameinfo/player/chatlog', {
				log: {code: 'bigtime'}
			});
			return;
		}

		if (req.param('channelid') && isNaN(req.param('channelid'))) {
			res.view('ingameinfo/player/chatlog', {
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

						query += ' ORDER BY `id` DESC LIMIT ' + (page - 1) * 100 + ',100';

						userId = uid;

						callback(null);
					});
				} else {
					query = 'SELECT * FROM `chat_log` WHERE UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"';

					if (req.param('channelid') && !isNaN(req.param('channelid'))) {
						query += ' AND `channel` = "' + req.param('channelid') + '"';
					}

					query += ' ORDER BY `id` DESC LIMIT ' + (page - 1) * 100 + ',100';

					callback(null);
				}
			},
			function getLog(callback) {
				gcdb.mainsrvdb.query(query, function (err, result) {
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
					query = 'SELECT count(*) as count FROM `chat_log` WHERE UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '" AND (`player` = "' + userId +  '" OR `targetPlayer` = "' + userId +  '")';

					if (req.param('channelid') && !isNaN(req.param('channelid'))) {
						query += ' AND `channel` = "' + req.param('channelid') + '"';
					}
				} else {
					query = 'SELECT count(*) as count FROM `chat_log` WHERE UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"';

					if (req.param('channelid') && !isNaN(req.param('channelid'))) {
						query += ' AND `channel` = "' + req.param('channelid') + '"';
					}
				}

				gcdb.mainsrvdb.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) return res.serverError(err);

			res.view('ingameinfo/player/chatlog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	},

	playerCommandslog: function (req, res) {
		if (!req.param('nickname')) {
			res.view('ingameinfo/player/commandslog', {
				log: null
			});
			return;
		}

		if (req.user.group === ugroup.mod && staffs.indexOf(req.param('nickname').toLowerCase()) !== -1) {
			res.view('ingameinfo/player/commandslog', {
				log: {code: 'staffblock'}
			});
			return;
		}

		var firsttime = Date.parse(req.param('firsttime')) / 1000,
			secondtime = Date.parse(req.param('secondtime')) / 1000,
			query,
			 page = (parseInt(req.param('page'), 10) >= 1) ? parseInt(req.param('page'), 10) : 1,
			userId;

		if (firsttime && isNaN(firsttime) || secondtime && isNaN(secondtime) || firsttime > secondtime) {
			res.view('ingameinfo/player/commandslog', {
				log: {code: 'wrongtime'}
			});
			return;
		}

		if ((secondtime - firsttime) > 1209600) {
			res.view('ingameinfo/player/commandslog', {
				log: {code: 'bigtime'}
			});
			return;
		}

		async.waterfall([
			function getUIDNBuildQuery(callback) {
				gcdb.user.getByLogin(req.param('nickname').replace(/[^a-zA-Z0-9_-]/g, ''), 'maindb', function (err, uid) {
					if (err) return callback(err);

					query = 'SELECT * FROM `commands_log` WHERE `player` = "' + uid +  '" AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '" ORDER BY `id` DESC LIMIT ' + (page - 1) * 100 + ',100';

					userId = uid;

					callback(null);
				});
			},
			function getLog(callback) {
				gcdb.mainsrvdb.query(query, function (err, result) {
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
				gcdb.mainsrvdb.query('SELECT count(*) AS count FROM `commands_log` WHERE `player` = "' + userId +  '" AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"', function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) return res.serverError(err);

			res.view('ingameinfo/player/commandslog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	},

	worldRegioninfo: function (req, res) {
		if (!req.param('regionname')) {
			res.view('ingameinfo/world/regioninfo', {
				rinfo: null
			});
			return;
		}

		gch.getRegionsInfo([{name:req.param('regionname')}], req.user.group, function (err, rinfo) {
			if (err) {
				return res.serverError(err);
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
				function serializeFull_accessOrgs(callback) {
					async.map(rinfo.full_access.orgs, function (element, callback) {
						gcdb.org.getByID(element, function (err, org) {
							if (err) return callback(err);

							if (org) {
								callback(null, {
									id: org.id,
									tag: org.tag
								});
							} else {
								callback(null, {
									id: element,
									tag: element
								});
							}
						});
					}, function (err, array) {
						if (err) return callback(err);

						rinfo.full_access.orgs = array;

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
				function serializeBuild_accessOrgs(callback) {
					async.map(rinfo.build_access.orgs, function (element, callback) {
						gcdb.org.getByID(element, function (err, org) {
							if (err) return callback(err);

							if (org) {
								callback(null, {
									id: org.id,
									tag: org.tag
								});
							} else {
								callback(null, {
									id: element,
									tag: element
								});
							}
						});
					}, function (err, array) {
						if (err) return callback(err);

						rinfo.build_access.orgs = array;

						callback(null);
					});
				}
			], function (err) {
				if (err) callback(err);

				res.view('ingameinfo/world/regioninfo', {
					rinfo: rinfo
				});
			});
		});
	},

	worldChestlog: function (req, res) {
		if (!req.param('xyz')) {
			res.view('ingameinfo/world/chestlog', {
				log: null
			});
			return;
		}

		var time = (req.param('time') === 'true') ? true : false,
			firsttime = Date.parse(req.param('firsttime')) / 1000,
			secondtime = Date.parse(req.param('secondtime')) / 1000,
			 page = (parseInt(req.param('page'), 10) >= 1) ? parseInt(req.param('page'), 10) : 1,
			queryTime;

		if (time && firsttime && isNaN(firsttime) || secondtime && isNaN(secondtime) || firsttime > secondtime) {
			res.view('ingameinfo/player/chatlog', {
				logs: {code: 'wrongtime'}
			});
			return;
		}

		if (time && firsttime && secondtime) {
			queryTime = ' AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"';
		} else {
			queryTime = '';
		}

		// ['-1337','42','420']
		var xyzMatch = req.param('xyz').match(/^(-?[0-9]*) (\-?[0-9]*) (\-?[0-9]*)/g),
			xyzSplited = req.param('xyz').split(' ');

		if (!xyzMatch){
			res.view('ingameinfo/world/blockslog', {
				log: {code: 'wrongxyz'}
			});
			return;
		}

		async.waterfall([
			function getLog(callback) {
				var query = 'SELECT * FROM `chest_logs` WHERE `x` = ' + xyzSplited[0] + ' AND `y` = ' + xyzSplited[1] + ' AND `z` = ' + xyzSplited[2] + queryTime + ' ORDER BY `id` DESC LIMIT ' + (page - 1) * 100 + ',100';

				gcdb.mainsrvdb.query(query, function (err, result) {
					if (err) return callback(err);

					callback(null, result);
				});
			},
			function serializeLog(log, callback) {
				gch.serializeChestLog(log, function (err, log) {
					if (err) return callback(err);

					callback(null, log);
				});
			},
			function getPageCount(log, callback) {
				gcdb.mainsrvdb.query('SELECT count(*) as count FROM `chest_logs` WHERE `x` = "' + xyzSplited[0] + '" AND `y` = "' + xyzSplited[1] + '" AND `z` = "' + xyzSplited[2] + '" AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"', function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) return res.serverError(err);

			res.view('ingameinfo/world/chestlog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	},

	worldBlockslog: function (req, res) {
		if (!req.param('xyz') && !req.param('firstxyz') && !req.param('secondxyz') && !req.param('firsttime') && !req.param('secondtime')) {
			res.view('ingameinfo/world/blockslog', {
				log: null
			});
			return;
		}

		if (isNaN(req.param('block')) || [10, 8, 51, 63, 19].indexOf(parseInt(req.param('block'), 10)) === -1) {
			res.view('ingameinfo/world/blockslog', {
				log: {code:'wrongblock'}
			});
			return;
		}

		var  page = (parseInt(req.param('page'), 10) >= 1) ? parseInt(req.param('page'), 10) : 1,
			queryWhere,
			queryParams;

		async.waterfall([
			function getLogs(callback) {
				if (req.param('xyz')) {
					// ['-1337','42','420']
					var xyzMatch = req.param('xyz').match(/^(-?[0-9]*) (\-?[0-9]*) (\-?[0-9]*)/g),
						xyzSplited = req.param('xyz').split(' ');

					if (!xyzMatch){
						res.view('ingameinfo/world/blockslog', {
							log: {code: 'wrongxyz'}
						});
						return;
					}

					queryWhere = '`x` = ? AND `y` = ? AND `z` = ? AND `block` = ?';
					queryParams = [xyzSplited[0], xyzSplited[1], xyzSplited[2], req.param('block')];


					gcdb.mainsrvdb.query('SELECT * FROM `blocks_log` WHERE ' + queryWhere  + ' ORDER BY `id` DESC LIMIT ' + (page - 1) * 100 + ',100', queryParams, function (err, result) {
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
						res.view('ingameinfo/world/blockslog', {
							logs: {code: 'wrongxyz'}
						});
						return;
					}

					if (firsttime && isNaN(firsttime) || secondtime && isNaN(secondtime)) {
						res.view('ingameinfo/world/blockslog', {
							logs: {code: 'wrongtime'}
						});
						return;
					}

					queryWhere = '`x` >= ? AND `x` <= ? AND `y` >= ? AND `y` <= ? AND `z` >= ? AND `z` <= ? AND UNIX_TIMESTAMP(`time`) >= ? AND UNIX_TIMESTAMP(`time`) <= ? AND `block` = ?';
					queryParams = [firstxyzSplited[0], secondxyzSplited[0], firstxyzSplited[1], secondxyzSplited[1], firstxyzSplited[2], secondxyzSplited[2], firsttime, secondtime, req.param('block')];

					gcdb.mainsrvdb.query('SELECT * FROM `blocks_log` WHERE ' + queryWhere + ' ORDER BY `id` DESC LIMIT ' + (page - 1) * 100 + ',100', queryParams, function (err, result) {
						if (err) return callback(err);

						callback(null, result);
					});
				} else {
					res.view('ingameinfo/world/blockslog', {
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
				gcdb.mainsrvdb.query('SELECT count(*) AS count FROM `blocks_log` WHERE ' + queryWhere, queryParams, function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) return res.serverError(err);

			res.view('ingameinfo/world/blockslog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	},

	worldMoneylog: function (req, res) {
		if (!req.param('sender')) {
			res.view('ingameinfo/world/moneylog', {
				log: null
			});
			return;
		}

		if (req.user.group === ugroup.mod && staffs.indexOf(req.param('sender').toLowerCase()) !== -1) {
			res.view('ingameinfo/world/moneylog', {
				log: {code: 'staffblock'}
			});
			return;
		}

		var sender = req.param('sender'),
			time = (req.param('time') === 'true') ? true : false,
			firstTime = Date.parse(req.param('firsttime')) / 1000,
			secondTime = Date.parse(req.param('secondtime')) / 1000,
			queryTime,
			type,
			 page = (parseInt(req.param('page'), 10) >= 1) ? parseInt(req.param('page'), 10) : 1;

		if (time && firsttime && secondtime) {
			queryTime = ' AND UNIX_TIMESTAMP(`time`) >= "' + firsttime + '" AND UNIX_TIMESTAMP(`time`) <= "' + secondtime + '"';
		} else {
			queryTime = '';
		}

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
						res.view('ingameinfo/player/moneylog', {
							log: {code: 'wrongorg'}
						});
					} else {
						callback(null, sender, type);
					}
				}
			},
			function getLog(uid, type, callback) {
				gcdb.mainsrvdb.query('SELECT * FROM `money_log` WHERE ((`sender` = ? AND `senderType` = ?) OR (`reciever` = ? AND `recieverType` = ?))' + queryTime + ' ORDER BY `id` DESC LIMIT ' + (page - 1) * 100 + ',100', [uid, type, uid, type, firstTime, secondTime], function (err, result) {
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
								gcdb.org.getByID(element.reciever, function (err, org) {
									if (err) return callback(err);

									if (org) {
										element.reciever = 'o:' + org.tag;
									} else {
										element.reciever = 'o:' + element.reciever;
									}

									callback(null, element);
								});
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
								gcdb.org.getByID(element.reciever, function (err, org) {
									if (err) return callback(err);

									if (org) {
										element.reciever = 'o:' + org.tag;
									} else {
										element.reciever = 'o:' + element.reciever;
									}

									callback(null, element);
								});
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
				gcdb.mainsrvdb.query('SELECT count(*) AS count FROM `money_log` WHERE ((`sender` = ? AND `senderType` = ?) OR (`reciever` = ? AND `recieverType` = ?))' + queryTime + ' ORDER BY `id` DESC', [sender, type, sender, type, firstTime, secondTime], function (err, result) {
					if (err) return callback(err);

					callback(null, log, Math.ceil(result[0].count / 100));
				});
			}
		], function (err, log, lastPage) {
			if (err) {
				return res.serverError(err);
			}

			res.view('ingameinfo/world/moneylog', {
				log: log,
				lastPage: lastPage,
				currentPage: page
			});
		});
	},

	worldStatisticsView: function (req, res) {
		res.view('ingameinfo/world/statistics');
	},

	worldStatisticsPlayers: function (req, res) {
		var obj = {
				dates: [],
				data: []
			};

		async.waterfall([
			function getCachedData(callback) {
				UserStatistics.find({
					sort: 'date ASC'
				}).exec(function (err, result) {
					if (err) return res.serverError(err);

					obj.data = result;

					callback(null, obj);
				});
			},
			function cacheNewData(obj, callback) {
				var lastElement = obj.data[obj.data.length - 1],
					lastCachedDate = (lastElement) ? moment(lastElement.date) : moment('2011-01-13');

				if (!lastCachedDate.diff(moment().subtract(1, 'days'), 'days')) {
					callback(null, obj);
				} else {
					var checkDate = lastCachedDate.add(1, 'days'),
						toCache = [];

					async.whilst(
						function () { return checkDate.diff(moment(), 'days') < 0; },
						function (callback) {
							async.waterfall([
								function getDaysRegistratedUsers(callback) {
									gcdb.sitedb.query('SELECT `login` FROM `users` WHERE DATE(`reg_date`) = ?', [checkDate.format("YYYY-MM-DD")], function (err, result) {
										if (err) return callback(err);

										var regUsers = result.map(function (element) {
											return element.login;
										});

										if (regUsers.length === 0) {
											return callback(null, {
												registratedUsers: [],
												registrations: 0,
												activations: 0,
												online: 0,
												date: checkDate.format("YYYY-MM-DD")
											});
										}

										callback(null, {
											registratedUsers: regUsers,
											registrations: regUsers.length,
											activations: null,
											online: null,
											date: checkDate.format("YYYY-MM-DD")
										});
									});
								},
								function getActivationsCount(obj, callback) {
									if (obj.activations === 0) {
										callback(null, obj);
									} else {
										gcdb.sitedb.query('SELECT COUNT(*) as `count` FROM `users` WHERE DATE(`reg_date`) = ? AND (`activation_code` = "" OR `activation_code` IS NULL)', [checkDate.format("YYYY-MM-DD")], function (err, result) {
											if (err) return callback(err);

											obj.activations = result[0].count;

											callback(null, obj);
										});
									}
								},
								function getPlayersThatEnteredServer(obj, callback) {
									if (obj.online === 0) {
										callback(null, obj);
									} else {
										gcdb.mainsrvdb.query('SELECT COUNT(distinct login) as `count` FROM `login_log` WHERE `login` IN (?)', [obj.registratedUsers], function (err, result) {
											if (err) return callback(err);

											obj.online = result[0].count;

											callback(null, obj);
										});
									}
								}
							], function (err, result) {
								if (err) return callback(err);

								if (lastCachedDate.diff(moment(), 'days')) {
									delete result.registratedUsers;

									toCache.push(result);
									obj.data.push(result);
								}

								callback(null);
							});

							checkDate = lastCachedDate.add(1, 'days');
						},
						function (err) {
							if (err) return callback(err);

							UserStatistics.create(toCache, function (err, result) {
								if (err) return callback(err);

								callback(null, obj);
							});
						}
					);
				}
			},
			function serializeData(obj, callback) {
				var registrations = [],
					activations = [],
					online = [];

				async.each(obj.data, function (element, callback) {
					registrations.push([moment(element.date).add(4, 'hours').unix() * 1000, element.registrations]);
					activations.push([moment(element.date).add(4, 'hours').unix() * 1000, element.activations]);
					online.push([moment(element.date).add(4, 'hours').unix() * 1000, element.online]);

					callback(null);
				}, function (err) {
					if (err) return callback(err);

					obj.data = {
						registrations: registrations,
						activations: activations,
						online: online
					};

					callback(null, obj);
				});
			}
		], function (err, obj) {
			if (err) return res.serverError(err);

			res.json(obj);
		});
	},

	worldStatisticsQuests: function (req, res) {
		// 2 6 11 16 24
		var obj = {
				dates: [],
				data: []
			};

		async.waterfall([
			function getCachedData(callback) {
				QuestStatistics.find({
					sort: 'date ASC'
				}).exec(function (err, result) {
					if (err) return res.serverError(err);

					obj.data = result;

					callback(null, obj);
				});
			},
			function cacheNewData(obj, callback) {
				var lastElement = obj.data[obj.data.length - 1],
					lastCachedDate = (lastElement) ? moment(lastElement.date) : moment('2011-01-13');

				if (!lastCachedDate.diff(moment().subtract(1, 'days'), 'days')) {
					callback(null, obj);
				} else {
					var checkDate = lastCachedDate.add(1, 'days'),
						toCache = [];

					async.whilst(
						function () { return checkDate.diff(moment(), 'days') < 0; },
						function (callback) {
							async.waterfall([
								function getRegistratedUsers(callback) {
									gcdb.sitedb.query('SELECT `login`, `game_id` as `id` FROM `users` WHERE DATE(`reg_date`) = ? AND (`activation_code` = "" OR `activation_code` IS NULL)', [checkDate.format("YYYY-MM-DD")], function (err, result) {
										if (err) return callback(err);

										var regUsersIds = result.map(function (element) {
												return element.id;
											}),
											regUsersLogins = result.map(function (element) {
												return element.login;
											});

										if (regUsersIds.length === 0) {
											return callback(null, {
												players: 0,
												quest2: 0,
												quest6: 0,
												quest11: 0,
												quest16: 0,
												quest24: 0,
												date: checkDate.format("YYYY-MM-DD")
											});
										}

										callback(null, {
											players: null,
											playersIds: regUsersIds,
											playersLogins: regUsersLogins,
											quest2: null,
											quest6: null,
											quest11: null,
											quest16: null,
											quest24: null,
											date: checkDate.format("YYYY-MM-DD")
										});
									});
								},
								function getCountPlayersThatEnteredServer(obj, callback) {
									if (obj.players === 0) {
										callback(null, obj);
									} else {
										gcdb.mainsrvdb.query('SELECT COUNT(distinct login) as `count` FROM `login_log` WHERE `login` IN (?)', [obj.playersLogins], function (err, result) {
											if (err) return callback(err);

											obj.players = result[0].count;

											callback(null, obj);
										});
									}
								},
								function getQuest2PlayersPassed(obj, callback) {
									if (obj.quest2 === 0) {
										callback(null, obj);
									} else {
										gcdb.mainsrvdb.query('SELECT COUNT(*) as `count` FROM `quests_data` WHERE (`data` LIKE \'%"quest_2":"1"%\' OR `data` LIKE \'%"quest_2":1%\') AND `user` IN (?)', [obj.playersIds], function (err, result) {
											if (err) return callback(err);

											obj.quest2 = result[0].count;

											callback(null, obj);
										});
									}
								},
								function getQuest6PlayersPassed(obj, callback) {
									if (obj.quest6 === 0) {
										callback(null, obj);
									} else {
										gcdb.mainsrvdb.query('SELECT COUNT(*) as `count` FROM `quests_data` WHERE (`data` LIKE \'%"quest_6":"1"%\' OR `data` LIKE \'%"quest_6":1%\') AND `user` IN (?)', [obj.playersIds], function (err, result) {
											if (err) return callback(err);

											obj.quest6 = result[0].count;

											callback(null, obj);
										});
									}
								},
								function getQuest11PlayersPassed(obj, callback) {
									if (obj.quest11 === 0) {
										callback(null, obj);
									} else {
										gcdb.mainsrvdb.query('SELECT COUNT(*) as `count` FROM `quests_data` WHERE (`data` LIKE \'%"quest_11":"1"%\' OR `data` LIKE \'%"quest_11":1%\') AND `user` IN (?)', [obj.playersIds], function (err, result) {
											if (err) return callback(err);

											obj.quest11 = result[0].count;

											callback(null, obj);
										});
									}
								},
								function getQuest16PlayersPassed(obj, callback) {
									if (obj.quest16 === 0) {
										callback(null, obj);
									} else {
										gcdb.mainsrvdb.query('SELECT COUNT(*) as `count` FROM `quests_data` WHERE (`data` LIKE \'%"quest_16":"1"%\' OR `data` LIKE \'%"quest_16":1%\') AND `user` IN (?)', [obj.playersIds], function (err, result) {
											if (err) return callback(err);

											obj.quest16 = result[0].count;

											callback(null, obj);
										});
									}
								},
								function getQuest24PlayersPassed(obj, callback) {
									if (obj.quest24 === 0) {
										callback(null, obj);
									} else {
										gcdb.mainsrvdb.query('SELECT COUNT(*) as `count` FROM `quests_data` WHERE (`data` LIKE \'%"quest_24":"1"%\' OR `data` LIKE \'%"quest_24":1%\') AND `user` IN (?)', [obj.playersIds], function (err, result) {
											if (err) return callback(err);

											obj.quest24 = result[0].count;

											callback(null, obj);
										});
									}
								}
							], function (err, result) {
								if (err) return callback(err);

								if (lastCachedDate.diff(moment(), 'days')) {
									delete obj.playersIds;
									delete obj.playersLogins;

									toCache.push(result);
									obj.data.push(result);
								}

								callback(null);
							});

							checkDate = lastCachedDate.add(1, 'days');
						},
						function (err) {
							if (err) return callback(err);

							QuestStatistics.create(toCache, function (err, result) {
								if (err) return callback(err);

								callback(null, obj);
							});
						}
					);
				}
			},
			function serializeData(obj, callback) {
				var players = [],
					quest2 = [],
					quest6 = [],
					quest11 = [],
					quest16 = [],
					quest24 = [];

				async.each(obj.data, function (element, callback) {
					players.push([moment(element.date).add(4, 'hours').unix() * 1000, element.players]);
					quest2.push([moment(element.date).add(4, 'hours').unix() * 1000, element.quest2]);
					quest6.push([moment(element.date).add(4, 'hours').unix() * 1000, element.quest6]);
					quest11.push([moment(element.date).add(4, 'hours').unix() * 1000, element.quest11]);
					quest16.push([moment(element.date).add(4, 'hours').unix() * 1000, element.quest16]);
					quest24.push([moment(element.date).add(4, 'hours').unix() * 1000, element.quest24]);

					callback(null);
				}, function (err) {
					if (err) return callback(err);

					obj.data = {
						players: players,
						quest2: quest2,
						quest6: quest6,
						quest11: quest11,
						quest16: quest16,
						quest24: quest24,
					};

					callback(null, obj);
				});
			}
		], function (err, obj) {
			if (err) return res.serverError(err);

			res.json(obj);
		});
	}

};

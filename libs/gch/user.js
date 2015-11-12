/* GCH – Helper library • User-related functions */

module.exports = user = {
	getGroup: function getGroup(user, cb) {
        if (typeof user === 'number') {
            gcdb.appdb.query('SELECT ugroup FROM users WHERE uid = ?', [user], function (err, result) {
                if (err) return cb(err);

                if (result.length !== 0) {
                    cb(null, result[0].ugroup);
                } else {
                    cb(null, 0); // User have group 0 by default
                }
            });
        } if (typeof user === 'string') {
            gcdb.user.getByID(user, function (err, uid) {
                if (err) return cb(err);

                gcdb.appdb.query('SELECT ugroup FROM users WHERE uid = ?', [user], function (err, result) {
                    if (err) return cb(err);

                    if (result.length !== 0) {
                        cb(null, result[0].ugroup);
                    } else {
                        cb(null, 0); // User have group 0 by default
                    }
                });
            });
        } else {
            cb('Incorrect variable!');
        }
	},

	getGroupString: function getGroupString(ugroup) {
		switch (ugroup) {
			case 0:
				return sails.__({phrase:'global.ugroup.user',locale: sails.language});

			case 1:
				return sails.__({phrase:'global.ugroup.helper',locale: sails.language});

			case 2:
				return sails.__({phrase:'global.ugroup.moderator',locale: sails.language});

			case 3:
				return sails.__({phrase:'global.ugroup.team',locale: sails.language});

			default:
				return;
		}
	},

	getPrefix: function getPrefix(user, cb) {
        if (typeof(user) === 'number') {
            gcdb.appdb.query('SELECT prefix FROM users WHERE uid = ?', [user], function (err, result) {
                if (err) return cb(err);

                if (result.length !== 0) {
                    cb(null, result[0].prefix);
                } else {
                    cb(null, '');
                }
            });
        } else if (typeof(user) === 'string') {
            gcdb.user.getByLogin(user, function (err, uid) {
                if (err) return cb(err);

                gcdb.appdb.query('SELECT prefix FROM users WHERE uid = ?', [uid], function (err, result) {
                    if (err) return cb(err);

                    if (result.length !== 0) {
                        cb(null, result[0].prefix);
                    } else {
                        cb(null, '');
                    }
                });
            });
        } else {
            cb('Incorrect variable: ' + user + ' & ' + typeof user);
        }
	},

	getColorClass: function getColorClass(user, cb) {
        if (typeof user === 'number') {
            gcdb.appdb.query('SELECT colorclass FROM users WHERE uid = ?', [user], function (err, result) {
                if (err) return cb(err);

                if (result.length !== 0) {
                    cb(null, result[0].colorclass);
                } else {
                    cb(null, '');
                }
            });
        } else if (typeof user === 'string') {
            gcdb.getByID(user, function (err, uid) {
                if (err) return cb(err);

                gcdb.appdb.query('SELECT colorclass FROM users WHERE uid = ?', [user], function (err, result) {
                    if (err) return cb(err);

                    if (result.length !== 0) {
                        cb(null, result[0].colorclass);
                    } else {
                        cb(null, '');
                    }
                });
            });
        } else {
            cb('Incorrect variable!');
        }
	},

	getLastseen: function getLastseen(user, cb) {
		async.waterfall([
			function checkData(callback) {
				if (typeof user === 'number') {
					gcdb.user.getByID(user, function (err, login) {
						if (err) return callback(err);

						callback(null, login);
					});
				} else if (typeof user === 'string') {
					callback(null, user);
				} else {
					callback('Incorrect variable!');
				}
			},
			function findLastseenMain(username, callback) {
				gcdb.mainsrvdb.query('SELECT * FROM login_log WHERE `login` = ? AND `status` = 1 ORDER BY `time` DESC LIMIT 1', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, {
							login: null,
							time: null,
							exit: null,
							ip: null,
							hardware: null
						});
					} else {
						callback(null, {
							login: result[0].login,
							time: result[0].time,
							exit: result[0].exit,
							ip: result[0].ip,
							hardware: result[0].hardware
						});
					}
				});
			}
		], function (err, result) {
			if (err) return cb(err);

			cb(null, result);
		});
	},

	getProfile: function getProfile(login, cb) {
		var obj = {
			login: login,
			prefix: null,
			lastseen: null,
			regdate: null
		};

		async.waterfall([
			function getCapitalizedLogin(obj, callback) {
				gcdb.user.getCapitalizedLogin(obj.login, function (err, login) {
					if (err) return callback(err);

					obj.login = login;

					callback(null, obj);
				});
			},
			function getPrefix(obj, callback) {
				user.getPrefix(obj.login, function (err, prefix) {
					if (err) return callback(err);

					obj.prefix = prefix;

					callback(null, obj);
				});
			},
			function getRegDate(obj, callback) {
				gcdb.user.getRegDate(obj.login, function (err, regDate) {
					if (err) return callback(err);

					obj.regdate = regDate;

					callback(null, obj);
				});
			}
		],
		function (err) {
			if (err) return cb(err);

			cb(null, obj);
		});
	},


	getPInfo: function getPInfo(credential, cb) {
		var obj = {
			user: {
				id: null,
				gameId: null,
				login: credential.replace(/[^a-zA-Z0-9_-]/g, '')
			},
			prefix: null,
			regdate: null,
			lastseen: null,
			lastip: null,
			lasthwid: null,
			ban: {
				status: null, // 0 - no ban, 1 - tempban, 2 - permban
				till: null
			},
			ticketsCount: null,
			memos: null
		};

		async.waterfall([
			function getCapitalizedLogin(callback) {
				gcdb.user.getCapitalizedLogin(obj.user.login, function (err, login) {
					if (err) return callback(err);

					if (!login) return callback({nouser: true});

					obj.user.login = login;

					callback(null, obj);
				});
			},
			function getUId(obj, callback) {
				gcdb.user.getByLogin(obj.user.login, function (err, uid) {
					if (err) return callback(err);

					obj.user.id = uid;

					callback(null, obj);
				});
			},
			function getPrefix(obj, callback) {
				user.getPrefix(obj.user.id, function (err, prefix) {
					if (err) return callback(err);

					obj.prefix = prefix;

					callback(null, obj);
				});
			},
			function getRegDate(obj, callback) {
				gcdb.user.getRegDate(obj.user.login, function (err, regDate) {
					if (err) return callback(err);

					obj.regdate = regDate;

					callback(null, obj);
				});
			},
			function getLastseenNOnlineStatus(obj, callback) {
				user.getLastseen(obj.user.login, function (err, result) {
					if (err) return callback(err);

					obj.online = (result.exit) ? false : true; // Offline if exit time is here. Online if no.

					obj.lastseen = result.time;
					obj.lastip = result.ip;
					obj.lasthwid = result.hardware;

					callback(null, obj);
				});
			},
			function getBanNUId(obj, callback) {
				gcdb.usersdb.query('SELECT `id`, `isBanned`, `bannedTill`, UNIX_TIMESTAMP(`bannedTill`) AS `bannedTillTS`, UNIX_TIMESTAMP(NOW()) AS `currentTimestamp` FROM users WHERE name = ?', [obj.user.login], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback('Incorrect user!');
					} else {
						obj.user.gameId = result[0].id;

						if (result[0].isBanned) {
							obj.ban = {
								status: 2,
								till: (result[0].bannedTill) ? result[0].bannedTill : null
							};
						} else if (result[0].bannedTillTS > result[0].currentTimestamp) {
							obj.ban = {
								status: 1,
								till: result[0].bannedTill
							};
						} else {
							obj.ban = {
								status: 0,
								till: null
							};
						}
						callback(null, obj);
					}
				});
			},
			function getTicketsCount(obj, callback) {
				Tickets.count({
					owner: obj.user.id
				}).exec(function (err, count) {
					if (err) return callback(err);

					obj.ticketsCount = count;

					callback(null, obj);
				});
			},
			function getMemos(obj, callback) {
				gcdb.usersdb.query('SELECT `moderator_id` AS `moderator`, `memo`, `time` FROM memos WHERE user_id = ? ORDER BY time DESC', [obj.user.gameId], function (err, result) {
					if (err) return callback(err);

					obj.memos = result;

					callback(null, obj);
				});
			},
			function serializeMemos(obj, callback) {
				async.map(obj.memos, function(element, callback) {
					gcdb.user.getByID(element.moderator, 'usersdb', function (err, username) {
						if (err) return callback(err);

						element.moderator = username;

						callback(null, element);
					});
				}, function (err, memos) {
					if (err) return callback(err);

					obj.memos = memos || obj.memos;

					callback(null, obj);
				});
			}
		],
		function (err, obj) {
			if (err) {
				if (err.nouser) {
					return cb(null, null);
				}
				return cb(err);
			}

			cb(null, obj);
		});
	}
};

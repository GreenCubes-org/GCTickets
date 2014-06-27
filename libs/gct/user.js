module.exports = user = {
	getGroup: function getGroup(user, cb) {
        if (typeof user === 'number') {
            appdbconn.query('SELECT ugroup FROM rights WHERE uid = ?', [user], function (err, result) {
                if (err) return cb(err);

                if (result.length !== 0) {
                    cb(null, result[0].ugroup);
                } else {
                    cb(null, 0); // User have group 0 by default
                }
            });
        } if (typeof user === 'string') {
            gcdb.getByID(user, function (err, uid) {
                if (err) return cb(err);

                appdbconn.query('SELECT ugroup FROM rights WHERE uid = ?', [user], function (err, result) {
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
				return 'Пользователь';

			case 1:
				return 'Хелпер';

			case 2:
				return 'Модератор';

			case 3:
				return 'Команда ГК';

			default:
				return;
		}
	},

	getPrefix: function getPrefix(user, cb) {
        if (typeof(user) === 'number') {
            appdbconn.query('SELECT prefix FROM rights WHERE uid = ?', [user], function (err, result) {
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

                appdbconn.query('SELECT prefix FROM rights WHERE uid = ?', [uid], function (err, result) {
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
            appdbconn.query('SELECT colorclass FROM rights WHERE uid = ?', [user], function (err, result) {
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

                appdbconn.query('SELECT colorclass FROM rights WHERE uid = ?', [user], function (err, result) {
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
					gcdb.getByID(user, function (err, login) {
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
				gcmainconn.query('SELECT `exit`, `time` FROM login_log WHERE login = ? ORDER BY `time` DESC LIMIT 1', [username], function (err, result) {
					if (err) return callback(err);

					if (result.length === 0) {
						callback(null, null);
					} else {
						callback(null, result[0].time);
					}
				});
			}
		], function (err, lastseen) {
			if (err) return cb(err);

			cb(null, lastseen);
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
				login: credential
			},
			prefix: null,
			lastseen: null,
			ban: {
				status: null, // 0 - no ban, 1 - tempban, 2 - permban
				till: null
			},
			ticketsCount: null,
			memos: null
		};

		async.waterfall([
			function getUId(callback) {
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
			function getLastseen(obj, callback) {
				user.getLastseen(obj.user.login, function (err, lastseen) {
					if (err) return callback(err);

					obj.lastseen = lastseen;

					callback(null, obj);
				});
			},
			function getBanNUId(obj, callback) {
				gcmainconn.query('SELECT `id`, `isBanned`, `bannedTill`, UNIX_TIMESTAMP(`bannedTill`) AS `bannedTillTS`, UNIX_TIMESTAMP(NOW()) AS `currentTimestamp` FROM users WHERE name = ?', [obj.user.login], function (err, result) {
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
				Ticket.count({
					owner: obj.user.id
				}).done(function (err, count) {
					if (err) return callback(err);

					obj.ticketsCount = count;

					callback(null, obj);
				});
			},
			function getLastTenMemos(obj, callback) {
				gcmainconn.query('SELECT `moderator_id` AS `moderator`, `memo`, `time` FROM memos WHERE user_id = ? ORDER BY time DESC LIMIT 10', [obj.user.gameId], function (err, result) {
					if (err) return callback(err);

					obj.memos = result;

					callback(null, obj);
				});
			},
			function serializeMemos(obj, callback) {
				async.map(obj.memos, function(element, callback) {
					gcdb.user.getByID(element.moderator, function(err, login) {
						if (err) return callback(err);

						element.moderator = login;

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
			if (err) return cb(err);

			cb(null, obj);
		});
	}
};

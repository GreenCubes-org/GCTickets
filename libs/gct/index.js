/**
 * GCT -
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */

var gcdb = require('../gcdb'),
	crypto = require('crypto'),
	fs = require('fs');

module.exports.all = all = require('./all');
module.exports.user = user = require('./user');
module.exports.bugreport = bugreport = require('./bugreport');
module.exports.rempro = rempro = require('./rempro');
module.exports.ban = ban = require('./ban');
module.exports.unban = unban = require('./unban');
module.exports.comment = comment = require('./comment');

module.exports.getStatusByID = getStatusByID = function (id) {
	switch (id) {
		case 1:
			return {
				text: sails.__({phrase:'global.status.new',locale: sails.language}),
				class: 'new',
				id: 1
			};

		case 2:
			return {
				text: sails.__({phrase:'global.status.rejected',locale: sails.language}),
				class: 'rejected',
				id: 2
			};

		case 3:
			return {
				text: sails.__({phrase:'global.status.specify',locale: sails.language}),
				class: 'specify',
				id: 3
			};

		case 4:
			return {
				text: sails.__({phrase:'global.status.declined',locale: sails.language}),
				class: 'declined',
				id: 4
			};

		case 5:
			return {
				text: sails.__({phrase:'global.status.hidden',locale: sails.language}),
				class: 'hidden',
				id: 5
			};

		case 6:
			return {
				text: sails.__({phrase:'global.status.removed',locale: sails.language}),
				class: 'removed',
				id: 6
			};

		case 7:
			return {
				text: sails.__({phrase:'global.status.helpfixed',locale: sails.language}),
				class: 'helpfixed',
				id: 7
			};

		case 8:
			return {
				text: sails.__({phrase:'global.status.inreview',locale: sails.language}),
				class: 'inreview',
				id: 8
			};

		case 9:
			return {
				text: sails.__({phrase:'global.status.delayed',locale: sails.language}),
				class: 'delayed',
				id: 9
			};

		case 10:
			return {
				text: sails.__({phrase:'global.status.done',locale: sails.language}),
				class: 'done',
				id: 10
			};

		case 11:
			return {
				text: sails.__({phrase:'global.status.accepted',locale: sails.language}),
				class: 'accepted',
				id: 11
			};

		case 12:
			return {
				text: sails.__({phrase:'global.status.fixed',locale: sails.language}),
				class: 'fixed',
				id: 12
			};

		default:
			return;
	}
};

module.exports.getStatusByClass = getStatusByClass = function (classname) {
	switch (classname) {
		case 'new':
			return 1;

		case 'rejected':
			return 2;

		case 'specify':
			return 3;

		case 'declined':
			return 4;

		case 'hidden':
			return 5;

		case 'removed':
			return 6;

		case 'helpfixed':
			return 7;

		case 'inreview':
			return 8;

		case 'delayed':
			return 9;

		case 'done':
			return 10;

		case 'accepted':
			return 11;

		case 'fixed':
			return 12;

		default:
			return;
	}
};

module.exports.getProductByID = getProductByID = function (id) {
	switch (id) {
		case 1:
			return {
				ticketText: sails.__({phrase:'global.product.unknown',locale: sails.language}),
				techText: 'unknown',
				id: 1
			};

		case 2:
			return {
				ticketText: sails.__({phrase:'global.product.main',locale: sails.language}),
				techText: 'main',
				id: 2
			};

		case 3:
			return {
				ticketText: sails.__({phrase:'global.product.rpg',locale: sails.language}),
				techText: 'rpg',
				id: 3
			};

		case 4:
			return {
				ticketText: sails.__({phrase:'global.product.apocalyptic',locale: sails.language}),
				techText: 'apocalyptic',
				id: 4
			};

		case 5:
			return {
				ticketText: sails.__({phrase:'global.product.websites',locale: sails.language}),
				techText: 'websites',
				id: 5
			};

		default:
			return {
				ticketText: '',
				techText: '',
				id: 0
			};
	}
};

module.exports.getProductByTechText = getProductByTechText = function (id) {
	switch (id) {
		case 'unknown':
			return {
				ticketText: sails.__({phrase:'global.product.unknown',locale: sails.language}),
				id: 1
			}

		case 'main':
			return {
				ticketText: sails.__({phrase:'global.product.main',locale: sails.language}),
				id: 2
			};

		case 'rpg':
			return {
				ticketText: sails.__({phrase:'global.product.rpg',locale: sails.language}),
				id: 3
			};

		case 'apocalyptic':
			return {
				ticketText: sails.__({phrase:'global.product.apocalyptic',locale: sails.language}),
				id: 4
			};

		case 'websites':
			return {
				ticketText: sails.__({phrase:'global.product.websites',locale: sails.language}),
				id: 5
			};

		default:
			return;
	}
};

module.exports.getVisiblityByID = getVisiblityByID = function (id) {
	switch (id) {
		case 1:
			return sails.__({phrase:'global.visibility.public',locale: sails.language});

		case 2:
			return sails.__({phrase:'global.visibility.private',locale: sails.language});

		default:
			return;
	}
};

module.exports.getVisibilityByClass = getVisiblityByClass = function (visibility) {
	switch (visibility) {
		case 'public':
			return 1;

		case 'private':
			return 2;

		default:
			return;
	}
};

module.exports.getModelTypeByID = getModelTypeByID = function (id) {
	switch (id) {
		case 1:
			return 'Bugreport';

		case 2:
			return 'Rempro';

		case 3:
			return 'Ban';

		case 4:
			return 'Unban';

		case 5:
			return 'Regen';

		case 6:
			return 'Admreq';

		case 7:
			return 'Entrouble';

		default:
			return;
	}
};

module.exports.getBaseUrlTypeByID = getBaseUrlTypeByID = function (id) {
	switch (id) {
		case 1:
			return '/bugreports';

		case 2:
			return '/rempros';

		case 3:
			return '/bans';

		case 4:
			return '/unbans';

		case 5:
			return '/regens';

		case 6:
			return '/admreqs';

		case 7:
			return '/entroubles';

		default:
			return;
	}
};

module.exports.serializeList = serializeList = function (type) {
	switch (type) {
		case 'all':
			return {
				url: 'all',
				text: sails.__({phrase:'global.list.alltickets',locale: sails.language}),
				iconclass: 'reorder',
				title: sails.__({phrase:'gct.serializeList.all',locale: sails.language})
			};

		case 'my':
			return {
				url: 'my',
				text: sails.__({phrase:'global.list.yourtickets',locale: sails.language}),
				iconclass: 'user',
				title: sails.__({phrase:'gct.serializeList.my',locale: sails.language})
			};

		case 'bugreports':
			return {
				url: 'bugreports',
				text: sails.__({phrase:'global.list.bugreports',locale: sails.language}),
				iconclass: 'bug',
				title: sails.__({phrase:'gct.serializeList.bugreports',locale: sails.language})
			};

		case 'rempros':
			return {
				url: 'rempros',
				text: sails.__({phrase:'global.list.rempros',locale: sails.language}),
				iconclass: 'trash',
				title: sails.__({phrase:'gct.serializeList.rempros',locale: sails.language})
			};

		case 'bans':
			return {
				url: 'bans',
				text: sails.__({phrase:'global.list.bans',locale: sails.language}),
				iconclass: 'ban circle',
				title: sails.__({phrase:'gct.serializeList.bans',locale: sails.language})
			};

		case 'unbans':
			return {
				url: 'unbans',
				text: sails.__({phrase:'global.list.unbans',locale: sails.language}),
				iconclass: 'circle blank',
				title: sails.__({phrase:'gct.serializeList.unbans',locale: sails.language})
			};

		case 'regen':
			return {
				url: 'regens',
				text: sails.__({phrase:'global.list.regens',locale: sails.language}),
				iconclass: 'leaf',
				title: sails.__({phrase:'gct.serializeList.regens',locale: sails.language})
			}

		case 'admreq':
			return {
				url: 'admreq',
				text: sails.__({phrase:'global.list.admreq',locale: sails.language}),
				iconclass: 'briefcase',
				title: sails.__({phrase:'gct.serializeList.admreq',locale: sails.language})
			}

		default:
			return;

	}
};

module.exports.serializeRegionActivity = serializeRegionActivity = function (status) {
	switch (status) {
		case 'activeOwners':
			return {
				className: 'activeowners',
				text: sails.__({phrase:'gct.serializeRegionActivity.activeowners',locale: sails.language})
			};

		case 'containsOrgs':
			return {
				className: 'containsorgs',
				text: sails.__({phrase:'gct.serializeRegionActivity.containsorgs',locale: sails.language})
			};

		case 'activeBuilders':
			return {
				className: 'activebuilders',
				text: sails.__({phrase:'gct.serializeRegionActivity.activebuilders',locale: sails.language})
			};

		case 'inactiveWithTempBans':
			return {
				className: 'inactivewithtempbans',
				text: sails.__({phrase:'gct.serializeRegionActivity.inactivewithtempbans',locale: sails.language})
			};

		case 'inactive':
			return {
				className: 'inactive',
				text: sails.__({phrase:'gct.serializeRegionActivity.inactive',locale: sails.language})
			};

		case 'noRegion':
			return {
				className: 'noregion',
				text: sails.__({phrase:'gct.serializeRegionActivity.noregion',locale: sails.language})
			};

		default:
			return {
				className: 'noregion',
				text: sails.__({phrase:'gct.serializeRegionActivity.noregion',locale: sails.language})
			};
	}
};

module.exports.serializeNotifType = serializeNotifType = function (id) {
	switch (id) {
		case 1:
			return {
				id: 1,
				text: sails.__({phrase:'gct.serializeNotifType.comment',locale: sails.language}),
				iconclass: 'comment'
			};

		case 2:
			return {
				id: 2,
				name: sails.__({phrase:'gct.serializeNotifType.commentwithstatus',locale: sails.language}),
				iconclass: 'comment'
			};

		case 3:
			return {
				id: 3,
				text: sails.__({phrase:'gct.serializeNotifType.removedcomment',locale: sails.language}),
				iconclass: 'trash'
			};

		case 4:
			return {
				id: 4,
				text: sails.__({phrase:'gct.serializeNotifType.mentioned',locale: sails.language}),
				iconclass: 'bell outline'
			};
	}
};

/*
 * 0 — STARTED
 * 1 — ACCEPTED
 * 2 — WRONGPASSWORD
 * 3 — BAN
 * 4 — IPBAN
 * 5 — HWBAN
*/
module.exports.serializeLoginLogStatus = serializeLoginLogStatus = function (status) {
	switch (status) {
		case 0:
			return sails.__('gct.serializeLoginLogStatus.started');

		case 1:
			return sails.__('gct.serializeLoginLogStatus.accepted');

		case 2:
			return sails.__('gct.serializeLoginLogStatus.wrongpassword');

		case 3:
			return sails.__('gct.serializeLoginLogStatus.ban');

		case 4:
			return sails.__('gct.serializeLoginLogStatus.ipban');

		case 5:
			return sails.__('gct.serializeLoginLogStatus.hwban');

		default:
			return sails.__('gct.serializeLoginLogStatus.default');
	}
};


module.exports.handleUpload = handleUpload = function (req, res, ticket, cb) {
	if (typeof(ticket) === 'function') cb = ticket;

	async.waterfall([
		function removeUploads(callback) {
			if (typeof(ticket) === 'function') return callback(null);

			var removeImage = req.body.removeimage;

			if (removeImage instanceof Array) {
				if (removeImage.length > ticket.uploads.length) {
					return callback({show: true, msg: sails.__({phrase:'gct.handleUpload.youcannotremovemorepics',locale: sails.language})});
				}
				async.each(removeImage, function (item, callback) {
					if (ticket.uploads[parseInt(item, 10)]) {
						fs.unlink(appPath + '/uploads/' + ticket.uploads[parseInt(item, 10)], function (err) {
							if (err) return callback(err);

							ticket.uploads[parseInt(item, 10)] = undefined;

							callback(null);
						});
					} else {
						callback({
							show: true,
							msg: sails.__({phrase:'gct.handleUpload.youcannotremoveunkownpic',locale: sails.language})
						 });
					}
				}, function (err) {
					if (err) {
						if (err.show) {
							return callback({show: true, msg: err.msg});
						} else {
							return callback(err);
						}
					}

					// Remove undefined elements
					ticket.uploads = ticket.uploads.filter(function (n) {
						return n
					});
					callback(null);
				});
			} else if (typeof removeImage === 'string' || removeImage instanceof String) {
				if (ticket.uploads[parseInt(removeImage, 10)]) {
					fs.unlink(appPath + '/uploads/' + ticket.uploads[parseInt(removeImage, 10)], function (err) {
						if (err) return callback(err);

						ticket.uploads[parseInt(removeImage, 10)] = undefined;

						// Remove undefined elements
						ticket.uploads = ticket.uploads.filter(function (n) {
							return n
						});

						callback(null);
					});
				} else {
					callback({
						show: true,
						msg: sails.__({phrase:'gct.handleUpload.youcannotremoveunkownpic',locale: sails.language})
					});
				}
			}  else {
				callback(null);
			}
		},
		function uploadData(callback) {

			var files;
			if (req.files) {
				files = req.files.upload;
			}

			var execFile = require('child_process').execFile,
				types = new RegExp('^image/(png|jpeg|jpg)\n$');

			// If MULTIPLE uploads
			if (files instanceof Array) {
				async.map(files, function(files, callback) {
					async.waterfall([
						function checkSize(callback) {
							if (files.size > 1024 * 1024 * 10) {
								fs.unlink(files.path, function (err) {
									if (err) return callback(err);

									callback({
										show: true,
										msg: sails.__({phrase:'gct.handleUpload.youcannotuploadmorethan10mb',locale: sails.language})
									});
								});
							} else {
								return callback(null);
							}
						},
						function getMime(callback) {
							execFile('file', ['-b', '--mime-type', files.path], function(err, stdout, stderr) {
								if (err) return callback(err);

								var extension;

								if (stdout === 'image/png\n') extension = 'png';
								if (stdout === 'image/jpeg\n') extension = 'jpeg';
								if (stdout === 'image/jpg\n') extension = 'jpg';

								callback(null, stdout, extension);
							});
						},
						function generateFilename(type, extension, callback) {
							crypto.randomBytes(16, function(err, buf) {
								if (err) return callback(err);

								callback(null, type, buf.toString('hex') + '.' + extension);
							});
						},
						function saveFileOrNot(type ,filename, callback) {
							if (types.test(type)) {
								fs.rename(files.path, appPath + '/uploads/' + filename, function (err) {
									if (err) return callback(err);

									callback(null, filename);
								});
							} else {
								fs.unlink(files.path, function (err) {
									if (err) return callback(err);

									callback({show: true, msg: sails.__({phrase:'gct.handleUpload.incorrecttypeoffile',locale: sails.language})}, null);
								});
							}
						}
					], function(err, uploads) {
						if (err) return callback(err);

						if (!uploads) {
							return callback(null, null);
						}

						callback(null, uploads);
					});
				}, function(err, uploads) {
					if (err) return callback(err);

					callback(null, uploads);
				});
			// If SINGLE upload and empty file
			} else if (files instanceof Object && files.originalFilename === '') {
				fs.unlink(files.path, function (err) {
					if (err) return callback(err);

					callback(null, null);
				});
			// If SINGLE upload
			} else if (files instanceof Object) {
				async.waterfall([
					function checkSize(callback) {
						if (files.size > 1024 * 1024 * 10) {
							fs.unlink(files.path, function (err) {
								if (err) return callback(err);

								callback({
									show: true,
									msg: sails.__({phrase:'gct.handleUpload.youcannotuploadmorethan10mb',locale: sails.language})
								});
							});
						} else {
								return callback(null);
							}
					},
					function getMime(callback) {
						execFile('file', ['-b', '--mime-type', files.path], function(err, stdout, stderr) {
							if (err) return callback(err);

							var extension;

							if (stdout === 'image/png\n') extension = 'png';
							if (stdout === 'image/jpeg\n') extension = 'jpeg';
							if (stdout === 'image/jpg\n') extension = 'jpg';

							callback(null, stdout, extension);
						});
					},
					function generateFilename(type, extension, callback) {
						crypto.randomBytes(16, function(err, buf) {
							if (err) return callback(err);

							callback(null, type, buf.toString('hex') + '.' + extension);
						});
					},
					function saveFileOrNot(type ,filename, callback) {
						if (types.test(type)) {
							fs.rename(files.path, appPath + '/uploads/' + filename, function (err) {
								if (err) return callback(err);

								callback(null, filename);
							});
						} else {
							fs.unlink(files.path, function (err) {
								if (err) return callback(err);

								callback({show: true, msg: sails.__({phrase:'gct.handleUpload.incorrecttypeoffile',locale: sails.language})}, null);
							});
						}
					}
				], function(err, uploads) {
					if (err) {
						if (err.show) {
							return callback({show: true, msg: err.msg});
						} else {
							return callback(err);
						}
					}

					if (!uploads) {
						return callback(null, null);
					}

					callback(null, [uploads]);
				});
			} else {
				// If NO uploads
				callback(null, null);
			}
		}
	], function(err, uploads) {
		if (err) return cb(err);

		cb(null, uploads);
	});
};

module.exports.getRegionsInfo = getRegionsInfo = function getRegionsInfo(regions, ugroup, cb) {
	async.map(regions, function (element, callback) {

		element = {
			id: null,
			name: element.name,
			creator: null,
			full_access: {
				players: [],
				orgs: [],
				all: false
			},
			build_access: {
				players: [],
				orgs: [],
				all: false
			},
			memos: null,
			status: null
		};

		async.waterfall([
			function getRegionIdNCreator(callback) {
				// Skip status logic for non-auth users & non-helpers and higher.
				if (ugroup < ugroup.helper) element.status = true;

				gcmainconn.query('SELECT `id`, `creator` FROM regions WHERE name = ?', [element.name], function (err, region) {
					if (err) return callback(err);

					if (!region.length) {
						element.status = 'noRegion';

						return callback(null);
					}

					element.id = region[0].id;
					element.creator = region[0].creator;

					callback(null);
				});
			},
			function getOwnersNMember(callback) {
				if (element.status) {
					return callback(null);
				}

				gcmainconn.query('SELECT * FROM regions_rights WHERE region = ?', [element.id], function (err, rights) {
					if (err) return callback(err);

					for (var i = 0; i < rights.length; i++) {
						/* right id: full - 0, build - 2, grant - 1, create_child - 9 */
						if (rights[i].right === 0) {
							if (rights[i].entityType === 1) {
								element.full_access.players.push(rights[i].entityId);
							}

							if (rights[i].entityType === 2) {
								element.full_access.orgs.push(rights[i].entityId);
							}

							if (rights[i].entityType === 3) {
								element.full_access.all = true;
							}
						}

						if ([1, 2, 9].indexOf(rights[i].right) !== -1) {
							if (rights[i].entityType === 1) {
								element.build_access.players.push(rights[i].entityId);
							}

							if (rights[i].entityType === 2) {
								element.build_access.orgs.push(rights[i].entityId);
							}

							if (rights[i].entityType === 3) {
								element.build_access.all = true;
							}
						}
					}

					element.full_access.players = element.full_access.players.filter(function(elem, pos) {
						return element.full_access.players.indexOf(elem) === pos;
					});

					element.full_access.orgs = element.full_access.orgs.filter(function(elem, pos) {
						return element.full_access.orgs.indexOf(elem) === pos;
					});

					element.build_access.players = element.build_access.players.filter(function(elem, pos) {
						return element.build_access.players.indexOf(elem) === pos;
					});

					element.build_access.orgs = element.build_access.orgs.filter(function(elem, pos) {
						return element.build_access.orgs.indexOf(elem) === pos;
					});

					callback(null);
				});
			},
			function getLastseens4Fulls(callback) {
				if (element.status) {
					return callback(null);
				}

				async.map(element.full_access.players, function (element, callback) {
					gcdb.user.getByID(element, 'maindb', function (err, login) {
						if (err) return callback(err);

						gcmainconn.query('SELECT `exit`, UNIX_TIMESTAMP(time) AS `time` FROM login_log WHERE login = ? AND `status` = 1 ORDER BY `time` DESC LIMIT 1', [login], function (err, result) {
							if (err) return callback(err);

								if (result.length) {
									time = new Date(result[0].time  * 1000);
								} else {
									time = new Date(1405009242000);
								}

								callback(null, {
									uid: element,
									lastseen: (result[0]) ? result[0].time : 1405009242,
									lastseenLocale: time.toLocaleString()
								});
						});
					});
				}, function (err, array) {
					if (err) return callback(err);

					element.full_access.players = array;

					callback(null);
				});
			},
			function getLastseens4Builds(callback) {
				if (element.status) {
					return callback(null);
				}

				async.map(element.build_access.players, function (element, callback) {
					gcdb.user.getByID(element, 'maindb', function (err, login) {
						if (err) return callback(err);

						gcmainconn.query('SELECT `exit`, UNIX_TIMESTAMP(time) AS `time` FROM login_log WHERE login = ? ORDER BY `time` DESC LIMIT 1', [login], function (err, result) {
							if (err) return callback(err);

							if (result.length) {
								time = new Date(result[0].time  * 1000);
							} else {
								time = new Date(1405009242000);
							}

							callback(null, {
								uid: element,
								lastseen: (result[0]) ? result[0].time : 1405009242,
								lastseenLocale: time.toLocaleString()
							});
						});
					});
				}, function (err, array) {
					if (err) return callback(err);

					element.build_access.players = array;

					callback(null);
				});
			},
			function checkFullOwners(callback) {
				if (element.status) {
					return callback(null);
				}

				element.full_access.players.forEach(function (el) {
					if ((el.lastseen + 1814400) * 1000 > Date.now()) {
						element.status = 'activeOwners';
					}

					return;
				});

				callback(null);
			},
			function check4Orgs(callback) {
				if (element.status) {
					return callback(null);
				}

				if (element.full_access.orgs.length) {
					element.status = 'containsOrgs';

					return callback(null);
				}

				callback(null);
			},
			function checkBuilders(callback) {
				if (element.status) {
					return callback(null);
				}

				element.build_access.players.forEach(function (el) {
					if ((el.lastseen + 1814400) * 1000 > Date.now()) {
						element.status = 'activeBuilders';
					}

					return;
				});

				callback(null);
			},
			function check4Bans(callback) {
				if (element.status) {
					return callback(null);
				}

				async.forEach(element.full_access.players, function (el, callback) {
					gcdb.user.getByID(el.uid, 'maindb', function (err, login) {
						if (err) return callback(err);

						maindbconn.query('SELECT `id`, `isBanned`, `bannedTill`, UNIX_TIMESTAMP(`bannedTill`) AS `bannedTillTS`, UNIX_TIMESTAMP(NOW()) AS `currentTimestamp` FROM users WHERE name = ?', [login], function (err, result) {
							if (err) return callback(err);

							if (result.length === 0) {
								callback('Incorrect user!');
							} else {
								if (result[0].isBanned) {
									element.status = 'inactive';
								} else if (result[0].bannedTillTS > result[0].currentTimestamp) {
									element.status = 'inactiveWithTempBans';
								} else {
									element.status = 'inactive';
								}

								callback(null);
							}
						});
					});
				}, function (err) {
					if (err) return callback(err);

					callback(null);
				});
			},
			function getMemos4Owners(callback) {
				if (['activeOwners','containsOrgs'].indexOf(element.status) !== -1) {
					return callback(null);
				}

				async.map(element.full_access.players, function (element, callback) {
					gcdb.user.getByID(element.uid, 'maindb', function (err, login) {
						if (err) return callback(err);

						maindbconn.query('SELECT `moderator_id` AS `moderator`, `memo`, `time` FROM memos WHERE user_id = ? ORDER BY time DESC', [element.uid], function (err, result) {
							if (err) return callback(err);

							async.map(result, function(element, callback) {
								maindbconn.query('SELECT `name` FROM users WHERE id = ?', [element.moderator], function (err, result) {
									if (err) return callback(err);

									element.moderator = result[0].name;

									callback(null, element);
								});
							}, function (err, memos) {
								if (err) return callback(err);

								callback(null, {
									player: login,
									memos: memos
								});
							});
						});
					});
				}, function (err, array) {
					if (err) return callback(err);

					element.memos = array;

					callback(null);
				});
			},
			function serializeStatus(callback) {
				element.status = gct.serializeRegionActivity(element.status);

				callback(null);
			}
		], function (err) {
			if (err) return callback(err);

			callback(null, element);
		});
	}, function (err, obj) {
		if (err) return cb(err);

		cb(null, obj);
	});

};

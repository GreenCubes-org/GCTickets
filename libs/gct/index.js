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
module.exports.comment = comment = require('./comment');

module.exports.getStatusByID = getStatusByID = function (id) {
	switch (id) {
		case 1:
			return {
				text: 'Новый',
				class: 'new'
			};

		case 2:
			return {
				text: 'Отменён',
				class: 'rejected'
			};

		case 3:
			return {
				text: 'Уточнить',
				class: 'specify'
			};

		case 4:
			return {
				text: 'Отклонён',
				class: 'declined'
			};

		case 5:
			return {
				text: 'Скрыт',
				class: 'hidden'
			};

		case 6:
			return {
				text: 'Удалён',
				class: 'removed'
			};

		case 7:
			return {
				text: 'Исправлен',
				class: 'helpfixed'
			};

		case 8:
			return {
				text: 'На&nbsp;рассмотрении',
				class: 'inreview'
			};

		case 9:
			return {
				text: 'Отложен',
				class: 'delayed'
			};

		case 10:
			return {
				text: 'Выполнен',
				class: 'done'
			};

		case 11:
			return {
				text: 'Принят',
				class: 'accepted'
			};

		case 12:
			return {
				text: 'Исправлен',
				class: 'fixed'
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
				ticketText: 'Неизвестно',
				techText: 'unknown'
			};

		case 2:
			return {
				ticketText: 'Сервер Main',
				techText: 'main'
			};

		case 3:
			return {
				ticketText: 'Сервер RPG',
				techText: 'rpg'
			};

		case 4:
			return {
				ticketText: 'Сервер Apocalyptic',
				techText: 'apocalyptic'
			};

		case 5:
			return {
				ticketText: 'Веб-сервисы',
				techText: 'websites'
			};

		default:
			return {
				ticketText: '',
				techText: ''
			};
	}
};

module.exports.getProductByTechText = getProductByTechText = function (id) {
	switch (id) {
		case 'unknown':
			return {
				ticketText: 'Неизвестно',
				id: 1
			}

		case 'main':
			return {
				ticketText: 'Сервер Main',
				id: 2
			};

		case 'rpg':
			return {
				ticketText: 'Сервер RPG',
				id: 3
			};

		case 'apocalyptic':
			return {
				ticketText: 'Сервер Apocalyptic',
				id: 4
			};

		case 'websites':
			return {
				ticketText: 'Веб-сервисы',
				id: 5
			};

		default:
			return;
	}
};

module.exports.getVisiblityByID = getVisiblityByID = function (id) {
	switch (id) {
		case 1:
			return 'Публичный';

		case 2:
			return 'Приватный';

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
				text: 'Все тикеты',
				iconclass: 'reorder',
				title: 'Список всех тикетов — GC.Поддержка'
			};

		case 'my':
			return {
				url: 'my',
				text: 'Ваши тикеты',
				iconclass: 'user',
				title: 'Список Ваших тикетов — GC.Поддержка'
			};

		case 'bugreports':
			return {
				url: 'bugreports',
				text: 'Баг-репорты',
				iconclass: 'bug',
				title: 'Список баг-репортов — GC.Поддержка'
			};

		case 'rempros':
			return {
				url: 'rempros',
				text: 'Заявки на удаление защит',
				iconclass: 'trash',
				title: 'Список заявок на удаление защит — GC.Поддержка'
			};

		case 'bans':
			return {
				url: 'bans',
				text: 'Заявки на бан',
				iconclass: 'ban circle',
				title: 'Список заявок на бан — GC.Поддержка'
			};

		case 'unbans':
			return {
				url: 'unbans',
				text: 'Заявки на разбан',
				iconclass: 'circle blank',
				title: 'Список заявок на разбан — GC.Поддержка'
			};

		case 'regen':
			return {
				url: 'regens',
				text: 'Заявки на регенерацию',
				iconclass: 'leaf',
				title: 'Список заявок на регенерацию — GC.Поддержка'
			}

		case 'admreq':
			return {
				url: 'admreq',
				text: 'Обращения к администрации',
				iconclass: 'briefcase',
				title: 'Список обращений к администрации — GC.Поддержка'
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
				text: 'Активен'
			}

		case 'containsOrgs':
			return {
				className: 'containsorgs',
				text: 'Есть организации'
			}

		case 'activeBuilders':
			return {
				className: 'activebuilders',
				text: 'Есть билдеры'
			}

		case 'inactiveWithTempBans':
			return {
				className: 'inactivewithtempbans',
				text: 'Есть врем. баны'
			}

		case 'inactive':
			return {
				className: 'inactive',
				text: 'Неактивен'
			}

		case 'noRegion':
			return {
				className: 'noregion',
				text: 'Нет региона'
			}

		default:
			return {
				className: 'noregion',
				text: 'Нет региона'
			}
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
					return callback({show: true, msg: 'Нельзя удалить больше картинок чем есть на самом деле '});
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
							msg: 'Невозможно удалить изображение, которого нет'
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
						msg: 'Невозможно удалить изображение, которого нет'
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
										msg: 'Файлы больше 10 мегабайт загружать запрещено'
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

									callback({show: true, msg: 'Некорректный тип файла. Разрешены только файлы .jpg .jpeg .png'}, null);
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
									msg: 'Файлы больше 10 мегабайт загружать запрещено'
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

								callback({show: true, msg: 'Некорректный тип файла. Разрешены только файлы .jpg .jpeg .png'}, null);
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

module.exports.processStatus = processStatus = function (req, res, type, canModerate, ticket, changedTo, cb) {
	var isStatus;
	switch (type) {
		case 1:
			// If status "Новый"
			if (ticket.status === 1 && (
				(canModerate && [11,4,3].indexOf(changedTo) != -1) ||
				(req.user.id === ticket.owner && changedTo === 2))) {
				return cb(true);
			}

			// If status "Уточнить"
			if (ticket.status === 3 && canModerate && [11,4].indexOf(changedTo) != -1) {
				return cb(true);
			}

			// If status "Принят"
			if (ticket.status === 11 && canModerate && [12,4].indexOf(changedTo) != -1) {
				return cb(true);
			}

			return cb(false);

		case 2:
			// If status "Новый"
			if (ticket.status === 1 && (
				(req.user.id === ticket.owner && changedTo === 2) || // Only owner can change to status 2 (Отклонён)
				(canModerate && [10,8,4,3].indexOf(changedTo) != -1) ||
				(res.user.group >= ugroup.mod && changedTo === 3))) {
				return cb(true);
			}

			// If status "Уточнить"
			if (ticket.status === 3 && canModerate && [10,4].indexOf(changedTo) != -1) {
				return cb(true);
			}

			// If status "На рассмотрении"
			if (ticket.status === 8 && canModerate && [10,9,4,3].indexOf(changedTo) != -1) {
				return cb(true);
			}

			// If status "Отложен"
			if (ticket.status === 9 && canModerate && [10,4,3].indexOf(changedTo) != -1) {
				return cb(true);
			}

			return cb(false);

		case 3:
			return cb(false);

		case 4:
			return cb(false);

		case 5:
			return cb(false);

		case 6:
			return cb(false);

		case 7:
			return cb(false);

		default:
			return cb(false);
	}
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
					gct.user.getLastseen(element, function (err, time) {
						if (err) return callback(err);

						time = new Date(time);

						callback(null, {
							uid: element,
							lastseen: time.toLocaleString()
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
					gct.user.getLastseen(element, function (err, time) {
						if (err) return callback(err);

						time = new Date(time);

						callback(null, {
							uid: element,
							lastseen: time.toLocaleString()
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

				element.full_access.players.forEach(function (element) {
					if ((element.lastseens + 1814400) * 1000 > Date.now()) {
						element.status = 'activeOwners';

						return callback(null);
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

				element.build_access.players.forEach(function (element) {
					if (element.lastseens + 1814400 > Date.now()) {
						element.status = 'activeBuilders';

						return callback(null);
					}

					return;
				});

				callback(null);
			},
			function check4Bans(callback) {
				if (element.status) {
					return callback(null);
				}

				element.full_access.players.forEach(function (element) {
					gcdb.user.getByID(element.uid, 'maindb', function (err, login) {
						if (err) return callback(err);

						maindbconn.query('SELECT `id`, `isBanned`, `bannedTill`, UNIX_TIMESTAMP(`bannedTill`) AS `bannedTillTS`, UNIX_TIMESTAMP(NOW()) AS `currentTimestamp` FROM users WHERE name = ?', [login], function (err, result) {
							if (err) return callback(err);

							if (result.length === 0) {
								callback('Incorrect user!');
							} else {
								obj.user.gameId = result[0].id;

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

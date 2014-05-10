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

//TODO: Заставить это и функции ниже работать с JSON файлом со значениями
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
				text: 'На рассмотрении',
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
				ticketText: 'Я не знаю',
				adminText: ''
			};

		case 2:
			return {
				ticketText: 'GC.Main Клиент',
				adminText: 'main-cli'
			};

		case 3:
			return {
				ticketText: 'GC.Main Сервер (GreenServer)',
				adminText: 'main-srv'
			};

		case 4:
			return {
				ticketText: 'GreenCubes.org Сайт',
				adminText: ''
			};

		case 5:
			return {
				ticketText: 'Форум GreenCubes',
				adminText: ''
			};

		case 6:
			return {
				ticketText: 'GreenCubes.Wiki',
				adminText: ''
			};

		case 7:
			return {
				ticketText: 'Тикет-система',
				adminText: ''
			};

		case 8:
			return {
				ticketText: 'GC.RPG Клиент',
				adminText: 'rpg-cli'
			};

		case 9:
			return {
				ticketText: 'GC.RPG Сервер',
				adminText: 'rpg-srv'
			};

		case 10:
			return {
				ticketText: 'GC.Apocalyptic Клиент',
				adminText: 'apo-cli'
			};

		case 11:
			return {
				ticketText: 'GC.Apocalyptic Сервер',
				adminText: 'apo-srv'
			};

		case 12:
			return {
				ticketText: 'GC.Main Новый клиент',
				adminText: 'main-newcli'
			};

		default:
			return {
				ticketText: 'Не указано',
				adminText: ''
			};
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

module.exports.processStatus = processStatus = function (req, res, type, canModerate, ticket, changedTo, callback) {
	var isStatus;
	switch (type) {
		case 1:
			// If status "Новый"
			if ((canModerate || req.user.id === ticket.owner) && ticket.status === 1 && [11,4,3,2].indexOf(changedTo) != -1) {
				return callback(true);
			}

			// If status "Уточнить"
			if (canModerate || req.user && (req.user.group >= ugroup.helper) && ticket.status === 3 && [11,4].indexOf(changedTo) != -1) {
				return callback(true);
			}

			// If status "Принят"
			if ((canModerate || req.user.id === ticket.owner) && ticket.status === 3 && [12,4].indexOf(changedTo) != -1) {
				return callback(true);
			}

			return callback(false);

		case 2:
			// If status "Новый"
			if ((canModerate || req.user.id === ticket.owner) && ticket.status === 1 && [10,8,4,3,2].indexOf(changedTo) != -1) {
				return callback(true);
			}

			// If status "Уточнить"
			if ((canModerate || req.user.id === ticket.owner) && req.user && (req.user.group >= ugroup.helper) || ticket.status === 3 && [8,4].indexOf(changedTo) != -1) {
				return callback(true);
			}

			// If status "На рассмотрении"
			if ((canModerate || req.user.id === ticket.owner) && ticket.status === 8 && [10,9,4].indexOf(changedTo) != -1) {
				return callback(true);
			}

			// If status "Отложен"
			if ((canModerate || req.user.id === ticket.owner) && ticket.status === 9 && [10,4].indexOf(changedTo) != -1) {
				return callback(true);
			}

			return callback(false);

		case 3:
			return callback(false);

		case 4:
			return callback(false);

		case 5:
			return callback(false);

		case 6:
			return callback(false);

		case 7:
			return callback(false);

		default:
			return callback(false);
	}
};

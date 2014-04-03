/**
* EditController
*
* @module :: Controller
* @description :: Редактирование тикетов.
*/

var crypto = require('crypto'),
	fs = require('fs');


function editBugreportTpl(req, res, ticket) {
	Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
		if (err) throw err;

		gct.bugreport.serializeSingle(bugreport, {isEdit: true}, function(err, result) {
			if (err) throw err;

			res.view('edit/bugreport', {
				ticket: result,
				globalid: ticket.id
			});
		});
	});
};

function editBugreport(req, res, ticket) {
	Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
		if (err) throw err;

		async.waterfall([
			function removeUploads(callback) {
				var removeImage = req.body.removeimage;
				
				if (removeImage instanceof Array) {
					if (removeImage.length > bugreport.uploads.length) {
						return callback({show: true, msg: 'Нельзя удалить больше картинок чем есть на самом деле '});
					}
					async.each(removeImage, function (item, callback) {
						if (bugreport.uploads[parseInt(item, 10)]) {
							fs.unlink(appPath + '/uploads/' + bugreport.uploads[parseInt(item, 10)], function (err) {
								if (err) return callback(err);

								bugreport.uploads[parseInt(item, 10)] = undefined;

								callback(null);
							});
						} else {
							callback('Невозможно удалить изображение, которого нет');
						}
					}, function (err) {
						if (err) {
							return callback({show: true, msg: err});
						}
						
						// Remove undefined elements
						bugreport.uploads = bugreport.uploads.filter(function (n) {
							return n
						});
						callback(null);
					});
				} else if (typeof removeImage === 'string' || removeImage instanceof String) {
					if (bugreport.uploads[parseInt(removeImage, 10)]) {
						fs.unlink(appPath + '/uploads/' + bugreport.uploads[parseInt(removeImage, 10)], function (err) {
							if (err) return callback(err);

							bugreport.uploads[parseInt(removeImage, 10)] = undefined;

							// Remove undefined elements
							bugreport.uploads = bugreport.uploads.filter(function (n) {
								return n
							});

							callback(null);
						});
					} else {
						callback({show: true, msg: 'Невозможно удалить изображение, которого нет'});
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
				// If SINGLE upload and empty file // FIX THIS
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
			},
			function setData(uploads, callback) {	
				gct.bugreport.serializeSingle(bugreport, {isEdit: true}, function(err, result) {
					if (err) return callback(err);
						
					if (!uploads) {
						uploads = bugreport.uploads;
					} else if (uploads instanceof Array) {
						uploads = bugreport.uploads.concat(uploads);
					}
					
					callback(null, {
						title: req.param('title'),
						description: req.param('description'),
						status: bugreport.status,
						owner: bugreport.owner,
						logs: req.param('logs'),
						product: bugreport.bugreport,
						uploads: uploads,
						visiblity: parseInt(req.param('visiblity'))
					});
				});
			},
			function checkData(obj, callback) {
				if (isNaN(obj.visiblity)) {
					return callback({
						show: true, msg: 'Выберите видимость тикета'
					});
				}

				var isErr = false;
				req.onValidationError(function (msg) {
					isErr = true;
					callback({ show: true, msg: msg });
				});
				req.check('title','Краткое описание должно содержать не менее %1 и не более %2 символов').len(6,64);
				if (!isErr) callback(null, obj);
			},
			function sanitizeData(obj, callback) {
				obj.description = req.sanitize('description').entityEncode();
				obj.logs = req.sanitize('logs').entityEncode();
				
				if (obj.logs === '') obj.logs = null;
				
				callback(null, obj);
			},
			function editBugreport(obj, callback) {
				Bugreport.findOne(ticket.tid).done(function(err, result) {
					if (err) return callback(err);
					
					result.title = obj.title;
					result.description = obj.description;
					result.logs = obj.logs;
					result.uploads = obj.uploads;

					result.save(function(err) {
						if (err) return callback(err);

						callback(null, result.id, obj);
					});
				});
			},
			function setVisiblity(ticketId, obj, callback) {
				Ticket.findOne(ticket.id).done(function (err, ticket) {
					if (err) return callback(err);

					ticket.visiblity = obj.visiblity;

					ticket.save(function (err) {
						if (err) return callback(err);

						callback(null, ticket);
					});
				});
			}
		 ], function (err, ticket) {
			if (err) {
				if (!err.show) {
					res.json({
						err: 'Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.'
					});
					
					throw err;
				} else {
					res.json({
						err: err.msg
					});
					return;
				}
			} else {
				res.json({
					id: ticket.id
				});
			}
		});
	});
}

module.exports = {
	routeSingle: function(req, res) {
		Ticket.findOne(req.param('id')).done(function (err, result) {
			if (err) throw err;

			if (result) {
				switch (result.type) {
					 case 1:
						return editBugreport(req, res, result);
					 case 2:
						return editRempro(req, res, result);
					 case 3:
						return editBan(req, res, result);
					 case 4:
						return editUnban(req, res, result);
					 case 5:
						return editRegen(req, res, result);
					 case 6:
						return editAdmreq(req, res, result);
					 default:
						return res.status(404).view('404', {layout: false});
				}
			} else {
				res.status(404).view('404', {layout: false});
			}
		})
	},

	routeSingleTpl: function(req, res) {
		Ticket.findOne(req.param('id')).done(function (err, result) {
			if (err) throw err;

			if (result) {
				switch (result.type) {
					 case 1:
						return editBugreportTpl(req, res, result);
					 case 2:
						return editRemproTpl(req, res, result);
					 case 3:
						return editBanTpl(req, res, result);
					 case 4:
						return editUnbanTpl(req, res, result);
					 case 5:
						return editRegenTpl(req, res, result);
					 case 6:
						return editAdmreqTpl(req, res, result);
					 default:
						return res.status(404).view('404', {layout: false});
				}
			} else {
				res.status(404).view('404', {layout: false});
			}
		})
	}

};

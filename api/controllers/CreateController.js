/**
* CreateController
*
* @module :: Controller
* @description :: Создание тикетов
*/

//FIXME: Поменять на глобальную переменную
var fs = require('fs'),
	crypto = require('crypto');

module.exports = {
	mainTpl: function(req,res) {
		//res.view('create/main');
		res.redirect('/new/bugreport');
	},

	allTpl: function(req,res) {
		res.view('create/all');
	},

	bugreportTpl: function(req,res) {
		res.view('create/bugreport');
	},
	
	bugreport: function(req, res) {
		async.waterfall([
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
			function setData(uploads,callback) {
				callback(null,{
					title: req.param('title'),
					description: req.param('description'),
					status: 1,
					owner: req.user.id,
					logs: req.param('logs') || '',
					product: parseInt(req.param('product')),
					uploads: uploads,
					visiblity: parseInt(req.param('visiblity'))
				})
			},
			function checkData(obj, callback) {
				if (isNaN(obj.visiblity)) {
					return callback({
						show: true, msg: 'Выберите видимость тикета'
					});
				}
				
				if (obj.product > 2) return callback({show: true, msg: 'Некорректный продукт'});
				
				var isErr = false;
				req.onValidationError(function (msg) {
					isErr = true;
					callback({ show: true, msg: msg });
				});
				req.check('title','Краткое описание должно содержать не менее %1 и не более %2 символов').len(6,64);
				if (!isErr) return callback(null, obj);
			},
			function sanitizeData(obj, callback) {
				obj.description = req.sanitize('description').entityEncode();
				obj.logs = req.sanitize('logs').entityEncode();
				
				if (obj.logs === '') obj.logs = null;
				
				callback(null, obj);
			},
			function createBugreport(obj, callback) {
				Bugreport.create({
					title: obj.title,
					description: obj.description,
					status: obj.status,
					owner: obj.owner,
					logs: obj.logs,
					product: obj.product,
					uploads: obj.uploads
				}).done(function(err, result) {
					if (err) return callback(err);
					
					callback(null, result.id, obj);
				});
			},
			function registerTicket(ticketId, obj, callback) {
				Ticket.create({
					tid: ticketId,
					type: 1,
					visiblity: obj.visiblity,
					comments: [],
					owner: obj.owner
				}).done(function (err, ticket) {
						if (err) return callback(err);
						
						callback(null, ticket)
					});
			}
		 ],
		 function (err, ticket) {
			if (err) {
				if (!err.show) {
					res.json({
						 err: 'Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.'
					});
					
					console.error(err);
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
	},
	
	remproTpl: function(req,res) {
		res.view('create/rempro');
	},

	banTpl: function(req,res) {
		res.view('create/ban');
	},

	unbanTpl: function(req,res) {
		res.view('create/unban');
	},

	regenTpl: function(req,res) {
		res.view('create/regen');
	},

	admreqTpl: function(req,res) {
		res.view('create/admreq');
	}
	
};

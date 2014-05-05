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
		res.view('create/main');
	},

	allTpl: function(req,res) {
		res.view('create/all');
	},

	bugreportTpl: function(req,res) {
		res.view('create/bugreport');
	},
	
	bugreport: function(req, res) {
		async.waterfall([
			function preCheck(callback) {
				if (!req.param('title') || !req.param('description')) {
					return callback({
						msg: 'Некорректный запрос'
					});
				}
				
				callback(null);
			},
			function handleUpload(callback) {
				gct.handleUpload(req, res, function (err, uploads) {
					if (err) return callback(null);

					callback(null, uploads);
				});
			},
			function setData(uploads,callback) {
				callback(null,{
					title: req.param('title'),
					description: req.param('description'),
					status: 1,
					owner: req.user.id,
					logs: req.param('logs') || '',
					product: parseInt(req.param('product'), 10),
					uploads: uploads || [],
					visiblity: parseInt(req.param('visiblity'), 10)
				})
			},
			function checkData(obj, callback) {
				if (isNaN(obj.visiblity)) {
					return callback({
						msg: 'Выберите видимость тикета'
					});
				}
				
				var isStatus = new RegExp('(1|7|12)');
				
				if (!obj.product) {
					return callback({
						msg: 'Выберите местоположение проблемы'
					});
				}
				if (!isStatus.test(obj.product)) {
					return callback({
						msg: 'Некорректное местоположение проблемы'
					});
				}
				
				var isErr = false;
				req.onValidationError(function (msg) {
					isErr = true;
					callback({ show: true, msg: msg });
				});
				req.check('title', 'Краткое описание должно содержать не менее %1 и не более %2 символов').len(6,64);
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
					status: obj.status,
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
				if (!err.msg) {
					res.json(500, {
						 err: 'Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.'
					});
					
					throw err;
				} else {
					return res.json({
						err: err.msg
					});
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

	rempro: function(req, res) {
		async.waterfall([
			function preCheck(callback) {
				if (!req.param('title') || !req.param('reason') || !(req.param('regions') || req.param('stuff')) ) {
					return callback({
						msg: 'Некорректный запрос'
					});
				}

				if (!(req.param('regions') || req.param('stuff'))) {
					return callback({
						msg: 'Введите хотя бы один регион или координату'
					});
				}

				callback(null);
			},
			function handleUpload(callback) {
				gct.handleUpload(req, res, function (err, uploads) {
					if (err) return callback(null);

					callback(null, uploads);
				});
			},
			function setData(uploads,callback) {
				callback(null,{
					title: req.param('title'),
					reason: req.param('reason'),
					status: 1,
					createdFor: req.param('createdfor').replace(/[^a-zA-Z0-9_-]/g, ''),
					owner: req.user.id,
					regions: req.param('regions').replace(/[^a-zA-Z0-9-_\n]/g, '').trim().split(/\n/) || '',
					stuff: req.param('stuff').replace(/[^0-9- \n]/g, '').trim().split(/\n/) || '',
					uploads: uploads || [],
					visiblity: parseInt(req.param('visiblity'), 10)
				})
			},
			function checkData(obj, callback) {
				if (isNaN(obj.visiblity)) {
					return callback({
						msg: 'Выберите видимость тикета'
					});
				}

				var isErr = false;
				req.onValidationError(function (msg) {
					isErr = true;
					callback({
						msg: msg
					});
				});
				req.check('title', 'Краткое описание должно содержать не менее %1 и не более %2 символов').len(6,64);

				if(obj.regions.indexOf('') !== -1 || obj.regions.join('').replace(/\n|\r/g, '') !== req.body.regions.replace(/\n|\r/g, '')) {
					return callback({
						msg: 'Регионы могут быть записаны только с использованием латинских символов, цифр, символов \'-\' и \'_\''
					});
				}

				if(obj.stuff.indexOf('') !== -1 || obj.stuff.join('').replace(/\n|\r/g, '') !== req.body.stuff.replace(/\n|\r/g, '')) {
					return callback({
						msg: 'Координаты могут быть записаны только цифрами и с использованием символа \'-\''
					});
				}

				if (!isErr) return callback(null, obj);
			},
			function sanitizeData(obj, callback) {
				obj.reason = req.sanitize('reason').entityEncode();

				if (obj.regions[0] === '') obj.regions = [];
				if (obj.stuff[0] === '') obj.stuff = [];

				if (!obj.createdFor) {
					callback(null, obj);
				} else {
					gcdb.user.getByLogin(obj.createdFor, function(err, uid) {
						if (err) return callback(err);

						if (!uid) {
							callback({
								msg: 'Игрока для которого создаётся заявка не существует'
							})
						} else {
							obj.createdFor = uid;
							callback(null, obj);
						}
					})
				}
			},
			function createRempro(obj, callback) {
				Rempro.create({
					title: obj.title,
					reason: obj.reason,
					createdFor: obj.createdFor,
					owner: obj.owner,
					regions: obj.regions,
					stuff: obj.stuff,
					uploads: obj.uploads
				}).done(function(err, result) {
					if (err) return callback(err);

					callback(null, result.id, obj);
				});
			},
			function registerTicket(ticketId, obj, callback) {
				Ticket.create({
					tid: ticketId,
					type: 2,
					status: obj.status,
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
				if (!err.msg) {
					res.json(500, {
						 err: 'Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.'
					});

					throw err;
				} else {
					return res.json({
						err: err.msg
					});
				}
			} else {
				res.json({
					id: ticket.id
				});
			}
		});
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

/**
* CreateController
*
* @module :: Controller
* @description :: Создание тикетов
*/

var fs = require('fs'),
	crypto = require('crypto'),
	validator = require('validator');

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
				if (!req.param('title')) {
					return callback({
						msg: 'Введите краткое описание'
					});
				}

				if (!req.param('description')) {
					return callback({
						msg: 'Введите подробное описание'
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
					title: req.param('title').replace(/^(\s*)$/g, ''),
					description: req.param('description'),
					status: 1,
					owner: req.user.id,
					logs: req.param('logs') || '',
					product: parseInt(req.param('product'), 10),
					uploads: uploads || [],
					visiblity: 2
				});
			},
			function checkData(obj, callback) {
				if (!obj.title) {
					return callback({
						msg: 'Введите краткое описание'
					});
				}

				if (!(validator.isLength(obj.title,6,128))) {
					return callback({
						msg: 'Краткое описание должно содержать не менее 6 и не более 128 символов'
					});
				}

				if (!obj.product) {
					return callback({
						msg: 'Выберите местоположение проблемы'
					});
				}
				// Only "Неизвестно", "Сервер Main", "Веб-сервисы"
				if ([1,2,5].indexOf(obj.product) === -1) {
					return callback({
						msg: 'Некорректное местоположение проблемы'
					});
				}
				
				callback(null, obj);
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
				if (!req.param('reason')) {
					return callback({
						msg: 'Введите причину распривата'
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
					regions: req.param('regions').trim().split(/\n/) || '',
					stuff: req.param('stuff').trim().split(/\n/) || '',
					uploads: uploads || [],
					visiblity: 2
				})
			},
			function checkData(obj, callback) {
				if (isNaN(obj.visiblity)) {
					return callback({
						msg: 'Выберите видимость тикета'
					});
				}

				return callback(null, obj);
			},
			function sanitizeData(obj, callback) {
				obj.reason = req.sanitize('reason').entityEncode();

				if (obj.regions[0] === '') obj.regions = [];
				if (obj.stuff[0] === '') obj.stuff = [];

				/* Set title if no title, set obj.createdFor */
				if (!obj.createdFor) {
					if (!obj.title) {
						gcdb.user.getByID(obj.owner, function (err, login) {
							if (err) return callback(err);

							obj.title = 'Заявка для ' + login;
							callback(null, obj);
						});
					} else {
						callback(null, obj);
					}
				} else {
					gcdb.user.getByLogin(obj.createdFor, function(err, uid) {
						if (err) return callback(err);

						if (!uid) {
							callback({
								msg: 'Игрока для которого создаётся заявка не существует'
							})
						} else {
							if (!obj.title) {
								gcdb.user.getCapitalizedLogin(obj.createdFor, function (err, login) {
									obj.title = 'Заявка от ' + login;

									obj.createdFor = uid;

									callback(null, obj);
								});
							} else {
								obj.createdFor = uid;

								callback(null, obj);
							}
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

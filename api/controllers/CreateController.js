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
	
	bugreportPost: function(req, res) {
		async.waterfall([
			function preCheck(callback) {
				if (!req.param('title')) {
					return callback({
						msg: sails.__('controller.create.bugreport.entertitle')
					});
				}

				if (!req.param('description')) {
					return callback({
						msg: sails.__('controller.create.bugreport.enterdescription')
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
						msg: sails.__('controller.create.bugreport.entertitle')
					});
				}

				if (!(validator.isLength(obj.title,6,128))) {
					return callback({
						msg: sails.__('controller.create.bugreport.titleshouldcontain')
					});
				}

				if (!obj.product) {
					return callback({
						msg: sails.__('controller.create.bugreport.enterproduct')
					});
				}
				// Only "Неизвестно", "Сервер Main", "Веб-сервисы"
				if ([1,2,5].indexOf(obj.product) === -1) {
					return callback({
						msg: sails.__('controller.create.bugreport.incorrectproduct')
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
				}).exec(function(err, result) {
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
				}).exec(function (err, ticket) {
					if (err) return callback(err);

					callback(null, ticket)
				});
			}
		 ],
		 function (err, ticket) {
			if (err) {
				if (!err.msg) {
					res.json(500, {
						 err: sails.__('global.suddenerror')
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

	remproPost: function(req, res) {
		async.waterfall([
			function preCheck(callback) {
				if (!req.param('reason')) {
					return callback({
						msg: sails.__('controller.create.rempro.enterreason')
					});
				}

				if (!(req.param('regions') || req.param('stuff'))) {
					return callback({
						msg: sails.__('controller.create.rempro.enterstuff')
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
					createdFor: req.param('createdfor').replace(/[^a-zA-Z0-9_-]/g, '') || null,
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
						msg: sails.__('controller.create.rempro.entervisibility')
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

							obj.title = 'Заявка от ' + login;
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
								msg: sails.__('controller.create.noplayer')
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
				}).exec(function(err, result) {
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
				}).exec(function (err, ticket) {
					if (err) return callback(err);

					callback(null, ticket)
				});
			}
		 ],
		 function (err, ticket) {
			if (err) {
				if (!err.msg) {
					res.serverError();
					console.log(err);
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

	banPost: function(req, res) {
		async.waterfall([
			function preCheck(callback) {
				if (!req.param('title')) {
					return callback({
						msg: sails.__('controller.create.entertitle')
					});
				}

				if (!req.param('reason')) {
					return callback({
						msg: sails.__('controller.create.enterreason')
					});
				}

				if (!req.param('targetuser')) {
					return callback({
						msg: sails.__('controller.create.unban.entertargetuser')
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
					reason: req.param('reason'),
					status: 1,
					targetUser: req.param('targetuser').replace(/[^a-zA-Z0-9_-]/g, '') || null,
					owner: req.user.id,
					logs: req.param('logs') || '',
					uploads: uploads || [],
					visiblity: 2
				});
			},
			function checkData(obj, callback) {
				if (!obj.title) {
					return callback({
						msg: sails.__('controller.create.entertitle')
					});
				}

				if (!obj.targetUser) {
					return callback({
						msg: sails.__('controller.create.ban.entertargetuser')
					});
				}

				callback(null, obj);
			},
			function sanitizeData(obj, callback) {
				obj.reason = req.sanitize('reason').entityEncode();
				obj.logs = req.sanitize('logs').entityEncode();

				if (obj.logs === '') obj.logs = null;

				/* Set title if no title, set obj.createdFor */
				gcdb.user.getByLogin(obj.targetUser, function(err, uid) {
					if (err) return callback(err);

					if (!uid) {
						callback({
							msg: sails.__('controller.create.noplayer') //FIXME
						})
					} else {
						obj.targetUser = uid;

						callback(null, obj);
					}
				});
			},
			function createBugreport(obj, callback) {
				Ban.create({
					title: obj.title,
					reason: obj.reason,
					targetUser: obj.targetUser,
					logs: obj.logs,
					uploads: obj.uploads
				}).exec(function(err, result) {
					if (err) return callback(err);

					callback(null, result.id, obj);
				});
			},
			function registerTicket(ticketId, obj, callback) {
				Ticket.create({
					tid: ticketId,
					type: 3,
					status: obj.status,
					visiblity: obj.visiblity,
					comments: [],
					owner: obj.owner
				}).exec(function (err, ticket) {
					if (err) return callback(err);

					callback(null, ticket)
				});
			}
		 ],
		 function (err, ticket) {
			if (err) {
				if (!err.msg) {
					res.json(500, {
						 err: sails.__('global.suddenerror')
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

	unbanTpl: function(req,res) {
		res.view('create/unban');
	},

	unbanPost: function(req, res) {
		async.waterfall([
			function preCheck(callback) {
				if (!req.param('title')) {
					return callback({
						msg: sails.__('controller.create.entertitle')
					});
				}

				if (!req.param('reason')) {
					return callback({
						msg: sails.__('controller.create.enterreason')
					});
				}

				if (!req.param('targetuser')) {
					return callback({
						msg: sails.__('controller.create.unban.entertargetuser')
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
					reason: req.param('reason'),
					status: 1,
					targetUser: req.param('targetuser').replace(/[^a-zA-Z0-9_-]/g, '') || null,
					owner: req.user.id,
					logs: req.param('logs') || '',
					uploads: uploads || [],
					visiblity: 2
				});
			},
			function checkData(obj, callback) {
				if (!obj.title) {
					return callback({
						msg: sails.__('controller.create.entertitle')
					});
				}

				if (!obj.targetUser) {
					return callback({
						msg: sails.__('controller.create.unban.entertargetuser')
					});
				}

				callback(null, obj);
			},
			function sanitizeData(obj, callback) {
				obj.reason = req.sanitize('reason').entityEncode();
				obj.logs = req.sanitize('logs').entityEncode();

				if (obj.logs === '') obj.logs = null;

				/* Set title if no title, set obj.createdFor */
				gcdb.user.getByLogin(obj.targetUser, function(err, uid) {
					if (err) return callback(err);

					if (!uid) {
						callback({
							msg: sails.__('controller.create.noplayer')
						})
					} else {
						obj.targetUser = uid;

						callback(null, obj);
					}
				});
			},
			function createBugreport(obj, callback) {
				Unban.create({
					title: obj.title,
					reason: obj.reason,
					targetUser: obj.targetUser,
					logs: obj.logs,
					uploads: obj.uploads
				}).exec(function(err, result) {
					if (err) return callback(err);

					callback(null, result.id, obj);
				});
			},
			function registerTicket(ticketId, obj, callback) {
				Ticket.create({
					tid: ticketId,
					type: 4,
					status: obj.status,
					visiblity: obj.visiblity,
					comments: [],
					owner: obj.owner
				}).exec(function (err, ticket) {
					if (err) return callback(err);

					callback(null, ticket)
				});
			}
		 ],
		 function (err, ticket) {
			if (err) {
				if (!err.msg) {
					res.json(500, {
						 err: sails.__('global.suddenerror')
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

	regenTpl: function(req,res) {
		res.view('create/regen');
	},

	admreqTpl: function(req,res) {
		res.view('create/admreq');
	}
	
};

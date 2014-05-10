var gcdb = require('../gcdb'),
	cfg = require('../../config/local.js'),
	bbcode = require('bbcode');

var moment = require('moment');
moment.lang('ru');

module.exports = bugreport = {
	serializeList: function serializeList(array, cb) {
		async.map(array, function (obj, callback) {
			async.waterfall([
				function getBugreport(callback) {
					Ticket.findOne(obj.id).done(function (err, ticket) {
						Bugreport.findOne(obj.tid).done(function (err, result) {
							if (err) return callback(err);

							result.owner = obj.owner;
							result.status = ticket.status;

							callback(null, result);
						});
					});
				},
				function serialize(result, callback) {
					bugreport.serializeView(result, null, function (err, ticket) {
						if (err) return callback(err);

						callback(null, {
							id: ticket.id,
							title: ticket.title,
							status: ticket.status,
							owner: ticket.owner,
							createdAt: ticket.createdAt,
							type: {
								descr: 'Баг-репорт',
								iconclass: 'bug'
							}
						});
					})
				}
			],
			function (err, bugreport) {
				if (err) throw err;

				callback(null, bugreport);
			});
		}, function (err, array) {
			if (err) throw err;

			cb(null, array);
		});

	},

	serializeView: function serializeSingle(obj, config, cb) {
		async.waterfall([
			function getUserByID(callback) {
				gcdb.user.getByID(obj.owner, function (err, result) {
					if (err) return callback(err);

					callback(null, {
						id: obj.id,
						title: obj.title,
						description: obj.description,
						status: getStatusByID(obj.status),
						owner: result,
						ownerId: obj.owner,
						type: obj.type,
						logs: obj.logs,
						uploads: obj.uploads,
						product: getProductByID(obj.product),
						visiblity: null,
						createdAt: obj.createdAt
					});
				});
			},
			function bbcode2html(obj, callback) {
				if (config && config.isEdit) {
					callback(null, obj);
				} else {
					bbcode.parse(obj.description, function(result) {
						obj.description = result;

						// IM SO SORRY.
						bbcode.parse(obj.logs, function(result) {
							obj.logs = result;

							callback(null, obj);
						});
					});
				}
			}
		],
		function (err, obj) {
			if (err) return cb(err);

			Ticket.find({
				tid: obj.id,
				type: 1
			}).done(function (err, ticket) {
				if (err) return cb(err);

				if (config && config.isEdit) {
					cb(null, {
						id: ticket[0].id,
						title: obj.title,
						description: obj.description,
						status: obj.status,
						owner: obj.owner,
						logs: obj.logs,
						uploads: obj.uploads,
						product: obj.product,
						visiblity: ticket[0].visiblity,
						createdAt: obj.createdAt,
						type: {
							descr: 'Баг-репорт',
							iconclass: 'bug',
							id: obj.type
						}
					});
				} else {
					cb(null, {
						id: ticket[0].id,
						title: obj.title,
						description: obj.description,
						status: obj.status,
						owner: obj.owner,
						ownerId: obj.ownerId,
						logs: obj.logs,
						uploads: obj.uploads,
						product: obj.product,
						visiblity: getVisiblityByID(ticket[0].visiblity),
						createdAt: obj.createdAt,
						type: {
							descr: 'Баг-репорт',
							iconclass: 'bug',
							id: obj.type
						}
					});
				}
			});
		});
	},

	tplView: function viewBugreport(req, res, ticket) {
		async.waterfall([
			function findBugreport(callback) {
				Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
					if (err) return callback(err);

					bugreport.owner = ticket.owner;
					bugreport.type = ticket.type;
					bugreport.status = ticket.status;
					callback(null, bugreport);
				});
			},
			function serializeView(bugreport, callback) {
				gct.bugreport.serializeView(bugreport, null, function(err, result) {
					if (err) return callback(err);

					callback(null, result, bugreport);
				});
			},
			// Adding var for checking local moderators
			function canModerate(bugreport, origTicket, callback) {
				if (req.user && req.user.group >= ugroup.mod) {
					callback({show: true}, bugreport, true);
				} else {
					callback(null, bugreport, origTicket);
				}
			},
			function getRights(bugreport, origTicket, callback) {
				if (req.user) {
					Rights.find({
						uid: req.user.id
					}).done(function (err, rights) {
						if (err) return callback(err);

						if (rights.length !== 0) callback(null, bugreport, rights[0].canModerate, origTicket);
							else callback({show: true}, bugreport, null, origTicket);
					});
				} else {
					callback(null, bugreport, null, origTicket);
				}
			},
			function checkRights(bugreport, canModerate, origTicket, callback) {
				if (canModerate instanceof Array) {
					async.each(canModerate, function (element, callback) {
						if (element === origTicket.product)
							return callback(true);

						callback(null);
					}, function (canMod) {
						if (canMod) return callback(null, bugreport, true);

						callback(null, bugreport, false);
					});
				} else {
					callback(null, bugreport, false);
				}
			}
		], function (err, result, canModerate) {
			if (err)
				if (!err.show) throw err;


			res.view('view/bugreport', {
				moment: moment,
				ticket: result,
				globalid: ticket.id,
				canModerate: canModerate
			});
		});
	},

	tplEdit: function editBugreportTpl(req, res, ticket) {
		Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
			if (err) throw err;

			gct.bugreport.serializeView(bugreport, {isEdit: true}, function(err, result) {
				if (err) throw err;

				res.view('edit/bugreport', {
					ticket: result,
					globalid: ticket.id
				});
			});
		});
	},

	postEdit: function editBugreport(req, res, ticket) {
		Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
			if (err) throw err;

			async.waterfall([
				function preCheck(callback) {
					if (!req.param('id') || !req.param('title') || !req.param('description') || !req.param('visiblity')) {
						return callback({
							show: true,
							msg: 'Некорректный запрос'
						});
					}

					callback(null);
				},
				function handleUpload(callback) {
					gct.handleUpload(req, res, bugreport, function (err, uploads) {
						if (err) return callback(err);

						callback(null, uploads);
					});
				},
				function setData(uploads, callback) {
					gct.bugreport.serializeView(bugreport, {isEdit: true}, function(err, result) {
						if (err) return callback(err);

						if (!uploads) {
							uploads = bugreport.uploads;
						} else if (uploads instanceof Array) {
							uploads = bugreport.uploads.concat(uploads);
						}

						callback(null, {
							title: req.param('title'),
							description: req.param('description', 10),
							status: bugreport.status,
							owner: bugreport.owner,
							logs: req.param('logs'),
							product: bugreport.bugreport,
							uploads: uploads,
							visiblity: parseInt(req.param('visiblity'), 10)
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
		});
	}
};

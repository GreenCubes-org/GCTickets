var gcdb = require('../gcdb');
var cfg = require('../../config/local.js');
var bbcode = require('../bbcode');

var moment = require('moment');
moment.lang('ru');

module.exports = rempro = {
	serializeList: function serializeList(array, cb) {
		async.map(array, function (obj, callback) {
			async.waterfall([
				function getRempro(callback) {
					Rempro.find({
						id: obj.tid
					}).done(function (err, result) {
						if (err) return callback(err);

						result[0].owner = obj.owner;
						result[0].status = obj.status;
						callback(null, result[0]);
					});
				},
				function getLoginForCreatedFor(result, callback) {
					if (result.createdFor) {
						gcdb.user.getByID(result.createdFor, function (err, login) {
							result.createdFor = login;

							callback(null, result);
						});
					} else {
						callback(null, result);
					}
				},
				function serialize(result, callback) {
					rempro.serializeView(result, null, function (err, ticket) {
						if (err) return callback(err);

						callback(null, {
							id: ticket.id,
							title: ticket.title,
							status: ticket.status,
							owner: ticket.owner,
							createdAt: ticket.createdAt,
							type: {
								descr: 'Удаление защит',
								iconclass: 'remove'
							}
						});
					})
				}
			],
			function (err, rempro) {
				if (err) throw err;

				callback(null, rempro);
			});
		}, function (err, array) {
			if (err) throw err;

			cb(null, array);
		});
	},

	serializeView: function serializeView(obj, config, cb) {
		async.waterfall([
			function getOwnerID(callback) {
				gcdb.user.getByID(obj.owner, function (err, result) {
					if (err) return callback(err);

					callback(null, {
						id: obj.id,
						title: obj.title,
						reason: obj.reason,
						regions: obj.regions,
						stuff: obj.stuff,
						status: getStatusByID(obj.status),
						createdFor: obj.createdFor,
						owner: result,
						ownerId: obj.owner,
						type: obj.type,
						uploads: obj.uploads,
						visiblity: null,
						createdAt: obj.createdAt
					});
				});
			},
			function getCreatedForID(obj, callback) {
				gcdb.user.getByID(obj.createdFor, function (err, result) {
					if (err) return callback(err);

					callback(null, {
						id: obj.id,
						title: obj.title,
						reason: obj.reason,
						regions: obj.regions,
						stuff: obj.stuff,
						status: obj.status,
						createdFor: result,
						owner: obj.owner,
						ownerId: obj.ownerId,
						type: obj.type,
						uploads: obj.uploads,
						visiblity: null,
						createdAt: obj.createdAt
					});
				});
			},
			function bbcode2html(obj, callback) {
				if (config && config.isEdit) {
					callback(null, obj);
				} else {
					bbcode.parse(obj.reason, function(result) {
						obj.reason = result;

						callback(null, obj);
					});
				}
			},
			function getTicket(obj, callback) {
				Ticket.find({
					tid: obj.id,
					type: 2
				}).done(function (err, ticket) {
					if (err) return cb(err);

					callback(null, obj, ticket);
				});
			},
			function getCommentsCount(obj, ticket, callback) {
				Comments.find({
					tid: ticket[0].id,
					status: {
						'!': 3
					}
				}).done(function (err, comments) {
					if (err) return callback(err);

					obj.commentsCount =  comments.length;

					callback(null, obj, ticket);
				});
			}
		], function (err, obj, ticket) {
			if (err) return cb(err);

			if (config && config.isEdit) {
				cb(null, {
					id: ticket[0].id,
					title: obj.title,
					reason: obj.reason,
					regions: obj.regions,
					stuff: obj.stuff,
					status: obj.status,
					createdFor: obj.createdFor,
					owner: obj.owner,
					uploads: obj.uploads,
					visiblity: {
						id: ticket[0].visiblity,
						text: getVisiblityByID(ticket[0].visiblity)
					},
					createdAt: obj.createdAt,
					type: {
						descr: 'Расприват',
						iconclass: 'remove',
						id: obj.type
					},
					commentsCount: obj.commentsCount
				});
			} else {
				cb(null, {
					id: ticket[0].id,
					title: obj.title,
					reason: obj.reason,
					regions: obj.regions,
					stuff: obj.stuff,
					status: obj.status,
					createdFor: obj.createdFor,
					owner: obj.owner,
					ownerId: obj.ownerId,
					uploads: obj.uploads,
					visiblity: getVisiblityByID(ticket[0].visiblity),
					createdAt: obj.createdAt,
					type: {
						descr: 'Расприват',
						iconclass: 'remove',
						id: obj.type
					},
					commentsCount: obj.commentsCount
				});
			}
		});
	},

	tplView: function viewRempro(req, res, ticket) {
		async.waterfall([
			function findRempro(callback) {
				Rempro.findOne(ticket.tid).done(function (err, rempro) {
					if (err) return callback(err);

					rempro.owner = ticket.owner;
					rempro.type = ticket.type;
					rempro.status = ticket.status;
					callback(null, rempro);
				});
			},
			function serializeView(rempro, callback) {
				gct.rempro.serializeView(rempro, null, function(err, result) {
					if (err) return callback(err);

					callback(null, result, rempro);
				});
			},
			function checkRights(rempro, origTicket, callback) {
				if (req.user && req.user.group >= ugroup.mod) {
					callback(null, rempro, true);
				} else {
					callback(null, rempro, origTicket);
				}
			}
		], function (err, result, canModerate) {
			if (err) throw err;

			res.view('view/rempro', {
				moment: moment,
				ticket: result,
				globalid: ticket.id,
				canModerate: canModerate
			});
		});
	},

	tplEdit: function editRemproTpl(req, res, ticket) {
		Rempro.findOne(ticket.tid).done(function (err, rempro) {
			if (err) throw err;

			rempro.owner = ticket.owner;
			gct.rempro.serializeView(rempro, {isEdit: true}, function(err, result) {
				if (err) throw err;

				res.view('edit/rempro', {
					ticket: result,
					globalid: ticket.id
				});
			});
		});
	},

	postEdit: function editRempro(req, res, ticket) {
		Rempro.findOne(ticket.tid).done(function (err, rempro) {
			if (err) throw err;

			async.waterfall([
				function preCheck(callback) {
					if (!req.param('title')) {
						return callback({
							msg: 'Введите краткое описание'
						});
					}

					if (!req.param('reason')) {
						return callback({
							msg: 'Введите причину удаления привата'
						});
					}

					if (!req.param('regions') && !req.param('stuff')) {
						return callback({
							msg: 'Введите хотя бы один регион или координату'
						});
					}

					callback(null);
				},
				function handleUpload(callback) {
					gct.handleUpload(req, res, rempro, function (err, uploads) {
						if (err) return callback(err);

						callback(null, uploads);
					});
				},
				function setData(uploads, callback) {
					gct.rempro.serializeView(rempro, {isEdit: true}, function(err, result) {
						if (err) return callback(err);

						if (!uploads) {
							uploads = rempro.uploads;
						} else if (uploads instanceof Array) {
							uploads = rempro.uploads.concat(uploads);
						}

						callback(null, {
							title: req.param('title'),
							reason: req.param('reason'),
							status: ticket.status,
							createdFor: req.param('createdfor'),
							owner: rempro.owner,
							regions: req.param('regions').trim().split(/\n/) || '',
							stuff: req.param('stuff').trim().split(/\n/) || '',
							uploads: uploads,
							visiblity: rempro.owner
						});
					});
				},
				function checkData(obj, callback) {
					var isErr = false;
					req.onValidationError(function (msg) {
						isErr = true;
						callback({ show: true, msg: msg });
					});
					req.check('title','Краткое описание должно содержать не менее %1 и не более %2 символов').len(6,64);

					if (!isErr) callback(null, obj);
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
				function editRempro(obj, callback) {
					Rempro.findOne(ticket.tid).done(function(err, result) {
						if (err) return callback(err);

						result.title = obj.title;
						result.reason = obj.reason;
						result.regions = obj.regions;
						result.stuff = obj.stuff;
						result.uploads = obj.uploads;
						result.createdFor = obj.createdFor;

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
					if (!err.msg) {
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

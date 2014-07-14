var gcdb = require('../gcdb'),
	cfg = require('../../config/local.js'),
	bbcode = require('../bbcode');

var moment = require('moment');
moment.lang('ru');

module.exports = bugreport = {
	serializeList: function serializeList(obj, cb) {
		async.waterfall([
			function getUserByID(callback) {
				gcdb.user.getByID(obj.owner, function (err, result) {
					if (err) return callback(err);

					callback(null, {
						id: obj.id,
						tid: obj.tid,
						title: obj.title,
						status: getStatusByID(obj.status),
						owner: {
							id: obj.owner,
							login: result,
							pinfo: null
						},
						type: obj.type,
						product: obj.product,
						visiblity: obj.visiblity,
						createdAt: obj.createdAt
					});
				});
			},
			function getCommentsCount(obj, callback) {
				Comments.find({
					tid: obj.tid,
					status: {
						'!': 3
					}
				}).done(function (err, comments) {
					if (err) return callback(err);

					var lastChangedToOwner;
					for (var i = comments.length - 1; i >= 0; i--) {
						if (comments[i].changedTo) {
							lastChangedToOwner = comments[i].owner;
							break;
						}
					}

					obj.comments = {
						count: comments.length,
						lastCommentOwner: (comments.length) ? comments[comments.length - 1].owner : null,
						lastChangedToOwner: lastChangedToOwner
					};

					callback(null, obj);
				});
			},
			function getLoginsForLastCommentOwners(obj, callback) {
				if (obj.comments.count) {
					gcdb.user.getByID(obj.comments.lastCommentOwner, function(err, login) {
						if (err) return callback(err);

						obj.comments.lastCommentOwner = login;

						if (obj.comments.lastChangedToOwner) {
							gcdb.user.getByID(obj.comments.lastChangedToOwner, function(err, login) {
								if (err) return callback(err);

								obj.comments.lastChangedToOwner = login;

								callback(null, obj);
							});
						} else {
							callback(null, obj);
						}
					});
				} else {
					callback(null, obj);
				}
			}
		], function (err, obj) {
			if (err) return cb(err);

			cb(null, {
				id: obj.tid,
				title: obj.title,
				status: obj.status,
				owner: obj.owner,
				visiblity: getVisiblityByID(obj.visiblity),
				createdAt: obj.createdAt,
				type: {
					descr: 'Баг-репорт',
					iconclass: 'bug',
					id: obj.type
				},
				product: gct.getProductByID(obj.product),
				comments: obj.comments
			});
		});
	},

	serializeView: function serializeView(req, res, obj, config, cb) {
		async.waterfall([
			function getUserByID(callback) {
				gcdb.user.getByID(obj.owner, function (err, result) {
					if (err) return callback(err);

					callback(null, {
						id: obj.id,
						title: obj.title,
						description: obj.description,
						status: getStatusByID(obj.status),
						owner: {
							id: obj.owner,
							login: result,
							pinfo: null
						},
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
			},
			function getTicket(obj, callback) {
				Ticket.find({
					tid: obj.id,
					type: 1
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

					var lastChangedToOwner;
					for (var i = comments.length - 1; i >= 0; i--) {
						if (comments[i].changedTo) {
							lastChangedToOwner = comments[i].owner;
							break;
						}
					}

					obj.comments = {
						count: comments.length,
						lastCommentOwner: (comments.length) ? comments[comments.length - 1].owner : null,
						lastChangedToOwner: lastChangedToOwner
					};

					callback(null, obj, ticket);
				});
			},
			function getLoginsForLastCommentOwners(obj, ticket, callback) {
				if (obj.comments.count) {
					gcdb.user.getByID(obj.comments.lastCommentOwner, function(err, login) {
						if (err) return callback(err);

						obj.comments.lastCommentOwner = login;

						if (obj.comments.lastChangedToOwner) {
							gcdb.user.getByID(obj.comments.lastChangedToOwner, function(err, login) {
								if (err) return callback(err);

								obj.comments.lastChangedToOwner = login;

								callback(null, obj, ticket);
							});
						} else {
							callback(null, obj, ticket);
						}
					});
				} else {
					callback(null, obj, ticket);
				}
			},
			function getPInfo4Owner(obj, ticket, callback) {
				if (req.user && req.user.group >= ugroup.helper) {
					gct.user.getPInfo(obj.owner.login, function(err, pinfo) {
						if (err) return callback(err);

						obj.owner.pinfo = pinfo;

						callback(null, obj, ticket);
					});
				} else {
					callback(null, obj, ticket);
				}
			}
		], function (err, obj, ticket) {
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
					visiblity: {
						id: ticket[0].visiblity,
						text: getVisiblityByID(ticket[0].visiblity)
					},
					createdAt: obj.createdAt,
					type: {
						descr: 'Баг-репорт',
						iconclass: 'bug',
						id: obj.type
					},
					comments: obj.comments
				});
			} else {
				cb(null, {
					id: ticket[0].id,
					title: obj.title,
					description: obj.description,
					status: obj.status,
					owner: obj.owner,
					logs: obj.logs,
					uploads: obj.uploads,
					product: obj.product,
					visiblity: getVisiblityByID(ticket[0].visiblity),
					createdAt: obj.createdAt,
					type: {
						descr: 'Баг-репорт',
						iconclass: 'bug',
						id: obj.type
					},
					comments: obj.comments
				});
			}
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
				gct.bugreport.serializeView(req, res, bugreport, null, function(err, result) {
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

			bugreport.owner = ticket.owner;
			gct.bugreport.serializeView(req, res, bugreport, {isEdit: true}, function(err, result) {
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

			bugreport.owner = ticket.owner;

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
					gct.handleUpload(req, res, bugreport, function (err, uploads) {
						if (err) return callback(err);

						callback(null, uploads);
					});
				},
				function setData(uploads, callback) {
					gct.bugreport.serializeView(req, res, bugreport, {isEdit: true}, function(err, result) {
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
							visiblity: bugreport.owner
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

							callback(null);
						});
					});
				}
			 ], function (err) {
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

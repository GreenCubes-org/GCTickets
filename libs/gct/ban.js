var gcdb = require('../gcdb'),
	cfg = require('../../config/local.js'),
	bbcode = require('../bbcode'),
	validator = require('validator');

var moment = require('moment');

module.exports = ban = {
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
				}).exec(function (err, comments) {
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
					descr: sails.__({phrase:'global.type.ban',locale: sails.language}),
					iconclass: 'ban circle',
					id: obj.type
				},
				comments: obj.comments
			});
		});
	},

	/*

	title: {
		type: 'string',
		maxLength: 120
	},
	// 'imma idiot, plz tp meh to spawn!1!!'
	reason: 'text',
	// uid
	targetUser: 'integer',
	// 'longtext'
	logs: 'text',
	// '42' (id of upload)
	uploads: 'array'

	*/
	serializeView: function serializeView(req, res, obj, config, cb) {
		async.waterfall([
			function getUserByID(callback) {
				gcdb.user.getByID(obj.owner, function (err, ownerLogin) {
					if (err) return callback(err);

					callback(null, {
						id: obj.id,
						title: obj.title,
						reason: obj.reason,
						status: getStatusByID(obj.status),
						owner: {
							id: obj.owner,
							login: ownerLogin,
							pinfo: null
						},
						targetUser: obj.targetUser,
						type: obj.type,
						logs: obj.logs,
						uploads: obj.uploads,
						visiblity: null,
						createdAt: obj.createdAt
					});
				});
			},
			function getUIDs4TargetUsers(obj, callback) {
				async.map(obj.targetUser, function (element, callback) {
					gcdb.user.getByID(element, function(err, login) {
						if (err) return callback(err);

						element = {
							id: element,
							login: login,
							pinfo: null
						};

						callback(null, element);
					});
				}, function (err, array) {
					if (err) return callback(err);

					obj.targetUser = array;

					callback(null, obj);
				});
			},
			function bbcode2html(obj, callback) {
				if (config && config.isEdit) {
					callback(null, obj);
				} else {
					bbcode.parse(obj.reason, function(result) {
						obj.reason = result;

						// IM SO SORRY.
						bbcode.parse(obj.logs, function(result) {
							obj.logs = result;

							callback(null, obj);
						});
					});
				}
			},
			function fixNewlines(obj, callback) {
				obj.reason = {
					view: obj.reason.replace("\r\n","\n").replace("\r","\n").replace("\n","<br>"),
					edit: obj.reason
				};

				callback(null, obj);
			},
			function getTicket(obj, callback) {
				Ticket.find({
					tid: obj.id,
					type: 3
				}).exec(function (err, ticket) {
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
				}).exec(function (err, comments) {
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
			},
			function getPInfo4TargetUsers(obj, ticket, callback) {
				if (req.user && req.user.group >= ugroup.helper) {
					async.map(obj.targetUser, function (element, callback) {
						gct.user.getPInfo(element.login, function(err, pinfo) {
							if (err) return callback(err);

							element.pinfo = pinfo;

							callback(null, element);
						});
					}, function (err, array) {
						if (err) return callback(err);

						obj.targetUser = array;

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
					reason: obj.reason,
					status: obj.status,
					owner: obj.owner,
					targetUser: obj.targetUser,
					logs: obj.logs,
					uploads: obj.uploads,
					visiblity: {
						id: ticket[0].visiblity,
						text: getVisiblityByID(ticket[0].visiblity)
					},
					createdAt: obj.createdAt,
					type: {
						descr: sails.__({phrase:'global.type.ban',locale: sails.language}),
						iconclass: 'ban circle',
						id: obj.type
					},
					comments: obj.comments
				});
			} else {
				cb(null, {
					id: ticket[0].id,
					title: obj.title,
					reason: obj.reason,
					status: obj.status,
					owner: obj.owner,
					targetUser: obj.targetUser,
					logs: obj.logs,
					uploads: obj.uploads,
					visiblity: getVisiblityByID(ticket[0].visiblity),
					createdAt: obj.createdAt,
					type: {
						descr: sails.__({phrase:'global.type.ban',locale: sails.language}),
						iconclass: 'ban circle',
						id: obj.type
					},
					comments: obj.comments
				});
			}
		});
	},

	tplView: function viewBan(req, res, ticket) {
		async.waterfall([
			function findBan(callback) {
				Ban.findOne(ticket.tid).exec(function (err, ban) {
					if (err) return callback(err);

					ban.owner = ticket.owner;
					ban.type = ticket.type;
					ban.status = ticket.status;

					callback(null, ban);
				});
			},
			function serializeView(ban, callback) {
				gct.ban.serializeView(req, res, ban, null, function(err, result) {
					if (err) return callback(err);

					callback(null, result, ban);
				});
			},
			function checkRights(rempro, origTicket, callback) {
				if (req.user && req.user.group >= ugroup.mod) {
					callback(null, rempro, true);
				} else {
					callback(null, rempro, false);
				}
			}
		], function (err, result, canModerate) {
			if (err && !err.show) return res.serverError(err);


			res.view('view/ban', {
				moment: moment,
				ticket: result,
				globalid: ticket.id,
				canModerate: canModerate
			});
		});
	},

	tplEdit: function editBanTpl(req, res, ticket) {
		Ban.findOne(ticket.tid).exec(function (err, ban) {
			if (err) return res.serverError(err);

			ban.owner = ticket.owner;

			gct.ban.serializeView(req, res, ban, {isEdit: true}, function(err, result) {
				if (err) return res.serverError(err);

				res.view('edit/ban', {
					ticket: result,
					globalid: ticket.id
				});
			});
		});
	},

	postEdit: function editBan(req, res, ticket) {
		Ban.findOne(ticket.tid).exec(function (err, ban) {
			if (err) return res.serverError(err);

			ban.owner = ticket.owner;

			async.waterfall([
				function preCheck(callback) {
					if (!req.param('title')) {
						return callback({
							msg: sails.__({phrase:'gct.ban.postEdit.entertitle',locale: sails.language})
						});
					}

					if (!req.param('reason')) {
						return callback({
							msg: sails.__({phrase:'gct.ban.postEdit.enterreason',locale: sails.language})
						});
					}

					callback(null);
				},
				function handleUpload(callback) {
					gct.handleUpload(req, res, ban, function (err, uploads) {
						if (err) return callback(err);

						callback(null, uploads);
					});
				},
				function setData(uploads, callback) {
					gct.ban.serializeView(req, res, ban, {isEdit: true}, function(err, result) {
						if (err) return callback(err);

						if (!uploads) {
							uploads = ban.uploads;
						} else if (uploads instanceof Array) {
							uploads = ban.uploads.concat(uploads);
						}

						callback(null, {
							title: req.param('title'),
							reason: req.param('reason'),
							status: ban.status,
							owner: ban.owner,
							logs: req.param('logs'),
							uploads: uploads,
							visiblity: ban.visiblity
						});
					});
				},
				function checkData(obj, callback) {
					if (!(validator.isLength(obj.title,6,128))) {
						return callback({
							msg: sails.__({phrase:'gct.postEdit.titleshouldhave',locale: sails.language})
						});
					}

					callback(null, obj);
				},
				function sanitizeData(obj, callback) {
					obj.reason = req.sanitize('reason').entityEncode();
					obj.logs = req.sanitize('logs').entityEncode();

					if (obj.logs === '') obj.logs = null;

					callback(null, obj);
				},
				function editBan(obj, callback) {
					Ban.findOne(ticket.tid).exec(function(err, result) {
						if (err) return callback(err);

						result.title = obj.title;
						result.reason = obj.reason;
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
							err: sails.__({phrase:'global.suddenerror',locale: sails.language})
						});

						return res.serverError(err);
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

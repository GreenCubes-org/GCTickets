var gcdb = require('../gcdb');
var cfg = require('../../config/local.js');
var bbcode = require('../bbcode');

var moment = require('moment');
moment.lang('ru');

module.exports = rempro = {
	serializeList: function serializeList(obj, cb) {
		async.waterfall([
			function getOwnerID(callback) {
				gcdb.user.getByID(obj.owner, function (err, result) {
					if (err) return callback(err);

					callback(null, {
						id: obj.id,
						title: obj.title,
						status: getStatusByID(obj.status),
						owner: {
							id: obj.owner,
							login: result,
							pinfo: null
						},
						type: obj.type,
						visiblity: null,
						createdAt: obj.createdAt
					});
				});
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

					var lastChangedToOwner;

					for (var i = comments.length - 1; i >= 0; i--) {
						if (comments[i].changedTo) {
							lastChangedToOwner = comments[i].owner;
						}
					}

					obj.comments = {
						count: comments.length,
						lastCommentOwner: (comments.length) ? comments[comments.length - 1].owner : 0,
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
			}
		], function (err, obj, ticket) {
			if (err) return cb(err);

			cb(null, {
				id: ticket[0].id,
				title: obj.title,
				status: obj.status,
				owner: obj.owner,
				visiblity: getVisiblityByID(ticket[0].visiblity),
				createdAt: obj.createdAt,
				type: {
					descr: 'Расприват',
					iconclass: 'remove',
					id: obj.type
				},
				comments: obj.comments
			});
		});
	},

	serializeView: function serializeView(req, res, obj, config, cb) {
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
						createdFor: {
							id: obj.createdFor,
							login: null,
							pinfo: null
						},
						owner: {
							id: obj.owner,
							login: result,
							pinfo: null
						},
						type: obj.type,
						uploads: obj.uploads,
						visiblity: null,
						createdAt: obj.createdAt
					});
				});
			},
			function getCreatedForLogin(obj, callback) {
				gcdb.user.getByID(obj.createdFor.id, function (err, result) {
					if (err) return callback(err);

					obj.createdFor.login = result;

					callback(null, obj);
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

					var lastChangedToOwner;

					for (var i = comments.length - 1; i >= 0; i--) {
						if (comments[i].changedTo) {
							lastChangedToOwner = comments[i].owner;
						}
					}

					obj.comments = {
						count: comments.length,
						lastCommentOwner: (comments.length) ? comments[comments.length - 1].owner : 0,
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
			function getPInfo4CreatedFor(obj, ticket, callback) {
				if (req.user && req.user.group >= ugroup.helper) {
					if (obj.createdFor.login) {
						gct.user.getPInfo(obj.createdFor.login, function(err, pinfo) {
							if (err) return callback(err);

							obj.createdFor.pinfo = pinfo;

							callback(null, obj, ticket);
						});
					} else {
						callback(null, obj, ticket);
					}
				} else {
					callback(null, obj, ticket);
				}
			},
			function getRegionsInfo (obj, ticket, callback) {
				obj.regions = obj.regions.map(function(element) {
					return {
						name: element.match(/^([a-zA-Z0-9-_]*)/g)[0],
						comment: element.replace(/^([a-zA-Z0-9-_]*)/g, '')
					};
				});

				if (req.user && req.user.group >= ugroup.helper && (!config || !config.isEdit)) {
					gct.getRegionsInfo(obj.regions, (req.user) ? req.user.group : 0, function (err, regions) {
						if (err) callback(err);

						async.each(regions, function (region, callback) {
							async.waterfall([
								function serializeCreator(callback) {
									gcdb.user.getByID(region.creator, 'maindb', function (err, login) {
										if (err) return callback(err);

										region.creator = login;

										callback(null);
									});
								},
								function serializeFull_accessPlayers(callback) {
									async.map(region.full_access.players, function (element, callback) {
										gcdb.user.getByID(element.uid, 'maindb', function (err, login) {
											if (err) return callback(err);

											callback(null, {
												name: login,
												lastseen: moment(element.lastseenLocale).format('D MMM YYYY, H:mm')
											});
										});
									}, function (err, array) {
										if (err) return callback(err);

										region.full_access.players = array;

										callback(null);
									});
								},
								function serializeBuild_accessPlayers(callback) {
									async.map(region.build_access.players, function (element, callback) {
										gcdb.user.getByID(element.uid, 'maindb', function (err, login) {
											if (err) return callback(err);

											callback(null, {
												name: login,
												lastseen: moment(element.lastseenLocale).format('D MMM YYYY, H:mm')
											});
										});
									}, function (err, array) {
										if (err) return callback(err);

										region.build_access.players = array;

										callback(null);
									});
								},
								function serializeFull_accessOrgs(callback) {
									async.map(region.full_access.orgs, function (element, callback) {
										callback(null, 'Организация #' + element);
									}, function (err, array) {
										if (err) return callback(err);

										region.full_access.orgs = array;

										callback(null);
									});
								},
								function serializeBuild_accessOrgs(callback) {
									async.map(region.build_access.orgs, function (element, callback) {
										callback(null, 'Организация #' + element);
									}, function (err, array) {
										if (err) return callback(err);

										region.build_access.orgs = array;

										callback(null);
									});
								}
							], function (err) {
								if (err) callback(err);

								callback(null, region);
							});
						}, function (err) {
							if (err) callback(err);

							obj.regions = regions;

							callback(null, obj, ticket);
						});
					});
				} else {
					callback(null, obj, ticket);
				}
			},
			function serializeStuff (obj, ticket, callback) {
				async.map(obj.stuff, function(element, callback) {
					var strMatch = element.match(/^(-?[0-9]*) (\-?[0-9]*) (\-?[0-9]*)/g),
						strReplace = element.replace(/^(-?[0-9]*) (\-?[0-9]*) (\-?[0-9]*)/g, '').replace(/\r/g, '');
					callback(null, {
						coord: (strMatch) ? strMatch[0] : '-',
						comment: strReplace
					});
				}, function (err, stuff) {
					obj.stuff = stuff;

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
					comments: obj.comments
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
					uploads: obj.uploads,
					visiblity: getVisiblityByID(ticket[0].visiblity),
					createdAt: obj.createdAt,
					type: {
						descr: 'Расприват',
						iconclass: 'remove',
						id: obj.type
					},
					comments: obj.comments
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
				gct.rempro.serializeView(req, res, rempro, null, function(err, result) {
					if (err) return callback(err);

					callback(null, result, rempro);
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

			gct.rempro.serializeView(req, res, rempro, {isEdit: true}, function(err, result) {
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

			rempro.owner = ticket.owner;

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
					gct.rempro.serializeView(req, res, rempro, {isEdit: true}, function(err, result) {
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
							visiblity: rempro.visiblity
						});
					});
				},
				function checkData(obj, callback) {
					var isErr = false;
					req.onValidationError(function (msg) {
						isErr = true;
						callback({ show: true, msg: msg });
					});

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

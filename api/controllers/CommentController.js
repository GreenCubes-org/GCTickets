/**
* CommentController
*
* @module :: Controller
* @description :: Управление комментариями
*/

var bbcode = require('../../libs/bbcode');

module.exports = {
	
	listViewComments: function(req, res) {
		if (!req.param('tid')) {
			return res.badRequest();
		}
		
		var tid = parseInt(req.param('tid'), 10);

		Comments.find({
			tid: tid
		}).exec(function(err, comments) {
				if (err) throw err;
				
				if (req.user) {
					gct.comment.serializeComments(comments, req.user.group, req.user.id, function(err, result) {
						if (err) throw err;

						res.json(result);
					});
				} else {
					gct.comment.serializeComments(comments, 0, 0, function(err, result) {
						if (err) throw err;

						res.json(result);
					});
				}
			});
	},

	newComment: function(req, res) {
		if (!req.param('tid')) {
			return callback({
				show: true,
				msg: 'Некорректный запрос'
			});
		}

		var tid = parseInt(req.param('tid'), 10)

		async.waterfall([
			function getTicket(callback) {
				Ticket.findOne(tid)
					.exec(function(err, ticket) {
						callback(err, ticket);
					});
			},
			function preCheck(ticket, callback) {
				if (req.user.group < ugroup.helper && [2,4,5,6,7,10,12].indexOf(ticket.status) !== -1) {
					return callback({
						show: true,
						msg: 'Комментирование закрытых тикетов запрещено'
					});
				}

				callback(null, ticket);
			},
			function getBugreport(ticket, callback) {
				if (ticket.type == 1) {
					Bugreport.findOne(ticket.tid)
						.exec(function (err, bugreport) {
							if (err) return callback(err);

							ticket.product = bugreport.product;

							callback(null, ticket);
						});
				} else {
					callback(null, ticket);
				}
			},
			function checkOldCommentsNMessageLength(ticket, callback) {
				Comments.find({
					tid: tid
				}).exec(function (err, comments) {
					if (err) return callback(err);

					if ((!req.param('message') && !req.param('status')) && !(req.param('status') === ticket.status && !req.param('message'))) {
						return callback({
							show: true,
							msg: 'Комментарий слишком короткий'
						});
					}

					callback(null,  {
						owner: req.user.id,
						message: req.sanitize('message').entityEncode(),
						status: 1,
						changedTo: parseInt(req.param('status'), 10),
						tid: tid
					}, ticket);

				});
			},
			// Adding var for checking global moderators
			function canModerate(newComment, ticket, callback) {
				if (req.user.group >= ugroup.mod) {
					callback(null, newComment, true, ticket);
				} else {
					callback(null, newComment, false, ticket);
				}
			},
			function getRights(newComment, pass, ticket, callback) {
				if (pass) return callback(null, newComment, true, null, ticket);
				
				if (req.user) {
					User.find({
						uid: req.user.id
					}).exec(function (err, rights) {
						if (err) return callback(err);

						if (rights.length) {
							callback(null, newComment, false, rights[0].canModerate, ticket);
						} else {
							callback(null, newComment, false, [], ticket);
						}
					});
				} else {
					callback(null, newComment, null, [], ticket);
				}
			},
			function checkRights(newComment, pass, canModerate, ticket, callback) {
				if (pass) return callback(null, newComment, true, ticket);
				
				async.each(canModerate, function (element, callback) {
					if (element === ticket.product) {
						return callback(true);
					}

					callback(false);
				}, function (canMod) {
					if (canMod) return callback(null, newComment, true, ticket);

					callback(null, newComment, false, ticket);
				});
			},
			function processStatus(newComment, canModerate, ticket, callback) {
				if (isNaN(newComment.changedTo) || newComment.changedTo === ticket.status) {
					delete newComment.changedTo;
					return callback(null, newComment);
				}
				
				gct.processStatus(req, res, ticket.type, canModerate, ticket, newComment.changedTo, function(result) {
					if (!result){
						delete newComment.changedTo;
					}

					callback(null, newComment);
				});
			},
			function createComment(newComment, callback) {
				Comments.create(newComment)
					.exec(function (err, comment) {
						if (err) return callback(err);

						newComment.id = comment.id;

						callback(null, newComment);
					});
			},
			function changeStatus(newComment, callback) {
				Ticket.findOne(tid)
					.exec(function (err, ticket) {
						if (err) return callback(err);

						if (newComment.changedTo) {
							ticket.status = newComment.changedTo;
						}

						ticket.save(function (err) {
							if (err) return callback(err);

							callback(null, newComment, ticket);
						});
					});
			},
			function serialize(newComment, ticket, callback) {
				gcdb.user.getByID(newComment.owner, function(err, login) {
					if (err) return callback(err);
					
					newComment.ownerId = newComment.owner;
					newComment.owner = login;
					newComment.code = 'OK';

					callback(null, newComment, ticket);
				})
			},
			function sendNotifs(newComment, ticket, callback) {
				if (newComment.ownerId !== ticket.owner) {
					if (newComment.changedTo) {
						Notif.add(2, ticket.owner, {
							ticket: tid,
							user: newComment.ownerId,
							cid: newComment.id,
							changedTo: newComment.changedTo
						}, function (err) {
							if (err) return callback(err);

							callback(null, newComment);
						});
					} else {
						Notif.add(1, ticket.owner, {
							ticket: tid,
							user: newComment.ownerId,
							cid: newComment.id
						}, function (err) {
							if (err) return callback(err);

							callback(null, newComment);
						});
					}
				} else {
					callback(null, newComment);
				}
			}
		],
		function (err, comment, reload) {
			if (err) {
				if (!err.show) {
					throw err;
				} else {
					return res.json({
						error: err.msg
					});
				}
			}
			
			res.json(comment);
		});
	},

	getComment: function (req, res) {
		if (!req.param('cid')) {
			return res.badRequest();
		}

		async.waterfall([
			function getComment(callback) {
				Comments.findOne(req.param('cid')).exec(function (err, comment) {
					if (err) return callback(err);

					callback(null, comment);
				});
			},
			function getBugreportProduct(comment, callback) {
				Ticket.findOne(comment.tid)
					.exec(function (err, ticket) {
						if (err) return callback(err);

						if (ticket.type == 1) {
							Bugreport.findOne(ticket.tid)
								.exec(function (err, bugreport) {
									if (err) return callback(err);

									callback(null, comment, bugreport.product);
								});
						} else {
							callback(null, comment, null);
						}
					});
			},
			function processMap(comment, bugreportProduct, callback) {
				gcdb.user.getByID(comment.owner, function (err, login) {
					if (err) return callback(err);

					async.waterfall([
						function getStatus(callback) {
							comment.changedTo = gct.getStatusByID(comment.changedTo);

							callback(null, comment);
						},
						function getPrefix(comment, callback) {
							user.getPrefix(comment.owner, function (err, prefix) {
								if (err) return callback(err);
								comment.prefix = prefix;

								callback(null, comment);
							});
						},
						function getColorClass(comment, callback) {
							user.getColorClass(comment.owner, function (err, colorclass) {
								if (err) return callback(err);

								comment.colorclass = colorclass;

								callback(null, comment);
							});
						},
						function getRights(comment, callback) {
							if (req.user.id) {
								User.find({
									uid: req.user.id
								}).exec(function (err, rights) {
									if (err) return callback(err);

									if (rights.length && bugreportProduct) {
										callback(null, comment, (rights[0].canModerate.indexOf(bugreportProduct) !== -1) ? true : false, req.user.id);
									} else if (rights.length && !bugreportProduct && comment.owner === req.user.id) {
										callback(null, comment, true, req.user.id);
									} else {
										callback(null, comment, false, req.user.id);
									}
								});
							} else {
								callback(null, comment, false, 0);
							}
						},
						function checkUGroup(comment, canModerate, commentCreator, callback) {
							if (canModerate || comment.owner === commentCreator || req.user.group >= ugroup.mod) {
								comment.canModerate = true;
								callback(null, comment);
							} else {
								callback(null, comment);
							}
						},
						function setLogin(comment, callback) {
							comment.owner = login;

							callback(null, comment);
						},
						function cbComments(comment, callback) {
							if (req.user.group >= ugroup.mod) {
								callback(null, comment);
							} else {
								if (comment.status && comment.status !== 1) {
									callback(null, undefined);
								} else {
									delete comment.status;
									callback(null, comment);
								}
							}
						}
					], function (err, comment) {
						if (err) return callback(err);

						callback(null, comment);
					});
				});
			}
		], function (err, comment) {
			if (err) {
				res.serverError();
				throw err;
			}

			res.json(comment);
		});
	},

	editComment: function (req, res) {
		if (!req.param('cid')) {
			return res.badRequest();
		}

		if (!req.param('message')) {
			return res.badRequest();
		}

		async.waterfall([
			function getComment(callback) {
				Comments.findOne({id: req.param('cid')})
					.exec(function(err, comment) {
						if (err) {
							res.serverError();
							return callback(err);
						}

						callback(null, comment);
				});
			},
			function checkUGroup(comment, callback) {
				if (comment.owner === req.user.id) {
					callback(null, comment);
				} else {
					res.forbidden();
				}
			},
			function getTicket(comment, callback) {
				Ticket.findOne(comment.tid)
					.exec(function(err, ticket) {
						callback(err, comment, ticket);
					});
			},
			function preCheck(comment, ticket, callback) {
				if (req.user.group < ugroup.helper && [2,4,5,6,7,10,12].indexOf(ticket.status) !== -1) {
					return callback({
						show: true,
						msg: 'Редактирование в закрытых тикетах запрещено'
					});
				}

				callback(null, comment);
			},
			function editComment(comment, callback) {
				comment.message = req.sanitize('message').entityEncode();

				comment.save(function (err) {
					if (err) return callback(err);

					callback(null, comment);
				});
			},
			// I'm updating ticket for updating updatedOn record.
			function updateTicket(comment, callback) {
				Ticket.findOne(comment.tid)
					.exec(function (err, ticket) {
						if (err) return callback(err);

						ticket.save(function(err) {
							if (err) return callback(err);

							callback(null, comment);
						});
					});
			}
		], function (err) {
			if (err) throw err;

			res.json({
				status: 'OK'
			});
		});

	},

	deleteComment: function (req, res) {
		if(!req.param('cid')) {
			return res.badRequest();
		}

		var action = req.param('action');

		if (action === 'remove' || action === 'recover') {
			async.waterfall([
				function getComment(callback) {
					Comments.findOne({id: req.param('cid')})
						.exec(function(err, comment) {
							if (err) {
								res.serverError();
								return callback(err);
							}

							callback(null, comment);
					});
				},
				function checkUGroup(comment, canModerate, callback) {
					if (req.user.group >= ugroup.mod || comment.owner === req.user.id) {
						callback(null, comment, 'pass');
					} else {
						callback(null, comment, req.user.canModerate);
					}
				},
				//Only for bugreports
				function checkRights(comment, canModerate, callback) {
					if (canModerate === 'pass') return callback(null, comment);
					if (!canModerate) return res.forbidden();

					Bugreport.findOne(comment.tid).exec(function (err, bugreport) {
						if (err) throw err;

						if (!bugreport) return res.forbidden();

						async.each(canModerate, function (element, callback) {
							if (element === bugreport.product)
								return callback(true);

							callback(null);
						}, function (canMod) {
							if (canMod) return callback(null, comment);

							res.forbidden();
						});
					});
				},
				function processRemoval(comment, callback) {
					if (action === 'remove') {
						if (comment.status === 3) {
							comment.destroy(function(err) {
								if (err) return callback(err);

								callback(null, comment.tid, comment);
							});
						} else {
							comment.status = 3;

							comment.save(function(err) {
								if (err) return callback(err);

								callback(null, comment);
							});
						}
					} else if (action === 'recover') {
						comment.status = 1;

						comment.save(function(err) {
							if (err) return callback(err);

							callback(null, comment);
						});
					}
				},
				// I'm updating ticket for updating updatedOn record.
				function updateTicket(comment, callback) {
					Ticket.findOne(comment.tid)
						.exec(function (err, ticket) {
							if (err) return callback(err);

							ticket.save(function(err) {
								if (err) return callback(err);

								callback(null, comment);
							});
						});
				},
				function sendNotifs(comment, callback) {
					if (comment.owner !== req.user.id && action === 'remove') {
						Notif.add(3, comment.owner, {
							ticket: comment.tid
						}, function (err) {
							if (err) return callback(err);

							callback(null);
						});

					} else {
						callback(null);
					}
				}
			], function (err) {
				if (err) throw err;

				res.json({
					status: 'OK'
				});
			});
		} else {
			res.forbidden();
		}
	}
	
};

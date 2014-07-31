/**
* CommentController
*
* @module :: Controller
* @description :: Управление комментариями
*/

module.exports = {
	
	listViewComments: function(req, res) {
		if (!req.param('tid')) {
			return res.json(400, {
				msg: 'Некорректный запрос'
			});
		}
		
		var tid = parseInt(req.param('tid'), 10);

		Comments.find({
			tid: tid
		}).done(function(err, comments) {
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
	
	deleteComment: function(req, res) {
		if(!req.param('cid')) {
			return res.json(400, {
				msg: 'Некорректный запрос'
			});
		}
		
		var action = req.param('action');
		
		if (action === 'remove' || action === 'recover' && req.param('cid') !== 0) {
			async.waterfall([
				function processRemoval(callback) {
					Comments.findOne({id: req.param('cid')})
						.done(function(err, comment) {
							if (err) {
								res.json({
									status: 'err'
								});
								return callback(err);
							}

							if (action === 'remove') {
								if (comment.status === 3) {
									comment.destroy(function(err) {
										if (err) return callback(err);

										callback(null, comment.tid);
									});
								} else {
									comment.status = 3;

									comment.save(function(err) {
										if (err) return callback(err);

										callback(null, comment.tid);
									});
								}
							} else if (action === 'recover') {
								comment.status = 1;

								comment.save(function(err) {
									if (err) return callback(err);

									callback(null, comment.tid);
								});
							}
						});
				},
				// I'm updating ticket for updating updatedOn record.
				function updateTicket(tid, callback) {
					Ticket.findOne(tid)
						.done(function (err, ticket) {
							if (err) return callback(err);

							ticket.save(function(err) {
								if (err) return callback(err);

								callback(null);
							});
						});
				}
			], function (err) {
				if (err) throw err;

				res.json({
					status: 'OK'
				});
			});
		} else {
			res.status(403).view('403', {layout: false});
		}
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
					.done(function(err, ticket) {
						callback(err, ticket);
					});
			},
			function getBugreport(ticket, callback) {
				if (ticket.type == 1) {
					Bugreport.findOne(ticket.tid)
						.done(function (err, bugreport) {
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
				}).done(function (err, comments) {
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
					}).done(function (err, rights) {
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
					.done(function (err, comment) {
						if (err) return callback(err);

						callback(null, newComment);
					});
			},
			function changeStatus(newComment, callback) {
				Ticket.findOne(tid)
					.done(function (err, ticket) {
						if (err) return callback(err);

						if (newComment.changedTo) {
							ticket.status = newComment.changedTo;
						}

						ticket.save(function (err) {
							if (err) return callback(err);

							callback(null, newComment);
						});
					});
			},
			function serialize(newComment, callback) {
				gcdb.user.getByID(newComment.owner, function(err, login) {
					if (err) return callback(err);
					
					newComment.owner = login;
					newComment.code = 'OK';
					callback(null, newComment);
				})
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
	}
	
};

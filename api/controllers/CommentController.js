/**
* CommentController
*
* @module :: Controller
* @description :: Управление комментариями
*/

module.exports = {
	
	listViewComments: function(req, res) {
		if (!req.param('id')) {
			return res.json(400, {
				msg: 'Некорректный запрос'
			});
		}
		
		Ticket.findOne(req.param('id'))
			.done(function(err, ticket) {
				if (err) throw err;
				
				if (req.user) {
					gct.comment.serializeComments(ticket.comments, req.user.group, req.user.id, ticket, function(err, result) {
						if (err) throw err;

						res.json(result);
					});
				} else {
					gct.comment.serializeComments(ticket.comments, 0, 0, ticket, function(err, result) {
						if (err) throw err;

						res.json(result);
					});
				}
			});
	},
	
	deleteComment: function(req, res) {
		if(!req.param('id') || !req.param('cid')) {
			return res.json(400, {
				msg: 'Некорректный запрос'
			});
		}
		
		var action = req.param('action');
		
		if (action === 'remove' || action === 'recover' || req.param('id') !== 0 && req.param('cid') !== 0) {
			Ticket.findOne(req.param('id'))
				.done(function(err, ticket) {
					if (err) {
						res.json({status: 'err'});
						throw err;
					}
					
					if (action === 'remove') {
						gct.comment.removeComment(ticket.comments, req.param('cid'), req.user.id, false, function(err, comments) {
							if (err) {
								if (err.msg) {
									return res.json({
										msg: err.msg
									});
								} else {
									res.json({status: 'err'});
									throw err;
								}
							}
							
							ticket.comments = comments;

							ticket.save(function(err) {
								if (err) throw err;

								res.json({status: 'OK'});
							});
						});
					} else if (action === 'recover') {
						gct.comment.removeComment(ticket.comments, req.param('cid'), req.user.id, true, function(err, comments) {
							if (err) {
								if (err.msg) {
									return res.json({
										msg: err.msg
									});
								} else {
									res.json({status: 'err'});
									throw err;
								}
							}

							ticket.comments = comments;

							ticket.save(function(err) {
								if (err) throw err;

								res.json({status: 'OK'});
							});
						});
					}
				});
		} else {
			res.status(403).view('403', {layout: false});
		}
	},
	
	newComment: function(req,res) {
		async.waterfall([
			function preCheck(callback) {
				if (!req.param('id')) {
					return callback({
						show: true,
						msg: 'Некорректный запрос'
					});
				}
				
				if (!req.param('message') || req.param('message') === '') {
					callback({
						show: true,
						msg: 'Комментарий слишком короткий'
					});
				} else {
					callback(null);
				}
			},
			function checkOldComments(callback) {
				Ticket.findOne(req.param('id'))
					.done(function (err, ticket) {
						if (err) return callback(err);

						if (ticket.comments && ticket.comments.length > 0) {
							callback(null, ticket.comments.length + 1, ticket);
						} else {
							callback(null, 1, ticket.tid); // set comment id to 1 because there is no other comments
						}
					});
			},
			function setData(commentId, origTicket, callback) {
				var TicketModel = gct.getModelTypeByID(obj.type);
				[TicketModel].findOne(origTicket.tid)
					.done(function(err, ticket) {

						ticket.status = origTicket.status;
						ticket.type = origTicket.type;

						callback(null, {
							id: commentId,
							owner: req.user.id,
							message: req.sanitize('message').entityEncode(),
							status: 1,
							changedTo: parseInt(req.body.status, 10),
							createdAt: Date()
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
			function getRights(newComment, pass, bugreport, callback) {
				if (pass) return callback(null, newComment, true, null, ticket);
				
				if (req.user) {
					Rights.find({
						uid: req.user.id
					}).done(function (err, rights) {
						if (err) return callback(err);

						if (rights) callback(null, newComment, false, rights[0].canModerate, ticket);
							else callback(null, newComment, false, [], ticket);
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

					callback(null);
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
				
				gct.processStatus(ticket.type, canModerate, ticket, function(result) {
					if (!result){
						delete newComment.changedTo;
					}

					callback(null, newComment);
				});
			},
			function createComment(newComment, callback) {
				Ticket.findOne(req.param('id')).done(function (err, ticket) {
					if (err) return callback(err);
					
					ticket.comments[newComment.id - 1] = newComment;
					ticket.status = newComment.changedTo;
					ticket.save(function(err) {
						if (err) return callback(err);

						callback(null, newComment);
					});
				})
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

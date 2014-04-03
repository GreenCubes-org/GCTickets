/**
* CommentController
*
* @module :: Controller
* @description :: Управление комментариями
*/

module.exports = {
	
	listSingleComments: function(req, res) {
		if (!req.param('id')) return res.json(404,{error: 404});
		
		Ticket.findOne(req.param('id'))
			.done(function(err, ticket) {
				if (err) throw err;
				
				if (req.user) {
					gct.comment.serializeComments(ticket.comments, req.user.group, req.user.id, ticket, function(err, result) {
						if (err) throw err;

						res.json(JSON.stringify(result));
					});
				} else {
					gct.comment.serializeComments(ticket.comments, 0, 0, ticket, function(err, result) {
						if (err) throw err;

						res.json(JSON.stringify(result));
					});
				}
			});
	},
	
	deleteComment: function(req, res) {
		var action = req.param('action');
		
		if (action === 'remove' || action === 'recover' || req.param('id') != 0 && req.param('cid') != 0) {
			if (!req.param('id')) return res.json(404, {error: 404});
			
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
									res.json({msg: err.msg});
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
									res.json({msg: err.msg});
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
	
	bugreportComment: function(req,res) {
		async.waterfall([
			function preCheck(callback) {
				if (req.param('message') === '') {
					callback({
						show: true,
						msg: 'Комментарий слишком короткий'
					});
				} else {
					callback(null);
				}
			},
			function checkOldComments(callback) {
				Ticket.findOne(req.param('id')).done(function (err, ticket) {
					if (err) return callback(err);

					if (ticket.comments && ticket.comments.length > 0) {
						callback(null, ticket.comments.length + 1, ticket.tid);
					} else {
						callback(null, 1, ticket.tid); // set comment id to 1 because there is no other comments
					}
				})
			},
			function setData(commentId, bugreportId, callback) {
				Bugreport.findOne(bugreportId)
					.done(function(err, bugreport) {
						callback(null, {
							id: commentId,
							owner: req.user.id,
							message: req.sanitize('message').entityEncode(),
							status: 1,
							changedTo: parseInt(req.body.status, 10),
							createdAt: Date()
						}, bugreport);
					});
			},
			// Adding var for checking local moderators
			function canModerate(newComment, bugreport, callback) {
				if (req.user.group >= ugroup.mod) {
					callback(null, newComment, true, bugreport);
				} else {
					callback(null, newComment, false, bugreport);
				}
			},
			function getRights(newComment, pass, bugreport, callback) {
				if (pass) return callback(null, newComment, true, null, bugreport);
				
				if (req.user) {
					Rights.find({
						uid: req.user.id
					}).done(function (err, rights) {
						if (err) return callback(err);

						if (rights.length !== 0) callback(null, newComment, false, rights[0].canModerate, bugreport);
							else callback(null, newComment, false, [], bugreport);
					});
				} else {
					callback(null, newComment, null, []);
				}
			},
			function checkRights(newComment, pass, canModerate, bugreport, callback) {
				if (pass) return callback(null, newComment, true, bugreport);
				
				async.each(canModerate, function (element, callback) {
					if (element === bugreport.product) { 
						return callback(true);
					}

					callback(null);
				}, function (canMod) {
					if (canMod) return callback(null, newComment, true, bugreport);

					callback(null, newComment, false, bugreport);
				});
			},
			function processStatus(newComment, canModerate, bugreport, callback) {
				if (!canModerate || isNaN(newComment.changedTo) || newComment.changedTo === (bugreport.status || '')) {
					delete newComment.status;
					return callback(null, newComment);
				}
				
				// If status "Новый"
				var isStatus = new RegExp('^(11|3|4|2)');
				if (bugreport.status === 1 && isStatus.test(newComment.changedTo)) {
					return callback(null, newComment);
				}
				
				// If status "Уточнить"
				isStatus = new RegExp('^(11|4)');
				if (bugreport.status === 3 && isStatus.test(newComment.changedTo)) {
					return callback(null, newComment);
				}
				
				// If status "Принят"
				isStatus = new RegExp('^(12|4)');
				if (bugreport.status === 3 && isStatus.test(newComment.changedTo)) {
					return callback(null, newComment);
				}
				
				delete newComment.status;
				callback(null, newComment);
			},
			function createComment(newComment, callback) {
				Ticket.findOne(req.param('id')).done(function (err, ticket) {
					if (err) return callback(err);
					
					ticket.comments[newComment.id - 1] = newComment;
					ticket.save(function(err) {
						if (err) return callback(err);

						callback(null, newComment, ticket.id);
					});
				})
			},
			function changeStatus(newComment, bugreportId, callback) {
				if (!newComment.changedTo) return callback(null, newComment);
				
				Bugreport.findOne(bugreportId)
					.done(function(err, bugreport) {
						bugreport.status = newComment.changedTo;
						bugreport.save(function(err) {
							if (err) return callback(err);
							
							// Adding propety for reloading page, because we changed status
							newComment.reload = true;
							
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
					if (err) throw err;
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
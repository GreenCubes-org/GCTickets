/**
 * CommentsController
 *
 * @module :: Controller
 * @description :: Контроллер комментариев.
 */

module.exports = {
	new: function (req, res) {
		if (!req.param('tid')) {
			return callback({
				show: true,
				msg: sails.__('controller.comment.incorrentrequest')
			});
		}

		var tid = parseInt(req.param('tid'), 10)

		async.waterfall([
			function getTicket(callback) {
				Tickets.findOne(tid)
					.exec(function(err, ticket) {
						callback(err, ticket);
					});
			},
			function preCheck(ticket, callback) {
				if (req.user.group < ugroup.helper && [2,4,5,6,7,10,12].indexOf(ticket.status) !== -1) {
					return callback({
						show: true,
						msg: sails.__('controller.comment.newComment.cantcommentclosed')
					});
				}

				callback(null, ticket);
			},
			function getBugreport(ticket, callback) {
				if (ticket.type == 1) {
					Bugreports.findOne(ticket.tid)
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
							msg: sails.__('controller.comment.newComment.commenttoosmall')
						});
					}

					callback(null,  {
						author: req.user.id,
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
					Users.find({
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

				gct.comment.processStatus(req, res, ticket.type, canModerate, ticket, newComment.changedTo, function(result) {
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
				Tickets.findOne(tid)
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
				gcdb.user.getByID(newComment.author, function(err, login) {
					if (err) return callback(err);

					newComment.authorId = newComment.author;
					newComment.author = login;
					newComment.code = 'OK';

					callback(null, newComment, ticket);
				})
			},
			/*function sendNotifsAboutNewCommentInTicket(newComment, ticket, callback) {
				if (newComment.authorId !== ticket.author) {
					if (newComment.changedTo) {
						Notif.add(2, ticket.author, {
							ticket: tid,
							user: newComment.authorId,
							cid: newComment.id,
							changedTo: newComment.changedTo
						}, function (err) {
							if (err) return callback(err);

							callback(null, newComment, ticket);
						});
					} else {
						Notif.add(1, ticket.author, {
							ticket: tid,
							user: newComment.authorId,
							cid: newComment.id
						}, function (err) {
							if (err) return callback(err);

							callback(null, newComment, ticket);
						});
					}
				} else {
					callback(null, newComment, ticket);
				}
			},
			function sendNotifsAboutMention(newComment, ticket, callback) {
				var wasMentioned = newComment.message.match(/(?:\B\@)(([a-zA-Z\-\_])(\w+)?)/g);

				wasMentioned = (function(arr){
					var m = {}, newarr = []
					if (arr) {
						for (var i=0; i<arr.length; i++) {
							var v = arr[i].replace('@', '');
							if (!m[v]) {
								newarr.push(v);
								m[v]=true;
							}
						}
					}
					return newarr;
				})(wasMentioned);

				async.each(wasMentioned, function (element, callback) {
					gcdb.user.getByLogin(element, function (err, uid) {
						if (err) return callback(err);

						User.findOne({uid: uid}).exec(function (err, user) {
							if (err) return callback(err);

							if (uid !== req.user.id && ((ticket.visiblity === 2 && user.ugroup >= ugroup.mod) || ticket.visiblity === 1)) {
								Notif.add(4, uid, {
									ticket: tid,
									user: newComment.authorId,
									cid: newComment.id
								}, function (err) {
									if (err) return callback(err);

									callback(null);
								});
							} else {
								callback(null);
							}
						});
					});
				}, function (err) {
					if (err) return callback(err);

					callback(null, newComment);
				});
			}*/
		],
		function (err, comment) {
			if (err) {
				if (!err.show) {
					return res.serverError(err);
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

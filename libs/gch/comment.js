/* GCH – Helper library • Bugreports-related functions */
var gch = require('./index.js');

module.exports = {
	serializeComments: function serializeComments(comments, userGroup, userId, cb) {
		if (comments === null || comments.length === 0) return cb(null, null);

		async.waterfall([
			function getBugreportProduct(callback) {
				Tickets.findOne(comments[0].tid)
					.exec(function (err, ticket) {
						if (err) return callback(err);

						if (ticket.type == 1) {
							Bugreports.findOne(ticket.tid)
								.exec(function (err, bugreport) {
									if (err) return callback(err);

									callback(null, bugreport.product);
								});
						} else {
							callback(null, null);
						}
					});
			},
			function processMap(bugreportProduct, callback) {
				async.map(comments, function (comment, callback) {
					comment.rights = {};
					
					// Serialize time
					comment.createdAt = gch.serializeTime(comment.createdAt);
					
					gcdb.user.getByID(comment.author, 'sitedb', function (err, login) {
						if (err) return callback(err);

						async.waterfall([
							function getStatus(callback) {
								comment.changedTo = gch.getStatus(comment.changedTo);

								callback(null, comment);
							},
							function setOwnerPrefixAndLogin(comment, callback) {
								gch.user.getPrefix(comment.author, function (err, prefix) {
									if (err) return callback(err);
									
									comment.author = {
										id: comment.author,
										username: login,
										prefix: prefix
									};

									callback(null, comment);
								});
							},
							function getRights(comment, callback) {
								if (userId) {
									Users.find({
										uid: userId
									}).exec(function (err, rights) {
										if (err) return callback(err);

										if (rights.length && bugreportProduct) {
											callback(null, comment, (rights[0].canModerate.indexOf(bugreportProduct) !== -1) ? true : false, userId);
										} else if (rights.length && !bugreportProduct && comment.author === userId) {
											callback(null, comment, true, userId);
										} else {
											callback(null, comment, false, userId);
										}
									});
								} else {
									callback(null, comment, false, 0);
								}
							},
							function checkUGroup(comment, canModerate, commentCreator, callback) {
								if ((canModerate || comment.author.id === commentCreator || userGroup >= ugroup.moderator ) && !comment.changedTo) {
									comment.rights.canRemove = true;
								}

								callback(null, comment);
							},
							function canEdit(comment, callback) {
								if (comment.author.id === userId) {
									comment.rights.canEdit = true;
								} else {
									comment.rights.canEdit = false;
								}

								callback(null, comment);
							},
							function cbComments(comment, callback) {
								if (userGroup >= ugroup.moderator) {
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
				}, function (err, comments) {
					if (err) return cb(err);

					// Remove undefined elements
					comments = comments.filter(function (n) {
						return n
					});

					if (comments.length === 0) {
						cb(null, null);
					} else {
						cb(null, comments);
					}
				});
			}
		]);
	}
};
var gct = require('./index'),
	bbcode = require('../bbcode');

module.exports = comment = {
	serializeComments: function serializeComments(comments, userGroup, userId, cb) {
		if (comments === null || comments.length === 0) return cb(null, null);

		async.waterfall([
			function getBugreportProduct(callback) {
				Ticket.findOne(comments[0].tid)
					.done(function (err, ticket) {
						if (err) return callback(err);

						if (ticket.type == 1) {
							Bugreport.findOne(ticket.tid)
								.done(function (err, bugreport) {
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
								if (userId && bugreportProduct) {
									User.find({
										uid: userId
									}).done(function (err, rights) {
										if (err) return callback(err);

										if (rights.length) {
											callback(null, comment, (rights[0].canModerate.indexOf(bugreportProduct) !== -1) ? true : false, userId);
										} else {
											callback(null, comment, false, userId);
										}
									});
								} else {
									callback(null, comment, false, 0);
								}
							},
							function checkUGroup(comment, canModerate, commentCreator, callback) {
								if (canModerate || comment.owner === commentCreator || userGroup >= ugroup.mod) {
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
							function bbcode2html(obj, callback) {
								bbcode.parse(obj.message, function (result) {
									obj.message = result;

									callback(null, obj);
								});
							},
							function cbComments(comment, callback) {
								if (userGroup >= ugroup.mod) {
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

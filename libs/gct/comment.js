var gct = require('./index');

module.exports = comment = {
	serializeComments: function serializeComments(comments, userGroup, userId, cb) {
		if (comments === null || comments.length === 0) return cb(null, null);

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
							if (userId) {
								Rights.find({
									uid: userId
								}).done(function (err, rights) {
									if (err) return callback(err);

									if (rights.length && rights[0].ugroup >= ugroup.mod) callback(null, comment, rights[0].ugroup, userId);
										else callback(null, comment, 0, userId);
								});
							} else {
								callback(null, comment, 0, 0);
							}
						},
						function checkUGroup(comment, userGroup, commentCreator, callback) {
							if (userGroup >= ugroup.mod || comment.owner === commentCreator) {
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
						}],
						function (err, comment) {
							if (err) return callback(err);

							callback(null, comment);
						}
					);
				});
			},
			function (err, comments) {
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
	},

	removeComment: function removeComment(comments, removeId, userId, isRecover, cb) {
		async.waterfall([
			function (callback) {
					async.map(comments, function (comment, callback) {
						if (comment.id === parseInt(removeId)) {
							Rights.find({
								uid: userId
							}).done(function (err, rights) {
								if (err) return cb(err);

								if (comment.status === 3 && !isRecover) {
									comment = undefined;
									return callback(null, comment);
								}

								if (userId === comment.owner || rights && rights.length !== 0 && rights[0].ugroup >= ugroup.mod) {
									if (isRecover) {
										comment.status = 1; // Status normal
									} else {
										comment.status = 3; // Status removed
									}
									callback(null, comment);
								} else {
									callback({
										msg: 'У вас нет прав на удаление этого комментария'
									});
								}
							});
						} else {
							callback(null, comment);
						}
					}, function (err, comments) {
						if (err) {
							if (err.msg) {
								return callback(null, err.msg);
							}
							return callback(err);
						}

						// Remove undefined elements
						comments = comments.filter(function (n) {
							return n
						});

						callback(null, comments);
					});
			}],
			function (err, result) {
				if (err) return cb(err);

				cb(null, result);
			});
	}

};

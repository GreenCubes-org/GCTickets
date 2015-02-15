/* GCH – Helper library • Bugreports-related functions */
var gch = require('./index.js');

module.exports = {
	serializeComments: function serializeComments(comments, userGroup, userId, cb) {
		if (comments === null || comments.length === 0) return cb(null, []);

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
	},

	processStatus: function processStatus(req, res, type, canModerate, ticket, changedTo, cb) {
		var isStatus;
		switch (type) {
			case 1:
				// If status "Новый"
				if (ticket.status === 1 && (
					(canModerate && [11,4,3].indexOf(changedTo) != -1) ||
					(req.user.id === ticket.owner && changedTo === 2) ||
					(req.user.group >= ugroup.helper && changedTo === 3))) {
					return cb(true);
				}

				// If status "Уточнить"
				if (ticket.status === 3 && canModerate && [11,4].indexOf(changedTo) != -1) {
					return cb(true);
				}

				// If status "Отклонён"
				if (ticket.status === 4 && canModerate && [11, 3].indexOf(changedTo) != -1) {
					return cb(true);
				}

				// If status "Принят"
				if (ticket.status === 11 && canModerate && [12,4].indexOf(changedTo) != -1) {
					return cb(true);
				}

				return cb(false);

			case 2:
				// If status "Новый"
				if (ticket.status === 1 && (
					(req.user.id === ticket.owner && changedTo === 2) || // Only owner can change to status 2 (Отклонён)
					(canModerate && [8,4,3].indexOf(changedTo) != -1) ||
					(req.user.group >= ugroup.helper && changedTo === 3))) {
					return cb(true);
				}

				// If status "Уточнить"
				if (ticket.status === 3 && canModerate && [10,4].indexOf(changedTo) != -1) {
					return cb(true);
				}

				// If status "Отклонён"
				if (ticket.status === 4 && canModerate && [8, 3].indexOf(changedTo) != -1) {
					return cb(true);
				}

				// If status "На рассмотрении"
				if (ticket.status === 8 && canModerate && [10,9,4,3].indexOf(changedTo) != -1) {
					return cb(true);
				}

				// If status "Отложен"
				if (ticket.status === 9 && canModerate && [10,4,3].indexOf(changedTo) != -1) {
					return cb(true);
				}

				return cb(false);

			case 3:
				// If status "Новый"
				if (ticket.status === 1 && (
					(req.user.id === ticket.owner && changedTo === 2) || // Only owner can change to status 2 (Отклонён)
					(canModerate && [10,4,3].indexOf(changedTo) != -1) ||
					(req.user.group >= ugroup.helper && changedTo === 3))) {
					return cb(true);
				}

				// If status "Уточнить"
				if (ticket.status === 3 && canModerate && [10,4].indexOf(changedTo) != -1) {
					return cb(true);
				}


				// If status "Отклонён"
				if (ticket.status === 4 && canModerate && [10, 3].indexOf(changedTo) != -1) {
					return cb(true);
				}

				return cb(false);

			case 4:
				// If status "Новый"
				if (ticket.status === 1 && (
					(req.user.id === ticket.owner && changedTo === 2) || // Only owner can change to status 2 (Отклонён)
					(canModerate && [10,4,3].indexOf(changedTo) != -1) ||
					(req.user.group >= ugroup.helper && changedTo === 3))) {
					return cb(true);
				}

				// If status "Уточнить"
				if (ticket.status === 3 && canModerate && [10,4].indexOf(changedTo) != -1) {
					return cb(true);
				}

				// If status "Отклонён"
				if (ticket.status === 4 && canModerate && [10, 3].indexOf(changedTo) != -1) {
					return cb(true);
				}

				return cb(false);

			case 5:
				return cb(false);

			case 6:
				return cb(false);

			case 7:
				return cb(false);

			default:
				return cb(false);
		}
	}
};

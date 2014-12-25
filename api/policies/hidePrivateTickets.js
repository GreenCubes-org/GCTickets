/**
 * Hide private tickets
 */
module.exports = function (req, res, ok) {
	async.waterfall([
		function check4CIds(callback) {
			if (req.params.cid) {
				Comments.findOne(req.params.cid)
					.exec(function (err, comment) {
						if (err) return callback(err);

						callback(null, comment.tid);
					});
			} else {
				if (isNaN(req.param('tid'))) {
					return res.badRequest();
				}

				callback(null, req.param('tid'));
			}
		},
		function magicLogic(tid, callback) {
			Ticket.findOne(tid).exec(function (err, ticket) {
				if (err) return callback(err);

				if (!ticket) {
					return res.notFound();
				}

				if (req.user && req.user.group >= ugroup.helper || req.user && req.user.id === ticket.owner) {
					ok();
				} else {
					if (ticket.visiblity === 2 || ticket.status === 5 || ticket.status === 6) {
						async.waterfall([
							function getRights(callback) {
								if (req.user) {
									callback(null, req.user.ugroup, req.user.id, req.user.canModerate);
								} else {
									if (req.wantsJSON) {
										res.json(403, {error: 403});
									} else {
										res.redirect('/login?errcode=1&redirectto=' + req.path);
									}
								}
							},
							function checkUGroup(userGroup, ticketCreator, canModerate, callback) {
								Ticket.findOne(tid).exec(function (err, ticket) {
									if (err) return callback(err);

									if (userGroup >= ugroup.mod || ticket.owner === ticketCreator) {
										ok();
									} else {
										callback(null, canModerate, ticket.tid);
									}
								});
							},
							//Only for bugreports
							function checkRights(canModerate, tid, callback) {
								if (!canModerate) return res.forbidden();

								Bugreport.findOne(tid).exec(function (err, bugreport) {
									if (err) return callback(err);

									async.each(canModerate, function (element, callback) {
										if (element === bugreport.product)
											return callback(true);

										callback(null);
									}, function (canMod) {
										if (canMod) return ok();

										return res.forbidden();
									});
								});
							}
						]);
					} else {
						ok();
					}
				}
			});
		}
	], function (err) {
		if (err) return res.serverError(err);
	});

};

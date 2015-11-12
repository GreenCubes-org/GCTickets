/**
 * Is ticket owner user or not?
 */
module.exports = function (req, res, ok) {
	async.waterfall([
		function getRights(callback) {
			if (req.user) {
				callback(null, req.user.group, req.user.id, req.user.canModerate);
			} else {
				callback(null, 0, 0, null);
			}
		},
		function checkUGroup(userGroup, ticketCreator, canModerate, callback) {
			Tickets.findOne(req.param('tid')).exec(function (err, ticket) {
				if (err) return res.serverError(err);

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

			Bugreports.findOne(tid).exec(function (err, bugreport) {
				if (err) return res.serverError(err);

				async.each(canModerate, function (element, callback) {
					if (element === bugreport.product)
						return callback(true);

					callback(null);
				}, function (canMod) {
					if (canMod) return ok();

					res.forbidden();
				});
			});
		}
	]);

};

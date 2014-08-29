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
			Ticket.findOne(req.param('tid')).done(function (err, ticket) {
				if (err) throw err;

				if (userGroup >= ugroup.mod || ticket.owner === ticketCreator) {
					ok();
				} else {
					callback(null, canModerate, ticket.tid);
				}
			});
		},
		//Only for bugreports
		function checkRights(canModerate, tid, callback) {
			if (!canModerate) return res.status(403).view('403', {layout: false});
			
			Bugreport.findOne(tid).done(function (err, bugreport) {
				if (err) throw err;
				
				async.each(canModerate, function (element, callback) {
					if (element === bugreport.product) 
						return callback(true);

					callback(null);
				}, function (canMod) {
					if (canMod) return ok();

					res.status(403).view('403', {layout: false});
				});
			});
		}
	]);

};

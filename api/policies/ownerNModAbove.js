/**
 * Is ticket owner user or not?
 */
module.exports = function (req, res, ok) {
	async.waterfall([
		function getRights(callback) {
			if (req.user) {
				Rights.find({
					uid: req.user.id
				}).done(function (err, rights) {
					if (err) throw err;

					if (rights.length !== 0) callback(null, rights[0].ugroup);
						else callback(null, 0, req.user.id);
				});
			} else {
				callback(null, 0, 0);
			}
		},
		function checkRights(ugroup, ticketCreator, callback) {
			Ticket.findOne(req.param('id')).done(function (err, ticket) {
				if (err) throw err;

				if (ugroup >=2 || ticket.owner === ticketCreator) {
					ok();
				} else {
					res.status(403).view('403', {layout: false});
				}
			});
		}
	]);

};

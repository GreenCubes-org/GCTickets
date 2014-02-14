/**
 * Is ticket owner user or not?
 */
module.exports = function (req, res, ok) {
	async.waterfall([
		function getRights(callback) {
			Rights.find({
				uid: req.user.id
			}).done(function (err, rights) {
				if (err) throw err;

				if (rights.length !== 0) callback(null, rights[0].ugroup);
					else callback(null, 0);
			});
		},
		function checkRights(ugroup, callback) {
			Ticket.findOne(req.param('id')).done(function (err, ticket) {
				if (err) throw err;

				if (ugroup >=3 || ticket.owner === req.user.id) {
					ok();
				} else {
					res.status(403).view('403', {layout: false});
				}
			});
		}
	]);

};

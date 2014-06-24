/**
 * Hide private tickets
 */
module.exports = function (req, res, ok) {
	
	Ticket.findOne(req.param('id')).done(function (err, ticket) {
		if (err) throw err;

		if (!ticket) {
			res.status(404).view('404', {layout: false});
		}
		
		if (req.user && req.user.group >= ugroup.helper || req.user && req.user.id === ticket.owner) {
			ok();
		} else {
			if (ticket.visiblity === 2 || ticket.status === 5 || ticket.status === 6) {
				res.status(403).view('403', {layout: false});
			} else {
				ok();
			}
		}
	});
	
};

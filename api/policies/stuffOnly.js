/**
 * Is stuff user or not?
 */
module.exports = function (req, res, ok) {
	
	if (req.user) {
		Rights.find({
			uid: req.user.id
		}).done(function (err, rights) {
			if (err) throw err;

			if (rights.length !== 0 && rights[0].ugroup === 3) {
				ok();
			} else {
				res.status(403).view('403', {layout: false});
			}
		});
	} else {
		res.status(403).view('403', {layout: false});
	}
};

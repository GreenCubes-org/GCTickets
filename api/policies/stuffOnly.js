/**
 * Is stuff user or not?
 */
module.exports = function (req, res, ok) {
	
	Rights.find({
		uid: req.user.id
	}).done(function (err, rights) {
		if (err) throw err;
		
		if (rights[0].ugroup === 3) {
			ok();
		} else {
			res.status(403).view('403', {layout: false});
		}
	});
};

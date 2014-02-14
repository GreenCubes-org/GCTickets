/**
 * Is MOD user or not?
 */
module.exports = function (req, res, ok) {

	Rights.find({
		uid: req.user.id
	}).done(function (err, rights) {
		if (err) throw err;

		if (rights.length !== 0 && rights[0].ugroup >= 2) {
			ok();
		} else {
			res.status(403).view('403', {layout: false});
		}
	});
};

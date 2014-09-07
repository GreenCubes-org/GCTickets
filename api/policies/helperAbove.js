/**
 * Is HELPER user or not?
 */
module.exports = function (req, res, ok) {

	if (req.user) {
		User.find({
			uid: req.user.id
		}).exec(function (err, rights) {
			if (err) throw err;

			if (rights.length !== 0 && rights[0].ugroup >= ugroup.helper) {
				ok();
			} else {
				res.status(403).view('403', {layout: false});
			}
		});
	} else {
		res.status(403).view('403', {layout: false});
	}
};

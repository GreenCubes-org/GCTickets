/**
 * Is MOD user or not?
 */
module.exports = function (req, res, ok) {

	if (req.user) {
		User.find({
			uid: req.user.id
		}).exec(function (err, rights) {
			if (err) throw err;

			if (rights.length !== 0 && rights[0].ugroup >= ugroup.mod) {
				ok();
			} else {
				res.forbidden();
			}
		});
	} else {
		res.forbidden();
	}
};

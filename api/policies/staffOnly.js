/**
 * Is stuff user or not?
 */
module.exports = function (req, res, ok) {
	
	if (req.user) {
		User.find({
			uid: req.user.id
		}).exec(function (err, rights) {
			if (err) return res.serverError(err);

			if (rights.length !== 0 && rights[0].ugroup === ugroup.staff) {
				ok();
			} else {
				res.forbidden();
			}
		});
	} else {
		res.forbidden();
	}
};

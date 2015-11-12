/**
 * Is stuff user or not?
 */
module.exports = function (req, res, ok) {

	if (req.user.group >= ugroup.staff) {
		ok();
	} else {
		res.forbidden();
	}
};

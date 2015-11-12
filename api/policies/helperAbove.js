/**
 * Is HELPER user or not?
 */
module.exports = function (req, res, ok) {

	if (req.user.group >= ugroup.helper) {
		ok();
	} else {
		res.forbidden();
	}
};

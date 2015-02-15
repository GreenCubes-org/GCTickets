/**
 * Is MOD user or not?
 */
module.exports = function (req, res, ok) {

	if (req.user.group >= ugroup.moderator) {
		ok();
	} else {
		res.forbidden();
	}
};

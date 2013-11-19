/**
 * Allow any authenticated user.
 */
module.exports = function (req, res, ok) {

	// User is allowed, proceed to controller
	if (req.isAuthenticated()) {
		return ok();
	}
	else {
		return res.status(403).view('403');
	}
};

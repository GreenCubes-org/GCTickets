/**
 * Is anon user?
 */
module.exports = function (req, res, ok) {
	
	if (req.isAuthenticated()) {
		return res.status(403).view('403');
	}
	else {
		return ok();
	}
};

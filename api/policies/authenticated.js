/**
 * Allow any authenticated user.
 */
module.exports = function (req, res, ok) {

	// User is allowed, proceed to controller
	if (req.isAuthenticated()) {
		return ok();
	}
	else {
		return res.view('home/index',{message: 'Пожалуйста, войдите в систему'});
	}
};

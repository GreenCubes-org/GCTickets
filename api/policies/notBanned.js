/**
 * Is not banned?
 */
module.exports = function (req, res, ok) {
	
	Banlist.find({
		uid: req.user.id
	}).done(function (err, ban) {
		if (err) return new Error(err);
		
		if (ban) {
			return res.status(403).view('403-ban');
		} else {
			ok();
		}
	});
};

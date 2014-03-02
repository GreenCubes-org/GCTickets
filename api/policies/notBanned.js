/**
 * Is not banned?
 */
module.exports = function (req, res, ok) {
	
	if (req.user) {
		Banlist.find({
			uid: req.user.id
		}).done(function (err, ban) {
			if (err) throw err;

			if (ban.length !== 0) {
				return res.status(403).view('403-ban');
			} else {
				ok();
			}
		});
	} else {
		ok();
	}
};

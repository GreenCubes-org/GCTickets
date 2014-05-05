/**
 * Is not banned?
 */
module.exports = function (req, res, ok) {
	var ipHeader = req.headers['x-real-ip'] || '127.0.0.1',
		ip = (ipHeader !== '127.0.0.1') ? ipHeader.split(',')[0] : ipHeader;
	
	Banlist.find({
		ip: ip
	}).done(function (err, ban) {
		if (err) throw err;

		if (ban.length) {
			return res.status(403).view('403-ban', {
				layout: false
			});
		} else {
			if (req.user) {
				Banlist.find({
					uid: req.user.id
				}).done(function (err, ban) {
					if (err) throw err;

					if (ban.length) {
						return res.status(403).view('403-ban', {
							layout: false
						});
					} else {
						ok();
					}
				});
			} else {
				ok();
			}
		}
	});
};

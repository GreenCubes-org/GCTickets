/**
* GameinfoController
*
* @module :: Controller
* @description :: Панель игровой информации
*/
module.exports = {

	main: function (req, res) {
		res.view('gameinfo/dashboard');
	},

	playerInfo: function (req, res) {
		if (!req.param('nickname')) {
			res.view('gameinfo/player/info', {
				pinfo: null
			});
			return;
		}

		gct.user.getPInfo(req.param('nickname'), function (err, pinfo) {
			if (err) {
				res.serverError();
				sails.log.error(err);
				throw err;
			}

			res.view('gameinfo/player/info', {
				pinfo: pinfo
			});
		});
	}

};

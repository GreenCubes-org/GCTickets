/**
* ViewController
*
* @module :: Controller
* @description :: Тикеты.
*/


module.exports = {

	routeView: function(req, res) {
		Ticket.findOne(req.param('tid')).exec(function (err, result) {
			if (err) return res.serverError(err);

			if (result) {
				switch (result.type) {
					 case 1:
						return gct.bugreport.tplView(req, res, result);
					 case 2:
						return gct.rempro.tplView(req, res, result);
					 case 3:
						return gct.ban.tplView(req, res, result);
					 case 4:
						return gct.unban.tplView(req, res, result);
					 case 5:
						return gct.regen.tplView(req, res, result);
					 case 6:
						return gct.admreq.tplView(req, res, result);
					 default:
						return res.notFound();
				}
			} else {
				res.notFound();
			}
		})
	}

};

/**
* EditController
*
* @module :: Controller
* @description :: Редактирование тикетов.
*/

module.exports = {
	routeView: function(req, res) {
		Ticket.findOne(req.param('tid')).exec(function (err, result) {
			if (err) return res.serverError(err);

			if (result) {
				switch (result.type) {
					case 1:
						return gct.bugreport.postEdit(req, res, result);
					case 2:
						return gct.rempro.postEdit(req, res, result);
					case 3:
						return gct.ban.postEdit(req, res, result);
					case 4:
						return gct.unban.postEdit(req, res, result);
					case 5:
						return gct.regen.postEdit(req, res, result);
					case 6:
						return gct.admreq.postEdit(req, res, result);
					default:
						return res.status(404).view('404', {layout: false});
				}
			} else {
				res.status(404).view('404', {layout: false});
			}
		})
	},

	routeViewTpl: function(req, res) {
		Ticket.findOne(req.param('tid')).exec(function (err, result) {
			if (err) return res.serverError(err);

			if (result) {
				switch (result.type) {
					case 1:
						return gct.bugreport.tplEdit(req, res, result);
					case 2:
						return gct.rempro.tplEdit(req, res, result);
					case 3:
						return gct.ban.tplEdit(req, res, result);
					case 4:
						return gct.unban.tplEdit(req, res, result);
					case 5:
						return gct.regen.tplEdit(req, res, result);
					case 6:
						return gct.admreq.tplEdit(req, res, result);
					default:
						return res.status(404).view('404', {layout: false});
				}
			} else {
				res.status(404).view('404', {layout: false});
			}
		})
	},

	deleteTpl: function (req, res) {
		Ticket.findOne(req.param('tid')).exec(function (err, result) {
			if (err) return res.serverError(err);

			res.view('delete', {
				ticket: result
			});
		});
	},

	deletePost: function (req, res) {
		if (req.param('action') !== 'remove') {
			return res.json({
				status: 'err'
			});
		}

		Ticket.findOne({
			id: req.param('tid')
		}).exec(function (err, result) {
			if (err) {
				res.json({
					status: 'err'
				});
				return res.serverError(err);
			}

			result.status = 6;
			result.save(function (err) {
				if (err) {
					res.json({
						status: 'err'
					});
					return res.serverError(err);
				};

				res.json({
					status: 'OK'
				});
			});
		});
	},

	changeVisibility: function (req, res) {
		if (req.param('action') !== 'changevisibility') {
			return res.json({
				status: 'err'
			});
		}

		Ticket.findOne({
			id: req.param('tid')
		}).exec(function (err, result) {
			if (err) {
				res.json({
					status: 'err'
				});
				return res.serverError(err);
			}

			if ((result.type === 1 && req.user.group < ugroup.mod) || (result.type === 2 && req.user.group < ugroup.helper)) {
				return res.json({
					status: 'err'
				});
			}

			if (result.visiblity === 1) {
				result.visiblity = 2;
			} else {
				result.visiblity = 1;
			}

			result.save(function (err) {
				if (err) {
					res.json({
						status: 'err'
					});
					return res.serverError(err);
				};

				res.json({
					status: 'OK'
				});
			});
		});
	}

};

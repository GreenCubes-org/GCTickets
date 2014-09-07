/**
 * DevController
 *
 * @module :: Controller
 * @description :: Технический функционал.
 */

var gct = require('../../libs/gct');

module.exports = {
	notFound: function (req, res) {
		res.view('404', {
			layout: false
		});
	},

	serverError: function (req, res) {
		res.view('500', {
			layout: false,
			test: true
		});
	},

	hideFeature: function (req, res) {
		res.view('403-hf', {
			layout: false
		});
	},

	check: function (req, res) {
		res.status(204).send('42');
	},

	test: function (req, res) {
		Notif.add(2, req.user.id, { user: 2, ticket: 166, cid: 1, changedTo: 1 });
	}
};

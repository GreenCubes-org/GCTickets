/**
* DevController
*
* @module :: Controller
* @description :: Технический функционал.
*/

var execFile = require('child_process').execFile;

module.exports = {
	notFound: function(req, res) {
		res.view('404', {layout: false});
	},

	serverError: function(req, res) {
		res.view('500', {layout: false, test: true});
	},

	hideFeature: function(req, res) {
		res.view('403-hf', {layout: false});
	},

	check: function(req, res) {
		res.status(204).send('42');
	}
};

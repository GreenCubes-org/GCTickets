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
	},
	
	deploymentWebHook: function (req, res) {
		if (!req.body.payload) {
			return res.json(404, {
				message: 'Not Found',
				documentation_url: docs_url
			});
		}
		
		var payload = req.body.payload;
		
		if (payload.ref === 'ref/heads/master') {
			execFile(__dirname + '../../scripts/deploy.sh', function(err, stdout, stderr) {
				if (err) throw err;
            });
		}
	}

};

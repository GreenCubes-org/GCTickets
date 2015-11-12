/**
 * SearchController
 *
 * @module :: Controller
 * @description :: Поиск.
 */

var gct = require('../../libs/gct');

module.exports = {
	main: function (req, res) {
		res.view('search/main');
	},

	edit: function (req, res) {
		res.view('search/edit');
	}
};

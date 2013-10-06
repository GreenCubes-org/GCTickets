/**
* HomeController
*
* @module :: Controller
* @description :: Contains logic for handling requests.
*/

var HomeController = {

	index: function (req,res)
	{
		if (!req.user) {
			res.view({
				user: req.user
			})}
		else {
			res.redirect('/all')
		}
	},
	
	list: function (req,res)
	{
		res.view({
			user: req.user
		})
		
	}

};
module.exports = HomeController;

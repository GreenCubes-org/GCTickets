/**
* TicketController
*
* @module :: Controller
* @description :: Contains logic for handling requests.
*/

module.exports = {
	list: function (req,res)
	{
		res.view({user: req.user})
		
	},

	create: function (req,res)
	{
		res.view({user: req.user})
		
	}

};

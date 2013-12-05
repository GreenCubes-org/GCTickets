/**
* AdminController
*
* @module :: Controller
* @description :: Контроллер админфункций.
*/

module.exports = {
	main: function(req,res) {
		res.view('admin/main');
	},
	
	users: function(req,res) {
		res.view('admin/users')
	}
  
};

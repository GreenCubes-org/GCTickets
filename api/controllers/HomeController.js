/**
* HomeController
*
* @module :: Controller
* @description :: Главная страница
*/
module.exports = {
  
	route: function(req,res) {
		if (req.user) {
			res.redirect('/all');
		} else {
			res.view('home/preview');
		}
	},
	
	loginProblem: function (req, res) {
		res.view('home/loginproblem');
	}
  
};

/**
* HomeController
*
* @module :: Controller
* @description :: Главная страница
*/
module.exports = {
  
	route: function(req,res) {
		if (req.user) {
			res.redirect(req.user.mainPage);
		} else {
			res.view('home/preview', {
				layout: false
			});
		}
	}
  
};

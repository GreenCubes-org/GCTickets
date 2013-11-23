/**
* DevController
*
* @module :: Controller
* @description :: Технический функционал.
*/
module.exports = {
  notFound: function(req,res) {
		res.status(404).view('404',{layout: false})
  },

  serverError: function(req,res) {
		res.view('500',{layout: false,test: true})
  },

  hideFeature: function(req,res) {
		res.status(403).view('403-hf', {layout: false})
  },

  check: function(req,res) {
		res.status(204).send('42');
  }
  
};

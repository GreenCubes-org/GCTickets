/**
* TicketController
*
* @module :: Controller
* @description :: Contains logic for handling requests.
*/
//title description type status owner
module.exports = {
  list: function (req,res) {
    res.view({user: req.user})
  },

  create: function(req,res) {
    res.view({user: req.user})
  }

};

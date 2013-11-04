/**
* CreateController
*
* @module :: Controller
* @description :: Создание тикетов
*/
// all bugreport rempro ban unban regen admreq anon

module.exports = {
  main: function(req,res) {
    res.view('create/main');
  },

  all: function(req,res) {
    res.view('create/all');
  },

  bugreport: function(req,res) {
    res.view('create/bugreport');
  },
  bugreportCreate: function(req,res) {
    Bugreport.create({
      title: req.param('title'),
      description: req.param('description'),
      status: 1,
      owner: req.user.id,
      product: parseInt(req.param('product'),10),
      hidden: parseInt(req.param('hidden'),10),
      uploads: []
    }).done(function(err, bugreport) {
      if (err) return new Error(err);
      Bugreport.publishCreate({
        id: bugreport.id
        });
      
      Ticket.create({
        tid: bugreport.id,
        type: 1
      }).done(function(err, ticket) {
        if (err) return new Error(err);
        Ticket.publishCreate({id: ticket.id});
        res.json({
          id: ticket.id
        });
        req.flash('info', 'Тикет успешно создан!');
      });
    });
  },

  rempro: function(req,res) {
    res.view('create/rempro');
  },

  ban: function(req,res) {
    res.view('create/ban');
  },

  unban: function(req,res) {
    res.view('create/unban');
  },

  regen: function(req,res) {
    res.view('create/regen');
  },

  admreq: function(req,res) {
    res.view('create/admreq');
  },

  anon: function(req,res) {
    res.view('create/anon');
  }
};

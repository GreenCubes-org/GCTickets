/**
* ListController
*
* @module :: Controller
* @description :: Вывод тикетов.
*/
// all bugreport rempro ban unban regen admreq anon

var gct = require('../../utils/');

module.exports = {

  all: function viewAll(req,res) {
    textd = 'Все тикеты';
    res.view('list/list', {
      type: {
        url:'all',
        text: textd
      }
    })
  },

  my: function viewMy(req,res) {
    text = 'Ваши тикеты';
    res.view('list/list', {
      type: {
        url:'my',
        text: text
      }
    })
  },

  bugreport: function viewBugreport(req,res) {
    text = 'Багрепорты';
    res.view('list/list', {
      type: {
        url:'bugreport',
        text: text
      }
    })
  },

  bugreportList: function listBugreport(req,res) {
    Bugreport.find({id: {'<': 420000}})
      .sort('createdAt').limit(20).done(function(err, bugreports) {
          gct.bugreport.serializeList(bugreports, function(err, result) {
            res.json(JSON.stringify(result));
          });
        });
  },

  rempro: function viewRempro(req,res) {
    text = 'Расприваты';
    res.view('list/list', {
      type: {
        url:'rempro',
        text: text
      }
    })
  },

  ban: function viewBan(req,res) {
    text = 'Баны';
    res.view('list/list', {
      type: {
        url:'ban',
        text: text
      }
    })
  },

  unban: function viewUnbanx(req,res) {
    text = 'Разбаны';
    res.view('list/list', {
      type: {
        url:'unban',
        text: text
      }
    })
  },

  regen: function viewRegen(req,res) {
    text = 'Регены';
    res.view('list/list', {
      type: {
        url:'regen',
        text: text
      }
    })
  },

  admreq: function viewAdmreq(req,res) {
    text = 'Обращения к администрации';
    res.view('list/list', {
      type: {
        url:'admreq',
        text: text
      }
    })
  }
};

/**
* ListController
*
* @module :: Controller
* @description :: Вывод тикетов.
*/
// all bugreport rempro ban unban regen admreq anon

//FIXME: Поменять на глобальную переменную
var gct = require('../../utils/gct');

var moment = require('moment');
moment.lang('ru');

function singleBugreport(req, res, ticket) {
	Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
	 if (err) return new Error(err);
	 gct.bugreport.serializeSingle(bugreport, function(err, result) {
		 res.view('view/bugreport', {
			moment: moment,
			ticket: result,
			globalid: ticket.id
		 })
	 })
	})
}

function singleRempro(req, res, ticket) {
	
}

function singleBan(req, res, ticket) {
	
}

function singleUnban(req, res, ticket) {
	
}

function singleRegen(req, res, ticket) {
	
}

function singleAdmreq(req, res, ticket) {
	
}

module.exports = {

	routeSingles: function(req, res) {
	 Ticket.findOne(req.param('id')).done(function (err, result) {
			if (err) return new Error(err);

			switch (result.type) {
				 case 1:
					return singleBugreport(req, res, result);
				 case 2:
					return singleRempro(req, res, result);
				 case 3:
					return singleBan(req, res, result);
				 case 4:
					return singleUnban(req, res, result);
				 case 5:
					return singleRegen(req, res, result);
				 case 6:
					return singleAdmreq(req, res, result);
				 default:
					return res.status(404).view('404', {layout: false});
			}
			})
	},

	listAll: function(req, res) {
	 textd = 'Все тикеты';
	 res.view('list/list', {
		 type: {
			url:'all',
			text: textd
		 }
	 })
	},

	listMy: function(req, res) {
	 text = 'Ваши тикеты';
	 res.view('list/list', {
		 type: {
			url:'my',
			text: text
		 }
	 })
	},

	listBugreport: function listBugreport(req, res) {
	 text = 'Багрепорты';
	 res.view('list/list', {
		 type: {
			url:'bugreports',
			text: text
		 }
	 })
	},

	postListBugreport: function(req, res) {
	 Bugreport.find({id: {'<': 420000}})
		.sort('createdAt').limit(20).done(function(err, bugreports) {
			if (err) new Error(err);
			bugreports.reverse();
			gct.bugreport.serializeList(bugreports, function(err, result) {
				 res.json(JSON.stringify(result));
			});
		 });
	},

	listRempro: function(req, res) {
	 text = 'Расприваты';
	 res.view('list/list', {
		 type: {
			url:'rempros',
			text: text
		 }
	 })
	},

	listBan: function(req, res) {
		text = 'Баны';
		res.view('list/list', {
			type: {
				url:'bans',
				text: text
			}
		 })
	},

	listUnban: function(req, res) {
	text = 'Разбаны';
		res.view('list/list', {
			type: {
				url:'unbans',
				text: text
			}
		})
	},

	listRegen: function(req, res) {
	text = 'Регены';
	res.view('list/list', {
		type: {
			url:'regens',
			text: text
		}
	})
	},

	listAdmreq: function(req, res) {
		text = 'Обращения к администрации';
		res.view('list/list', {
			type: {
				url:'admreq',
				text: text
			}
		})
	}
};

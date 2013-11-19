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

	listAllTpl: function(req, res) {
	 text = 'Все тикеты';
	 res.view('list/list', {
		type: {
			url:'all',
			text: text,
			iconclass: 'reorder'
		}
	 })
	},
	
	postListNewestAll: function(req, res) {
		Ticket.find()
			.sort('id DESC')
			.limit(20)
			.done(function(err, tickets) {
				if (err) new Error(err);
				gct.all.serializeList(tickets, function(err, result) {
					res.json(JSON.stringify(result));
				});
			 });
	},
	
	postList20All: function(req, res) {
		async.waterfall([
			function getNumOfIDs(callback) {
				Ticket.find()
					.sort('id DESC')
					.limit(1)
					.done(function (err, latestElement) { 
						if (err) return callback(err);
						console.log(latestElement);
						callback(null, latestElement[0].id)
					})
			},
			function findBugreports(tableSize, callback) {
				skipRows = (req.param('page') - 1 ) * 20;
				if (tableSize <= skipRows) {
					return res.json({
						err: 'no more tickets'
					});
				}
				
				Ticket.find()
					.sort('id ASC')
					.skip(skipRows)
					.sort('id DESC')
					.done(function(err, tickets) {
						if (err) new Error(err);
						gct.all.serializeList(tickets, function(err, result) {
							console.log(result);
							res.json(JSON.stringify(result));
						});
					 });
			}
		], 
		function (err) {
			new Error(err);
		})
	},

	listMyTpl: function(req, res) {
		text = 'Ваши тикеты';
		res.view('list/list', {
			type: {
				url:'my',
				text: text,
				iconclass: 'user'
			 }
		 })
	},
	
	postListNewestMy: function(req, res) {
		Ticket.find({
			owner: req.user.id
			})
			.sort('id DESC')
			.limit(20)
			.done(function(err, tickets) {
				if (err) new Error(err);
				gct.all.serializeList(tickets, function(err, result) {
					res.json(JSON.stringify(result));
				});
			 });
	},
	
	postList20My: function(req, res) {
		async.waterfall([
			function getNumOfIDs(callback) {
				Ticket.find({
					owner: req.user.id
					})
					.sort('id DESC')
					.limit(1)
					.done(function (err, latestElement) { 
						if (err) return callback(err);
						callback(null, latestElement[0].id)
					})
			},
			function findBugreports(tableSize, callback) {
				skipRows = (req.param('page') - 1 ) * 20;
				if (tableSize <= skipRows) {
					return res.json({
						err: 'no more tickets'
					});
				}
				
				Ticket.find()
					.sort('id ASC')
					.skip(skipRows)
					.sort('id DESC')
					.done(function(err, tickets) {
						if (err) new Error(err);
						gct.all.serializeList(tickets, function(err, result) {
							console.log(result);
							res.json(JSON.stringify(result));
						});
					 });
			}
		], 
		function (err) {
			new Error(err);
		})
	},

	listBugreportTpl: function listBugreport(req, res) {
		text = 'Багрепорты';
		res.view('list/list', {
			type: {
				url:'bugreports',
				text: text,
				iconclass: 'bug'
			 }
	 })
	},

	postListNewestBugreport: function(req, res) {
		Bugreport.find()
			.sort('id DESC')
			.limit(20)
			.done(function(err, bugreports) {
				if (err) new Error(err);
				gct.bugreport.serializeList(bugreports, function(err, result) {
					res.json(JSON.stringify(result));
				});
			 });
	},
	
	postList20Bugreport: function(req, res) {
		async.waterfall([
			function getNumOfIDs(callback) {
				Bugreport.find()
					.sort('id DESC')
					.limit(1)
					.done(function (err, latestElement) { 
						if (err) return callback(err);
						
						callback(null, latestElement[0].id)
					})
			},
			function findBugreports(tableSize, callback) {
				skipRows = (req.param('page') - 1 ) * 20;
				if (tableSize <= skipRows) {
					return res.json({
						err: 'no more tickets'
					});
				}
				
				Bugreport.find()
					.sort('id ASC')
					.skip(skipRows)
					.sort('id DESC')
					.limit(20)
					.done(function(err, bugreports) {
						if (err) return callback(err);
						gct.bugreport.serializeList(bugreports, function(err, result) {
							if (err) return callback(err);
							res.json(JSON.stringify(result));
						});
					 })
			}
		], 
		function (err) {
			new Error(err);
		})
	},

	listRemproTpl: function(req, res) {
		text = 'Расприваты';
		res.view('list/list', {
			type: {
				url:'rempros',
				text: text,
				iconclass: 'remove'
			}
		})
	},

	listBanTpl: function(req, res) {
			text = 'Баны';
			res.view('list/list', {
				type: {
					url:'bans',
					text: text,
					iconclass: 'ban circle'
				}
			})
	},

	listUnbanTpl: function(req, res) {
		text = 'Разбаны';
		res.view('list/list', {
			type: {
				url:'unbans',
				text: text,
				iconclass: 'circle blank'
			}
		})
	},

	listRegenTpl: function(req, res) {
		text = 'Регены';
		res.view('list/list', {
			type: {
				url:'regens',
				text: text,
				iconclass: 'leaf'
			}
		})
	},

	listAdmreqTpl: function(req, res) {
		text = 'Обращения к администрации';
		res.view('list/list', {
			type: {
				url:'admreq',
				text: text,
				iconclass: 'briefcase'
			}
		})
	}
};

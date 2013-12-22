/**
* ListController
*
* @module :: Controller
* @description :: Вывод списков тикетов.
*/

//FIXME: Поменять на глобальную переменную
var gct = require('../../utils/gct');

module.exports = {

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
	
	listNewestAll: function(req, res) {
		Ticket.find()
			.sort('id DESC')
			.limit(20)
			.done(function(err, tickets) {
				if (err) throw err;

				gct.all.serializeList(tickets, function(err, result) {
					res.json(JSON.stringify(result));
				});
			 });
	},
	
	list20All: function(req, res) {
		async.waterfall([
			function getNumOfIDs(callback) {
				Ticket.find()
					.sort('id DESC')
					.limit(1)
					.done(function (err, latestElement) { 
						if (err) return callback(err);
						callback(null, latestElement[0].id)
					})
			},
			function findTickets(tableSize, callback) {
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
						if (err) throw err;
						gct.all.serializeList(tickets, function(err, result) {
							res.json(JSON.stringify(result));
						});
					 });
			}
		], 
		function (err) {
			throw err;
		});
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
	
	listNewestMy: function(req, res) {
		Ticket.find({
			owner: req.user.id
			})
			.sort('id DESC')
			.limit(20)
			.done(function(err, tickets) {
				if (err) throw err;
				gct.all.serializeList(tickets, function(err, result) {
					res.json(JSON.stringify(result));
				});
			 });
	},
	
	list20My: function(req, res) {
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
			function findTickets(tableSize, callback) {
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
						if (err) throw err;
						gct.all.serializeList(tickets, function(err, result) {
							res.json(JSON.stringify(result));
						});
					 });
			}
		], 
		function (err) {
			throw err;
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

	listNewestBugreport: function(req, res) {
		Ticket.find({
				type: 1
			})
			.sort('id DESC')
			.limit(20)
			.done(function(err, tickets) {
				if (err) throw err;

				gct.all.serializeList(tickets, function(err, result) {
					res.json(JSON.stringify(result));
				});
			 });
	},
	
	list20Bugreport: function(req, res) {
		async.waterfall([
			function getNumOfIDs(callback) {
				Ticket.find()
					.sort('id DESC')
					.limit(1)
					.done(function (err, latestElement) { 
						if (err) return callback(err);
						callback(null, latestElement[0].id)
					})
			},
			function findTickets(tableSize, callback) {
				skipRows = (req.param('page') - 1 ) * 20;
				if (tableSize <= skipRows) {
					return res.json({
						err: 'no more tickets'
					});
				}
				
				Ticket.find({
						type: 1
					})
					.sort('id ASC')
					.skip(skipRows)
					.sort('id DESC')
					.done(function(err, tickets) {
						if (err) throw err;
						gct.all.serializeList(tickets, function(err, result) {
							res.json(JSON.stringify(result));
						});
					 });
			}
		], 
		function (err) {
			throw err;
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

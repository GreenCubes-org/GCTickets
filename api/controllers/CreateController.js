/**
* CreateController
*
* @module :: Controller
* @description :: Создание тикетов
*/
// all bugreport rempro ban unban regen admreq anon
//FIXME: Поменять на глобальную переменную
var redis = require('../../utils/redis');

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
		async.waterfall([
			function setData(callback) {
				callback(null,{
					title: req.param('title'),
					description: req.param('description'),
					status: 1,
					owner: req.user.id,
					product: parseInt(req.param('product'),10),
					hidden: parseInt(req.param('hidden'),10),
					uploads: [],
					comments: []
				})
			},
			function checkData(bugreport, callback) {
				var errcode;
				req.onValidationError(function (msg) {
					errcode = 1;
					callback({ show: true, msg: msg });
				});
				req.check('title','Краткое описание должно содержать не менее %1 и не более %2 символов').len(6,64);
				if (!errcode) callback(null, bugreport);
			},
			function sanitizeData(bugreport, callback) {
				bugreport.description = req.sanitize(bugreport.description).entityEncode();
				callback(null, bugreport);
			},
			function createBugreport(bugreport, callback) {
				Bugreport.create(bugreport).done(function(err, bugreport) {
					callback(err, bugreport)
				});
			},
			function registerTicket(bugreport, callback) {
				Ticket.create({
					tid: bugreport.id,
					type: 1
				}).done(function (err, ticket) { 
						callback(err, ticket)
					});
			},
			function cacheToRedis(err, ticket, callback) {
				redis.set('ticket:' + ticket.id, ticket.type + ':' + ticket.tid);
				callback(err, ticket);
			}
		 ],
		 function (err, ticket) {
				if (!err.show) {
					res.json({
						 err: 'Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.'
					});
					return new Error(err);
				} else {
					res.json({
						err: err.msg
					});
					return;
				}

				res.json({
					id: ticket.id
				});
				req.flash('info', 'Тикет успешно создан!');
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

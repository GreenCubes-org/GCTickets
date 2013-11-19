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
					product: parseInt(req.param('product')),
					visiblity: parseInt(req.param('visiblity')),
					uploads: [],
					comments: []
				})
			},
			function checkData(obj, callback) {
				var isErr = false;
				req.onValidationError(function (msg) {
					isErr = true;
					callback({ show: true, msg: msg }, obj);
				});
				req.check('title','Краткое описание должно содержать не менее %1 и не более %2 символов').len(6,64);
				if (!isErr) callback(null, obj);
			},
			function sanitizeData(obj, callback) {
				obj.description = req.sanitize('description').entityEncode();
				callback(null, obj);
			},
			function createBugreport(obj, callback) {
				Bugreport.create({
					title: obj.title,
					description: obj.description,
					status: obj.status,
					owner: obj.owner,
					product: obj.product,
					uploads: obj.uploads,
					comments: obj.comments
				}).done(function(err) {
					callback(err, obj)
				});
			},
			function registerTicket(obj, callback) {
				Ticket.create({
					tid: obj.id,
					type: 1,
					visiblity: obj.visiblity,
					owner: obj.owner
				}).done(function (err, ticket) { 
						callback(err, ticket)
					});
			},
			function cacheToRedis(ticket, callback) {
				redis.set('ticket:' + ticket.id, ticket.type + ':' + ticket.tid);
				callback(null, ticket);
			}
		 ],
		 function (err, ticket) {
			if (err) {
				if (!err.show) {
					res.json({
						 err: 'Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.'
					});
					console.log(err, ticket);
					return new Error(err);
				} else {
					res.json({
						err: err.msg
					});
					return;
				}
			} else {
				res.json({
					id: ticket.id
				});
			}
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

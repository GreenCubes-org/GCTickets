/**
* CreateController
*
* @module :: Controller
* @description :: Создание тикетов
*/

//FIXME: Поменять на глобальную переменную
var gcdb = require('../../utils/gcdb')

module.exports = {
	mainTpl: function(req,res) {
		res.view('create/main');
	},

	allTpl: function(req,res) {
		res.view('create/all');
	},

	bugreportTpl: function(req,res) {
		res.view('create/bugreport');
	},
	
	bugreport: function(req,res) {
		async.waterfall([
			function setData(callback) {
				callback(null,{
					title: req.param('title'),
					description: req.param('description'),
					status: 1,
					owner: req.user.id,
					product: parseInt(req.param('product')),
					uploads: [],
					visiblity: parseInt(req.param('visiblity'))
				})
			},
			function checkData(obj, callback) {
				if (isNaN(obj.visiblity)) {
					callback({
						show: true, msg: 'Выберите видимость тикета'
					});
				}
				
				var isErr = false;
				req.onValidationError(function (msg) {
					isErr = true;
					callback({ show: true, msg: msg });
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
					uploads: obj.uploads
				}).done(function(err, result) {
					if (err) return callback(err);
					
					callback(null, result.id, obj);
				});
			},
			function registerTicket(ticketId, obj, callback) {
				Ticket.create({
					tid: ticketId,
					type: 1,
					visiblity: obj.visiblity,
					comments: [],
					owner: obj.owner
				}).done(function (err, ticket) {
						if (err) return callback(err);
						
						callback(null, ticket)
					});
			}
		 ],
		 function (err, ticket) {
			if (err) {
				if (!err.show) {
					res.json({
						 err: 'Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.'
					});
					
					console.error(err);
					throw err;
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
	
	bugreportComment: function(req,res) {
		async.waterfall([
			function preCheck(callback) {
				if (req.param('message') === '') {
					callback({
						show: true,
						msg: 'Комментарий слишком короткий'
					});
				} else {
					callback(null);
				}
			},
			function checkOldComments(callback) {
				Ticket.findOne(req.param('id')).done(function (err, bugreport) {
					if (err) return callback(err);

					if (bugreport.comments.length > 0) {
						callback(null, bugreport.comments.length + 1);
					} else {
						callback(null, 1); // set comment id to 1 because there is no other comments
					}
				})
			},
			function setData(commentId, callback) {
				callback(null, {
					id: commentId,
					owner: req.user.id,
					message: req.sanitize('message').entityEncode(),
					status: 1,
					createdAt: Date()
				})
			},
			function createComment(newComment, callback) {
				Ticket.findOne(req.param('id')).done(function (err, ticket) {
						if (err) return callback(err);
						
						
						ticket.comments[newComment.id - 1] = newComment;
						ticket.save(function(err) {
							if (err) return callback(err);
							
							callback(null, newComment);
						});
				})
			},
			function serialize(newComment, callback) {
				gcdb.user.getByID(newComment.owner, function(err, login) {
					if (err) return callback(err);
					
					newComment.owner = login;
					newComment.code = 'OK';
					callback(null, newComment);
				})
			}
		],
		function (err, comment) {
			if (err) {
				if (!err.show) {
					if (err) throw err;
				} else {
					return res.json({
						error: err.msg
					});
				}
			} else {
				res.json(comment);
			}
		});
	},
	
	remproTpl: function(req,res) {
		res.view('create/rempro');
	},

	banTpl: function(req,res) {
		res.view('create/ban');
	},

	unbanTpl: function(req,res) {
		res.view('create/unban');
	},

	regenTpl: function(req,res) {
		res.view('create/regen');
	},

	admreqTpl: function(req,res) {
		res.view('create/admreq');
	}
	
};

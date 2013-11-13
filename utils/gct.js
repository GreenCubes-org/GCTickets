/**
 * GCT - 
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */
// FIXME: Поменять на глобальную переменную
var redis = require('./redis');
var gcdb = require('./gcdb');

module.exports = function (){
	return '42';
};

module.exports.getStatusByID = getStatusByID = function(id) {
	switch (id) {
		 case 1:
			 return { text: 'Новый', class: 'new' };
		 case 2:
			 return { text: 'Отменён', class: 'rejected' };
		 case 3:
			 return { text: 'Требует уточнения', class: 'specify' };
		 case 4:
			 return { text: 'Отклонён', class: 'declined' };
		 case 5:
			 return { text: 'Скрыт', class: 'black' };
		 case 6:
			 return { text: 'Удалён', class: 'black' };
		 case 7:
			 return { text: 'Исправлен', class: 'helpfixed' };
		 case 8:
			 return { text: 'На рассмотрении', class: 'inreview' };
		 case 9:
			 return { text: 'Отложен', class: 'delayed' };
		 case 10:
			 return { text: 'Выполнен', class: 'done' };
		 case 11:
			 return { text: 'Принят', class: 'accepted' };
		 case 12:
			 return { text: 'Будет исправлен', class: 'befixed' };
		 case 13:
			 return { text: 'Исправлен', class: 'done' };
		 default:
			 return;
	}
};

module.exports.getProductByID = getProductByID = function(id) {
	switch (id) {
		 case 1:
			 return 'GC.Main Клиент';
		 case 2:
			 return 'GC.Main Сервер(GreenServer)';
		 case 3:
			 return 'GreenCubes.org сайт';
		 case 4:
			 return 'Форум GreenCubes';
		 case 5:
			 return 'GreenCubes.Wiki';
		 case 6:
			 return 'GreenCubes.Ticket';
		 case 7:
			 return 'GC.RPG Клиент';
		 case 8:
			 return 'GC.RPG Сервер';
		 case 9:
			 return 'GC.Apocalyptic Клиент';
		 case 10:
			 return 'GC.Apocalyptic Сервер';
		 default:
			 return;
	}
};

module.exports.getVisiblityByID = getVisiblityByID = function (id) {
	switch (id) {
		case 1: 
			return 'Публичный';
		case 2:
			return 'Виден только администраторам'
		default:
			return;
	}
};

module.exports.bugreport = bugreport = {
	serializeList: function(array, cb) {
		 async.waterfall([
			 function map(callback) {
					async.map(array, function(obj, callback) {
						
						async.waterfall([
							 function getUserByID(callback) {
								 gcdb.user.getByID(obj.owner, function(err, result) {
									if (err) return callback(err);
									
									callback(null, {
										id: obj.id,
										title: obj.title,
										status: getStatusByID(obj.status),
										owner: result,
										createdAt: obj.createdAt
									})
								 })
							 }
						],
						function (err, obj) {
							 if (err) return callback(err);
							 
							 redis.get('ticket:' + '1:' + obj.id, function(err, reply) {
								 if (err) callback(err);
								 
								 if (!reply) {
									Ticket.find({
										tid: obj.id,
										type: 1
									}).done(function(err, ticket) {
										if (err) return callback(err);
										
										redis.set('ticket:' + '1:' + obj.id, ticket[0].id);
										
										callback(null, {
											 id: ticket[0].id,
											 title: obj.title,
											 status: obj.status,
											 owner: obj.owner,
											 createdAt: obj.createdAt
										})
									})
								 } else {
									callback(null, {
											 id: reply,
											 title: obj.title,
											 status: obj.status,
											 owner: obj.owner,
											 createdAt: obj.createdAt
										})
									} 
							 })
						})
						
					}, 
					function (err, result) {
						if (err) callback(err);
						
						callback(null, result);
					})
			 }
		 ], function(err, result) {
					if (err) cb(err);
					cb(null, result);
			 })
	},

	serializeSingle: function(obj, cb) {
		 async.waterfall([
			 function getUserByID(callback) {
					gcdb.user.getByID(obj.owner, function(err, result) {
						if (err) return callback(err);
						
						callback(null, {
							 id: obj.id,
							 title: obj.title,
							 description: obj.description,
							 status: getStatusByID(obj.status),
							 owner: result,
							 product: obj.product,
							 comments: obj.comments,
							 visiblity: getVisiblityByID(obj.visiblity),
							 createdAt: obj.createdAt
						})
					})
			 }
		 ],
		 function (err, obj) {
			 if (err) return callback(err);
			 
			 redis.get('ticket:' + '1:' + obj.id, function(err, reply) {
					if (err) callback(err);
					
					if (!reply) {
						Ticket.find({
							 tid: obj.id,
							 type: 1
						}).done(function(err, ticket) {
							 if (err) return callback(err);
							 
							 redis.set('ticket:' + '1:' + obj.id, ticket[0].id);
							 
							 cb(null, {
								 id: ticket[0].id,
								 title: obj.title,
								 description: obj.description,
								 status: obj.status,
								 owner: obj.owner,
								 product: obj.product,
								 comments: obj.comments,
								 visiblity: obj.visiblity,
								 createdAt: obj.createdAt,
								 type: {
									text: 'Баг-репорт',
									iconclass: 'bug'
								 }
							 })
						})
					} else {
						cb(null, {
								 id: reply,
								 title: obj.title,
								 description: obj.description,
								 status: obj.status,
								 owner: obj.owner,
								 product: obj.product,
								 comments: obj.comments,
								 visiblity: obj.visiblity,
								 createdAt: obj.createdAt,
								 type: {
									text: 'Баг-репорт',
									iconclass: 'bug'
								 }
							 })
						} 
			 })
		 })
	}
};

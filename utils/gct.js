/**
 * GCT - 
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */
// FIXME: Поменять на глобальную переменную
var redis = require('./redis');
var gcdb = require('./gcdb');

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
			 return 'GC.Main Сервер (GreenServer)';
			 
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
			 return 'Не указано';
	}
};

module.exports.getVisiblityByID = getVisiblityByID = function(id) {
	switch (id) {
		case 1: 
			return 'Публичный';
			
		case 2:
			return 'Виден только администраторам';
			
		default:
			return;
	}
};

module.exports.serializeComments = serializeComments = function(comments, cb) {
	if (comments === null) return cb(null, null);

	async.map(comments, function(comment, callback) {
		gcdb.user.getByID(comment.owner, function(err, login) {
			if (err) return callback(err);
			
			comment.owner = login;
			callback(null, comment);
		})
	},
	function (err, result) {
		if (err) return cb(err);
		
		cb(null, result);
	})
};

module.exports.all = all = {
	serializeList: function(array, cb) {
		async.map(array, function(obj, callback) {
			switch (obj.type) {
				case 1:
					async.waterfall([
						function getBugreport(callback) {
							Bugreport.find({
								id: obj.tid
							}).done(function (err, result) {
								callback(err, result);
							});
						},
						function serialize(result, callback) {
							bugreport.serializeSingle(result[0], function(err, ticket) {
								callback(null, {
									id: ticket.id,
									title: ticket.title,
									status: ticket.status,
									owner: ticket.owner,
									createdAt: ticket.createdAt,
									type: {
										descr: 'Баг-репорт',
										iconclass: 'bug'
									}
								})
							}) 
						}
					],
					function (err, bugreport) {
						if (err) throw err;
						
						callback(null, bugreport);
					});
					return;
					
				case 2:
					return//rempro.serializeSingle
					
				case 3:
					return//ban.serializeSingle
					
				case 4:
					return//unban.serializeSingle
					
				case 5:
					return//regen.serializeSingle
					
				case 6:
					return//admreq.serializeSingle
					
				case 7:
					return//entrouble.serializeSingle
					
				default:
					return;
			}
		}, function (err, array) {
			if (err) throw err;
			
			cb(null, array);
		});
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
								 if (err) return callback(err);
								 
								 if (!reply) {
									Ticket.find({
										tid: obj.id,
										type: 1
									}).done(function(err, ticket) {
										if (err) return callback(err);
										
										cache = JSON.stringify({
											id: ticket[0].id,
											tid: ticket[0].tid,
											type: ticket[0].type, 
											visiblity: ticket[0].visiblity
										});
																				
										redis.set('ticket:' + '1:' + obj.id, cache, function(err) {
											callback(null, {
												id: ticket[0].id,
												title: obj.title,
												status: obj.status,
												owner: obj.owner,
												createdAt: obj.createdAt,
												visiblity: getVisiblityByID(obj.visiblity),
												type: {
													descr: 'Баг-репорт',
													iconclass: 'bug'
												}
											})
										})
									})
								 } else {
									ticket = JSON.parse(reply);
									callback(null, {
											id: ticket.id,
											title: obj.title,
											status: obj.status,
											owner: obj.owner,
											createdAt: obj.createdAt,
											visiblity: getVisiblityByID(obj.visiblity),
											type: {
												descr: 'Баг-репорт',
												iconclass: 'bug'
											}
										})
									} 
							 })
						})
						
					}, 
					function (err, result) {
						if (err) return callback(err);
						
						callback(null, result);
					})
			 }
		 ], function(err, result) {
					if (err) return cb(err);
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
						 product: getProductByID(obj.product),
						 visiblity: null,
						 createdAt: obj.createdAt
					})
				})
			 }
		 ],
		 function (err, obj) {
			 if (err) return cb(err);
			 
			 redis.get('ticket:' + '1:' + obj.id, function(err, reply) {
					if (err) return callback(err);
					
					if (!reply) {
						Ticket.find({
							 tid: obj.id,
							 type: 1
						}).done(function(err, ticket) {
							if (err) return callback(err);
							 
							cache = JSON.stringify({
								id: ticket[0].id,
								tid: ticket[0].tid,
								type: ticket[0].type, 
								visiblity: ticket[0].visiblity
							});
							 
							redis.set('ticket:' + '1:' + obj.id, cache, function(err) {
								if (err) return cb(err);
									if (err) return cb(err);
									
									cb(null, {
										id: ticket[0].id,
										title: obj.title,
										description: obj.description,
										status: obj.status,
										owner: obj.owner,
										product: obj.product,
										visiblity: getVisiblityByID(ticket.visiblity),
										createdAt: obj.createdAt,
										type: {
											descr: 'Баг-репорт',
											iconclass: 'bug'
										}
									})
							})
						})
					} else {
						ticket = JSON.parse(reply);
						if (err) return cb(err);
						
						cb(null, {
								 id: ticket.id,
								 title: obj.title,
								 description: obj.description,
								 status: obj.status,
								 owner: obj.owner,
								 product: obj.product,
								 visiblity: getVisiblityByID(ticket.visiblity),
								 createdAt: obj.createdAt,
								 type: {
									descr: 'Баг-репорт',
									iconclass: 'bug'
								 }
							 })
					}
			 })
		 })
	}
};

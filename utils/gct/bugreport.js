var redis = require('../redis');
var gcdb = require('../gcdb');
var cfg = require('../../config/local.js');

module.exports = bugreport = {
	serializeList: function serializeList(array, cb) {
		async.map(array, function (obj, callback) {
			async.waterfall([
				function getBugreport(callback) {
					Bugreport.find({
						id: obj.tid
					}).done(function (err, result) {
						if (err) return callback(err);
						console.log(result, obj);
						callback(err, result[0]);
					});
				},
				function serialize(result, callback) {
					bugreport.serializeSingle(result, function (err, ticket) {
						if (err) return callback(err);
						
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
						});
					})
				}
			],
			function (err, bugreport) {
				if (err) throw err;
	
				callback(null, bugreport);
			});
		}, function (err, array) {
			if (err) throw err;

			cb(null, array);
		});
		
	},

	serializeSingle: function serializeSingle(obj, cb) {
		async.waterfall([
			function getUserByID(callback) {
					gcdb.user.getByID(obj.owner, function (err, result) {
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

				redis.get('ticket:' + '1:' + obj.id, function (err, reply) {
					if (err) return callback(err);

					if (!reply) {
						Ticket.find({
							tid: obj.id,
							type: 1
						}).done(function (err, ticket) {
							if (err) return callback(err);

							cache = JSON.stringify({
								id: ticket[0].id,
								tid: ticket[0].tid,
								type: ticket[0].type,
								visiblity: ticket[0].visiblity
							});

							redis.set('ticket:' + '1:' + obj.id, cache, function (err) {
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

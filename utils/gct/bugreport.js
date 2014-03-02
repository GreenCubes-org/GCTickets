var gcdb = require('../gcdb');
var cfg = require('../../config/local.js');
var bbcode = require('bbcode');

module.exports = bugreport = {
	serializeList: function serializeList(array, cb) {
		async.map(array, function (obj, callback) {
			async.waterfall([
				function getBugreport(callback) {
					Bugreport.find({
						id: obj.tid
					}).done(function (err, result) {
						if (err) return callback(err);
						
						callback(null, result[0]);
					});
				},
				function serialize(result, callback) {
					bugreport.serializeSingle(result, null, function (err, ticket) {
						if (err) return callback(err);
						
						callback(null, {
							id: ticket.id,
							title: ticket.title,
							status: ticket.status,
							owner: ticket.owner,
							logs: ticket.logs,
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

	serializeSingle: function serializeSingle(obj, config, cb) {
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
						ownerId: obj.owner,
						logs: obj.logs,
						product: getProductByID(obj.product),
						visiblity: null,
						createdAt: obj.createdAt
					});
				});
			},
			function bbcode2html(obj, callback) {
				if (config && config.isEdit) {
					callback(null, obj);
				} else {
					bbcode.parse(obj.description, function(result) {
						obj.description = result;
						
						// IM SO SORRY.
						bbcode.parse(obj.logs, function(result) {
							obj.logs = result;

							callback(null, obj);
						});
					});
				}
			}
		],
		function (err, obj) {
			if (err) return cb(err);
			
			Ticket.find({
				tid: obj.id,
				type: 1
			}).done(function (err, ticket) {
				if (err) return cb(err);

				if (config && config.isEdit) {
					cb(null, {
						id: ticket[0].id,
						title: obj.title,
						description: obj.description,
						status: obj.status,
						owner: obj.owner,
						logs: obj.logs,
						product: obj.product,
						visiblity: ticket[0].visiblity,
						createdAt: obj.createdAt,
						type: {
							descr: 'Баг-репорт',
							iconclass: 'bug'
						}
					});
				} else {
					cb(null, {
						id: ticket[0].id,
						title: obj.title,
						description: obj.description,
						status: obj.status,
						owner: obj.owner,
						ownerId: obj.ownerId,
						logs: obj.logs,
						product: obj.product,
						visiblity: getVisiblityByID(ticket[0].visiblity),
						createdAt: obj.createdAt,
						type: {
							descr: 'Баг-репорт',
							iconclass: 'bug'
						}
					});
				}
			});
		});
	}
};

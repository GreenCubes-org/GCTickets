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
						
						callback(null, result[0]);
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
					});
				});
			}
		],
		function (err, obj) {
			if (err) return cb(err);
			
			Ticket.find({
				tid: obj.id,
				type: 1
			}).done(function (err, ticket) {
				if (err) return callback(err);

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
				});
			});
		});
	}
};

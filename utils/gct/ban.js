var bbcode = require('bbcode');

module.exports = ban = {
	serializeList: function serializeList(array, cb) {
		async.map(array, function (obj, callback) {
			async.waterfall([
				function getBan(callback) {
					Ban.find({
						id: obj.tid
					}).done(function (err, result) {
						if (err) return callback(err);
						
						callback(null, result[0]);
					});
				},
				function serialize(result, callback) {
					ban.serializeSingle(result, null, function (err, ticket) {
						if (err) return callback(err);
						
						callback(null, {
							id: ticket.id,
							title: ticket.title,
							status: ticket.status,
							owner: ticket.owner,
							createdAt: ticket.createdAt,
							type: {
								descr: 'Заявка на бан',
								iconclass: 'circle ban'
							}
						});
					})
				}
			],
			function (err, ban) {
				if (err) throw err;
	
				callback(null, ban);
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
						victim: obj.victim,
						status: getStatusByID(obj.status),
						owner: result,
						type: obj.type,
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

						callback(null, obj);
					});
				}
			}
		],
		function (err, obj) {
			if (err) return cb(err);
			
			Ticket.find({
				tid: obj.id,
				type: 3
			}).done(function (err, ticket) {
				if (err) return callback(err);

				if (config && config.isEdit) {
					cb(null, {
						id: ticket[0].id,
						title: obj.title,
						description: obj.description,
						victim: obj.victim,
						status: obj.status,
						owner: obj.owner,
						visiblity: ticket[0].visiblity,
						createdAt: obj.createdAt,
						type: {
							descr: 'Заявка на бан',
							iconclass: 'circle ban',
							id: obj.type
						}
					});
				} else {
					
					cb(null, {
						id: ticket[0].id,
						title: obj.title,
						description: obj.description,
						victim: obj.victim,
						status: obj.status,
						owner: obj.owner,
						visiblity: getVisiblityByID(ticket[0].visiblity),
						createdAt: obj.createdAt,
						type: {
							descr: 'Заявка на бан',
							iconclass: 'circle ban',
							id: obj.type
						}
					});
				}
			});
		});
	}
};

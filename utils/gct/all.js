module.exports = {
	serializeList: function (array, cb) {
		async.map(array, function (obj, callback) {
			switch (obj.type) {
				case 1:
					async.waterfall([
						function getBugreport(callback) {
							Bugreport.find({
								id: obj.tid
							}).done(function (err, result) {
								if (err) return callback(err);
								
								callback(err, result[0]);
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
									createdAt: ticket.createdAt,
									type: {
										descr: 'Баг-репорт',
										iconclass: 'bug'
									}
								});
							});
						}
					],
					function (err, bugreport) {
						if (err) return callback(err);

						callback(null, bugreport);
					});
					return;

			case 2:
				return //rempro.serializeSingle

			case 3:
				async.waterfall([
						function getBugreport(callback) {
							Ban.find({
								id: obj.tid
							}).done(function (err, result) {
								if (err) return callback(err);
								
								callback(err, result[0]);
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
										iconclass: 'ban circle'
									}
								});
							})
						}
					],
					function (err, bugreport) {
						if (err) throw err;

						callback(null, bugreport);
					});
					return;

			case 4:
				return //unban.serializeSingle

			case 5:
				return //regen.serializeSingle

			case 6:
				return //admreq.serializeSingle

			case 7:
				return //entrouble.serializeSingle

			default:
				return;
			}
		}, function (err, array) {
			if (err) throw err;

			cb(null, array);
		});
	}

};

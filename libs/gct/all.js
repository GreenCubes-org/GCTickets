module.exports = {
	serializeList: function (array, cb) {
		async.map(array, function (obj, callback) {
			switch (obj.type) {
				case 1:
					async.waterfall([
						function getBugreport(callback) {
							Bugreport.findOne(obj.tid).done(function (err, result) {
								if (err) return callback(err);

								result.status = obj.status;
								result.owner = obj.owner;
								result.tid = obj.id;
								result.visiblity = obj.visiblity;

								callback(err, result);
							});
						},
						function serialize(result, callback) {
							bugreport.serializeList(result, function (err, ticket) {
								if (err) return callback(err);

								callback(null, {
									id: ticket.id,
									title: ticket.title,
									status: ticket.status,
									owner: ticket.owner,
									createdAt: ticket.createdAt,
									visibility: {
										class: (ticket.visiblity === 'Публичный') ? 'unlock' : 'lock',
										text: ticket.visiblity
									},
									type: {
										descr: 'Баг-репорт',
										iconclass: 'bug'
									},
									product: ticket.product,
									comments: ticket.comments
								});
							});
						}
					],
					function (err, bugreport) {
						if (err) return callback(err);

						callback(null, bugreport);
					});
					break;

			case 2:
				async.waterfall([
					function getRempro(callback) {
						Rempro.findOne(obj.tid).done(function (err, result) {
							if (err) return callback(err);

							result.status = obj.status;
							result.owner = obj.owner;
							callback(err, result);
						});
					},
					function serialize(result, callback) {
						rempro.serializeList(result, function (err, ticket) {
							if (err) return callback(err);

							callback(null, {
								id: ticket.id,
								title: ticket.title,
								status: ticket.status,
								owner: ticket.owner,
								createdAt: ticket.createdAt,
								visibility: {
									class: (ticket.visiblity === 'Публичный') ? 'unlock' : 'lock',
									text: ticket.visiblity
								},
								type: {
									descr: 'Расприват',
									iconclass: 'trash'
								},
								comments: ticket.comments
							});
						});
					}
				],
				function (err, rempro) {
					if (err) return callback(err);

					callback(null, rempro);
				});
				break;

			case 3:
				break;

			case 4:
				break; //unban.serializeSingle

			case 5:
				break; //regen.serializeSingle

			case 6:
				break; //admreq.serializeSingle

			case 7:
				break; //entrouble.serializeSingle

			default:
				break;
			}
		}, function (err, array) {
			if (err) throw err;

			cb(null, array);
		});
	}

};

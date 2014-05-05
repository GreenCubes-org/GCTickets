module.exports = {
	serializeList: function (array, cb) {
		async.map(array, function (obj, callback) {
			switch (obj.type) {
				case 1:
					async.waterfall([
						function getBugreport(callback) {
							Ticket.findOne(obj.id).done(function (err, ticket) {
								Bugreport.findOne(obj.tid).done(function (err, result) {
									if (err) return callback(err);

									result.status = ticket.status;
									callback(err, result);
								});
							});
						},
						function serialize(result, callback) {
							bugreport.serializeView(result, null, function (err, ticket) {
								if (err) return callback(err);

								gcdb.user.getByID(obj.owner, function (err, ownerLogin) {
									callback(null, {
										id: ticket.id,
										title: ticket.title,
										status: ticket.status,
										owner: ownerLogin,
										createdAt: ticket.createdAt,
										type: {
											descr: 'Баг-репорт',
											iconclass: 'bug'
										}
									});
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
						Rempro.find({
							id: obj.tid
						}).done(function (err, result) {
							if (err) return callback(err);

							callback(err, result[0]);
						});
					},
					function serialize(result, callback) {
						rempro.serializeView(result, null, function (err, ticket) {
							if (err) return callback(err);

							gcdb.user.getByID(obj.owner, function (err, ownerLogin) {
								callback(null, {
									id: ticket.id,
									title: ticket.title,
									status: ticket.status,
									owner: ownerLogin,
									createdAt: ticket.createdAt,
									type: {
										descr: 'Расприват',
										iconclass: 'remove'
									}
								});
							});
						});
					}
				],
				function (err, bugreport) {
					if (err) return callback(err);

					callback(null, bugreport);
				});
				break;

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

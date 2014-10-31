/**
 * NotifController
 *
 * @module :: Controller
 * @description :: Оповещения.
 */



module.exports = {

	listNotifications: function (req, res) {
		redis.sort('notif:' + req.user.id, 'ALPHA', function (err, result) {
			if (err) return res.serverError(err);

			if (!result.length) { return res.json([]); }

			async.map(result, function (element, callback) {
				element = JSON.parse(element);

				async.waterfall([
					function serializeType(callback) {
						element.type = gct.serializeNotifType(element.type);

						callback(null, element);
					},
					function getUser(element, callback) {
						if (element.user) {
							gcdb.user.getByID(element.user, function (err, login) {
								if (err) return callback(err);

								element.user = login;

								callback(null, element);
							});
						} else {
							callback(null, element);
						}
					},
					function serializeTicket(element, callback) {
						if (element.ticket) {
							Ticket.findOne(element.ticket).exec(function (err, ticket) {
								if (err) return callback(err);

								switch (ticket.type) {
									case 1:
										Bugreport.findOne(ticket.tid).exec(function (err, bugreport) {
											if (err) return callback(err);

											element.ticket = {
												id: ticket.id,
												title: bugreport.title
											};

											callback(null, element);
										});
										break;

									case 2:
										Rempro.findOne(ticket.tid).exec(function (err, rempro) {
											if (err) return callback(err);

											element.ticket = {
												id: ticket.id,
												title: rempro.title
											};

											callback(null, element);
										});
										break;

									case 3:
										Ban.findOne(ticket.tid).exec(function (err, rempro) {
											if (err) return callback(err);

											element.ticket = {
												id: ticket.id,
												title: rempro.title
											};

											callback(null, element);
										});
										break;

									case 4:
										Unban.findOne(ticket.tid).exec(function (err, rempro) {
											if (err) return callback(err);

											element.ticket = {
												id: ticket.id,
												title: rempro.title
											};

											callback(null, element);
										});
										break;
								}
							});
						} else {
							callback(null, element);
						}
					},
					function serializeChangedTo(element, callback) {
						if (element.changedTo) {
							element.changedTo = gct.getStatusByID(element.changedTo);

							callback(null, element);
						} else {
							callback(null, element);
						}
					}
				], function (err, element) {
					if (err) return callback(err);

					callback(null, element);
				});
			}, function (err, result) {
				if (err) return res.serverError(err);

				res.json(result);
			});
		});
	},

	removeNotifications: function (req, res) {
		redis.del('notif:' + req.user.id, function (err) {
			if (err) return res.serverError(err);

			res.json({
				message: 'OK'
			});
		});
	}

};

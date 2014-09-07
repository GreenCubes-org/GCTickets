module.exports = {

	add: function(type, user, options, callback) {
		var obj;

		switch (type) {
			case 1:
				obj = {
					type: 1,
					user: options.user,
					ticket: options.ticket,
					cid: options.cid
				};
				break;

			case 2:
				obj = {
					type: 2,
					user: options.user,
					ticket: options.ticket,
					cid: options.cid,
					changedTo: options.changedTo
				};
				break;

			case 3:
				obj = {
					type: 3,
					ticket: options.ticket,
				};
				break;
		}

		redis.lpush('notif:' + user, JSON.stringify(obj), callback);
	}
};

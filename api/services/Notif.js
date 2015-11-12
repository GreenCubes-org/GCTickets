module.exports = {

	add: function(type, user, options, callback) {
		var obj;

		switch (type) {
			// New comment
			case 1:
				obj = {
					type: 1,
					user: options.user,
					ticket: options.ticket,
					cid: options.cid
				};
				break;

			// New comment with status
			case 2:
				obj = {
					type: 2,
					user: options.user,
					ticket: options.ticket,
					cid: options.cid,
					changedTo: options.changedTo
				};
				break;

			// Comment removed by someone (administration, by example)
			case 3:
				obj = {
					type: 3,
					ticket: options.ticket,
				};
				break;

			// User was summoned you to discussion :)
			case 4:
				obj = {
					type: 4,
					user: options.user,
					ticket: options.ticket,
					cid: options.cid
				};
				break;
		}

		redis.lpush('notif:' + user, JSON.stringify(obj), callback);
	}
};

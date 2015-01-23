/* GCH – Helper library • Bans-related functions */

module.exports = {
	getAdditionalFields: function (id, cb) {
		var obj = {
			reason: null,
			targetUser: null
		};
		
		Bans.findOne(id).done(function (err, result) {
			if (err) return cb(err);
			
			obj.reason = result.reason;
			obj.targetUser = result.targetUser;
			
			cb(null, obj);
		});
	},

	serializeAdditionalFields: function (fields, cb) {
		gcdb.user.getByID(fields.targetUser, function (err, login) {
			if (err) return cb(err);
			
			fields.targetUser = login;
			
			cb(null, fields);
		});
	}
};
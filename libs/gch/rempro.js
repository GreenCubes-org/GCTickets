/* GCH – Helper library • Rempros-related functions */

module.exports = {
	getAdditionalFields: function (id, cb) {
		var obj = {
			createdFor: null,
			reason: null,
			regions: null,
			stuff: null
		};
		
		Rempros.findOne(id).done(function (err, result) {
			if (err) return cb(err);
			
			obj.createdFor = result.createdFor;
			obj.reason = result.reason;
			obj.regions = result.regions;
			obj.stuff = result.stuff;
			
			cb(null, obj);
		});
	},
	
	serializeAdditionalFields: function (fields, cb) {
		gcdb.user.getByID(fields, function (err, login) {
			if (err) return cb(err);
			
			fields.createdFor = login;
			
			cb(null, fields);
		});
	}
};
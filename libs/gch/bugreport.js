/* GCH – Helper library • Bugreports-related functions */

module.exports = {
	getAdditionalFields: function (id, cb) {
		var obj = {
			description: null,
			product: null
		};
		
		Bugreports.findOne(id).exec(function (err, result) {
			if (err) return cb(err);
			
			obj.description = result.description;
			obj.product = gch.getProduct(result.product);
			
			cb(null, obj);
		});
	}
};
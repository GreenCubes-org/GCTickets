/* GCH – Helper library • Bugreports-related functions */

module.exports = {
	serializeAttachments: function (attachments, cb) {
		var sortedAttachments = {
			images: [],
			logs: []
		};
		
		async.map(attachments, function (attachment, callback) {
			async.waterfall([
				function getCreatedByUserInfo(callback) {
					gcdb.user.getByID(attachment.createdBy, function (err, username) {
						if (err) return callback(err);
						
						attachment.createdBy = {
							id: attachment.createdBy,
							username: username
						};
						
						callback(null, attachment);
					});
				},
				function doTypeSpecificSerializationAndSort(attachment, callback) {
					attachment.data = JSON.parse(attachment.data);
					
					switch (attachment.type) {
						case 1:
							attachment.type = 'image';
							attachment.description = attachment.data.description;
							attachment.src = attachment.data.src;
							sortedAttachments.images.push(attachment);
							break;

						case 2:
							attachment.type = 'log';
							attachment.description = attachment.data.description;
							attachment.data = attachment.data.data;
							sortedAttachments.logs.push(attachment);
							break;

						default:
							callback('Wrong type of attachment');
							return;
					}

					callback(null, attachment);
				}
			], function (err, attachement) {
				if (err) return callback(err);

				callback(null, attachement);
			});
		}, function (err, attachments) {
			if (err) return cb(err);
			
			// We don't use original attachments array becase we have sorted.
			cb(null, sortedAttachments);
		});
	}
};
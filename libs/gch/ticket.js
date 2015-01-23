

module.exports = {
	get: function (id, cb) {
		var obj = {
			id: id,
			title: null,
			type: null,
			visibility: null,
			status: null,
			owner: null,
			additional: [],
			comments: [],
			attachments: []
		};
		
		if (obj.id === NaN) {
			return res.badRequest("Wrong ID format");
		}
		
		async.waterfall([
			function getMainFields(callback) {
				Tickets.findOne(obj.id).exec(function (err, result) {
					if (err) return callback(err);
					
					if (!result) return res.notFound();
					
					obj.tid = result.tid;
					obj.title = result.title;
					obj.type = result.type;
					obj.visibility = result.visibility;
					obj.status = result.status;
					obj.owner = result.owner;
					obj.attachments = result.attachments;
					obj.createdAt = result.createdAt;
					
					callback(null, obj);
				});
			},
			function getAndSerializeAdditionalField(obj, callback) {
				switch (obj.type) {
					case 1:
						gch.bugreport.getAdditionalFields(obj.tid, function (err, result) {
							if (err) return callback(err);
								
							obj.additional.description = result.description;
							obj.additional.product = result.product;

							callback(null, obj);
						});
						break;
					
					case 2:
						gch.rempro.getAdditionalFields(obj.tid, function (err, result) {
							if (err) return callback(err);
							
							gch.rempro.serializeAdditionalFields(result, function (err, result) {
								if (err) return callback(err);
								
								obj.additional.createdFor = result.createdFor;
								obj.additional.reason = result.reason;
								obj.additional.regions = result.regions;
								obj.additional.stuff = result.stuff;

								callback(null, obj);
							});
						});
						break;
					
					case 3:
						gch.ban.getAdditionalFields(obj.tid, function (err, result) {
							if (err) return callback(err);
							
							gch.ban.serializeAdditionalFields(result, function (err, result) {
								if (err) return callback(err);
								
								obj.additional.reason = result.reason;
								obj.additional.targetUser = result.targetUser;
								
								callback(null, obj);
							});
						});
						break;
					
					case 4:
						gch.unban.getAdditionalFields(obj.tid, function (err, result) {
							if (err) return callback(err);
							
							gch.uban.serializeAdditionalFields(result, function (err, result) {
								if (err) return callback(err);
								
								obj.additional.reason = result.reason;
								obj.additional.targetUser = result.targetUser;
								
								callback(null, obj);
							});
						});
						break;
					
					default:
						callback('Wrong ticket type');
						break;
				}
			},
			function getCommentsField(obj, callback) {
				Comments.find({
					tid: obj.id
				}).exec(function (err, result) {
					if (err) return callback(err);
					
					obj.comments = result;
					
					callback(null, obj);
				});
			},
			function serializeCommentsField(obj, callback) {
				gch.comment.serializeComments(obj.comments, 1, 1, function (err, comments) {
				//gch.comment.serializeComments(obj.comments, req.user.group, req.user.id, function (err, comments) {
					if (err) return callback(err);
					
					obj.comments = comments;
					
					callback(null, obj);
				});
			},
			function getAndserializeAttachmentsField(obj, callback) {
				gcdb.appdb.query('SELECT * FROM `attachments` WHERE id IN (' + obj.attachments.join(',') + ')', function (err, attachments) {
					if (err) return callback(err);
					
					gch.attachement.serializeAttachments(attachments, function (err, attachments) {
						if (err) return callback(err);

						obj.attachments = attachments;

						callback(null, obj);
					});
				});
			}
		], function (err, obj) {
			if (err) return cb(err);
			
			cb(null, obj);
		});
	},
	
	getList: function getList(config, cb) {
		var visibility = config.visibility,
			status = config.status,
			type = config.type,
			product = config.product,
			sort = config.sort,
			user = config.user,
			query = {
				status: null,
				visibility: null,
				product: null,
				type: null,
				first: null
			},
			sortBy;

		if (!visibility && !status) {
			query.status = '`status` not in (5,6)';
		}

		if (type) {
			query.type = '`type` in (' + type + ')';
		}

		if (status) {
			query.status = '`status` in (' + status + ')';

			if (!user.current.id || user.current.group < ugroup.helper) {
				query.visibility = '`visiblity` = 1';
			}
		}

		if (visibility && user.current.id && user.current.group >= ugroup.helper) {
			if (visibility !== 3) {
				query.visibility = '`visiblity` = ' + visibility;
			}

			if (!status) {
				query.status = '`status` not in (5,6)';
			}
		}

		if (!user.current.id || user.current.group < ugroup.helper) {
			if (!visibility || visibility === 3) {
				if (user.current.id) {
					query.visibility = '(`visiblity` = 1 OR (`visiblity` = 2 AND `owner` = ' + user.current.id + '))';
				} else {
					query.visibility = '`visiblity` = 1';
				}
			}

			if (visibility === 1) {
				query.visibility = '`visiblity` = 1';
			}

			if (visibility === 2) {
				if (user.current.id) {
					query.visibility = '`visiblity` = 2 AND `owner` = "' + user.current.id + '"';
				} else {
					query.visibility = '`id` = 0';
				}
			}
		}

		if (product) {
			query.product = 'CASE WHEN (`type` = 1) THEN (`tid` in (SELECT `id` FROM `bugreport` WHERE `product` IN (' + product + '))) ELSE `id` <> 0 END';

			if (user.current.id &&
				user.current.canModerate.map(function (el) {
					if (product.indexOf(el) !== -1) {
						return true;
					} else {
						return false;
					}
				}).indexOf(false) !== -1) {
				delete query.visibility;
			}
		}

		switch (sort) {
			case 1:
				sortBy = 'id DESC';
				break;

			case 2:
				sortBy = 'updatedAt DESC';
				break;

			default:
				sortBy = 'id DESC';
				break;
		}

		sails.log.verbose('sortBy: ', sortBy);
		sails.log.verbose('query: ', query);


		if (user.id) {
			query.first = 'owner = ' + user.id;
		} else {
			query.first = 'id <> 0';
		}

		if (!user.current.id || user.current.group < ugroup.helper) {
			query.first += ' AND `status` not in (5,6)';
		}

		query = 'SELECT * FROM `ticket` WHERE ' + query.first + ((query.type) ? ' AND ' + query.type : '') + ((query.product) ? ' AND ' + query.product : '') + ((query.status) ? ' AND ' + query.status : '') + ((query.visibility) ? ' AND ' + query.visibility : '') + ' ORDER BY ' + sortBy;

		sails.log.verbose('query: ', query);

		Ticket.query(query, function (err, tickets) {
			if (err) return cb(err);

			sails.log.verbose('tickets.length: ', tickets.length);

			cb(null, tickets);
		});
	};
};


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
			return cb("Wrong ID format");
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
				gch.ticket.serializeAdditionalFields(obj, function (err, modifiedObj) {
					if (err) return callback(err);

					obj = obj;

					callback(null, obj);
				});
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
				//gch.comment.serializeComments(obj.comments, 1, 1, function (err, comments) {
				gch.comment.serializeComments(obj.comments, req.user.group, req.user.id, function (err, comments) {
					if (err) return callback(err);

					obj.comments = comments;

					callback(null, obj);
				});
			},
			function getAndSerializeAttachmentsField(obj, callback) {
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
				first: null,
				limit: null
			},
			sortBy,
			limit;

		if (!visibility && !status) {
			query.status = '`status` not in (5,6)';
		}

		if (type) {
			query.type = '`type` in (' + type + ')';
		}

		if (status) {
			query.status = '`status` in (' + status + ')';

			if (!user.current.id || user.current.group < ugroup.helper) {
				query.visibility = '`visibility` = 1';
			}
		}

		if (visibility && user.current.id && user.current.group >= ugroup.helper) {
			if (visibility !== 3) {
				query.visibility = '`visibility` = ' + visibility;
			}

			if (!status) {
				query.status = '`status` not in (5,6)';
			}
		}

		if (!user.current.id || user.current.group < ugroup.helper) {
			if (!visibility || visibility === 3) {
				if (user.current.id) {
					query.visibility = '(`visibility` = 1 OR (`visibility` = 2 AND `owner` = ' + user.current.id + '))';
				} else {
					query.visibility = '`visibility` = 1';
				}
			}

			if (visibility === 1) {
				query.visibility = '`visibility` = 1';
			}

			if (visibility === 2) {
				if (user.current.id) {
					query.visibility = '`visibility` = 2 AND `owner` = "' + user.current.id + '"';
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

		if (limit) {
			query.limit = ' LIMIT 0,' + limit;
		}

		query = 'SELECT * FROM `tickets` WHERE ' + query.first + ((query.type) ? ' AND ' + query.type : '') + ((query.product) ? ' AND ' + query.product : '') + ((query.status) ? ' AND ' + query.status : '') + ((query.visibility) ? ' AND ' + query.visibility : '') + ' ORDER BY ' + sortBy + ((query.limit) ? query.limit : '');

		sails.log.verbose('query: ', query);


		Tickets.query(query, function (err, tickets) {
			if (err) return cb(err);

			sails.log.verbose('tickets.length: ', tickets.length);

			cb(null, tickets);
		});
	},

	serializeList: function (tickets, cb) {
		async.map(tickets, function (ticket, callback) {
			async.waterfall([
				function serializeMainFields(callback) {
					ticket.type = gch.getType(ticket.type);
					ticket.visibility = gch.getVisibility(ticket.visibility);
					ticket.status = gch.getStatus(ticket.status);
					ticket.createdAt = gch.serializeTime(ticket.createdAt);

					try {
						ticket.attachments = JSON.parse(ticket.attachments);
					} catch (err) {
						return callback(err);
					}

					callback(null, ticket);
				},
				function getOwner(ticket, callback) {
					ticket.owner = {
						id: ticket.owner,
						username: null
					};

					gcdb.user.getByID(ticket.owner.id, function (err, login) {
						if (err) return callback(err);

						ticket.owner.username = login;

						callback(null, ticket);
					});
				},
				function getCommentsCount(ticket, callback) {
					Comments.count({
						tid: ticket.id
					}).exec(function (err, result) {
						if (err) return callback(err);

						ticket.comments = {
							count: result
						};

						callback(null, ticket);
					});
				},
				function serializeAdditionalFields(ticket, callback) {
					ticket.additional = {};

					gch.ticket.serializeAdditionalFields(ticket, function (err, modifiedTicket) {
						if (err) return callback(err);

						ticket = modifiedTicket;

						callback(null, ticket);
					});
				},
				function getAndSerializeAttachmentsField(ticket, callback) {
          if (!ticket.attachments.length) return callback(null, ticket);
          
					gcdb.appdb.query('SELECT * FROM `attachments` WHERE id IN (' + ticket.attachments.join(',') + ')', function (err, attachments) {
						if (err) return callback(err);

						gch.attachement.serializeAttachments(attachments, function (err, attachments) {
							if (err) return callback(err);

							ticket.attachments = attachments;

							callback(null, ticket);
						});
					});
				}
			], function (err, ticket) {
				if (err) callback(err);

				callback(null, ticket);
			});
		}, function (err, array) {
			if (err) cb(err);

			cb(null, array);
		});
	},

	serializeAdditionalFields: function serializeAdditionalFields(ticket, cb) {
		switch ((ticket.type.id) ? ticket.type.id : ticket.type) {
			case 1:
				gch.bugreport.getAdditionalFields(ticket.tid, function (err, result) {
					if (err) return cb(err);

					ticket.additional.description = result.description;
					ticket.additional.product = result.product;

					cb(null, ticket);
				});
				return;

			case 2:
				gch.rempro.getAdditionalFields(ticket.tid, function (err, result) {
					if (err) return cb(err);

					gch.rempro.serializeAdditionalFields(result, function (err, result) {
						if (err) return cb(err);

						ticket.additional.createdFor = result.createdFor;
						ticket.additional.reason = result.reason;
						ticket.additional.regions = result.regions;
						ticket.additional.stuff = result.stuff;

						cb(null, ticket);
					});
				});
				return;

			case 3:
				gch.ban.getAdditionalFields(ticket.tid, function (err, result) {
					if (err) return cb(err);

					gch.ban.serializeAdditionalFields(result, function (err, result) {
						if (err) return cb(err);

						ticket.additional.reason = result.reason;
						ticket.additional.targetUser = result.targetUser;

						cb(null, ticket);
					});
				});
				return;

			case 4:
				gch.unban.getAdditionalFields(ticket.tid, function (err, result) {
					if (err) return cb(err);

					gch.uban.serializeAdditionalFields(result, function (err, result) {
						if (err) return cb(err);

						ticket.additional.reason = result.reason;
						ticket.additional.targetUser = result.targetUser;

						cb(null, ticket);
					});
				});
				return;

			default:
				cb('Wrong ticket type');
				return;
		}
	}
};

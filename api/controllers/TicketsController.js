/**
 * TicketsController
 *
 * @module :: Controller
 * @description :: Контроллер тикетов.
 */

module.exports = {
	/* GET /api/tickets/:id */
	get: function (req, res) {
		var ticket = {
			id: parseInt(req.param('tid'), 10),
			title: null,
			type: null,
			visibility: null,
			status: null,
			owner: null,
			additional: [],
			comments: [],
			attachments: [],
			createdAt: null
		};
		
		if (ticket.id === NaN) {
			return res.badRequest("Wrong ID format");
		}
		
		async.waterfall([
			function getMainFields(callback) {
				Tickets.findOne(ticket.id).exec(function (err, result) {
					if (err) return callback(err);
					
					if (!result) return res.notFound();
					
					ticket.tid = result.tid;
					ticket.title = result.title;
					ticket.type = gch.getType(result.type);
					ticket.visibility = gch.getVisibility(result.visibility);
					ticket.status = gch.getStatus(result.status);
					ticket.owner = result.owner;
					ticket.attachments = result.attachments;
					ticket.createdAt = gch.serializeTime(result.createdAt);
					
					callback(null, ticket);
				});
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
			function getAndSerializeAdditionalField(ticket, callback) {
				switch (ticket.type.id) {
					case 1:
						gch.bugreport.getAdditionalFields(ticket.tid, function (err, result) {
							if (err) return callback(err);
								
							ticket.additional.description = result.description;
							ticket.additional.product = result.product;

							callback(null, ticket);
						});
						break;
					
					case 2:
						gch.rempro.getAdditionalFields(ticket.tid, function (err, result) {
							if (err) return callback(err);
							
							gch.rempro.serializeAdditionalFields(result, function (err, result) {
								if (err) return callback(err);
								
								ticket.additional.createdFor = result.createdFor;
								ticket.additional.reason = result.reason;
								ticket.additional.regions = result.regions;
								ticket.additional.stuff = result.stuff;

								callback(null, ticket);
							});
						});
						break;
					
					case 3:
						gch.ban.getAdditionalFields(ticket.tid, function (err, result) {
							if (err) return callback(err);
							
							gch.ban.serializeAdditionalFields(result, function (err, result) {
								if (err) return callback(err);
								
								ticket.additional.reason = result.reason;
								ticket.additional.targetUser = result.targetUser;
								
								callback(null, ticket);
							});
						});
						break;
					
					case 4:
						gch.unban.getAdditionalFields(ticket.tid, function (err, result) {
							if (err) return callback(err);
							
							gch.uban.serializeAdditionalFields(result, function (err, result) {
								if (err) return callback(err);
								
								ticket.additional.reason = result.reason;
								ticket.additional.targetUser = result.targetUser;
								
								callback(null, ticket);
							});
						});
						break;
					
					default:
						callback('Wrong ticket type');
						break;
				}
			},
			function getCommentsField(ticket, callback) {
				Comments.find({
					tid: ticket.id
				}).exec(function (err, result) {
					if (err) return callback(err);
					
					ticket.comments = result;
					
					callback(null, ticket);
				});
			},
			function serializeCommentsField(ticket, callback) {
				gch.comment.serializeComments(ticket.comments, req.user.group, req.user.id, function (err, comments) {
					if (err) return callback(err);
					
					ticket.comments = comments;
					
					callback(null, ticket);
				});
			},
			function getAndSerializeAttachmentsField(ticket, callback) {
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
			if (err) return res.serverError(err);
			
			sails.log.verbose('-> Tickets.get: ticket: \n', ticket);
			
			res.view('tickets/view/view_' + ticket.type.name, {
				ticket: ticket
			});
		});
	},
	
	getTest: function (req, res) {
		res.view('tickets/view/view_bugreport', {
			ticket: {
				id: 0,
				title: 'Testificate',
				owner: {
					username: 'nzh'
				},
				createdAt: {
					pretty: '2 минуты назад'
				},
				additional: {
					product: {
						name: 'Игровой сервер'
					},
					description: 'Длинное нудное описание'
				},
				status: {
					name: 'new'
				},
				attachments: {
					images: [
						{
							id: 1,
							src: 'http://www.sunny-cat.ru/datas/users/1-daniel004.jpg',
							description: 'Милый котёнок'
						}
					],
					logs: [
						{
							id: 2,
							data: 'long text',
							description: 'Лог краша клиента'
						}
					]
				},
				comments: [
					{
						id: 1,
						author: {
							username: 'Rena4ka'
						},
						message: 'tset',
						status: {
							name: 'accepted',
						},
						createdAt: {
							pretty: '2 минуты назад'
						}
					}
				]
			}
		});
		
	},
	
	/* GET /api/tickets */
	list: function (req, res) {
		// GET /tickets?cake=isalie&visibility=1&status=1,5,10&product=1&type=3
		var sort = parseInt(req.param('sort'), 10),
			visibility = parseInt(req.param('visibility'), 10),
			/* On input: '1,2,3' on output: [1, 2, 3]
				'1,g,3' -> [1, NaN, 3] */
			status = ((req.param('status')) ? req.param('status').split(',').map(function (el) {
				el = parseInt(el, 10);
				if (el && (1 >= el <= 12)) {
					return parseInt(el, 10);
				} else {
					return;
				}
			}) : null),
			statusJoined = (status) ? status.join(',') : null,
			product = ((req.param('product')) ? req.param('product').split(',').map(function (el) {
				el = parseInt(el, 10);
				if (el && [1,2,5].indexOf(el) !== -1) {
					return parseInt(el, 10);
				} else {
					return;
				}
			}) : null),
			productJoined = (product) ? product.join(',') : null,
			type = ((req.param('type')) ? req.param('type').split(',').map(function (el) {
				el = parseInt(el, 10);
				if (el && (1 >= type <= 4)) {
					return el;
				} else {
					return;
				}
			}) : null),
			typeJoined = (type) ? type.join(',') : null,
			currentPage = parseInt(req.param('param'), 10) || ((req.param('page')) ? parseInt(req.param('page'), 10) : 1),
			user = {
				current: {
					id: (req.user) ? req.user.id : null,
					group: (req.user) ? req.user.group : null,
					canModerate: (req.user) ? req.user.canModerate : null
				}
			};

		sails.log.verbose('visibility: ', visibility);
		sails.log.verbose('req.param(\'visibility\'): ', req.param('visibility'));
		sails.log.verbose('sort: ', sort);
		sails.log.verbose('req.param(\'sort\'): ', req.param('sort'));
		sails.log.verbose('status: ', status);
		sails.log.verbose('req.param(\'status\'): ', req.param('status'));
		sails.log.verbose('product: ', product);
		sails.log.verbose('req.param(\'product\'): ', req.param('product'));
		sails.log.verbose('type: ', type);
		sails.log.verbose('req.param(\'type\'): ', req.param('type'));
		sails.log.verbose('user: ', user);

		/* Check and convert data */


		if (sort && !(1 >= sort <= 2)) {
			return res.badRequest();
		}

		if (visibility && !(1 >= visibility <= 3)) {
			return res.badRequest();
		}

		// Undefined = Wrong input
		if ((status && status.indexOf(undefined) !== -1) || (product && product.indexOf(undefined) !== -1) || (type && type.indexOf(undefined) !== -1)) {
			return res.badRequest();
		}

		/* Perform user-specific checks */
		if (status && (status.indexOf(5) !== -1 || status.indexOf(6) !== -1) && (!req.user || req.user.group < ugroup.helper)) {
			return res.forbidden();
		}

		async.waterfall([
			function findTickets(callback) {
				gch.ticket.getList({
					visibility: visibility,
					status: statusJoined,
					type: typeJoined,
					product: productJoined,
					sort: sort,
					user: user
				}, function (err, tickets) {
					if (err) return callback(err);

					callback(null, tickets);
				});
			},
			function viewTickets(tickets, callback) {
				var lastPage = Math.ceil(tickets.length / 20);
				var skipRows = (currentPage - 1) * 20;

				sails.log.verbose('lastPage: ', lastPage);
				sails.log.verbose('skipRows: ', skipRows);

				if (tickets.length <= skipRows) {
					return res.view('tickets/list/list_notickets', {
						type: (type) ? type : [],
						product: (product) ? product : [],
						status: (status) ? status : [],
						sort: sort,
						visibility: visibility
					});
				}

				tickets = tickets.slice(skipRows, skipRows + 20);

				var query = (req.originalUrl.split('?')[1]) ? '?' + req.originalUrl.split('?')[1] : '';

				gch.ticket.serializeList(tickets, function (err, result) {
					if (err) return callback(err);

					res.view('tickets/list/list', {
						tickets: result,
						lastPage: lastPage,
						currentPage: currentPage,
						query: query,
						type: (type) ? type : [],
						product: (product) ? product : [],
						status: (status) ? status : [],
						sort: sort,
						visibility: visibility
					});

					callback(null, result);
				});
			}
		], function (err) {
			if (err) {
				if (err.msg) {
					return res.json({
						err: err.msg
					});
				}
				return res.serverError(err);
			}
		});
	},
	
	/* POST /api/tickets/:id */
	create: function (req, res) {
		
	},
	
	/* PATCH /api/tickets/:id */
	edit: function (req, res) {
		
	},
	
	/* DELETE /api/tickets/:id */
	delete: function (req, res) {
		
	}
};

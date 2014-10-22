/**
 * ListController
 *
 * @module :: Controller
 * @description :: Вывод списков тикетов.
 */

module.exports = {

	listTwenty: function (req, res) {
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
			sortBy,
			query = {
				status: null,
				visibility: null,
				product: null
			},
			currentPage = parseInt(req.param('param'), 10) || ((req.param('page')) ? parseInt(req.param('page'), 10) : 1);

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
				if (!visibility && !status) {
					query.status = '`status` not in (5,6)';
				}
				if (type) {
					query.type = '`type` in (' + typeJoined + ')';
				}
				if (status) {
					query.status = '`status` in (' + statusJoined + ')';

					if (!req.user || req.user.group < ugroup.helper) {
						query.visibility = '`visiblity` = 1';
					}
				}
				if (visibility && req.user && req.user.group >= ugroup.helper) {
					if (visibility !== 3) {
						query.visibility = '`visiblity` = ' + visibility;
					}

					if (!status) {
						query.status = '`status` not in (5,6)';
					}
				}
				if (!req.user || req.user.group < ugroup.helper) {
					if (!visibility || visibility === 3) {
						if (req.user) {
							query.visibility = '(`visiblity` = 1 OR (`visiblity` = 2 AND `owner` = ' + req.user.id + '))';
						} else {
							query.visibility = '`visiblity` = 1';
						}
					}
					if (visibility === 1) {
						query.visibility = '`visiblity` = 1';
					}
					if (visibility === 2) {
						if (req.user) {
							query.visibility = '`visiblity` = 2 AND `owner` = "' + req.user.id + '"';
						} else {
							query.visibility = '`id` = 0';
						}
					}
				}
				if (product) {
					query.product = 'CASE WHEN (`type` = 1) THEN (`tid` in (SELECT `id` FROM `bugreport` WHERE `product` IN (' + productJoined + '))) ELSE `id` <> 0 END';

					if (req.user &&
						req.user.canModerate.map(function (el) {
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

				query = 'SELECT * FROM `ticket` WHERE id <> 0' + ((query.type) ? ' AND ' + query.type : '') + ((query.product) ? ' AND ' + query.product : '') + ((query.status) ? ' AND ' + query.status : '') + ((query.visibility) ? ' AND ' + query.visibility : '') + ' ORDER BY ' + sortBy;

				sails.log.verbose('query: ', query);

				Ticket.query(query, function (err, tickets) {
					if (err) return callback(err);

					sails.log.verbose('tickets.length: ', tickets.length);

					callback(null, tickets);
				});
			},
			function viewTickets(tickets, callback) {
				var lastPage = Math.ceil(tickets.length / 20);
				var skipRows = (currentPage - 1) * 20;

				sails.log.verbose('lastPage: ', lastPage);
				sails.log.verbose('skipRows: ', skipRows);

				if (tickets.length <= skipRows) {
					return res.view('list/notickets', {
						type: (type) ? type : [],
						product: (product) ? product : [],
						status: (status) ? status : [],
						sort: sort,
						visibility: visibility
					});
				}

				tickets = tickets.slice(skipRows, skipRows + 20);

				var query = (req.originalUrl.split('?')[1]) ? '?' + req.originalUrl.split('?')[1] : '';

				gct.all.serializeList(tickets, function (err, result) {
					if (err) return callback(err);

					res.view('list/main', {
						moment: moment,
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

					callback(null);
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

	redirect: function (req, res) {
		res.redirect('/tickets');
	}
};

/**
 * ListController
 *
 * @module :: Controller
 * @description :: Вывод списков тикетов.
 */

var moment = require('moment');

module.exports = {

	listTwenty: function (req, res) {
		moment.lang((req.user) ? req.user.locale : sails.userLocale);

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
				gct.getList({
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

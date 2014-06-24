/**
 * ListController
 *
 * @module :: Controller
 * @description :: Вывод списков тикетов.
 */

module.exports = {

	listTwenty: function (req, res) {
		sails.log.verbose('-> ListController.listTwenty:');

		// splitedPath = ['','bugreports','main','1'];
		var splitedPath = req.path.split('/');

		sails.log.verbose('splitedPath:', splitedPath);

		if (typeof(parseInt(splitedPath[2], 10)) === 'string' && splitedPath[1] === 'bugreports') {
			return this.listByProduct(req, req);
		} else if (typeof(parseInt(splitedPath[2], 10)) === 'string' && splitedPath[1] !== 'bugreports') {
			return res.notFound();
		}

		var findBy = {},
			whereBy = {},
			filterBy = {},
			filterByStatus = gct.getStatusByClass(req.query.status),
			filterByNoStatus = gct.getStatusByClass(req.query.nostatus),
			filterByVisibility = gct.getVisibilityByClass(req.query.visibility),
			currentPage = parseInt(req.param('param'), 10) || 1,
			sortBy;

		sails.log.verbose('currentPage:', currentPage);
		sails.log.verbose('filterByStatus:', filterByStatus);
		sails.log.verbose('filterByNoStatus:', filterByNoStatus);
		sails.log.verbose('filterByVisibility:', filterByVisibility);

		if (filterByStatus) {
			filterBy.status = filterByStatus
		}

		if (filterByNoStatus) {
			filterBy.nostatus = filterByNoStatus
		}

		if (filterByVisibility) {
			filterBy.visibility = filterByVisibility
		}

		if ((filterBy.visibility === 5 || filterBy.visibility === 6) && (!req.user || req.user.group < ugroup.mod)) {
			return res.json({
				status: 'err'
			});
		}

		/* Set findBy criteria for sections */
		switch (splitedPath[1]) {
			case 'all':
				break;

			case 'bugreports':
				findBy.type = 1;
				break;

			case 'rempros':
				findBy.type = 2;
				break;

			default:
				return res.notFound();
		}

		var type = gct.serializeList(splitedPath[1]);

		sails.log.verbose('type: ', type);

		async.waterfall([
			function checkData(callback) {
				if ((filterBy === 5 || filterBy === 6) && (!req.user || req.user.group < ugroup.helper)) {
					return res.forbidden()
				}

				callback(null);
			},
			function findTickets(callback) {
				if (!filterBy.visibility && !filterBy.status) {
					whereBy = {
						status: {
							'!': 5,
							'!': 6
						}
					};

					if (!findBy.owner && (!req.user || req.user.group < ugroup.helper)) {
						findBy.visiblity = 1;
					}
				}
				if (filterBy.status) {
					findBy.status = filterBy.status;

					if (!findBy.owner && (!req.user || req.user.group < ugroup.helper)) {
						findBy.visiblity = 1;
					}
				}
				if (filterBy.nostatus) {
					whereBy = {
						status: {
							'!': 5,
							'!': 6,
							'!': filterBy.nostatus
						}
					};
				}
				if (filterBy.visibility && req.user && req.user.group >= ugroup.helper) {
					findBy.visiblity = filterBy.visibility;

					if (!filterByStatus) {
						whereBy = {
							status: {
								'!': 5,
								'!': 6
							}
						};
					}
				}

				sails.log.verbose('findBy: ', findBy);
				sails.log.verbose('whereBy: ', whereBy);

				if (req.param('byModifed')) {
					sortBy = 'updatedAt DESC';
				} else {
					sortBy = 'id DESC';
				}

				sails.log.verbose('sortBy:', sortBy);

				Ticket.find(findBy)
					.where(whereBy)
					.sort(sortBy)
					.done(function (err, tickets) {
						if (err) return callback(err);

						sails.log.verbose('tickets.length: ', tickets.length);

						callback(null, tickets);
					});
			},
			function viewTickets(tickets, callback) {
				var lastPage =  Math.ceil(tickets.length / 20);
				var skipRows = (currentPage - 1) * 20;

				sails.log.verbose('lastPage: ', lastPage);
				sails.log.verbose('skipRows: ', skipRows);

				if (tickets.length <= skipRows) {
					return res.view('list/notickets',{
						type: type
					});
				}

				tickets = tickets.slice(skipRows, skipRows + 20);

				var query = (req.originalUrl.split('?')[1]) ? '?' + req.originalUrl.split('?')[1] : '';

				gct.all.serializeList(tickets, function (err, result) {
					if (err) return callback(err);

					res.view('list/main',{
						type: type,
						moment: moment,
						tickets: result,
						lastPage: lastPage,
						currentPage: currentPage,
						query: query
					});

					callback(null);
				});
			}
		],
		function (err) {
			if (err) {
				if (err.msg) {
					return res.json({
						err: err.msg
					});
				}
				throw err;
			}
		});
	},

	listByProduct: function (req, res) {
		sails.log.verbose('-> ListController.listByProduct:');

		// splitedPath = ['','bugreports','main','1'];
		var splitedPath = req.path.split('/');

		sails.log.verbose('splitedPath:', splitedPath);

		var findBy = {},
			filterBy = {},
			filterByStatus = gct.getStatusByClass(req.query.status),
			filterByNoStatus = gct.getStatusByClass(req.query.nostatus),
			filterByVisibility = gct.getVisibilityByClass(req.query.visibility),
			currentPage = parseInt(req.param('page'), 10) || 1,
			currentSubSectionId = gct.getProductByTechId(splitedPath[2])[id];

		sails.log.verbose('currentPage:', currentPage);
		sails.log.verbose('filterByStatus:', filterByStatus);
		sails.log.verbose('filterByNoStatus:', filterByNoStatus);
		sails.log.verbose('filterByVisibility:', filterByVisibility);


		/* Set filters */
		if (filterByStatus) {
			filterBy.status = filterByStatus
		}

		if (filterByNoStatus) {
			filterBy.nostatus = filterByNoStatus
		}

		if (filterByVisibility) {
			filterBy.visibility = filterByVisibility
		}

		if ((filterBy.visibility === 5 || filterBy.visibility === 6) && (!req.user || req.user.group < ugroup.helper)) {
			return res.json({
				status: 'err'
			});
		}

		// this controller only for bugreports now.
		findBy.type = 1;

		var type = gct.serializeList(splitedPath[1]);

		sails.log.verbose('type: ', type);

		async.waterfall([
			function checkData(callback) {
				if ((filterBy === 5 || filterBy === 6) && (!req.user || req.user.group < ugroup.helper)) {
					return res.forbidden()
				}

				callback(null);
			},
			function findTickets(callback) {
				var whereBy = {};
				if (!filterBy.visibility && !filterBy.status) {
					whereBy = {
						status: {
							'!': 5,
							'!': 6
						}
					};

					if (!findBy.owner && (!req.user || req.user.group < ugroup.helper)) {
						findBy.visiblity = 1;
					}
				}
				if (filterBy.status) {
					findBy.status = filterBy.status;

					if (!findBy.owner && (!req.user || req.user.group < ugroup.helper)) {
						findBy.visiblity = 1;
					}
				}
				if (filterBy.nostatus) {
					whereBy = {
						status: {
							'!': 5,
							'!': 6,
							'!': filterBy.nostatus
						}
					};
				}
				if (filterBy.visibility && req.user && req.user.group >= ugroup.helper) {
					findBy.visiblity = filterBy.visibility;

					if (!filterByStatus) {
						whereBy = {
							status: {
								'!': 5,
								'!': 6
							}
						};
					}
				}

				sails.log.verbose('findBy: ', findBy);
				sails.log.verbose('whereBy: ', whereBy);

				Ticket.find(findBy)
					.where(whereBy)
					.sort('id DESC')
					.done(function (err, tickets) {
						if (err) return callback(err);

						sails.log.verbose('tickets.length: ', tickets.length);

						callback(null, tickets);
					});
			},
			function viewTickets(tickets, callback) {
				var lastPage =  Math.ceil(tickets.length / 20);
				var skipRows = (currentPage - 1) * 20;

				sails.log.verbose('lastPage: ', lastPage);
				sails.log.verbose('skipRows: ', skipRows);

				if (tickets.length <= skipRows) {
					return res.notFound();
				}

				tickets = tickets.slice(skipRows, skipRows + 20);

				var query = (req.originalUrl.split('?')[1]) ? '?' + req.originalUrl.split('?')[1] : '';

				gct.all.serializeList(tickets, serializeOptions, function (err, result) {
					if (err) return callback(err);

					res.view('list/main',{
						type: type,
						moment: moment,
						tickets: result,
						lastPage: lastPage,
						currentPage: currentPage,
						query: query
					});

					callback(null);
				});
			}
		],
		function (err) {
			if (err) {
				if (err.msg) {
					return res.json({
						err: err.msg
					});
				}
				throw err;
			}
		});
	}
};

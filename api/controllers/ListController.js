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

		if (splitedPath[2] && isNaN(splitedPath[2], 10) && splitedPath[1] !== 'bugreports') {
			return res.notFound();
		}

		var findBy = {},
			whereBy = {},
			filterBy = {},
			filterByStatus = gct.getStatusByClass(req.query.status),
			filterByNoStatus = gct.getStatusByClass(req.query.nostatus),
			filterByVisibility = gct.getVisibilityByClass(req.query.visibility),
			currentPage = parseInt(req.param('param'), 10) || 1,
			currentSubSectionId = (splitedPath[2] && isNaN(splitedPath[2], 10) && splitedPath[1] === 'bugreports') ? gct.getProductByTechText(splitedPath[2]).id : null,
			sortBy,
			query = {
				status: null,
				visibility: null
			};

		sails.log.verbose('currentPage:', currentPage);
		sails.log.verbose('currentSubSectionId:', currentSubSectionId);
		sails.log.verbose('filterByStatus:', filterByStatus);
		sails.log.verbose('filterByNoStatus:', filterByNoStatus);
		sails.log.verbose('filterByVisibility:', filterByVisibility);

		if (filterByStatus) {
			filterBy.status = filterByStatus;
		}

		if (filterByNoStatus) {
			filterBy.nostatus = filterByNoStatus;
		}

		if (filterByVisibility) {
			filterBy.visibility = filterByVisibility;
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
				if (!filterBy.visibility && !filterBy.status && !filterBy.nostatus) {
					whereBy = {
						status: {
							'!': 5,
							'!': 6
						}
					};

					query.status = '`status` not in (5,6)';

					if (!findBy.owner && (!req.user || req.user.group < ugroup.helper)) {
						findBy.visiblity = 1;

						query.visibility = '`visiblity` = 1';
					}
				}
				if (filterBy.status) {
					findBy.status = filterBy.status;

					query.status = '`status` = ' + filterBy.status;

					if (!findBy.owner && (!req.user || req.user.group < ugroup.helper)) {
						findBy.visiblity = 1;

						query.visibility = '`visiblity` = 1';
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

					query.status = '`status` not in (5,6,' + filterBy.nostatus + ')';
				}
				if (filterBy.visibility && req.user && req.user.group >= ugroup.helper) {
					findBy.visiblity = filterBy.visibility;

					query.visibility = '`visiblity` = ' + filterBy.visibility;

					if (!filterByStatus) {
						whereBy = {
							status: {
								'!': 5,
								'!': 6
							}
						};

						query.status ='`status` not in (5,6)';
					}
				}

				sails.log.verbose('findBy: ', findBy);
				sails.log.verbose('whereBy: ', whereBy);

				if (req.param('byCreation')) {
					sortBy = 'id DESC';
				} else {
					sortBy = 'updatedAt DESC';
				}

				sails.log.verbose('sortBy:', sortBy);
				sails.log.verbose('query: ', query);

				if (currentSubSectionId) {
					if (req.user && req.user.canModerate.indexOf(currentSubSectionId) !== -1) {
						delete query.visibility;
					}

					query = 'SELECT * FROM `ticket` WHERE `type` = 1 AND `tid` in (SELECT `id` FROM `bugreport` WHERE `product` = ' + currentSubSectionId + ')' + ((query.status) ? ' AND ' + query.status : '') + ((query.visibility) ? ' AND ' + query.visibility : '') + ' ORDER BY ' + sortBy + ' LIMIT 20';

					sails.log.verbose('query: ', query);

					Ticket.query(query, function (err, tickets) {
							if (err) return callback(err);

							sails.log.verbose('tickets.length: ', tickets.length);

							callback(null, tickets);
						});
				} else {
					Ticket.find(findBy)
						.where(whereBy)
						.sort(sortBy)
						.done(function (err, tickets) {
							if (err) return callback(err);

							sails.log.verbose('tickets.length: ', tickets.length);

							callback(null, tickets);
						});
				}
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
	}
};

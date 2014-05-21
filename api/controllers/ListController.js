/**
 * ListController
 *
 * @module :: Controller
 * @description :: Вывод списков тикетов.
 */

module.exports = {

	listNewest: function (req, res) {
		var findBy = {},
			filterBy = gct.getStatusByClass(req.param('filter'));

		if (filterBy) {
			filterBy = {
				status: filterBy
			}
		} else {
			filterBy = {
				visibility: gct.getVisibilityByClass(req.param('filter'))
			}
		}

		if ((filterBy.visibility === 5 || filterBy.visibility === 6) && (!req.user || req.user.group < ugroup.mod)) {
			return res.json({
				status: 'err'
			});
		}

		var splitedPath = req.path.split('/');

		switch (splitedPath[1]) {
			case 'all':
				break;

			case 'my':
				findBy.owner = req.user.id;
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

		var whereBy = {};
		if (!filterBy.visibility && !filterBy.status) {
			whereBy = {
				status: {
					'!': 5,
					'!': 6
				}
			};

			if (req.user && req.user.group === ugroup.helper) {
				whereBy = {
					status: {
						'!': 6
					}
				};
			}

			if (req.user && req.user.group >= ugroup.mod) {
				whereBy = {};
			}

			if (!findBy.owner && (!req.user || req.user.group <= ugroup.mod)) {
				findBy.visiblity = 1;
			}
		} else if (filterBy.status) {
			findBy.status = filterBy.status;

			if (!findBy.owner && (!req.user || req.user.group <= ugroup.mod)) {
				findBy.visiblity = 1;
			}
		} else if (filterBy.visibility && req.user && req.user.group >= ugroup.mod) {
			findBy.visiblity = filterBy.visibility;

			whereBy = {
				status: {
					'!': 5,
					'!': 6
				}
			};

			if (req.user && req.user.group === ugroup.helper) {
				whereBy = {
					status: {
						'!': 6
					}
				};
			}

			if (req.user && req.user.group >= ugroup.mod) {
				whereBy = {};
			}
		} else {
			res.notFound();
			return;
		}

		Ticket.find(findBy)
			.where(whereBy)
			.sort('id DESC')
			.limit(20)
			.done(function (err, tickets) {
				if (err) throw err;

				gct.all.serializeList(tickets, function (err, result) {
					if (err) throw err;

					res.json(result);
				});
			});
	},

	list20: function (req, res) {
		var findBy = {},
			filterBy = gct.getStatusByClass(req.param('filter'));

		if (filterBy) {
			filterBy = {
				status: filterBy
			}
		} else {
			filterBy = {
				visibility: gct.getVisibilityByClass(req.param('filter'))
			}
		}

		if ((filterBy.visibility === 5 || filterBy.visibility === 6) && (!req.user || req.user.group < ugroup.mod)) {
			return res.json({
				status: 'err'
			});
		}

		var splitedPath = req.path.split('/');

		switch (splitedPath[1]) {
			case 'all':
				break;

			case 'my':
				findBy.owner = req.user.id;
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

		async.waterfall([
			function checkData(callback) {
				if (isNaN(parseInt(req.param('page'), 10))) {
					return callback({
						msg: 'Wrong page'
					})
				}

				if ((filterBy === 5 || filterBy === 6) && (!req.user || req.user.group < ugroup.mod)) {
					return callback({
						msg: 'Don\'t have rights for this list'
					});
				}

				if (!req.param('lastelement') || req.param('lastelement') === '') {
					callback({
						msg: 'Can\'t find last element date!'
					});
				} else {
					callback(null, req.param('lastelement'));
				}
			},
			function getNumOfIDs(lastElementDate, callback) {
				var query;
				if (req.user && req.user.group >= ugroup.staff) {
					if (findBy.type) {
						query = 'SELECT type, count(*) as count from ticket where type = ' + findBy.type;
					} else if (findBy.owner) {
						query = 'SELECT type, count(*) as count from ticket where owner = ' + findBy.owner;
					} else {
						query = 'SELECT count(*) as count from ticket'
					}

					Ticket.query(query, function (err, result) {
						if (err) return callback(err);

						callback(null, lastElementDate, result[0].count);
					});
				} else {
					if (!findBy.owner) findBy.visiblity = 1;
					if (findBy.type) {
						query = 'SELECT type, count(*) as count from ticket where visiblity = 1, type = ' + findBy.type;
					} else if (findBy.owner) {
						query = 'SELECT type, count(*) as count from ticket where owner = ' + findBy.owner;
					} else {
						query = 'SELECT count(*) as count from ticket where visiblity = 1'
					}

					Ticket.query(query, function (err, result) {
						if (err) return callback(err);

						callback(null, lastElementDate, result.count);
					});
				}
			},
			function findTickets(lastElementDate, tableSize, callback) {
				skipRows = (parseInt(req.param('page'), 10) - 1) * 20;
				if (tableSize <= skipRows) {
					return res.json({
						err: 'no more tickets'
					});
				}

				var whereBy = {};
				if (!filterBy.visibility && !filterBy.status) {
					whereBy.createdAt = {
						'<': lastElementDate
					}
					whereBy.status = {
						'!': 5,
						'!': 6
					}

					if (req.user && req.user.group === ugroup.helper) {
						whereBy.status = {
							'!': 6
						}
					}

					if (req.user && req.user.group >= ugroup.mod) {
						delete whereBy.status;
					}

					if (!findBy.owner && (!req.user || req.user.group <= ugroup.mod)) {
						findBy.visiblity = 1;
					}
				} else if (filterBy.status) {
					findBy.status = filterBy.status;

					if (!findBy.owner && (!req.user || req.user.group <= ugroup.mod)) {
						findBy.visiblity = 1;
					}
				} else if (filterBy.visibility && req.user && req.user.group >= ugroup.mod) {
					findBy.visiblity = filterBy.visibility;

					whereBy.createdAt = {
						'<': lastElementDate
					}
					whereBy.status = {
						'!': 5,
						'!': 6
					}

					if (req.user && req.user.group === ugroup.helper) {
						whereBy.createdAt = {
							'<': lastElementDate
						}
						whereBy.status = {
							'!': 6
						}
					}

					if (req.user && req.user.group >= ugroup.mod) {
						whereBy = {
							createdAt: {
								'<': lastElementDate
							}
						};
					}
				} else {
					res.notFound();
					return;
				}

				Ticket.find(findBy)
					.where(whereBy)
					.sort('id ASC')
					.limit(skipRows)
					.sort('id DESC')
					.done(function (err, tickets) {
						if (err) return callback(err);

						gct.all.serializeList(tickets, function (err, result) {
							if (err) return callback(err);

							res.json(result);
						});
					});
			}
		],
		function (err) {
			if (err) {
				if (err.msg) {
					return res.json({
						err: 'Некорретный запрос'
					});
				}
				throw err;
			}
		});
	},

	listAllTpl: function (req, res) {
		text = 'Все тикеты';
		res.view('list/main', {
			type: {
				url: 'all',
				text: text,
				iconclass: 'reorder'
			},
			title: 'Список всех тикетов — GC.Поддержка'
		})
	},

	listMyTpl: function (req, res) {
		text = 'Ваши тикеты';
		res.view('list/main', {
			type: {
				url: 'my',
				text: text,
				iconclass: 'user'
			},
			title: 'Список Ваших тикетов — GC.Поддержка'
		})
	},

	listNewestMy: function (req, res) {
		var findBy,
			filterBy = gct.getStatusByClass(req.param('filter'));

		if (filterBy) {
			findBy = {
				owner: req.user.id,
				status: filterBy
			};
		} else {
			findBy = {
				owner: req.user.id
			};
		}

		Ticket.find(findBy)
			.sort('id DESC')
			.limit(20)
			.done(function (err, tickets) {
				if (err) throw err;
				gct.all.serializeList(tickets, function (err, result) {
					res.json(result);
				});
			});
	},

	list20My: function (req, res) {
		var findBy,
			filterBy = gct.getStatusByClass(req.param('filter'));

		async.waterfall([
			function checkLastElementDate(callback) {
				if (!req.param('lastelement') || req.param('lastelement') === '') {
					callback({
						msg: 'Can\'t find last element date!'
					});
				} else {
					callback(null, req.param('lastelement'));
				}
			},
			function getNumOfIDs(lastElementDate, callback) {
				if (filterBy) {
					findBy = {
						owner: req.user.id,
						status: filterBy
					};
				} else {
					findBy = {
						owner: req.user.id
					};
				}

				Ticket.find(findBy)
					.sort('id DESC')
					.limit(1)
					.done(function (err, latestElement) {
						if (err) return callback(err);

						callback(null, lastElementDate, latestElement[0].id);
					});
			},
			function findTickets(lastElementDate, tableSize, callback) {
				skipRows = (req.param.page - 1) * 20;
				if (tableSize <= skipRows) {
					return res.json({
						err: 'no more tickets'
					});
				}

				if (filterBy) {
					findBy = {
						owner: req.user.id,
						status: filterBy
					};
				} else {
					findBy = {
						owner: req.user.id
					};
				}

				Ticket.find(findBy)
					.where({
						createdAt: {
							'<': lastElementDate
						}
					})
					.sort('id ASC')
					.limit(skipRows)
					.sort('id DESC')
					.done(function (err, tickets) {
						if (err) return callback(err);

						gct.all.serializeList(tickets, function (err, result) {
							if (err) return callback(err);

							res.json(result);
						});
					});
			}
		],
		function (err) {
			if (err) {
				if (err.msg) {
					return res.json({
						err: 'Некорретный запрос'
					});
				}
				throw err;
			}
		});
	},

	listBugreportTpl: function listBugreport(req, res) {
		text = 'Баг-репорты';
		res.view('list/main', {
			type: {
				url: 'bugreports',
				text: text,
				iconclass: 'bug'
			},
			title: 'Список баг-репортов — GC.Поддержка'
		})
	},

	listNewestBugreport: function (req, res) {
		var findBy,
			filterBy = gct.getStatusByClass(req.param('filter'));

		if (req.user && req.user.group >= ugroup.staff) {
			if (filterBy) {
				findBy = {
					type: 1,
					status: filterBy
				};
			} else {
				findBy = {
					type: 1
				};
			}

			Ticket.find({
				type: 1
			}).sort('id DESC')
				.limit(20)
				.done(function (err, tickets) {
					if (err) throw err;

					gct.bugreport.serializeList(tickets, function (err, result) {
						res.json(result);
					});
				});
		} else {
			if (filterBy) {
				findBy = {
					type: 1,
					visiblity: 1,
					status: filterBy
				};
			} else {
				findBy = {
					type: 1,
					visiblity: 1
				};
			}

			Ticket.find(findBy).sort('id DESC')
				.limit(20)
				.done(function (err, tickets) {
					if (err) throw err;

					gct.bugreport.serializeList(tickets, function (err, result) {
						res.json(result);
					});
				});
		}
	},

	listRemproTpl: function (req, res) {
		text = 'Удаление защит';
		res.view('list/main', {
			type: {
				url: 'rempros',
				text: text,
				iconclass: 'remove'
			},
			title: 'Список заявок на удаление защит — GC.Поддержка'
		})
	},

	listBanTpl: function (req, res) {
		text = 'Баны';
		res.view('list/main', {
			type: {
				url: 'bans',
				text: text,
				iconclass: 'ban circle'
			},
			title: 'Список заявок на бан — GC.Поддержка'
		})
	},

	listNewestBan: function (req, res) {
		if (req.user && req.user.group >= ugroup.staff) {
			Ticket.find({
				type: 3
			})
				.sort('id DESC')
				.limit(20)
				.done(function (err, tickets) {
					if (err) throw err;

					gct.ban.serializeList(tickets, function (err, result) {
						if (err) throw err;

						res.json(result);
					});
				});
		} else {
			Ticket.find({
				type: 3,
				visiblity: 1
			})
				.sort('id DESC')
				.limit(20)
				.done(function (err, tickets) {
					if (err) throw err;

					gct.ban.serializeList(tickets, function (err, result) {
						if (err) throw err;

						res.json(result);
					});
				});
		}
	},

	list20Ban: function (req, res) {
		async.waterfall([

			function checkLastElementDate(callback) {
					if (!req.param('lastelement') || req.param('lastelement') === '') {
						callback({
							msg: 'Can\'t find last element date!'
						});
					} else {
						callback(null, req.param('lastelement'));
					}
			},
			function getNumOfIDs(lastElementDate, callback) {
					if (req.user && req.user.group >= ugroup.staff) {
						Ticket.find({
							type: 3
						})
							.sort('id DESC')
							.limit(1)
							.done(function (err, latestElement) {
								if (err) return callback(err);

								callback(null, lastElementDate, latestElement[0].id);
							});
					} else {
						Ticket.find({
							type: 3,
							visiblity: 1
						})
							.sort('id DESC')
							.limit(1)
							.done(function (err, latestElement) {
								if (err) return callback(err);

								callback(null, lastElementDate, latestElement[0].id);
							});
					}
			},
			function findTickets(lastElementDate, tableSize, callback) {
					skipRows = (req.param.page - 1) * 20;
					if (tableSize <= skipRows) {
						return res.json({
							err: 'no more tickets'
						});
					}

					Ticket.find({
						type: 3
					})
						.where({
							createdAt: {
								'<': lastElementDate
							}
						})
						.sort('id ASC')
						.limit(skipRows)
						.sort('id DESC')
						.done(function (err, tickets) {
							if (err) return callback(err);

							gct.all.serializeList(tickets, function (err, result) {
								if (err) return callback(err);

								res.json(result);
							});
						});
			}
		],
			function (err) {
				if (err) {
					if (err.msg) {
						return res.json({
							err: 'Некорретный запрос'
						});
					}
					throw err;
				}
			});
	},

	listUnbanTpl: function (req, res) {
		text = 'Разбаны';
		res.view('list/main', {
			type: {
				url: 'unbans',
				text: text,
				iconclass: 'circle blank'
			}
		})
	},

	listRegenTpl: function (req, res) {
		text = 'Регены';
		res.view('list/main', {
			type: {
				url: 'regens',
				text: text,
				iconclass: 'leaf'
			}
		})
	},

	listAdmreqTpl: function (req, res) {
		text = 'Обращения к администрации';
		res.view('list/main', {
			type: {
				url: 'admreq',
				text: text,
				iconclass: 'briefcase'
			}
		})
	}
};

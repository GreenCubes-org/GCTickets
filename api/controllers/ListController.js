/**
 * ListController
 *
 * @module :: Controller
 * @description :: Вывод списков тикетов.
 */

module.exports = {

	listAllTpl: function (req, res) {
		text = 'Все тикеты';
		res.view('list/list', {
			type: {
				url: 'all',
				text: text,
				iconclass: 'reorder'
			}
		})
	},

	listNewestAll: function (req, res) {
		if (req.user && req.user.group >= ugroup.staff) {
			Ticket.find()
				.sort('id DESC')
				.limit(20)
				.done(function (err, tickets) {
					if (err) throw err;

					gct.all.serializeList(tickets, function (err, result) {
						res.json(result);
					});
				});
		} else {
			Ticket.find({
				visiblity: 1
			})
				.sort('id DESC')
				.limit(20)
				.done(function (err, tickets) {
					if (err) throw err;

					gct.all.serializeList(tickets, function (err, result) {
						res.json(result);
					});
				});
		}
	},

	list20All: function (req, res) {
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
						Ticket.find()
							.sort('id DESC')
							.limit(1)
							.done(function (err, latestElement) {
								if (err) return callback(err);

								callback(null, lastElementDate, latestElement[0].id);
							});
					} else {
						Ticket.find({
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

				Ticket.find()
					.where({
						createdAt: {
							'<': lastElementDate
						},
						visiblity: {
							'<': visiblity
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

	listMyTpl: function (req, res) {
		text = 'Ваши тикеты';
		res.view('list/list', {
			type: {
				url: 'my',
				text: text,
				iconclass: 'user'
			}
		})
	},

	listNewestMy: function (req, res) {
		Ticket.find({
			owner: req.user.id
		})
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
					Ticket.find({
						owner: req.user.id
					})
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

					Ticket.find({
						owner: req.user.id
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

	listBugreportTpl: function listBugreport(req, res) {
		text = 'Багрепорты';
		res.view('list/list', {
			type: {
				url: 'bugreports',
				text: text,
				iconclass: 'bug'
			}
		})
	},

	listNewestBugreport: function (req, res) {
		if (req.user && req.user.group >= ugroup.staff) {
			Ticket.find({
				type: 1
			})
				.sort('id DESC')
				.limit(20)
				.done(function (err, tickets) {
					if (err) throw err;

					gct.bugreport.serializeList(tickets, function (err, result) {
						res.json(result);
					});
				});
		} else {
			Ticket.find({
				type: 1,
				visiblity: 1
			})
				.sort('id DESC')
				.limit(20)
				.done(function (err, tickets) {
					if (err) throw err;

					gct.bugreport.serializeList(tickets, function (err, result) {
						res.json(result);
					});
				});
		}
	},

	list20Bugreport: function (req, res) {
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
							type: 1
						})
							.sort('id DESC')
							.limit(1)
							.done(function (err, latestElement) {
								if (err) return callback(err);

								callback(null, lastElementDate, latestElement[0].id);
							});
					} else {
						Ticket.find({
							type: 1,
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
						type: 1
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

							gct.bugreport.serializeList(tickets, function (err, result) {
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

	listRemproTpl: function (req, res) {
		text = 'Расприваты';
		res.view('list/list', {
			type: {
				url: 'rempros',
				text: text,
				iconclass: 'remove'
			}
		})
	},

	listNewestRempro: function (req, res) {
		if (req.user && req.user.group >= ugroup.staff) {
			Ticket.find({
				type: 2
			})
			.sort('id DESC')
			.limit(20)
			.done(function (err, tickets) {
				if (err) throw err;

				gct.rempro.serializeList(tickets, function (err, result) {
					res.json(result);
				});
			});
		} else {
			Ticket.find({
				type: 2,
				visiblity: 1
			})
			.sort('id DESC')
			.limit(20)
			.done(function (err, tickets) {
				if (err) throw err;

				gct.rempro.serializeList(tickets, function (err, result) {
					res.json(result);
				});
			});
		}
	},

	list20Rempro: function (req, res) {
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
							type: 2
						})
						.sort('id DESC')
						.limit(1)
						.done(function (err, latestElement) {
							if (err) return callback(err);

							callback(null, lastElementDate, latestElement[0].id);
						});
					} else {
						Ticket.find({
							type: 2,
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
						type: 1
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

						gct.rempro.serializeList(tickets, function (err, result) {
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

	listBanTpl: function (req, res) {
		text = 'Баны';
		res.view('list/list', {
			type: {
				url: 'bans',
				text: text,
				iconclass: 'ban circle'
			}
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
		res.view('list/list', {
			type: {
				url: 'unbans',
				text: text,
				iconclass: 'circle blank'
			}
		})
	},

	listRegenTpl: function (req, res) {
		text = 'Регены';
		res.view('list/list', {
			type: {
				url: 'regens',
				text: text,
				iconclass: 'leaf'
			}
		})
	},

	listAdmreqTpl: function (req, res) {
		text = 'Обращения к администрации';
		res.view('list/list', {
			type: {
				url: 'admreq',
				text: text,
				iconclass: 'briefcase'
			}
		})
	}
};

/**
 * MiscController
 *
 * @module :: Controller
 * @description :: Контроллер различного мелкого функционала.
 */

module.exports = {

	mainPage: function (req, res) {
		console.log(req.session);
		var tickets = {
			latestBugreports: [],
			latestRempros: [],
			latestBansUnbans: []
		},
		questions = {
			faq: [],
			latest: []
		},
		user = {
			current: {
				id: (req.user) ? req.user.id : null,
				group: (req.user) ? req.user.group : null,
				canModerate: (req.user) ? req.user.canModerate : null
			}
		};

		async.waterfall([
			function getLatestBugreports(callback) {
				gch.ticket.getList({
					user: user,
					type: '1',
					limit: 6
				}, function (err, result) {
					if (err) return callback(err);

					tickets.latestBugreports = result;

					callback(null, tickets, questions);
				});
			},
			function serializeLatestBugreports(tickets, questions, callback) {
				gch.ticket.serializeList(tickets.latestBugreports, function (err, result) {
					if (err) return callback(err);

					tickets.latestBugreports = result;

					callback(null, tickets, questions);
				});
			},
			function getLatestRempros(tickets, questions, callback) {
				gch.ticket.getList({
					user: user,
					type: '2',
					limit: 6
				}, function (err, result) {
					if (err) return callback(err);

					tickets.latestRempros = result;

					callback(null, tickets, questions);
				});
			},
			function serializeLatestRempros(tickets, questions, callback) {
				gch.ticket.serializeList(tickets.latestRempros, function (err, result) {
					if (err) return callback(err);

					tickets.latestRempros = result;

					callback(null, tickets, questions);
				});
			},
			function getLatestBansUnbans(tickets, questions, callback) {
				gch.ticket.getList({
					user: user,
					type: '3,4',
					limit: 6
				}, function (err, result) {
					if (err) return callback(err);

					tickets.latestBansUnbans = result;

					callback(null, tickets, questions);
				});
			},
			function serializeLatestBansUnbans(tickets, questions, callback) {
				gch.ticket.serializeList(tickets.latestBansUnbans, function (err, result) {
					if (err) return callback(err);

					tickets.latestBansUnbans = result;

					callback(null, tickets, questions);
				});
			}/*,
			function getFAQ(tickets, questions, callback) {

			},
			function serializeFAQ(tickets, questions, callback) {

			},
			function getLatestQuestions(tickets, questions, callback) {

			},
			function LatestQuestions(tickets, questions, callback) {

			}*/
		], function (err, tickets, questions) {
			if (err) return res.serverError(err);

			res.view('main/mainpage', {
				tickets: tickets,
				questions: questions
			});
		});
	},

	apiRoot: function (req, res) {
		var apiRootURL = "https://help.greencubes.org/api";

		res.json({
			user_url: apiRootURL + "/users/{user}",
			current_user_url: apiRootURL + "/user",
			tickets_url: apiRootURL + "/tickets",
			questions_url: apiRootURL + "/questions",
			meta_url: apiRootURL + "/meta",
			rate_limit_url: apiRootURL + "/rate_limit",
			documentation_url: "https://wiki.greencubes.org/Система_поддержки/API"
		});
	}
};

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

	/* Main page */
	'/': 'misc.mainPage',

	/* Misc stuff */
	'/new': 'tickets.createPage',

	/* User stuff */
	'/login': 'users.login',
	'/logout': 'users.logout',

	'/users/:user': 'users.profile',
	'/user': 'users.profile',

	'/oauth/callback': 'users.callback',

	'get /api/notifs': 'users.listNotifications',
	'delete /api/notifs': 'users.removeNotifications',


	/* Search stuff */
	'/search': {
		view: 'search/main'
	},

	'get /api/search': 'search.find',


	/* Tickets stuff */
	'/tickets': 'tickets.list',
	'get /tickets/new': {
		view: 'tickets/new'
	},

	'post /ticket': 'tickets.create',
	'get /id/:tid': 'tickets.get',
	'post /id/:tid': 'tickets.update',
	'delete /id/:tid': 'tickets.delete',

	'get /id/test': 'tickets.getTest',


	/* Comments stuff */
	'post /api/comment': 'comments.new',
	'get /api/comments/:cid': 'comments.get',
	'post /api/comments/:cid': 'comments.edit',


	/* Questions stuff */
	'/questions': 'questions.list',
	'get /questions/new': {
		view: 'questions/new'
	},

	'post /api/questions/new': 'questions.create',
	'get /question/:name': 'questions.get',
	'post /question/:name': 'questions.update',
	'delete /question/:name': 'questions.delete',


	/* Admin-panel stuff */
	'/admin': 'admin.main',
	'/admin/users': 'dev.hideFeature',

	'/admin/users/roles': 'admin.usersRights',
	'post /admin/users/roles/new': 'admin.setRights',
	'/admin/users/roles/remove/:uid': 'admin.removeRights',

	'/admin/users/bans': 'admin.usersBans',
	'post /admin/users/bans/new': 'admin.setBan',
	'/admin/users/bans/remove/:id': 'admin.removeBan',


	/* In-game panel stuff */
	'/gameinfo': 'ingameinfo.main',

	'/gameinfo/player/info': 'ingameinfo.playerInfo',
	'/gameinfo/player/loginlog': 'ingameinfo.playerLoginlog',
	'/gameinfo/player/inventory': 'ingameinfo.playerInventory',
	'/gameinfo/player/chestslog': 'ingameinfo.playerChestslog',
	'/gameinfo/player/chatlog': 'ingameinfo.playerChatlog',
	'/gameinfo/player/commandslog': 'ingameinfo.playerCommandslog',

	'/gameinfo/world/regioninfo': 'ingameinfo.worldRegioninfo',
	'/gameinfo/world/chestlog': 'ingameinfo.worldChestlog',
	'/gameinfo/world/blockslog': 'ingameinfo.worldBlockslog',
	'/gameinfo/world/moneylog': 'ingameinfo.worldMoneylog',
	'/gameinfo/world/statistics': 'gameinfo.worldStatisticsView',
	'get /gameinfo/world/statistics/players': 'gameinfo.worldStatisticsPlayers',
	'get /gameinfo/world/statistics/quests': 'gameinfo.worldStatisticsQuests',

};

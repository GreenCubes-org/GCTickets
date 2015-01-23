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
	'/': {
		view: 'main/mainpage'
	},
	
	/* Misc stuff */
	'/new': 'misc.new',
	
	/* User stuff */
	'/login': 'users.login',
	'/logout': 'users.logout',
	
	'/oauth/callback': 'users.callback',
	
	
	/* Search stuff */
	'/search': {
		view: 'search/main'
	},
	'get /api/search': 'search.find',
	
	/* Tickets stuff */
	'get /api/tickets/new': {
		view: 'tickets/new'
	},
	'post /tickets/new': 'tickets.create',
	'get /id/test': 'tickets.getTest',
	'get /id/:id': 'tickets.get',
	'patch /id/:id': 'tickets.update',
	'delete /id/:id': 'tickets.delete',
	'/tickets': 'tickets.list',
	
	
	/* Questions stuff */
	'get /questions/new': {
		view: 'questions/new'
	},
	'post /api/questions/new': 'questions.create',
	'get /question/:name': 'questions.get',
	'patch /question/:name': 'questions.update',
	'delete /question/:name': 'questions.delete',
	'/questions': 'questions.list',
	
	
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
	'/gameinfo': 'gameinfo.main',

	'/gameinfo/player/info': 'gameinfo.playerInfo',
	'/gameinfo/player/loginlog': 'gameinfo.playerLoginlog',
	'/gameinfo/player/inventory': 'gameinfo.playerInventory',
	'/gameinfo/player/chestslog': 'gameinfo.playerChestslog',
	'/gameinfo/player/chatlog': 'gameinfo.playerChatlog',
	'/gameinfo/player/commandslog': 'gameinfo.playerCommandslog',

	'/gameinfo/world/regioninfo': 'gameinfo.worldRegioninfo',
	'/gameinfo/world/chestlog': 'gameinfo.worldChestlog',
	'/gameinfo/world/blockslog': 'gameinfo.worldBlockslog',
	'/gameinfo/world/moneylog': 'gameinfo.worldMoneylog',

};

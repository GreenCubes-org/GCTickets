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

	/* User stuff */
	'/login': 'users.login',
	'/logout': 'users.logout',

	'get /users/:user': 'users.profile',
	'get /user': 'users.profile',

	'/oauth/callback': 'users.callback',

	'get /api/notifs': 'users.listNotifications',
	'delete /api/notifs': 'users.removeNotifications',


	/* Search stuff */
	'/search': {
		view: 'search/main'
	},

	'get /api/search': 'search.find',


	/* Tickets stuff */
	'post /api/ticket': 'tickets.create',
	'get /tickets': 'tickets.list',
	'get /tickets/:tid': 'tickets.get',
	'post /api/tickets/:tid': 'tickets.update',
	'delete /api/tickets/:tid': 'tickets.delete',

	'get /id/test': 'tickets.getTest',


	/* Comments stuff */
	'post /api/comment': 'comments.new',
	'get /api/comments/:cid': 'comments.get',
	'post /api/comments/:cid': 'comments.edit',
	'delete /api/comments/:cid': 'comments.delete',


	/* Questions stuff */
	'get /api/questions': 'questions.list',
	'post /api/question': 'questions.create',
	'get /api/questions/:qname': 'questions.get',
	'post /api/questions/:qname': 'questions.update',
	'delete /api/questions/:qname': 'questions.delete',


	/* Admin-panel stuff */
	'post /api/admin/users/role': 'admin.setRights',
	'delete /api/admin/users/roles/:uid': 'admin.removeRights',

	'post /api/admin/users/ban': 'admin.setBan',
	'delete /api/admin/users/bans/:id': 'admin.removeBan'

};

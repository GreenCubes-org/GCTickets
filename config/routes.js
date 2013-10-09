/**
 * Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.routes = {
	/*'/': 'home.index',

	'/login': 'home.index',

	'post /login': 'home.login',

	'/logout': 'home.logout',

	'/all': 'ticket.list',

	'/new': 'ticket.create'*/
	'/': {
		controller: 'home',
		action: 'index'
	},

	'get /login': {
		controller: 'home',
		action: 'login'
	},

	'post /login': {
		controller: 'home',
		action: 'doLogin'
	},

	'/logout': {
		controller: 'home',
		action: 'logout'
	},

	'/all': {
		controller: 'ticket',
		action: 'list'
	},

	'get /new': {
		view: 'ticket/create'
	},

	'post /new': {
		controller: 'ticket',
		action: 'create'
	}
};

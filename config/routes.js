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
  '/': 'home.index',

  'get /login': 'home.login',

  'post /login': 'home.doLogin',

  '/logout': 'home.logout',

  '/all': 'ticket.list',
  
  'get /new': 'ticket.create'
};

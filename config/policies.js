/**
 * Policy mappings (ACL)
 *
 * Policies are simply Express middleware functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect just one of its actions.
 *
 * Any policy file (e.g. `authenticated.js`) can be dropped into the `/policies` folder,
 * at which point it can be accessed below by its filename, minus the extension, (e.g. `authenticated`)
 *
 * For more information on policies, check out:
 * http://sailsjs.org/#documentation
 */


module.exports.policies = {
	'*': true,

	UserController: {
		'*': ['authenticated'],
		'loginTpl': 'notAuthenticated',
		'login': 'notAuthenticated',
		'logout': true
	},

	CreateController: {
		'*': ['authenticated', 'notBanned'],
		'mainTpl': ['notBanned']
	},

	CommentsController: {
		'*': ['authenticated', 'hidePrivateTickets'],
		'listViewComments': 'hidePrivateTickets'
	},

	EditController: {
		'*': ['ownerNModAbove'],
		'deleteTpl': 'modAbove',
		'deletePost': 'modAbove',
		'changeVisibility': 'helperAbove'
	},

	AdminController: {
		'*': ['authenticated', 'staffOnly']
	},

	ViewController: {
		'*': ['hidePrivateTickets']
	}

};

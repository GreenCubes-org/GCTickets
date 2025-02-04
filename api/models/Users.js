/**
 * User
 *
 * @module      :: 	Model
 * @description ::	User model
 *
 */

module.exports = {

	attributes: {
		// User id
		uid: 'integer',

		// Game id
		gameId: 'integer',

		// User group
		ugroup: 'integer',

		// Prefix in the system from game
		prefix: 'string',

		// CSS class of the color
		colorclass: 'string',

		// Can moderate any product (for example), ex: user can moderate bugreports of ticket system
		canModerate: 'array',

		// Language
		locale: 'string'

	}

};

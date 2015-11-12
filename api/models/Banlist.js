/**
 * Banlist
 *
 * @module      :: 	Model
 * @description ::	Model with internal user bans.
 *
 */

module.exports = {

	attributes: {

		// '42' ID of banned user
		uid: 'integer',

		ip: 'string',

		// '42' ID of user who give ban
		by: 'integer',

		message: 'text'

	}

};

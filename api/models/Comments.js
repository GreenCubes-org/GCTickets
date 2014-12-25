/**
 * Comments
 *
 * @module      :: 	Model
 * @description ::	Comments model
 *
 */

module.exports = {

	attributes: {

		// Ticket id
		tid: 'integer',

		// Author id
		owner: 'integer',

		// Comment message
		message: 'text',

		// New status of ticket (if set)
		changedTo: 'integer',

		// Status of comment, 1 - public, 2 - reported, 3 - removed
		status: 'integer',

		// Uploads
		uploads: 'array'

	}

};

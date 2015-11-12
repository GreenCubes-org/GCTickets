/**
 * UserStatistics
 *
 * @module      :: 	Model
 * @description ::	User statistics model
 *
 */

module.exports = {

	attributes: {

		// Count of registrations
		registrations: 'integer',

		// Count of activated accounts for this day
		activations: 'integer',

		// Count of players that played on server today
		online: 'integer',

		// Date for this info was relevant
		date: 'date'
	},

	autoUpdatedAt: false

};

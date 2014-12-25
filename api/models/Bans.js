/**
 * Ban - Заявка на бан
 *
 * @module    :: Model
 * @description :: Ban
 *
 */

module.exports = {

	attributes: {
		// 'imma idiot, plz tp meh to spawn!1!!'
		reason: 'text',

		// uid
		targetUser: 'array',

		// '42' (id of attachment)
		attachments: 'array'
	}

};

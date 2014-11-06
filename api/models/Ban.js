/**
 * Ban - Заявка на бан
 *
 * @module    :: Model
 * @description :: Ban
 *
 */

module.exports = {

	attributes: {
		// required: title description type status owner
		// also: assignedTo product
		// 'lol plz tp me to spawn(((((('
		title: {
			type: 'string',
			maxLength: 120
		},
		// 'imma idiot, plz tp meh to spawn!1!!'
		reason: 'text',
		// uid
		targetUser: 'array',
		// 'longtext'
		logs: 'text',
		// '42' (id of upload)
		uploads: 'array'
	}

};

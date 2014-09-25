/**
 * Unban - Заявка на разбан
 *
 * @module    :: Model
 * @description :: Unban
 *
 */

module.exports = {

	attributes: {
		// required: title description type status owner
		// also: assignedTo product
		// 'unban me plz'
		title: {
			type: 'string',
			maxLength: 120
		},
		// 'because you can'
		reason: 'text',
		// uid
		targetUser: 'integer',
		// 'longtext'
		logs: 'text',
		// '42' (id of upload)
		uploads: 'array'
	}

};

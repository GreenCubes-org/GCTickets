/**
 * Bugreport - Баг-репорт
 *
 * @module    :: Model
 * @description :: Bugreport
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
		description: 'text',
		// '1' (id of status)
		status: 'integer',
		// '1' (id of owner user)
		owner: 'integer',
		// '1' (id of product)
		product: 'integer',
		// 'longtext'
		logs: 'text',
		// '42' (id of upload)
		uploads: 'array'
	}

};

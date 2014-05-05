/**
 * Rempro - Расприват
 *
 * @module    :: Model
 * @description :: Rempro
 *
 */

module.exports = {

	attributes: {
		// required: title description type status owner
		// also: assignedTo product
		// 'lol plz tp me to spawn(((((('
		title: {
			type: 'string',
			maxLength: 120,
		},
		// '424242' (id of user)
		createdFor: 'integer',
		// 'OMG HES AN IDIOT'
		reason: 'string',
		// ['creep','feyolapalace']
		regions: 'array',
		// ['-14 00 33','33 33 33']
		stuff: 'array',
		// '1' (id of status)
		status: 'integer',
		// '42' (id of upload)
		uploads: 'array'
	}

};

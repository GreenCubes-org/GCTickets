/**
 * Rempro - Расприват
 *
 * @module    :: Model
 * @description :: Rempro
 *
 */

module.exports = {

	attributes: {
		// '424242' (id of user)
		createdFor: 'integer',

		// 'OMG HES AN IDIOT'
		reason: 'text',

		// ['creep','feyolapalace']
		regions: 'array',

		// ['-14 00 33','33 33 33']
		stuff: 'array',

		// '42' (id of attachment)
		attachments: 'array'
	}

};

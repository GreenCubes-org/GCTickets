/**
 * Questions - Вопросы
 *
 * @module    :: Model
 * @description :: Ticket
 *
 */

module.exports = {

	attributes: {
		// Title
		title: {
			type: 'string',
			maxLength: 120
		},

		// Description
		description: 'text',

		// '1' (id of owner user)
		asker: 'integer'
	}

};

/**
 * Tickets - Тикеты
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

		// Local model ticket ID
		tid: 'integer',

		// Type ID
		type: 'integer',

		// '1' (id of visiblity to users)
		visiblity: 'integer',

		// '1' (id of status)
		status: 'integer',

		// '1' (id of owner user)
		owner: 'integer'
	}

};

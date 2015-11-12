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

		// '1' (id of visibility to users)
		visibility: 'integer',

		// '1' (id of status)
		status: 'integer',

		// '1' (id of owner user)
		owner: 'integer',

		// '42' (id of attachment)
		attachments: 'array'
	}

};

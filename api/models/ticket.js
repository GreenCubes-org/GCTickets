/**
 * Ticket
 *
 * @module	  :: Model
 * @description :: Ticket model.
 *
 */

module.exports = {

	attributes: {
		
		// '42'
		id: {
			type: 'INTEGER',
			required: true
		},
		// '1' (id of type)
		type: {
			type: 'INTEGER',
			required: true
		},
		// 'lol plz tp me to spawn(((((('
		title: {
			type: 'STRING',
			maxLength: 40,
			minLength: 10,
			required: true
		},
		// 'imma idiot, plz tp meh to spawn!1!!'
		description: {
			type: 'STRING',
			minLength: 10,
			required: true
		},
		// '1' (id of status)
		status: {
			type: 'INTEGER',
			required: true
		},
		// '1' (id of owner user)
		owner: {
			type: 'INTEGER',
			required: true
		},
		// 'YYYY-MM-DD HH:MM:SS' (creation time)
		createdAt: {
			type: 'DATETIME',
			required: true
		},
		// '1' (id of assigned user)
		assignedTo: {
			type: 'INTEGER',
			required: false
		},
		// '1' (id of product)
		product: {
			type: 'INTEGER',
			required: false
		}
	}

};

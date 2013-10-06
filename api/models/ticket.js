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
	// '2' (id of type)
	type: {
		type: 'INTEGER',
		required: true
	},
	// 'lol plz tp me to spawn(((((('
	title: {
		type: 'STRING',
		required: true
	},
	// 'imma idiot, plz tp meh to spawn!1!!'
	description: {
		type: 'STRING',
		required: true
	},
	// '2' (id of status)
	status: {
		type: 'INTEGER',
		required: true
	},
	// '2' (id of owner user)
	owner: {
		type: 'INTEGER',
		required: true
	},
	// '4' (id of assigned user)
	assigned: {
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

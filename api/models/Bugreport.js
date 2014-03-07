/**
 * Bugreport - Баг-репорт
 *
 * @module    :: Model
 * @description :: Bugreport
 *
 */

var validator = require('validator');

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
	},

	beforeCreate: function(values, cb) {
		validator.escape(values.id);
		validator.escape(values.description);

		cb();
	},

	beforeUpdate: function(values, cb) {
		validator.escape(values.id);
		validator.escape(values.description);

		cb();
	}

};

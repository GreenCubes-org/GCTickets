/**
 * Attachments
 *
 * @module      :: 	Model
 * @description ::	Attachments model
 *
 */

module.exports = {

	attributes: {
		// Attachment type: 'image' or 'log'
		type: 'integer',

		// Data.
		data: 'json',
		
		// Created By
		createdBy: 'integer'
	}
};

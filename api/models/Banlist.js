/**
 * Banlist
 *
 * @module      :: 	Model
 * @description ::	Model with internal user bans.
 *
 */

module.exports = {

  attributes: {
  	
		// '42' ID of banned user
		uid: 'integer',
		
		// '42' ID of user who give ban
		by: 'integer',
		
		// '2424-42-24 42:24:42' End date of the ban
		until: 'date',
		
		isPermban: 'boolean',
		
		message: 'text'
		
  }

};

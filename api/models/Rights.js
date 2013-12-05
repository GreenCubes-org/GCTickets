/**
 * Right
 *
 * @module      :: 	Model
 * @description ::	Right model
 *
 */

module.exports = {

  attributes: {
  	// User id
  	uid: 'integer',
  	
  	// User group
  	ugroup: 'integer',
  	
  	// Prefix in the system from game
  	prefix: 'string',
  	
  	// CSS class of the color
  	colorclass: 'string',
  	
  	// Rights in system, ex: user can moderate bugreports of ticket system
  	rights: 'array'
   
  }

};

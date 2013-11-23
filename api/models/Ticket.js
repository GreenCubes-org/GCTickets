/**
 * Ticket - Тикет
 *
 * @module    :: Model
 * @description :: Ticket
 *
 */

module.exports = {

  attributes: {
   // Local model ticket ID
   tid: 'integer',
   // Type ID
   type: 'integer',
   // '1' (id of visiblity to users)
   visiblity: 'integer',
	// '1' (id of owner user)
   owner: 'integer',
   //'[]' (array of objects(JSON))
   comments: 'array'
  }

};

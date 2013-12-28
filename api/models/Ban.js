/**
 * Ban - Бан
 *
 * @module    :: Model
 * @description :: Ban
 *
 */

module.exports = {

  attributes: {
    // required: title description type status owner
    // also: assignedTo product
    // 'lol plz tp me to spawn(((((('
    title: {
      type: 'string',
      maxLength: 50
    },
    // 'imma idiot, plz tp meh to spawn!1!!'
    description: {
      type: 'string',
      minLength: 10
    },
    // '42' (id of victim)
    victim: 'integer',
    // '1' (id of status)
    status: 'integer',
    // '1' (id of owner user)
    owner: 'integer',
    // '1' (id of product)
    product: 'integer',
    // '[]' Text comments
    comments: 'array',
    // '42' (id of upload)
    uploads: 'array'
  }

};

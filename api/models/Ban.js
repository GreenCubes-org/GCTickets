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
    // '42' (nickname of victim)
    victim: 'string',
    // '1' (id of status)
    status: 'integer',
    // '1' (id of owner user)
    owner: 'integer',
    // '42' (id of upload)
    uploads: 'array'
  }

};

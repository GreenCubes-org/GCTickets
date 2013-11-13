/**
 * Rempro - Расприват
 *
 * @module    :: Model
 * @description :: Rempro
 *
 */

module.exports = {

  attributes: {
    // required: title description type status owner
    // also: assignedTo product
    // 'lol plz tp me to spawn(((((('
    title: {
      type: 'string',
      maxLength: 50,
    },
    // ['creep','renaisland']
    region: 'array',
    //['-42 42 42','23 42 1441']
    coord: 'array',
    // '1' (id of status)
    status: 'integer',
    // '1' (id of owner user)
    owner: 'integer',
    // '[]' Text comments
    comments: 'array',
    // '42' (id of upload)
    uploads: 'array'
  }

};

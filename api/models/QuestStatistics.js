/**
 * QuestStatistics
 *
 * @module      :: 	Model
 * @description ::	Quest statistics model
 *
 */

module.exports = {

  attributes: {

    // Count of players
    players: 'integer',

    // Count of players that finished quest #2
    quest2: 'integer',

    // Count of players that finished quest #3
    quest3: 'integer',

    // Count of players that finished quest #4
    quest4: 'integer',

    // Count of players that finished quest #6
    quest6: 'integer',

    // Count of players that finished quest #11
    quest11: 'integer',

    // Count of players that finished quest #16
    quest16: 'integer',

    // Count of players that finished quest #24
    quest24: 'integer',

    // Date for this info was relevant
    date: 'date'
  },

  autoUpdatedAt: false

};

/**
 * Unban - Заявка на разбан
 *
 * @module    :: Model
 * @description :: Unban
 *
 */

module.exports = {

	attributes: {
		// 'because you can'
		reason: 'text',

		// uid
		targetUser: 'array'
	}

};

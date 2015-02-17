/* GCH – Helper library • Index file */

var moment = require('moment');

/* Ticket files */
module.exports.ticket = require('./ticket.js');
module.exports.bugreport = require('./bugreport.js');
module.exports.rempro = require('./rempro.js');
module.exports.ban = require('./ban.js');
module.exports.unban = require('./unban.js');
module.exports.regen = require('./regen.js');

/* Question file */
module.exports.question = require('./question.js');

/* Misc files */
module.exports.user = require('./user.js');
module.exports.comment = require('./comment.js');
module.exports.attachement = require('./attachment.js');


/* Root functions */
module.exports.getVisibility = getVisibility = function (visibility) {
	switch (visibility) {
		case 1:
			return {
				id: 1,
				name: 'public',
				iconClass: 'unlock'
			};

		case 2:
			return {
				id: 2,
				name: 'private',
				iconClass: 'lock'
			};

		default:
			return;
	}
};

module.exports.getStatus = getStatus = function (status) {
	switch (status) {
		case 1:
		case 'new':
			return {
				name: 'new',
				id: 1
			};

		case 2:
		case 'rejected':
			return {
				name: 'rejected',
				id: 2
			};

		case 3:
		case 'specify':
			return {
				name: 'specify',
				id: 3
			};

		case 4:
		case 'declined':
			return {
				name: 'declined',
				id: 4
			};

		case 5:
		case 'hidden':
			return {
				name: 'hidden',
				id: 5
			};

		case 6:
		case 'removed':
			return {
				name: 'removed',
				id: 6
			};

		case 7:
		case 'helpfixed':
			return {
				name: 'helpfixed',
				id: 7
			};

		case 8:
		case 'inreview':
			return {
				name: 'inreview',
				id: 8
			};

		case 9:
		case 'delayed':
			return {
				name: 'delayed',
				id: 9
			};

		case 10:
		case 'done':
			return {
				name: 'done',
				id: 10
			};

		case 11:
		case 'accepted':
			return {
				name: 'accepted',
				id: 11
			};

		case 12:
		case 'fixed':
			return {
				name: 'fixed',
				id: 12
			};

		default:
			return;
	}
};

module.exports.getProduct = getProduct = function (product) {
	switch (product) {
		case 1:
		case 'unknown':
			return {
				name: 'unknown',
				id: 1
			};

		case 2:
		case 'main':
			return {
				name: 'main',
				id: 2
			};

		case 3:
		case 'rpg':
			return {
				name: 'rpg',
				id: 3
			};

		case 4:
		case 'apocalyptic':
			return {
				name: 'apocalyptic',
				id: 4
			};

		case 5:
		case 'websites':
			return {
				name: 'websites',
				id: 5
			};

		default:
			return {
				name: '',
				id: 0
			};
	}
};

module.exports.getType = function (id) {
	switch (id) {
		case 1:
			return {
				id: 1,
				name: 'bugreport',
				iconClass: 'bug'
			};
		
		case 2:
			return {
				id: 2,
				name: 'rempro',
				iconClass: 'trash'
			};
		
		case 3:
			return {
				id: 3,
				name: 'ban',
				iconClass: 'ban circle'
			};
		
		case 4:
			return {
				id: 4,
				name: 'unban',
				iconClass: 'circle blank'
			};
		
		case 5:
			return {
				id: 5,
				name: 'regen',
				iconClass: 'leaf'
			};
		
		default:
			return {
				id: id,
				name: ''
			}
	}
};

module.exports.serializeTime = serializeTime =  function (time) {
	return {
		date: time,
		pretty: moment(time).format('D MMM YYYY, H:mm'),
		fromNow: moment(time).fromNow()
	};
};

module.exports.serializeNotifType = serializeNotifType = function (id) {
	switch (id) {
		case 1:
			return {
				id: 1,
				text: sails.__({phrase:'gct.serializeNotifType.comment',locale: sails.language}),
				iconclass: 'comment'
			};

		case 2:
			return {
				id: 2,
				name: sails.__({phrase:'gct.serializeNotifType.commentwithstatus',locale: sails.language}),
				iconclass: 'comment'
			};

		case 3:
			return {
				id: 3,
				text: sails.__({phrase:'gct.serializeNotifType.removedcomment',locale: sails.language}),
				iconclass: 'trash'
			};

		case 4:
			return {
				id: 4,
				text: sails.__({phrase:'gct.serializeNotifType.mentioned',locale: sails.language}),
				iconclass: 'bell outline'
			};
	}
};

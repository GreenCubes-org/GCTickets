// Start sails and pass it command line arguments
require('sails').lift({
	hooks: {
		sockets: false,
		pubsub: false,
		i18n: false
	}
}, function doneLifting (err) { if (err) throw err; });

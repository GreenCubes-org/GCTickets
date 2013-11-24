require('forever').startDaemon('app.js', require('optimist').argv);

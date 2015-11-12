/* Configuration */
var migrations = [
	//{ do: 'alter modify', table: 'client', column: 'internal', type: 'varchar(2)' }
	/*{ do: 'create table', query: "CREATE TABLE IF NOT EXISTS `bugreport` (\
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,\
  `description` longtext COLLATE utf8_unicode_ci,\
  `product` int(11) DEFAULT NULL,\
  `logs` longtext COLLATE utf8_unicode_ci,\
  `uploads` longtext COLLATE utf8_unicode_ci,\
  `id` int(11) NOT NULL AUTO_INCREMENT,\
  `createdAt` datetime DEFAULT NULL,\
  `updatedAt` datetime DEFAULT NULL,\
  PRIMARY KEY (`id`)\
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=48 ;"}*/

];

/* Example config:
var tables = [
	{ do: 'modify', column: 'client', type: 'varchar(2) }
];
*/

/* Main logic */
var mysql = require('mysql');
var async = require('../node_modules/sails/node_modules/async');
var cfg = require('../config/local');

console.log('[DB-MIGRATIONS] Start script');

console.log('[DB-MIGRATIONS] Check config: \n', migrations);

if (migrations.length) {
	console.log('[DB-MIGRATIONS] OK. Not empty config.');
} else {
	console.log('[DB-MIGRATIONS] NOT OK. Empty config! QUIT.');
	process.exit(0);
}

console.log('[DB-MIGRATIONS] Create connection to DB');

var db = mysql.createConnection({
	host: cfg.appdb.host,
	database: cfg.appdb.database,
	user: cfg.appdb.user,
	password: cfg.appdb.password
});

console.log('[DB-MIGRATIONS] Connect to DB');

db.connect();

function migrate(migrations, cb) {
	async.each(migrations, function (migrate, callback) {
		var query;

		switch (migrate.do) {
			case 'custom':
				query = migrate.query;
				break;
			case 'alter add':
				query = 'ALTER TABLE ' + migrate.table + ' ADD ' + migrate.column + ' ' + migrate.type;
				break;

			case 'alter modify':
				query = 'ALTER TABLE ' + migrate.table + ' MODIFY ' + migrate.column + ' ' + migrate.type;
				break;

			case 'alter drop':
				query = 'ALTER TABLE ' + migrate.table + ' DROP ' + migrate.column;
				break;
		}

		db.query(query, function (err, result) {
			if (err) {
				if (err.code === 'ER_DUP_FIELDNAME') {
					console.log('[DB-MIGRATIONS] ALTER TABLE ' + migrate.table + ' ADD ' + migrate.column + ' ' + migrate.type + ' - ALREADY CREATED');
					return callback(null);
				}

				callback(err);
			}

			console.log('[DB-MIGRATIONS] ALTER TABLE ' + migrate.table + ' ADD ' + migrate.column + ' ' + migrate.type + ' - SUCCESS');
			callback(null);
		})
	}, function (err) {
		if (err) {
			console.error('[DB-MIGRATIONS] ERROR. I\'M SO SORRY. Here is your err var:\n', err);
			throw err;
		}

		console.log('[DB-MIGRATIONS] DONE. GOODBYE.');
		process.exit(0);
	});
};

console.log('[DB-MIGRATIONS] Processing commands:');

migrate(migrations);

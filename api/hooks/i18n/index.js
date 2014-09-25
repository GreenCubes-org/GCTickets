module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('../../../node_modules/sails/node_modules/lodash'),
		Hook = require('../../../node_modules/sails/lib/hooks/index'),
		i18n,
		domain = require('domain');


	/**
	 * Expose hook definition
	 */

	return {

		defaults: {
			// i18n
			i18n: {
				locales: ['ru'],
				defaultLocale: 'ru',
				localesDirectory: '/config/locales'
			}
		},

		routes: {

			before: {

				'all /*': function addLocalizationMethod (req, res, next) {

					i18n.init(req, res, function() {
						res.locals.i18n = res.i18n = res.__;

						var language = (req.query.lang && sails.config.i18n.locales.indexOf(req.query.lang) !== -1) ? req.query.lang : ((req.user) ? req.user.locale : sails.config.i18n.defaultLocale);

						// Set locale from ?lang= or from userconfig
						res.setLocale(language);

						req.language = (language);

						next();
					});

				}
			}
		},

		initialize: function(cb) {

			// Hackily include the i18n custom debug levels
			var debugLevel = process.env.DEBUG || '';
			switch (sails.config.log.level) {
				case 'silly':
				case 'verbose':
				case 'debug':
					debugLevel += ' i18n:debug i18n:warn i18n:error';
					break;
				case 'info':
				case 'blank':
				case 'warn':
					debugLevel += ' i18n:warn i18n:error';
					break;
				case 'error':
					debugLevel += ' i18n:error';
					break;
				case 'crit':
				case 'silent':
					break;
				default:
					break;
			}
			process.env.DEBUG += ' i18n:error';

			i18n = require('../../../node_modules/sails/node_modules/i18n');
			domain.create()

			// Catch
			.on('error', function(err) {
				sails.log.error(err);
			})

			// Try
			.run(function() {
				var cfg = _.defaults(sails.config.i18n, {
					cookie: null,
					directory: sails.config.appPath + sails.config.i18n.localesDirectory,
					updateFiles: false,
					extension: '.json'
				});

				i18n.configure(cfg);

				// Expose global access to locale strings
				sails.__ = i18n.__;
			});

			// Finally
			cb();
		}

	};
};

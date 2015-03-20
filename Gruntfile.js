/**
 * Gruntfile
 *
 * If you created your Sails app with `sails new foo --linker`, 
 * the following files will be automatically injected (in order)
 * into the EJS and HTML files in your `views` and `assets` folders.
 *
 * At the top part of this file, you'll find a few of the most commonly
 * configured options, but Sails' integration with Grunt is also fully
 * customizable.	If you'd like to work with your assets differently
 * you can change this file to do anything you like!
 *
 * More information on using Grunt to work with static assets:
 * http://gruntjs.com/configuring-tasks
 */

module.exports = function (grunt) {


	/**
	 * CSS files to inject in order
	 * (uses Grunt-style wildcard/glob/splat expressions)
	 *
	 * By default, Sails also supports LESS in development and production.
	 * To use SASS/SCSS, Stylus, etc., edit the `sails-linker:devStyles` task
	 * below for more options.	For this to work, you may need to install new
	 * dependencies, e.g. `npm install grunt-contrib-sass`
	 */

	var cssLibsFilesToInject = [
		'css/libs/*.css'
	];

	var cssFilesToInject = [
		'css/styles/*.css'
	];

	/**
	 * Javascript files to inject in order
	 * (uses Grunt-style wildcard/glob/splat expressions)
	 *
	 * To use client-side CoffeeScript, TypeScript, etc., edit the
	 * `sails-linker:devJs` task below for more options.
	 */

	var jsLibsFilesToInject = [
		'js/libs/jquery.js',
		'js/libs/jquery.serializejson.js',
		'js/libs/jquery.browserLanguage.js',
		'js/libs/semantic-ui.js',
		'js/libs/moment.js',
		'js/libs/js-signals.js',
		'js/libs/crossroads.js',
		'js/libs/lightbox.js',
		'js/libs/wbb.js',
		'js/libs/wbb-ru.js'
	];

	var jsFilesToInject = [
		'js/controllers/*.js',
		'js/*.js'
	];



	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	//
	// DANGER:
	//
	// With great power comes great responsibility.
	//
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////

	// Modify css file injection paths to use
	cssLibsFilesToInject = cssLibsFilesToInject.map(function (path) {
		return '.tmp/public/' + path;
	});

	cssFilesToInject = cssFilesToInject.map(function (path) {
		return '.tmp/public/' + path;
	});

	// Modify js file injection paths to use
	jsFilesToInject = jsFilesToInject.map(function (path) {
		return '.tmp/public/' + path;
	});

	jsLibsFilesToInject = jsLibsFilesToInject.map(function (path) {
		return '.tmp/public/' + path;
	});


	// Get path to core grunt dependencies from Sails
	var depsPath = grunt.option('gdsrc') || 'node_modules/sails/node_modules';
	grunt.loadTasks(depsPath + '/grunt-contrib-clean/tasks');
	grunt.loadTasks(depsPath + '/grunt-contrib-copy/tasks');
	grunt.loadTasks(depsPath + '/grunt-contrib-concat/tasks');
	grunt.loadTasks(depsPath + '/grunt-sails-linker/tasks');
	grunt.loadTasks(depsPath + '/grunt-contrib-watch/tasks');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadTasks(depsPath + '/grunt-contrib-cssmin/tasks');
	grunt.loadNpmTasks("grunt-remove-logging");

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		copy: {
			dev: {
				files: [
					{
						expand: true,
						cwd: './assets',
						src: ['**/*'],
						dest: '.tmp/public'
					}
				]
			},
			build: {
				files: [
					{
						expand: true,
						cwd: '.tmp/public',
						src: ['**/*'],
						dest: 'www'
					}
				]
			}
		},

		clean: {
			dev: ['.tmp/public/**'],
			build: ['.tmp/public/js/*/', '.tmp/public/js/init.js', '.tmp/public/js/routes.js', '.tmp/public/css/*/*']
		},

		concat: {
			jsApp: {
				src: jsFilesToInject,
				dest: '.tmp/concat/app.js'
			},
			jsLibs: {
				src: jsLibsFilesToInject,
				dest: '.tmp/concat/libs.js'
			},
			cssLibs: {
				src: cssLibsFilesToInject,
				dest: '.tmp/concat/libs.css'
			},
			cssStyles: {
				src: cssFilesToInject,
				dest: '.tmp/concat/styles.css'
			}
		},

		uglify: {
			jsLibs: {
				options: {
					compress: {
						drop_console: false
					},
					mangle: false,
					preserveComments: 'all'
				},
				files: {
					'.tmp/public/js/libs.js': ['.tmp/concat/libs.js']
				}
			},
			jsApp: {
				options: {
					compress: {
						drop_console: false
					},
					mangle: {
						except: ['jQuery','moment','crossroads']
					},
					preserveComments: 'some'
				},
				files: {
					'.tmp/public/js/app.js': ['.tmp/concat/app.js']
				}
			},
		},

		cssmin: {
			libsDist: {
				src: ['.tmp/concat/libs.css'],
				dest: '.tmp/public/css/libs.css'
			},
			stylesDist: {
				src: ['.tmp/concat/styles.css'],
				dest: '.tmp/public/css/styles.css'
			}
		}/*,

		watch: {
			api: {

				// API files to watch:
				files: ['api/** /*']
			},
			assets: {

				// Assets to watch:
				files: ['assets/** /*'],

				// When assets are changed:
				tasks: ['copy:dev','compileAssets']
			}
		}*/
	});

	// When Sails is lifted:
	grunt.registerTask('default', [
		'prod'/*,
		'watch'*/
	]);

	// When sails is lifted in production
	grunt.registerTask('prod', [
		'clean:dev',
		'copy:dev',
		'compileAssets'
	]);

	grunt.registerTask('compileAssets', [
		'concat',
		'uglify',
		'cssmin',
		'clean:build'
	])

  // When API files are changed:
  // grunt.event.on('watch', function(action, filepath) {
  //   grunt.log.writeln(filepath + ' has ' + action);

  //   // Send a request to a development-only endpoint on the server
  //   // which will reuptake the file that was changed.
  //   var baseurl = grunt.option('baseurl');
  //   var gruntSignalRoute = grunt.option('signalpath');
  //   var url = baseurl + gruntSignalRoute + '?action=' + action + '&filepath=' + filepath;

  //   require('http').get(url)
  //   .on('error', function(e) {
  //     console.error(filepath + ' has ' + action + ', but could not signal the Sails.js server: ' + e.message);
  //   });
  // });
};

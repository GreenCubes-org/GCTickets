/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = function(grunt) {

	grunt.config.set('uglify', {
		distLibs: {
			src: ['.tmp/public/concat/libs.js'],
			dest: '.tmp/public/min/libs.js'
		},
		distApp: {
			src: ['.tmp/public/concat/app.js'],
			dest: '.tmp/public/min/app.js'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
};

/**
* HomeController
*
* @module :: Controller
* @description :: Главная страница
*/
var fs = require('fs');

module.exports = {
  
	route: function(req,res) {
		if (req.user) {
			res.redirect(req.user.startPage);
		} else {
			res.view('home/preview', {
				layout: false,
				require: require
			});
		}
	},

	/**
	* Принимает на вход session_id и username. Ну и файлик.
	*/
	hiddenupload: function (req, res) {
		if (!req.param('session_id') || !req.param('username')) {
			res.badRequest();
			return;
		}

		if (!req.headers['x-real-ip']) {
			res.status(400).json({
				message: 'Wrong IP config'
			});
		}
		async.waterfall([
			function checkUser(callback) {
				maindbconn.query('SELECT * FROM `auth_sessions` WHERE `user_name` = ?', [req.param('username').replace(/[^a-zA-Z0-9_-]/g, '')], function (err, result) {
					if (err) return callback(err);

					var d = req.headers['x-real-ip'].split('.');
					// via http://stackoverflow.com/questions/8105629/ip-addresses-stored-as-int-results-in-overflow
					if ( ( ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]) === result[0].ip) && req.param('session_id') === result[0].session_id) {
						callback(null);
					} else {
						res.badRequest();
					}
				});
			},
			function uploadData(callback) {
				var files;
				if (req.files) {
					files = req.files.upload;
				}

				var execFile = require('child_process').execFile,
					types = new RegExp('^image/(png|jpeg|jpg)\n$');

				// If MULTIPLE uploads
				if (files instanceof Array) {
					var counter = 0; // counter of 'files' var -_-
					async.map(files, function(files, callback) {
						counter++;

						async.waterfall([
							function getMime(callback) {
								execFile('file', ['-b', '--mime-type', files.path], function(err, stdout, stderr) {
									if (err) return callback(err);

									var extension;

									if (stdout === 'image/png\n') extension = 'png';

									if (!extension) {
										res.badRequest();
									}

									var currentDate = new Date();
									callback(null, stdout, currentDate.getYear() + currentDate.getMonth() + currentDate.getDate() + '_' + req.param('username') + '.' + extension);
								});
							},
							function saveFileOrNot(type, filename, callback) {
								if (types.test(type)) {
									fs.rename(files.path, appPath + '/clientuploads/' + currentDate.getYear() + currentDate.getMonth() + currentDate.getDate() + '_' + req.param('username') + '_' + counter + '.' + extension, function (err) {
										if (err) return callback(err);

										callback(null, filename);
									});
								} else {
									fs.unlink(files.path, function (err) {
										if (err) return callback(err);

										callback({show: true, msg: 'Wrong file type'}, null);
									});
								}
							}
						], function(err, uploads) {
							if (err) return callback(err);

							if (!uploads) {
								return callback(null, null);
							}

							callback(null, uploads);
						});
					}, function(err, uploads) {
						if (err) return callback(err);

						callback(null, uploads);
					});
				// If SINGLE upload and empty file
				} else if (files instanceof Object && files.originalFilename === '') {
					fs.unlink(files.path, function (err) {
						if (err) return callback(err);

						callback(null, null);
					});
				// If SINGLE upload
				} else if (files instanceof Object) {
					async.waterfall([
						function getMime(callback) {
							execFile('file', ['-b', '--mime-type', files.path], function(err, stdout, stderr) {
								if (err) return callback(err);

								var extension;

								if (stdout === 'image/png\n') extension = 'png';

								if (!extension) {
									res.badRequest();
								}

								var currentDate = new Date();
								callback(null, stdout, currentDate.getYear() + currentDate.getMonth() + currentDate.getDate() + '_' + req.param('username') + '.' + extension);
							});
						},
						function saveFileOrNot(type, filename, callback) {
							if (types.test(type)) {
								fs.rename(files.path, appPath + '/clientuploads/' + filename, function (err) {
									if (err) return callback(err);

									callback(null, filename);
								});
							} else {
								fs.unlink(files.path, function (err) {
									if (err) return callback(err);

									callback({show: true, msg: 'Wrong file type'}, null);
								});
							}
						}
					], function(err, uploads) {
						if (err) {
							if (err.show) {
								return callback({show: true, msg: err.msg});
							} else {
								return callback(err);
							}
						}

						if (!uploads) {
							return callback(null, null);
						}

						callback(null, [uploads]);
					});
				} else {
					res.badRequest();
				}
			}
		], function (err, uploads) {
			if (err) return res.serverError(err);

			res.json({
				status: 'OK',
				files: uploads.length
			});
		});
	}
  
};

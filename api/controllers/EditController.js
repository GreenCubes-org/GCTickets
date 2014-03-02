/**
* EditController
*
* @module :: Controller
* @description :: Редактирование тикетов.
*/

//FIXME: Поменять на глобальную переменную
var gct = require('../../utils/gct'),
	formidable = require('formidable'),
	crypto = require('crypto');

function editBugreportTpl(req, res, ticket) {
	Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
		if (err) throw err;

		gct.bugreport.serializeSingle(bugreport, {isEdit: true}, function(err, result) {
			if (err) throw err;

			res.view('edit/bugreport', {
				ticket: result,
				globalid: ticket.id
			});
		});
	});
};
function editBugreport(req, res, ticket) {
	Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
		if (err) throw err;

		async.waterfall([
			/*function uploadData(callback) {
				var form = new formidable.IncomingForm(),
					files = [],
					fields = [];
				
				form.uploadDir = '../../uploads';
				form.encoding = 'utf-8';
				form.maxFieldsSize = 2 * 1024 * 1024;
				
				form.on('file', function(field, file) {
						if (files.length === 0)
							return callback({
								show: true,
								msg: 'Ошибка в запросе',
								ticket: ticket
							});

						if (files.image.type === 'image/jpeg' || 'image/png') {
							var filename = crypto.createHash('md5').digest('hex');

							fs.rename(files.upload.path, '../../uploads/' + filename, function (err) { 
								if (err) return callback(err); 
							});
						} else {
							fs.unlink('/tmp/hello', function (err) {
								if (err) return callback(err);
							});
						}
					})
					.on('aborted', function() {
						callback(null, null);
					})
					.on('end', function() {
						console.log(files, fields);
						
						callback(null, null);
					});
				form.parse(req);
			},*/
			function setData(callback) {
				gct.bugreport.serializeSingle(bugreport, {isEdit: true}, function(err, result) {
					if (err) throw err;

					callback(null,{
						title: req.param('title'),
						description: req.param('description'),
						status: bugreport.status,
						owner: bugreport.owner,
						logs: req.param('logs'),
						product: bugreport.bugreport,
						uploads: null,
						visiblity: parseInt(req.param('visiblity'))
					});
				});
			},
			function checkData(obj, callback) {
				if (isNaN(obj.visiblity)) {
					callback({
						show: true, msg: 'Выберите видимость тикета'
					});
				}

				var isErr = false;
				req.onValidationError(function (msg) {
					isErr = true;
					callback({ show: true, msg: msg });
				});
				req.check('title','Краткое описание должно содержать не менее %1 и не более %2 символов').len(6,64);
				if (!isErr) callback(null, obj);
			},
			function sanitizeData(obj, callback) {
				obj.description = req.sanitize('description').entityEncode();
				obj.logs = req.sanitize('logs').entityEncode();
				
				if (obj.logs === '') obj.logs = null;
				
				callback(null, obj);
			},
			function editBugreport(obj, callback) {
				Bugreport.findOne(ticket.tid).done(function(err, result) {
					if (err) return callback(err);

					result.title = obj.title;
					result.description = obj.description;
					result.logs = obj.logs;
					result.uploads = obj.uploads;

					result.save(function(err) {
						if (err) callback(err);

						callback(null, result.id, obj);
					});
				});
			},
			function setVisiblity(ticketId, obj, callback) {
				Ticket.findOne(ticket.id).done(function (err, ticket) {
					if (err) return callback(err);

					ticket.visiblity = obj.visiblity;

					ticket.save(function (err) {
						if (err) callback(err);

						callback(null, ticket);
					});
				});
			}
		 ],
		 function (err) {
			if (err) {
				if (!err.show) {
					res.view('edit/bugreport',{
						err: 'Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.',
						ticket: ticket
					});

					console.error(err);
					throw err;
				} else {
					res.view('edit/bugreport',{
						err: err.msg,
						ticket: ticket
					});
					return;
				}
			} else {
				res.redirect('/id/' + ticket.id);
			}
		});
	});
}

module.exports = {
	routeSingle: function(req, res) {
		Ticket.findOne(req.param('id')).done(function (err, result) {
			if (err) throw err;

			if (result) {
				switch (result.type) {
					 case 1:
						return editBugreport(req, res, result);
					 case 2:
						return editRempro(req, res, result);
					 case 3:
						return editBan(req, res, result);
					 case 4:
						return editUnban(req, res, result);
					 case 5:
						return editRegen(req, res, result);
					 case 6:
						return editAdmreq(req, res, result);
					 default:
						return res.status(404).view('404', {layout: false});
				}
			} else {
				res.status(404).view('404', {layout: false});
			}
		})
	},

	routeSingleTpl: function(req, res) {
		Ticket.findOne(req.param('id')).done(function (err, result) {
			if (err) throw err;

			if (result) {
				switch (result.type) {
					 case 1:
						return editBugreportTpl(req, res, result);
					 case 2:
						return editRemproTpl(req, res, result);
					 case 3:
						return editBanTpl(req, res, result);
					 case 4:
						return editUnbanTpl(req, res, result);
					 case 5:
						return editRegenTpl(req, res, result);
					 case 6:
						return editAdmreqTpl(req, res, result);
					 default:
						return res.status(404).view('404', {layout: false});
				}
			} else {
				res.status(404).view('404', {layout: false});
			}
		})
	},

	//TODO: Закончить это
	bugreport: function(req,res) {

	}

};

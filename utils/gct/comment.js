var redis = require('../redis');
var gcdb = require('../gcdb');
var cfg = require('../../config/local.js');

module.exports = comment = {
	serializeComments: function serializeComments(comments, ugroup, cb) {
		if (comments === null || comments.length === 0) return cb(null, null);
	
		async.map(comments, function (comment, callback) {
				gcdb.user.getByID(comment.owner, function (err, login) {
					if (err) return callback(err);
	
					async.waterfall([
						function getPrefix(callback) {
							user.getPrefix(comment.owner, function (err, prefix) {
								if (err) return callback(err);
								comment.prefix = prefix;
	
								callback(null, comment);
							});
						},
						function getColorClass(comment, callback) {
							user.getColorClass(comment.owner, function (err, colorclass) {
								if (err) return callback(err);
	
								comment.colorclass = colorclass;
	
								callback(null, comment);
							});
						},
						function setLogin(comment, callback) {
							comment.owner = login;
							callback(null, comment);
						},
						function cbComments(comment, callback) {
							if (ugroup >= 2) {
								callback(null, comment);
							} else {
								if (comment.status && comment.status !== 1) {
									callback(null, undefined);
								} else {
									delete comment.status;
									callback(null, comment);
								}
							}
						}],
						function (err, comment) {
							if (err) return callback(err);
	
							callback(null, comment);
						}
					);
				});
			},
			function (err, comments) {
				if (err) return cb(err);
	
				// Remove undefined elements
				comments = comments.filter(function (n) {
					return n
				});
	
				if (comments.length === 0) {
					cb(null, null);
				} else {
					cb(null, comments);
				}
			});
	},
	
	removeComment: function removeComment(comments, removeId, userId, cb) {
		async.waterfall([
			function (callback) {
				_.each(comments, function(comment, index) {
					if(comment.id === parseInt(removeId)) {
						if (userId === comment.owner || userId >= 2) {
							comments[index].status = 3; // Status removed, if you don't know.
							callback(null, comments);
						} else {
							callback({msg: 'У вас нет прав на удаление этого комментария'});
						}
					}
				});
			}],
			function(err, result) {
				if (err) return cb(err);
				
				cb(null, result);
			});
	}

};

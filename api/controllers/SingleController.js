/**
* SingleController
*
* @module :: Controller
* @description :: Тикеты.
*/
//FIXME: Поменять на глобальную переменную
var gct = require('../../utils/gct');

var moment = require('moment');
moment.lang('ru');


function singleBugreport(req, res, ticket) {
	async.waterfall([
		function findBugreport(callback) {
			Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
				if (err) return callback(err);

				bugreport.type = ticket.type;
				callback(null, bugreport);
			});
		},
		function serializeSingle(bugreport, callback) {
			gct.bugreport.serializeSingle(bugreport, null, function(err, result) {
				if (err) return callback(err);

				callback(null, result, bugreport);
			});
		},
		// Adding var for checking local moderators
		function canModerate(bugreport, origBugreport, callback) {
			if (req.user && (req.user.id === origBugreport.owner || req.user.group >= ugroup.mod)) {
				callback({show: true}, bugreport, true);
			} else {
				callback(null, bugreport, origBugreport);
			}
		},
		function getRights(bugreport, origBugreport, callback) {
			if (req.user) {
				Rights.find({
					uid: req.user.id
				}).done(function (err, rights) {
					if (err) return callback(err);

					if (rights.length !== 0) callback(null, bugreport, rights[0].canModerate, origBugreport);
						else callback({show: true}, bugreport, null, origBugreport);
				});
			} else {
				callback(null, bugreport, null, origBugreport);
			}
		},
		function checkRights(bugreport, canModerate, origBugreport, callback) {
			if (canModerate instanceof Array) {
				async.each(canModerate, function (element, callback) {
					if (element === origBugreport.product) 
						return callback(true);

					callback(null);
				}, function (canMod) {
					if (canMod) return callback(null, bugreport, true);

					callback(null, bugreport, false);
				});
			} else {
				callback(null, bugreport, false);
			}
		}
	], function (err, result, canModerate) {
		if (err)
			if (!err.show) throw err;
		
		
		res.view('single/bugreport', {
			moment: moment,
			ticket: result,
			globalid: ticket.id,
			canModerate: canModerate
		});
	});
}

function singleRempro(req, res, ticket) {
	
}

function singleBan(req, res, ticket) {
	Ban.findOne(ticket.tid).done(function (err, ban) {
		if (err) throw err;
		
		ban.type = ticket.type
		gct.ban.serializeSingle(ban, null, function(err, result) {
			if (err) throw err;
			
			res.view('single/ban', {
				moment: moment,
				ticket: result,
				globalid: ticket.id
			});
		});
	});
}

function singleUnban(req, res, ticket) {
	
}

function singleRegen(req, res, ticket) {
	
}

function singleAdmreq(req, res, ticket) {
	
}

module.exports = {

	routeSingle: function(req, res) {
		Ticket.findOne(req.param('id')).done(function (err, result) {
			if (err) throw err;
			
			if (result) {
				switch (result.type) {
					 case 1:
						return singleBugreport(req, res, result);
					 case 2:
						return singleRempro(req, res, result);
					 case 3:
						return singleBan(req, res, result);
					 case 4:
						return singleUnban(req, res, result);
					 case 5:
						return singleRegen(req, res, result);
					 case 6:
						return singleAdmreq(req, res, result);
					 default:
						return res.status(404).view('404', {layout: false});
				}
			} else {
				res.status(404).view('404', {layout: false});
			}
		})
	}
	
};

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
	Bugreport.findOne(ticket.tid).done(function (err, bugreport) {
		if (err) throw err;
    
    	gct.bugreport.serializeSingle(bugreport, function(err, result) {
			if (err) throw err;
			res.view('single/bugreport', {
				moment: moment,
				ticket: result,
                globalid: ticket.id
            })
        })
    })
}

function singleRempro(req, res, ticket) {
	
}

function singleBan(req, res, ticket) {
	
}

function singleUnban(req, res, ticket) {
	
}

function singleRegen(req, res, ticket) {
	
}

function singleAdmreq(req, res, ticket) {
	
}

module.exports = {

	routeSingles: function(req, res) {
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
	},

	listSingleComments: function(req, res) {
		if (!req.param('id')) return res.json(404,{error: 404});
		
		Ticket.findOne(req.param('id'))
			.done(function(err, ticket) {
				if (err) throw err;
				
				gct.serializeComments(ticket.comments, req.user.group, function(err, result) {
                    if (err) throw err;
                    
					res.json(JSON.stringify(result));
				});
			});
	},
	
    //TODO Закончить это!
	deleteCommentTpl: function(req, res) {
		if (!req.param('id')) return res.json(404,{error: 404});
		
		
	}
	
};

$(document).ready(function(socket){
try {
	var currentUrl = window.location.pathname;
	$.ajax({
		type: "GET",
		url: currentUrl + '/read',
		async: false,
		data: $(this).serialize(),
		complete: function(data) {
			$('#content').html('<table class="ui basic table" id="listTickets">' +
				'<thead>' +
				'<tr>' +
				 '<th>Тип</th>' +
				 '<th>Пользователь</th>' +
				 '<th>Тема</th>' +
				 '<th>Время</th>' +
				 '<th>Статус</th>' +
				'</tr></thead>' +
				'<tbody id="gc-list">' +
				'</tbody>' +
				'</table>');
			tickets = $.parseJSON(data.responseJSON);
			tickets.map(function(res) {
				$('#gc-list').append('<tr>' +
				'	<td class="t-type" title="' + res.type.descr + '"><i class="' + res.type.iconclass + ' icon"></i></td>' +
				'	<td class="t-nick"><a href="/user/'+ res.owner +'" class="gc-link">'+ res.owner +'</a></td>' +
				'	<td class="t-decr"><a title="#'+ res.id +'" href="/id/'+ res.id +'" class="gc-link">'+ res.title +'</a></td>' +
				'	<td class="t-time"><span title="' + moment(res.createdAt).format('Do MMM YYYY, h:mm') +'">' + moment(res.createdAt).fromNow() + '</span></td>' +
				'	<td class="t-status ' + res.status.class +'">'+ res.status.text +'</td>' +
				'</tr>');
			});
			if (tickets.length < 20) {
				$('#content').append('<div id="t-givemorebtn"><div class="ui basic small icon labeled right fluid disabled button">Больше нет тикетов</div></div>');
			} else {
				$('#content').append('<div id="t-givemorebtn"><button class="ui basic small icon labeled right fluid button" id="givememore">Загрузить ещё</button></div>');
			}
		}
	});
	
	var page = 1;
	$(document).on('click', '#givememore', function(e) {
		page = ++page;
		$.ajax({
		 type: "GET",
		 url: currentUrl + '/read/' + page,
		 data: $(this).serialize(),
		 beforeSend: function () {
			$('#t-givemorebtn').html('<div class="ui active inverted dimmer"><div class="ui text loader"></div></div>');
		 },
		 complete: function(data) {
			if (data.responseJSON.err ==='no more tickets') {
				$('#t-givemorebtn').html('<div class="ui basic small icon labeled right fluid disabled button">Больше нет тикетов</div>')	;
				return;
			}
			
			tickets = $.parseJSON(data.responseJSON);
			if (tickets.length < 20) {
				$('#t-givemorebtn').html('<div class="ui basic small icon labeled right fluid disabled button">Больше нет тикетов</div>');
			} else {
				$('#t-givemorebtn').html('<button class="ui basic small icon labeled right fluid button" id="givememore">Загрузить ещё</button>');
			}
			
			tickets.map(function(res) {
				$('#listTickets').append('<tr>' +
				'	<td class="t-type" title="' + res.type.descr + '"><i class="' + res.type.iconclass + ' icon"></i></td>' +
				'	<td class="t-nick"><a href="/user/'+ res.owner +'" class="gc-link">'+ res.owner +'</a></td>' +
				'	<td class="t-decr"><a title="#'+ res.id +'" href="/id/'+ res.id +'" class="gc-link">'+ res.title +'</a></td>' +
				'	<td class="t-time"><span title="' + moment(res.createdAt).format('Do MMM YYYY, h:mm') +'">' + moment(res.createdAt).fromNow() + '</span></td>' +
				'	<td class="t-status ' + res.status.class +'">'+ res.status.text +'</td>' +
				'</tr>');
			});
		 }
		});
		return false;
	});
} catch (err) {
	$('#content').html('<div class="ui error message" style="margin-top: 2em;"><div class="header">Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.</div></div>');
}
})

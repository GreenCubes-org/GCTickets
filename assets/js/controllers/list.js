var app = app || {};

app.list = {
	get: function () {
		app.list.process();
	},

	filterByStatus: function (status) {
		app.list.process(status);
	},

	process: function (status) {
		try {
			var currentUrl;
			if (status) {
				status = {
					filter: status
				};
			} else {
				status = {};
			}
			currentUrl = window.location.pathname;

			var lastTicket;

			$.ajax({
				type: "GET",
				url: currentUrl + '/read',
				async: false,
				data: status,
				complete: function(data) {
					var tickets = data.responseJSON;

					if (tickets.status === 404) {
						$('#l-content').html('<div class="ui info message"><div class="header">Неверный запрос!</div>Такое бывает, если вы ошиблись в URL адресе.</div>');
						$('#l-content').fadeIn(500).css('display','inline-block');
						return;
					}

					$('#l-content').html('<table class="ui basic table" id="listTickets">' +
						'<thead>' +
						'<tr>' +
						 '<th>Тип</th>' +
						 '<th>Пользователь</th>' +
						 '<th>Тема</th>' +
						 '<th style="width:14%">Время</th>' +
						 '<th>Статус</th>' +
						'</tr></thead>' +
						'<tbody id="gc-list">' +
						'</tbody>' +
						'</table>');

					tickets.map(function(res) {
						$('#gc-list').append('<tr>' +
						'	<td class="t-type" title="' + res.type.descr + '"><i class="' + res.type.iconclass + ' icon"></i></td>' +
						'	<td class="t-nick">'+ res.owner +'</td>' +
						'	<td class="t-descr"><a title="#'+ res.id +'" href="/id/'+ res.id +'" class="gc-link">'+ res.title +'</a></td>' +
						'	<td class="t-time"><span title="' + moment(res.createdAt).format('Do MMM YYYY, h:mm') +'">' + moment(res.createdAt).fromNow() + '</span></td>' +
						'	<td class="t-status ' + res.status.class +'">'+ res.status.text +'</td>' +
						'</tr>');
					});

					lastTicket = tickets[tickets.length - 1];

					if (tickets.length == 0) {
						$('#l-content').html('<div class="ui info message"><div class="header">Тикетов нет</div>По данному параметру фильтрации не найдено тикетов.</div>');
					} else if (tickets.length < 20) {
						$('#l-content').append('<div class="ui basic small icon labeled right fluid disabled button">Больше нет тикетов</div>');
					} else {
						$('#l-content').append('<div id="t-givemorebtn"><button class="ui basic small icon labeled right fluid button" id="givememore">Загрузить ещё</button></div>');
					}

					$('#l-content').fadeIn(500).css('display','inline-block');
				}
			});

			var page = 1;
			$(document).on('click', '#givememore', function(e) {
				page++;
				$.ajax({
				 type: "GET",
				 url: currentUrl + '/read/' + page,
				 data: 'lastelement=' + lastTicket.createdAt,
				 beforeSend: function () {
					$('#t-givemorebtn').html('<div class="ui active inverted dimmer"><div class="ui text loader"></div></div>');
				 },
				 complete: function(data) {
					if (data.responseJSON.err ==='no more tickets') {
						$('#t-givemorebtn').html('<div class="ui basic small icon labeled right fluid disabled button">Больше нет тикетов</div>');
						return;
					}

					var tickets = data.responseJSON;

					tickets.map(function(res) {
						$('#listTickets').append('<tr>' +
						'	<td class="t-type" title="' + res.type.descr + '"><i class="' + res.type.iconclass + ' icon"></i></td>' +
						'	<td class="t-nick">'+ res.owner +'</td>' +
						'	<td class="t-descr"><a title="#'+ res.id +'" href="/id/'+ res.id +'" class="gc-link">'+ res.title +'</a></td>' +
						'	<td class="t-time"><span title="' + moment(res.createdAt).format('Do MMM YYYY, h:mm') +'">' + moment(res.createdAt).fromNow() + '</span></td>' +
						'	<td class="t-status ' + res.status.class +'">'+ res.status.text +'</td>' +
						'</tr>');
					});

					lastTicket = tickets[tickets.length - 1];

					if (tickets.length < 20) {
						$('#t-givemorebtn').html('<div class="ui basic small icon labeled right fluid disabled button">Больше нет тикетов</div>');
					} else {
						$('#t-givemorebtn').html('<button class="ui basic small icon labeled right fluid button" id="givememore">Загрузить ещё</button>');
					}
				 }
				});
				return false;
			});
		} catch (err) {
			$('#l-content').html('<div class="ui error message" style="margin-top: 2em;"><div class="header">Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.</div></div>');
		}
	}
};

$(document).ready(function(){
	/*window.console = {
		log   : function(){},
		info  : function(){},
		error : function(){},
		warn  : function(){}
	};*/
	var currentUrl = window.location.pathname.split('/');
	var ticketId = currentUrl[2];
	$.ajax({
			type: "GET",
			url: '/csrfToken',
			success: function(csrfToken) {
				$.ajaxSetup({
					data: csrfToken
				});
			}
		});
	getComments(ticketId);
	
	// Init modals
	$('.ui.modal').modal();
	
	$(document).on('click', '#commentsubmit', function(e) {
		$.ajax({
			type: "POST",
			url: '/id/' + ticketId + '/comment',
			data: $('#commentpost').serialize(),
			beforeSend: function () {
				$('#commentfield').fadeIn('slow').append('<div class="ui active dimmer"><div class="ui loader"></div></div>');
			},
			complete: function(data) {
				$('#commentfield').html('<textarea></textarea>');

				if (data.responseJSON.error) {
					$('#commentfield').append('<div class="ui active dimmer">' +
					  '<div class="content">' +
						 '<div class="center">' +
							'<h2 class="ui inverted icon header">' +
								'<i class="icon circular inverted emphasized red exclamation"></i>' +
								'Произошла ошибка: ' + data.responseJSON.error +
							'</h2>' +
							'<small style="display:block;">Кликните по сообщению чтобы оно пропало</small>' +
						 '</div>' +
					  '</div>' +
					'</div>');
					$('.ui.active.dimmer').dimmer();
				} else if (data.responseJSON.code === 'OK') {
					getComments(ticketId);
				} else {
					$('#commentfield').append('<div class="ui active dimmer">' +
					  '<div class="content">' +
						 '<div class="center">' +
							'<h2 class="ui inverted icon header">' +
							  '<i class="icon circular inverted emphasized red exclamation"></i>' +
							  'Увы, но произошла ошибка!' +
							'</h2>' +
							'<small style="display:block;">Кликните по сообщению чтобы оно пропало</small>' +
						 '</div>' +
					  '</div>' +
					'</div>');
					$('.ui.active.dimmer').dimmer();
				}
			}
		});
		return false;
	});
	
	$(document).on('click', '#commentrefresh', function(e) {
		getComments(ticketId);
		return false;
	});
	
	$('#commentsubmit').popup({
		inline: true,
		position: 'top center',
		target: '#commentstatus',
		variation: 'inverted',
		title: 'Смена статуса'
	});
	$('#s-editicon').popup({
		inline: true,
		position: 'bottom center',
		variation: 'inverted',
		title: 'Изменить тикет'
	});
	$('#s-reporticon').popup({
		inline: true,
		position: 'bottom center',
		variation: 'inverted',
		title: 'Пожаловаться'
	});
	$('#commentstatus').dropdown();
	$('.ui.accordion').accordion();
	
	$(document).on('click', '#commentremove', function(e) {
		rembutton = this;
		
		$('#remcomment')
			.modal('setting', {
				transition: 'fade up',
				closable  : false,
				onDeny    : function(){
					return true;
				},
				onApprove : function() {
					cid = $(rembutton).attr('cid');
					
					$.ajax({
						type: "POST",
						url: '/id/' + ticketId + '/comment/' + cid + '/remove',
						data: {confirm: 'yeas'},
						beforeSend: function () {
							$('body').fadeIn('slow').append('<div class="ui active dimmer" id="removedimmer"><div class="ui loader"></div></div>');
						},
						complete: function(data) {
							$('#removedimmer').remove();
							if (data.status === 'err') {
								$('body').fadeIn('slow').append('<div class="header">Произошла ошибка!</div><div class="content">Пожалуйста, сообщите разработчику о ней</div><div class="actions"><div class="ui fluid button">Ладно, вернёмся обратно</div></div>');
							}
							
							if (data.msg) {
								$('body').fadeIn('slow').append('<div class="header">' + data.msg + '</div><div class="actions"><div class="ui fluid button">Ладно, вернёмся обратно</div></div>');
							}
							
							if (data.status === 'OK') {
								getComments(ticketId);
								$('body').fadeIn('slow').append('<div class="header">Комментарий успешно удалён</div><div class="content">Комментарий был успешно удалён, можно вернуться к работе</div><div class="actions"><div class="ui fluid button">Отлично, вернёмся обратно</div></div>');
							}
						}
					});
				}
			})
			.modal('show');
	});
});

function getComments(ticketId) {
		$.ajax({
			type: "GET",
			url: '/id/' + ticketId + '/comments',
			data: $(this).serialize(),
			beforeSend: function() {
				$('#commentpost').hide();
				$('#comments').html('<div class="ui active inverted dimmer" style="position: relative !important;padding:5em 0em;"><div class="ui text loader">Загружается</div></div>');
			},
			success: function(data) {
				comments = $.parseJSON(data);
				
				if (comments === null || comments.length === 0) {
					$('#comments').html('<div style="padding: 5em 0em;text-align: center;">Нет комментариев</div>');
					$('#commentpost').fadeIn(500);
					return;
				}
				
				$('#comments').html('');
				comments.map(function (comment) {
					$('#comments').append(
						'<div class="comment ' + comment.status + '" id="comment'+ comment.id +'">' +
						 '<div class="content">' +
							'<div class="ui ribbon label ' + comment.colorclass + '">' + comment.prefix + ' <a href="/user/'+ comment.owner +'">'+ comment.owner +'</a></div>' +
							'<div class="metadata">' +
							  '<a href="/id/'+ ticketId +'/#comment'+ comment.id +'" class="date" title="'+ moment(comment.createdAt).format('Do MMM YYYY h:mm') +'">'+ moment(comment.createdAt).fromNow() +'</a>' +
							  '<div class="ui inline top left pointing dropdown" id="commentoptions">' +
								 '<i class="ellipsis horizontal icon"></i>' +
								 '<div class="menu">' +
									'<a href="/id/'+ ticketId +'/comment/'+ comment.id +'/report"class="item">Репорт</a>' +
									'<a id="commentremove" cid="' + comment.id + '" class="item">Удалить</a>' +
								 '</div>' +
							  '</div>' +
							'</div>' +
							'<div class="text">' +
								comment.message +
							'</div>' +
						 '</div>' +
					  '</div>');
					$('.ui.inline.top.left.pointing.dropdown').dropdown();
				});
				$('#commentpost').show();
			}
	});
};
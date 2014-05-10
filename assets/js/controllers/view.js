var app = app || {};

function renderAllComments(ticketId) {
	getComments(ticketId, function(err, comments) {
		$('#commentssubheader').html('');
		if (comments === null || comments.length === 0) {
			$('#comments').html('<div style="padding: 5em 0em;text-align: center;font-size:1.4em">Нет комментариев</div>');
			$('#commentpost').fadeIn(500);
			return;
		}

		$('#comments').html('');

		var removedCount = 0;

		comments.forEach(function (comment) {
			if (comment.status === 3) {
				removedCount++;
				return;
			}

			if (comment.canModerate) {
				var menu = '<div class="ui inline top right pointing dropdown" id="commentoptions">' +
						 '<i class="ellipsis horizontal icon"></i>' +
						 '<div class="menu">' +
							'<a id="commentremove" cid="' + comment.id + '" do="remove" class="item">Удалить</a>' +
						 '</div>' +
					  '</div>';
			} else {
				var menu = '';
			}

			if (comment.changedTo) {
				var changedTo = '<div class="ui small divider"></div>' +
					'Изменён статус на <div class="ui small label ' + comment.changedTo.class + '">' + comment.changedTo.text + '</div>';
			} else {
				var changedTo = '';
			}

			$('#comments').append(
				'<div class="comment ' + comment.status + '" id="comment'+ comment.id +'">' +
				 '<div class="content">' +
					'<div class="ui ribbon label ' + comment.colorclass + '">' + comment.prefix + ' '+ comment.owner +'</div>' +
					'<div class="metadata">' +
					  '<a href="/id/'+ ticketId +'/#comment'+ comment.id +'" class="date" title="' + comment.createdAt.fullDate + '">'+ comment.createdAt.simply +'</a>' +
					 menu +
					'</div>' +
					'<div class="text">' +
						comment.message +
						changedTo +
					'</div>' +
				 '</div>' +
			  '</div>');
			$('.ui.inline.top.right.pointing.dropdown').dropdown();
		});

		if (removedCount !== 0 ) {
			$('#commentssubheader').html('Комментариев удалено: ' + removedCount);$('#commentssubheader');
		} else {
			$('#commentssubheader').html('');
		}

		$('#commentoptions').dropdown();
		$('#commentpost').fadeIn(500);
		$('#commentdivider').show();
	});
};

function renderRemovedComments(ticketId) {
	getComments(ticketId, function(err, comments) {
		$('#commentpost').hide();
		$('#commentdivider').hide();
		$('#commentssubheader').html('Показаны только удалённые');
		$('#comments').html('');

		comments = comments.map(function (comment) {
			if (comment.status !== 3) return undefined;
			if (comment.canModerate) {
				var menu = '<div class="ui inline top right pointing dropdown" id="commentoptions">' +
						 '<i class="ellipsis horizontal icon"></i>' +
						 '<div class="menu">' +
							'<a id="commentremove" cid="' + comment.id + '" do="recover" class="item">Восстановить</a>' +
							'<a id="commentremove" cid="' + comment.id + '" do="remove" class="item">Удалить безвозвратно</a>' +
						 '</div>' +
					  '</div>';
			} else {
				var menu = '';
			}

			if (comment.changedTo) {
				var changedTo = '<div class="ui small divider"></div>' +
					'Изменён статус на <div class="ui small label ' + comment.changedTo.class + '">' + comment.changedTo.text + '</div>';
			} else {
				var changedTo = '';
			}

			$('#comments').append(
				'<div class="comment ' + comment.status + '" id="comment'+ comment.id +'">' +
				 '<div class="content">' +
					'<div class="ui ribbon label ' + comment.colorclass + '">' + comment.prefix + ' '+ comment.owner +'</div>' +
					'<div class="metadata">' +
					  '<a href="/id/'+ ticketId +'/#comment'+ comment.id +'" class="date" title="' + comment.createdAt.fullDate + '">'+ comment.createdAt.simply +'</a>' +
					 menu +
					'</div>' +
					'<div class="text">' +
						comment.message +
						changedTo +
					'</div>' +
				 '</div>' +
			  '</div>');
			$('.ui.inline.top.right.pointing.dropdown').dropdown();

			return comment;
		});

		// Remove undefined elements
		comments = comments.filter(function (n) {
			return n
		});

		if (comments === null || comments.length === 0) {
			$('#comments').html('<div style="padding: 5em 0em;text-align: center;">Нет комментариев</div>');
			return;
		}

		$('#commentoptions').dropdown();
	});
};

function getComments(ticketId, callback) {
	$.ajax({
		type: "GET",
		url: '/id/' + ticketId + '/comments',
		data: $(this).serialize(),
		beforeSend: function() {
			$('#commentpost').hide();
			$('#comments').html('<div class="ui active inverted dimmer" style="position: relative !important;padding:5em 0em;"><div class="ui text loader">Загружается</div></div>');
		},
		success: function(data) {
			var comments = data || [];

			var parsedComments = comments.map(function (comment) {
				comment.createdAt = {
					fullDate: moment(comment.createdAt).format('Do MMM YYYY h:mm'),
					simply: moment(comment.createdAt).fromNow()
				};
				return comment;
			})

			callback(null, parsedComments);
		}
	});
};

app.view = {

	main: function (id) {
		$('#s-setstatus.ui.dropdown').dropdown();

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
		renderAllComments(ticketId);

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
					$('#commentfield').html('<textarea name="message" id="commentform"></textarea>');

					if (data.responseJSON.error) {
						$('#commentfield').append('<div class="ui active dimmer">' +
						  '<div class="content">' +
							 '<div class="center">' +
								'<h2 class="ui inverted icon header">' +
									'<i class="icon circular inverted emphasized red exclamation"></i>' +
									data.responseJSON.error +
								'</h2>' +
								'<small style="display:block;">Кликните по сообщению чтобы оно пропало</small>' +
							 '</div>' +
						  '</div>' +
						'</div>');
						$('.ui.active.dimmer').dimmer();
					} else if (data.responseJSON.changedTo) {
						location.reload();
					} else if (data.responseJSON.code === 'OK') {
						renderAllComments(ticketId);
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
					$('#commentsubmit').reset();
				}
			});
			return false;
		});

		$(document).on('click', '#commentrefresh', function(e) {
			renderAllComments(ticketId);
			return false;
		});

		$(document).on('click', '#commentremoved', function(e) {
			renderRemovedComments(ticketId);
			return false;
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
						var cid = $(rembutton).attr('cid');
						var action = $(rembutton).attr('do');

						$.ajax({
							type: "POST",
							url: '/id/' + ticketId + '/comment/' + cid + '/remove',
							data: {action: action},
							beforeSend: function () {
								$('body').fadeIn('slow').append('<div class="ui active dimmer" id="removedimmer"><div class="ui active dimmer" id="removedimmer"><div class="ui loader"></div></div></div>');
							},
							complete: function(data) {
								$('#removedimmer').remove();
								if (data.responseJSON.status === 'err') {
									$('body').fadeIn('slow').append('<div class="ui active dimmer" id="removedimmer"><div class="header">Произошла ошибка!</div><div class="content">Пожалуйста, сообщите разработчику о ней</div><div class="actions"><div class="ui fluid button">Ладно, вернёмся обратно</div></div></div>');
								}

								if (data.responseJSON.msg) {
									$('body').fadeIn('slow').append('<div class="ui active dimmer" id="removedimmer"><div class="header">' + data.msg + '</div><div class="actions"><div class="ui fluid button">Ладно, вернёмся обратно</div></div></div>');
								}

								if (data.responseJSON.status === 'OK') {
									renderAllComments(ticketId);
								}
							}
						});
					}
				})
				.modal('show');
		});

		/* Rempro type only */
		$("input.s-regionstuffitem").on("click", function () {
			$(this).select();
		});
	},

	edit: function(id) {
		var currentUrl = window.location.pathname.split('/');
		var ticketId = currentUrl[2];
		var csrfToken = $('#_csrf').attr('value');
		$('#gc-reportform .ui.dropdown').dropdown();

		var descriptionCode;
		if ($('#description').length > 0) {
			$('#description').wysibb({
				buttons: 'bold,italic,underline,|link,|,quote'
			});
			descriptionCode = $('#description').html();
			$('#description').sync();
		}
		if ($('#reason').length > 0) {
			$('#reason').wysibb({
				buttons: 'bold,italic,underline,|link,|,quote'
			});
			descriptionCode = $('#reason').html();
			$('#reason').sync();
		}
		$('.ui.checkbox').checkbox();
		$('.gc-helppopup').popup();

		$(document).on('submit', "#gc-reportform", function (e) {
			e.preventDefault();
			var formData = new FormData($('form#gc-reportform')[0]);
			$.ajax({
				type: "POST",
				url: document.location.path,
				data: formData,
				mimeType: "multipart/form-data",
				contentType: false,
				cache: false,
				processData: false,
				success: function (data) {
					data = JSON.parse(data);
					if (data.id) {
						window.location = '/id/' + data.id;
					} else if (data.err) {
						console.log(data.err);
						$('#gc-reportformdiv').addClass('error');
						$('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">' + data.err + '</div></div>');
					} else if (data.status === 413) {
						$('#gc-reportformdiv').addClass('error');
						$('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">Загрузка файлов больше 10 мегабайт запрещена</div></div>');
					} else {
						$('#gc-reportformdiv').addClass('error');
						$('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">Внезапная необычная ошибка. Пожалуйста, сообщите о ней разработчику.</div></div>');
					}
				},
			});

			return false;
		});

		$(document).on('click', '#deleteticket', function (e) {
			$('#remticket')
				.modal('setting', {
					transition: 'fade up',
					closable  : false,
					onDeny    : function(){
						return true;
					},
					onApprove : function() {
						$.ajax({
							type: "POST",
							url: '/id/' + ticketId + '/delete',
							data: {
								action: 'remove',
								_csrf: csrfToken
							},
							beforeSend: function () {
								$('body').fadeIn('slow').append('<div class="ui active dimmer" id="removedimmer"><div class="ui active dimmer" id="removedimmer"><div class="ui loader"></div></div></div>');
							},
							complete: function(data) {
								$('#removedimmer').remove();
								if (data.responseJSON.status === 'err') {
									$('body').fadeIn('slow').append('<div class="ui active dimmer" id="removedimmer"><div class="header">Произошла ошибка!</div><div class="content">Пожалуйста, сообщите разработчику о ней</div><div class="actions"><div class="ui fluid button">Ладно, вернёмся обратно</div></div></div>');
								}

								if (data.responseJSON.msg) {
									$('body').fadeIn('slow').append('<div class="ui active dimmer" id="removedimmer"><div class="header">' + data.msg + '</div><div class="actions"><div class="ui fluid button">Ладно, вернёмся обратно</div></div></div>');
								}

								if (data.responseJSON.status === 'OK') {
									window.location = '/';
								}
							}
						});
					}
				})
				.modal('show');
		});
	}
};

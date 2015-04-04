var app = app || {};

app.create = {
	main: function () {

		if ($('#description')) {
			$('#description').wysibb({
				lang: 'ru',
				buttons: 'bold,italic,underline,|,link,numlist,code,|,spoiler',
				allButtons: {
					spoiler: {
						title: __.t('global.spoiler'),
						buttonText: 'Spoiler',
						transform: {
							'<div class="ui basic accordion"><div class="title"><i class="dropdown icon"></i></div><div class="content">{SELTEXT}</div></div>':'[spoiler]{SELTEXT}[/spoiler]'
						}
					},
					code: {
						title: __.t('global.code'),
						buttonText: 'Code',
						transform: {
							'<pre><code>{SELTEXT}</code></pre>':'[code]{SELTEXT}[/code]'
						}
					}
				}
			});
		}
		if ($('#reason')) {
			$('#reason').wysibb({
				lang: 'ru',
				buttons: 'bold,italic,underline,|,link,numlist,code,|,spoiler',
				allButtons: {
					spoiler: {
						title: __.t('global.spoiler'),
						buttonText: 'Spoiler',
						transform: {
							'<div class="ui basic accordion"><div class="title"><i class="dropdown icon"></i></div><div class="content">{SELTEXT}</div></div>':'[spoiler]{SELTEXT}[/spoiler]'
						}
					},
					code: {
						title: __.t('global.code'),
						buttonText: 'Code',
						transform: {
							'<pre><code>{SELTEXT}</code></pre>':'[code]{SELTEXT}[/code]'
						}
					}
				}
			});
		}

		$('body').on('DOMNodeInserted', '.ui.accordion', function () {
			$('.ui.accordion').accordion();
		});

		$('#gc-reportform .ui.dropdown').dropdown();

		$('.ui.checkbox').checkbox();
		$('.gc-helppopup').popup();

		$(document).on('submit', "#gc-reportform", function (e) {
			e.preventDefault();
			$('#senddimmer').dimmer('toggle');
			var formData = new FormData($('form#gc-reportform')[0]);
			$.ajax({
				type: "POST",
				url: document.URL,
				data: formData,
				mimeType: "multipart/form-data",
				contentType: false,
				cache: false,
				processData: false,
				success: function (data) {
					data = JSON.parse(data);

					$('#senddimmer').dimmer('toggle');

					if (data.id) {
						$('#commentsubmit').trigger( 'reset' );
						window.location = '/id/' + data.id;
					} else if (data.err) {
						console.log(data.err);
						$('#gc-reportformdiv').addClass('error');
						$('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">' + data.err + '</div></div>');
						$('#modalerrormessage').html(data.err);
						$('#errormodal')
							.modal('setting', {
								transition: 'fade up',
								closable  : true
							})
							.modal('show');
					} else if (data.status === 413) {
						$('#gc-reportformdiv').addClass('error');
						$('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">' + __.t('global.uploadingmore10mb') + '</div></div>');
						$('#modalerrormessage').html(__.t('global.uploadingmore10mb'));
						$('#errormodal')
							.modal('setting', {
								transition: 'fade up',
								closable  : true
							})
							.modal('show');
					} else {
						$('#gc-reportformdiv').addClass('error');
						$('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">' + __.t('global.suddenerror') + '</div></div>');
						$('#modalerrormessage').html(__.t('global.suddenerror'));
						$('#errormodal')
							.modal('setting', {
								transition: 'fade up',
								closable  : true
							})
							.modal('show');
					}

				},
			});
			return false;
		});

		$('a').mousedown(function (event){
			if (event.which !== 1) return;

			var link = this;
			$('#unsavedlink')
				.modal('setting', {
					transition: 'fade up',
					closable  : false,
					onDeny    : function(){
						return true;
					},
					onApprove : function() {
						window.location.href = link;
					}
				})
				.modal('show');
			event.preventDefault();
		});

		$('span#venusguidelink').click(function (event){
			window.open($(this).attr('href'),'_blank');
		});

		var titleDefaultPlaceholder = $('#title').attr('placeholder');

		$('#createdfor').on('input', function() {
			if ($(this).val()) {
				$('#title').attr('placeholder', __.t('global.createdfor', {nickname: $(this).val()}));
			} else {
				$('#title').attr('placeholder', titleDefaultPlaceholder);
			}
		});
	}
};

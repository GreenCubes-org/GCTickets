var app = app || {};

app.create = {
	main: function () {
		if ($('#description')) {
			$('#description').wysibb({
				lang: 'ru',
				buttons: 'bold,italic,underline,|,link,numlist'
			});
		}
		if ($('#reason')) {
			$('#reason').wysibb({
				lang: 'ru',
				buttons: 'bold,italic,underline,|,link,numlist'
			});
		}
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
						$('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">Загрузка файлов больше 10 мегабайт запрещена</div></div>');
						$('#modalerrormessage').html('Загрузка файлов больше 10 мегабайт запрещена');
						$('#errormodal')
							.modal('setting', {
								transition: 'fade up',
								closable  : true
							})
							.modal('show');
					} else {
						$('#gc-reportformdiv').addClass('error');
						$('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">Внезапная необычная ошибка. Пожалуйста, сообщите о ней разработчику.</div></div>');
						$('#modalerrormessage').html('Внезапная необычная ошибка. Пожалуйста, сообщите о ней разработчику.');
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

		$('a').click(function (event){
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

		var titleDefaultPlaceholder = $('#title').attr('placeholder');

		$('#createdfor').on('input', function() {
			if ($(this).val()) {
				$('#title').attr('placeholder', 'Заявка для ' + $(this).val());
			} else {
				$('#title').attr('placeholder', titleDefaultPlaceholder);
			}
		});
	}
};

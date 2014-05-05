var app = app || {};

app.create = {
	main: function () {
		if ($('#description')) {
			$('#description').wysibb({
				buttons: 'bold,italic,underline,|link,|,quote'
			});
		}
		if ($('#reason')) {
			$('#reason').wysibb({
				buttons: 'bold,italic,underline,|link,|,quote'
			});
		}
		$('#gc-reportform .ui.dropdown').dropdown();

		$('.ui.checkbox').checkbox();

		$(document).on('submit', "#gc-reportform", function (e) {
			e.preventDefault();
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
					$('#gc-reportform').reset();
				},
			});
			return false;
		});
	}
};

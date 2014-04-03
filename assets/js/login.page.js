// TODO: ПОФИКСИТЬ ЭТО К НОРМАЛЬНОМУ ВИДУ.
$(document).on('submit', "#loginform", function (e) {
	$.ajax({
		type: "POST",
		url: '/login',
		data: $('form#loginform').serialize(),
		success: function (data) {
			if (!data.error) {
				window.location = '/';
			} else {
				$('#loginerr').html('<div class="ui error message"><div class="header">' + data.error.message + '</div></div>');
			}
		},
		error: function (err) {
			html = formhtml = '<div class="ui error message"><div class="header">Внезапная необычная ошибка. Пожалуйста, сообщите о ней разработчику.</div></div>';
		}
	});
	return false;
});
var app = app || {};

app.list = {
	main: function () {
		$('#l-setstartpage').click(function () {
			$.ajax({
				type: "POST",
				url: '/settings',
				async: false,
				data: {
					_csrf: $('#_csrf').attr('value'),
					startPage: window.location.pathname + window.location.search
				},
				complete: function(data) {
					if (data.responseJSON.code === 'OK') {
						window.location.reload();
						return;
					}
					if (data.responseJSON.code === 'err') {
						alert(data.message);
					}
				}
			});
		});
	}
};

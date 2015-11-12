var app = app || {};

app.settings = function () {

	$('#gc-reportform').submit(function () {
		$.ajax({
			type: "POST",
			url: '/settings',
			data: $(this).serialize(),
			success: function (data) {
				window.location.search = "";
			},
		});
		return false;
	});

	$('#gc-languagedropdown').dropdown();

};

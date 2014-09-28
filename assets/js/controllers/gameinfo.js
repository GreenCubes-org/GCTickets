var app = app || {};

app.gameinfo = {
	playerInfo: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input#gc-forminput').val();
		});
	}
};

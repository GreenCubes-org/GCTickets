var app = app || {};

app.gameinfo = {
	player: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input#gc-forminput').val();
		});
	},

	worldRegioninfo: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?regionname=' + $('input#gc-forminput').val();
		});
	}
};

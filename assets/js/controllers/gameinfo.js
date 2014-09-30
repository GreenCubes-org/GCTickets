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
	},

	worldBlockslog: function () {
		$('#gc-formfirstsubmit').click(function () {
			window.location.search = '?xyz=' + $('input#gc-formxyzinput').val() + '&block=' + $('input#gc-formfirstblockinput').val();
		});

		$('#gc-formsecondsubmit').click(function () {
			window.location.search = '?firstxyz=' + $('input#gc-formfirstxyzinput').val() + '&secondxyz=' + $('input#gc-formsecondxyzinput').val() + '&firsttime=' + $('input#gc-formfirsttimeinput').val() + '&secondtime=' + $('input#gc-formsecondtimeinput').val() + '&block=' + $('input#gc-formsecondblockinput').val();
		});

		$('.gc-formdropdown').dropdown();
	}
};

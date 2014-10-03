var app = app || {};

app.gameinfo = {
	player: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val();
		});
	},

	worldMoneylog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?sender=' + $('input[name=sender]').val() + '&senderType=' + $('input[name=senderType]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input[name=block]').val();

			$('.gc-formdropdown').dropdown();
		});
	},

	worldRegioninfo: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?regionname=' + $('input[name=regionname]').val();
		});
	},

	worldBlockslog: function () {
		$('#gc-formfirstsubmit').click(function () {
			window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&block=' + $('input#gc-formfirstblockinput').val();
		});

		$('#gc-formsecondsubmit').click(function () {
			window.location.search = '?firstxyz=' + $('input[name=firstxyz]').val() + '&secondxyz=' + $('input[name=secondxyz]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input#gc-formsecondblockinput').val();
		});

		$('.gc-formdropdown').dropdown();
	}
};

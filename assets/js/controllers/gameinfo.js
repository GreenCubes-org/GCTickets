var app = app || {};

app.gameinfo = {
	player: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val();
		});
		
		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val();
			}
			e.stopPropagation();
		});
	},

	playerLoginlog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&ip=' + $('input[name=ip]').val() + '&hwid=' + $('input[name=hwid]').val() + '&sort=' + $('input[name=sort]').val();
		});
		
		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&ip=' + $('input[name=ip]').val() + '&hwid=' + $('input[name=hwid]').val() + '&sort=' + $('input[name=sort]').val();
			}

			e.stopPropagation();
		});
	},

	playerChatlog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&channelid=' + $('input[name=channelid]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]').val();
		});
		
		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&channelid=' + $('input[name=channelid]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]').val();
			}

			e.stopPropagation();
		});
	},

	playerCommandslog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]').val();
		});
		
		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]').val();
			}

			e.stopPropagation();
		});
	},

	playerChestslog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]').val();
		});
		
		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]').val();
			}

			e.stopPropagation();
		});

		$('.ui.checkbox').checkbox();
	},

	worldMoneylog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?sender=' + $('input[name=sender]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input[name=block]').val() + '&sort=' + $('input[name=sort]').val();
		});
		
		$('input[name=sender]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?sender=' + $('input[name=sender]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input[name=block]').val() + '&sort=' + $('input[name=sort]').val();
			}

			e.stopPropagation();
		});

		$('.ui.checkbox').checkbox();
	},

	worldRegioninfo: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?regionname=' + $('input[name=regionname]').val();
		});
		
		$('input[name=regionname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?regionname=' + $('input[name=regionname]').val();
			}

			e.stopPropagation();
		});
	},

	worldBlockslog: function () {
		$('#gc-formfirstsubmit').click(function () {
			window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&block=' + $('input#gc-formfirstblockinput').val() + '&sort=' + $('input[name=sort]').val();
		});
		
		$('input[name=xyz]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&block=' + $('input#gc-formfirstblockinput').val() + '&sort=' + $('input[name=sort]').val();
			}

			e.stopPropagation();
		});

		$('#gc-formsecondsubmit').click(function () {
			window.location.search = '?firstxyz=' + $('input[name=firstxyz]').val() + '&secondxyz=' + $('input[name=secondxyz]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input#gc-formsecondblockinput').val() + '&sort=' + $('input[name=sort]').val();
		});

		$('.gc-formdropdown').dropdown();
	},

	worldChestlog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]').val();
		});
		
		$('input[name=xyz]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]').val();
			}

			e.stopPropagation();
		});

		$('.ui.checkbox').checkbox();
	},
};

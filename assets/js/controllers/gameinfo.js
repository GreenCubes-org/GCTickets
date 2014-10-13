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
			e.preventDefault();
			return false;
		});
	},

	playerLoginlog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&ip=' + $('input[name=ip]').val() + '&hwid=' + $('input[name=hwid]').val();
		});
		
		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&ip=' + $('input[name=ip]').val() + '&hwid=' + $('input[name=hwid]').val();
			}
			e.preventDefault();
			return false;
		});
	},

	playerChatlog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&channelid=' + $('input[name=channelid]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val();
		});
		
		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&channelid=' + $('input[name=channelid]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val();
			}
			e.preventDefault();
			return false;
		});
	},

	playerCommandslog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val();
		});
		
		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val();
			}
			e.preventDefault();
			return false;
		});
	},

	playerChestslog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val();
		});
		
		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val();
			}
			e.preventDefault();
			return false;
		});
	},

	worldMoneylog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?sender=' + $('input[name=sender]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input[name=block]').val();
		});
		
		$('input[name=sender]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?sender=' + $('input[name=sender]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input[name=block]').val();
			}
			e.preventDefault();
			return false;
		});
	},

	worldRegioninfo: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?regionname=' + $('input[name=regionname]').val();
		});
		
		$('input[name=regionname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?regionname=' + $('input[name=regionname]').val();
			}
			e.preventDefault();
			return false;
		});
	},

	worldBlockslog: function () {
		$('#gc-formfirstsubmit').click(function () {
			window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&block=' + $('input#gc-formfirstblockinput').val();
		});
		
		$('input[name=xyz]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&block=' + $('input#gc-formfirstblockinput').val();
			}
			e.preventDefault();
			return false;
		});

		$('#gc-formsecondsubmit').click(function () {
			window.location.search = '?firstxyz=' + $('input[name=firstxyz]').val() + '&secondxyz=' + $('input[name=secondxyz]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input#gc-formsecondblockinput').val();
		});

		$('.gc-formdropdown').dropdown();
	},

	worldChestlog: function () {
		$('#gc-formsubmit').click(function () {
			window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val();
		});
		
		$('input[name=xyz]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val();
			}
			e.preventDefault();
			return false;
		});
	},
};

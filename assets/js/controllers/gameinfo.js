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
		$('.ui.checkbox').checkbox();

		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&ip=' + $('input[name=ip]').val() + '&hwid=' + $('input[name=hwid]').val() + '&sort=' + $('input[name=sort]:checked').val();
		});

		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&ip=' + $('input[name=ip]').val() + '&hwid=' + $('input[name=hwid]').val() + '&sort=' + $('input[name=sort]:checked:checked').val();
			}

			e.stopPropagation();
		});
	},

	playerChatlog: function () {
		$('.ui.checkbox').checkbox();

		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&channelid=' + $('input[name=channelid]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]:checked').val();
		});

		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&channelid=' + $('input[name=channelid]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]:checked').val();
			}

			e.stopPropagation();
		});
	},

	playerCommandslog: function () {
		$('.ui.checkbox').checkbox();

		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]:checked').val();
		});

		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]:checked').val();
			}

			e.stopPropagation();
		});
	},

	playerChestslog: function () {
		$('.ui.checkbox').checkbox();

		$('#gc-formsubmit').click(function () {
			window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]:checked').val();
		});

		$('input[name=nickname]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?nickname=' + $('input[name=nickname]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]:checked').val();
			}

			e.stopPropagation();
		});

		$('.ui.checkbox').checkbox();
	},

	worldMoneylog: function () {
		$('.ui.checkbox').checkbox();

		$('#gc-formsubmit').click(function () {
			window.location.search = '?sender=' + $('input[name=sender]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input[name=block]').val() + '&sort=' + $('input[name=sort]:checked').val();
		});

		$('input[name=sender]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?sender=' + $('input[name=sender]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input[name=block]').val() + '&sort=' + $('input[name=sort]:checked').val();
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
		$('.ui.checkbox').checkbox();

		$('#gc-formfirstsubmit').click(function () {
			window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&block=' + $('input#gc-formfirstblockinput').val() + '&sort=' + $('input[name=sort]:checked').val();
		});

		$('input[name=xyz]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&block=' + $('input#gc-formfirstblockinput').val() + '&sort=' + $('input[name=sort]:checked').val();
			}

			e.stopPropagation();
		});

		$('#gc-formsecondsubmit').click(function () {
			window.location.search = '?firstxyz=' + $('input[name=firstxyz]').val() + '&secondxyz=' + $('input[name=secondxyz]').val() + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&block=' + $('input#gc-formsecondblockinput').val() + '&sort=' + $('input[name=sort]:checked').val();
		});

		$('.gc-formdropdown').dropdown();
	},

	worldChestlog: function () {
		$('.ui.checkbox').checkbox();

		$('#gc-formsubmit').click(function () {
			window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]:checked').val();
		});

		$('input[name=xyz]').keypress(function (e) {
			if (e.which == 13) {
				window.location.search = '?xyz=' + $('input[name=xyz]').val() + '&time=' + $('input[name=time]').prop('checked') + '&firsttime=' + $('input[name=firsttime]').val() + '&secondtime=' + $('input[name=secondtime]').val() + '&sort=' + $('input[name=sort]:checked').val();
			}

			e.stopPropagation();
		});

		$('.ui.checkbox').checkbox();
	},

	worldStatistics: function () {
		$.ajax({
			type: "GET",
			url: '/gameinfo/world/statistics/players',
			success: function (data) {
				$('#players-chart').highcharts('StockChart', {


					rangeSelector: {
						selected: 1
					},

					title: {
						text: 'Players statistics'
					},

					series: [{
						name: 'Registrations',
						data: data.data.registrations,
						tooltip: {
							valueDecimals: 2
						}
					},{
						name: 'Players that activated their account',
						data: data.data.activations,
						tooltip: {
							valueDecimals: 2
						}
					},
					{
						name: 'Players that played on server',
						data: data.data.online,
						tooltip: {
							valueDecimals: 2
						}
					}]
				});
			},
		});

		$.ajax({
			type: "GET",
			url: '/gameinfo/world/statistics/quests',
			success: function (data) {
				$('#quests-chart').highcharts('StockChart', {


					rangeSelector: {
						selected: 1
					},

					title: {
						text: 'Quests statistics'
					},

					series: [{
						name: 'Total players',
						data: data.data.players,
						tooltip: {
							valueDecimals: 2
						}
					},{
						name: 'Players that passed quest #2',
						data: data.data.quest2,
						tooltip: {
							valueDecimals: 2
						}
					},{
						name: 'Players that passed quest #6',
						data: data.data.quest6,
						tooltip: {
							valueDecimals: 2
						}
					},{
						name: 'Players that passed quest #11',
						data: data.data.quest11,
						tooltip: {
							valueDecimals: 2
						}
					},{
						name: 'Players that passed quest #16',
						data: data.data.quest16,
						tooltip: {
							valueDecimals: 2
						}
					},{
						name: 'Players that passed quest #24',
						data: data.data.quest24,
						tooltip: {
							valueDecimals: 2
						}
					}]
				});
			},
		});
	}
};

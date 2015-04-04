var getNotifs = function getNotifs(callback) {
	$.ajax({
		type: "GET",
		url: '/notifs',
		data: {},
		beforeSend: function () {
			$('#gc-notifmodal #gc-notiftable').hide();
			$('#gc-notifmodal .content').append('<div class="ui active inverted dimmer" style="position: relative !important;padding:5em 0em;" id="loadingmodal"><div class="ui text loader">' + __.t('global.loading') + '</div></div>');
		},
		success: function (data) {
			var notifs = data || [];

			return callback(notifs);
		}
	});
};

var renderNotifs = function renderNotifs() {
	getNotifs(function (notifs) {
		$('#gc-notifnumber').html(notifs.length);
		$('#gc-notifheaderbutton').prop('title', __.t('all.notifs.tooltip', {num: notifs.length}));

		$('#loadingmodal').remove();
		$('#nonotifs').remove();

		if (notifs.length) {
			$('#gc-notifheaderbutton').addClass('newnotifs');
		} else {
			$('#gc-notifheaderbutton').removeClass('newnotifs');
			return $('#gc-notifmodal .content').append('<div style="padding: 7em 0em;text-align: center;font-size:1.4em" id="nonotifs">' + __.t('all.notifs.nonotifs') + '</div>');
		}

		$('#gc-notifmodal .content').html('<table class="ui basic padded large table" id="gc-notiftable">' +
			'<tbody id="gc-notiftablebody"></tbody>' +
		'</table>');

		notifs = notifs.map(function (el) {

			switch (el.type.id) {
				case 1:
					el.html = __.t('all.notifs.type.1', {
						user: el.user,
						tid: el.ticket.id,
						cid: el.cid,
						title: el.ticket.title
					});
					break;

				case 2:
					el.html = __.t('all.notifs.type.2', {
						user: el.user,
						tid: el.ticket.id,
						cid: el.cid,
						title: el.ticket.title,
						changedToClass: el.changedTo.class,
						changedToText: el.changedTo.text
					});
					break;

				case 3:
					el.html = __.t('all.notifs.type.3', {
						tid: el.ticket.id,
						title: el.ticket.title
					});
					break;

				case 4:
					el.html = __.t('all.notifs.type.4', {
						user: el.user,
						tid: el.ticket.id,
						cid: el.cid,
						title: el.ticket.title
					});
					break;

				default:
					el.html = '&mdash;';
					break;
			}

			return el;
		});

		notifs.forEach(function (el) {
			$('#gc-notiftablebody').append('<tr>' +
				'<td title="' + el.type.text + '"><i class="' + el.type.iconclass + ' icon"></i></td>' +
				'<td>' + el.html + '</td>' +
				'</tr>');
		});
	});
};

$(document).ready(function () {
	$.ajax({
		type: "GET",
		url: '/csrfToken',
		success: function (csrfToken) {
			$.ajaxSetup({
				data: csrfToken
			});
		}
	});

	renderNotifs();

	/* Notification modal */
	$('#gc-notifheaderbutton').click(function () {
		$('#gc-notifmodal').modal('setting', {
			onDeny: function () {
				$.ajax({
					type: "DELETE",
					url: '/notifs',
					data: {},
					beforeSend: function () {
						$('#gc-notifmodal #gc-notiftable').hide();
						$('#gc-notifmodal .content').append('<div class="ui active inverted dimmer" style="position: relative !important;padding:5em 0em;" id="loadingmodal"><div class="ui text loader">' + __.t('global.loading') + '</div></div>');
					},
					success: function (data) {
						$('#gc-notifmodal .content').html('<div style="padding: 7em 0em;text-align: center;font-size:1.4em" id="nonotifs">' + __.t('all.notifs.successflydeleted') + '</div>');

						$('#gc-notifheaderbutton').removeClass('newnotifs');
						$('#gc-notifnumber').html(0);
					}
				});

				return false;
			},
			onApprove: function () {
				renderNotifs();

				return false;
			},
			onShow: function () {
				$('#gc-notifmodal .content').css('height', $(window).height() - 250);
				$('#gc-notifmodal').css('margin-top','3em');
				$('#gc-notifmodal').css('top','0%');
			}
		}).modal('show');
	});

	/* Logout modal */

	$('#gc-logoutbutton').click(function () {
		$('#gc-logoutmodal').modal('setting', {
			onDeny: function () {
				return true;
			},
			onApprove: function () {
				window.location.replace('/logout');
			}
		}).modal('show');
	});

	/* Lang dropdown */
	$('.ui.lang.dropdown').dropdown({
		on: 'hover',
		transition: 'slide up'
	});
});

var app = app || {};

app.tickets = {
	main: function () {
		var currentUrl = window.location.pathname.split('/');
		var ticketId = currentUrl[2];

		$('.ui.accordion').accordion();

		var submitForm = function () {
			$.ajax({
				type: "POST",
				url: '/api/comments/new',
				data: $('#commentpost').serialize() + '&tid=' + ticketId,
				beforeSend: function () {
					$('#commentfield').fadeIn('slow').append('<div class="ui active segment dimmer"><div class="ui loader"></div></div>');
				},
				complete: function (data) {
					$('#commentfield').html('<textarea name="message" id="commentform"></textarea>');

					if (data.responseJSON.error) {
						alert('Сообщите разработчикам об ошибке: ' + data.responseJSON.error);
						$('.ui.active.dimmer').dimmer();
					} else if (data.responseJSON.code === 'OK') {
						$('#commentpost').trigger('reset');
						window.location.reload();
						return true;
					} else {
						alert('Произошла неизвестная ошибка.');
						$('.ui.active.dimmer').dimmer();
					}
					$('#commentpost').trigger('reset');
					return true;
				}
			});
		};

		// Submit comment form on Ctrl+Enter
		$(document).on('keypress', '#commentform', function (event) {
			if ((event.keyCode === 10 || event.keyCode == 13) && event.ctrlKey) {
				submitForm();

				return false;
			}
			event.stopPropagation();
		});

		$(document).on('click', '#commentsubmit', function (e) {
			submitForm();
			return false;
		});
	},

	list: function () {
		$('#gc-filter-submit').click(function () {
			var json = $('#gc-filter-form').serializeJSON({useIntKeysAsArrayIndex: true});

			console.log(json, $('#gc-filter-form'));

			// Remove undefined elements in arrays
			if (json.status) {
				json.status = json.status.filter(function (n) {
					return n
				});
			}

			if (json.product) {
				json.product = json.product.filter(function (n) {
					return n
				});
			}

			if (json.type) {
				json.type = json.type.filter(function (n) {
					return n
				});
			}

			window.location = window.location.pathname+ '?edgy=aspuck' + ((json.sort) ? '&sort=' + json.sort : '') + ((json.visibility) ? '&visibility=' + json.visibility : '') + ((json.status) ? '&status=' + json.status.join(',') : '') + ((json.product) ? '&product=' + json.product.join(',') : '') + ((json.type) ? '&type=' + json.type.join(',') : '');
		});

		$('#gc-filter-reset').click(function () {
			window.location = window.location.pathname;
		});

		$('.ui.accordion').accordion();

		$('.ui.checkbox').checkbox();

		$('.filter-status-done').change(function () {
			var _this = this;

			$('.' + this.className).not(this).prop('checked', this.checked);
		});
	}
};

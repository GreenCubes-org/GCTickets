var app = app || {};

app.list = {
	main: function () {
		$('#l-setstartpage').click(function () {
			$.ajax({
				type: "POST",
				url: '/settings',
				async: false,
				data: {
					_csrf: $('#_csrf').attr('value'),
					startPage: window.location.pathname + window.location.search
				},
				complete: function(data) {
					if (data.responseJSON.code === 'OK') {
						window.location.reload();
						return;
					}
					if (data.responseJSON.code === 'err') {
						alert(data.message);
					}
				}
			});
		});

		$('#gc-filter-submit').click(function () {
			var json = $('#gc-filter-form').serializeJSON({useIntKeysAsArrayIndex: true});

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

			window.location = window.location.pathname+ '?cake=isalie' + ((json.sort) ? '&sort=' + json.sort : '') + ((json.visibility) ? '&visibility=' + json.visibility : '') + ((json.status) ? '&status=' + json.status.join(',') : '') + ((json.product) ? '&product=' + json.product.join(',') : '') + ((json.type) ? '&type=' + json.type.join(',') : '');
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

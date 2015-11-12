var app = app || {};

app.admin = {
	roles: function () {
		$('.ui.fluid.dropdown').dropdown();
		$('.ui.checkbox').checkbox();

		$(document).on('submit', "#gc-newrole", function(e) {
			$.ajax({
				type: "POST",
				url: '/admin/users/roles/new',
				data: $('form#gc-newrole').serialize(),
				success: function(data) {
					console.log(data);
					if (data.status === "OK") {
						 location.reload();
					} else if (data.err) {
						 $('#gc-reportformdiv').addClass('error');
						 $('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">' + data.err + '</div></div>');
					} else {
						 $('#gc-reportformdiv').addClass('error');
						 $('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">Внезапная необычная ошибка. Пожалуйста, сообщите о ней разработчику.</div></div>');
					}
				},
			});
			return false;
		});
	},
	bans: function () {
		$('.ui.fluid.dropdown').dropdown();
		$('.ui.checkbox').checkbox();

		$(document).on('submit', "#gc-newban", function(e) {
			$.ajax({
				type: "POST",
				url: '/admin/users/bans/new',
				data: $('form#gc-newban').serialize(),
				success: function(data) {
					console.log(data);
					if (data.status === "OK") {
						 location.reload();
					} else if (data.err) {
						 $('#gc-reportformdiv').addClass('error');
						 $('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">' + data.err + '</div></div>');
					} else {
						 $('#gc-reportformdiv').addClass('error');
						 $('#errmessage').html('<div class="ui divider"></div><div class="ui error message"><div class="header">Внезапная необычная ошибка. Пожалуйста, сообщите о ней разработчику.</div></div>');
					}
				},
			});
			return false;
		});
	}
};

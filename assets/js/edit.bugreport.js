$(document).ready(function(){
	var currentUrl = window.location.pathname.split('/');
	var ticketId = currentUrl[2];

	$(document).on('submit', "#gc-reportform", function(e) {
		 $.ajax({
					type: "POST",
					url: '/id/' + ticketId + '/edit',
					data: $('form#gc-reportform').serialize(),
					success: function(data) {
						if (data.id) {
							 window.location = '/id/' + data.id;
						} else if (data.err) {
							console.log(data.err)
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
})

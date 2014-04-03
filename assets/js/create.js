$(document).ready(function () {
	/*window.console = {
    log   : function(){},
    info  : function(){},
    error : function(){},
    warn  : function(){}
  };*/
	$('#description').wysibb({
		buttons: 'bold,italic,underline,|link,|,quote'
	});
	$('#gc-reportform .ui.dropdown').dropdown();
	$('.ui.checkbox').checkbox();
})
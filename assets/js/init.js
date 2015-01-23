$(document).ready(function(){
	crossroads.parse(document.location.pathname);
	
	// Probably should be enabled everywhere:
	$('.ui.dropdown').dropdown();
});

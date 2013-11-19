$(document).ready(function(){
	/*window.console = {
		log   : function(){},
		info  : function(){},
		error : function(){},
		warn  : function(){}
	};*/
	$('#commentsubmit').popup({
		inline: true,
		position: 'top center',
		target: '#commentstatus',
		variation: 'inverted',
		title: 'Смена статуса'
	});
	$('#s-editicon').popup({
		inline: true,
		position: 'bottom center',
		variation: 'inverted',
		title: 'Изменить тикет'
	});
	$('#s-reporticon').popup({
		inline: true,
		position: 'bottom center',
		variation: 'inverted',
		title: 'Пожаловаться'
	});
	$('#commentstatus').dropdown();
	$('#commentoptions').dropdown();
	$('.ui.accordion').accordion();
})

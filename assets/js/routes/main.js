var app = app || {};

app.main = {
	mainpage: function () {
		$(document).ready(function() {
			var data = {

				labels: ['13 ноября, четверг','14 ноября, пятница','15 ноября, суббота', '16 ноября, воскресенье', '17 ноября, понедельник', '18 ноября, вторник', '19 ноября, среда'],

				series: [
					[1,3,2,4,2,1,2]
				]
			};

			new Chartist.Line('.ct-chart', data);
			console.log('test');
			$('.ui.dropdown').dropdown();

			$('#gc-mainpage-search-input').focus();
		});
	}
};
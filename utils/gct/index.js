/**
 * GCT -
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */

var gcdb = require('../gcdb');

module.exports.all = all = require('./all');
module.exports.user = user = require('./user');
module.exports.bugreport = bugreport = require('./bugreport');
module.exports.ban = ban = require('./ban');
module.exports.comment = comment = require('./comment');

//TODO: Заставить это и функции ниже работать с JSON файлом со значениями
module.exports.getStatusByID = getStatusByID = function (id) {
	switch (id) {
		case 1:
			return {
				text: 'Новый',
				class: 'new'
			};

		case 2:
			return {
				text: 'Отменён',
				class: 'rejected'
			};

		case 3:
			return {
				text: 'Уточнить',
				class: 'specify'
			};

		case 4:
			return {
				text: 'Отклонён',
				class: 'declined'
			};

		case 5:
			return {
				text: 'Скрыт',
				class: 'black'
			};

		case 6:
			return {
				text: 'Удалён',
				class: 'black'
			};

		case 7:
			return {
				text: 'Исправлен',
				class: 'helpfixed'
			};

		case 8:
			return {
				text: 'На рассмотрении',
				class: 'inreview'
			};

		case 9:
			return {
				text: 'Отложен',
				class: 'delayed'
			};

		case 10:
			return {
				text: 'Выполнен',
				class: 'done'
			};

		case 11:
			return {
				text: 'Принят',
				class: 'accepted'
			};

		case 12:
			return {
				text: 'Исправлен',
				class: 'done'
			};

		default:
			return;
	}
};

module.exports.getProductByID = getProductByID = function (id) {
	switch (id) {
		case 1:
			return {
				ticketText: 'Я не знаю',
				adminText: ''
			};

		case 2:
			return {
				ticketText: 'GC.Main Клиент',
				adminText: 'main-cli'
			};

		case 3:
			return {
				ticketText: 'GC.Main Сервер (GreenServer)',
				adminText: 'main-srv'
			};

		case 4:
			return {
				ticketText: 'GreenCubes.org Сайт',
				adminText: ''
			};

		case 5:
			return {
				ticketText: 'Форум GreenCubes',
				adminText: ''
			};

		case 6:
			return {
				ticketText: 'GreenCubes.Wiki',
				adminText: ''
			};

		case 7:
			return {
				ticketText: 'Тикет-система',
				adminText: ''
			};

		case 8:
			return {
				ticketText: 'GC.RPG Клиент',
				adminText: 'rpg-cli'
			};

		case 9:
			return {
				ticketText: 'GC.RPG Сервер',
				adminText: 'rpg-srv'
			};

		case 10:
			return {
				ticketText: 'GC.Apocalyptic Клиент',
				adminText: 'apo-cli'
			};

		case 11:
			return {
				ticketText: 'GC.Apocalyptic Сервер',
				adminText: 'apo-srv'
			};
			
		case 12:
			return {
				ticketText: 'GC.Main Новый клиент',
				adminText: 'main-newcli'
			};

		default:
			return {
				ticketText: 'Не указано',
				adminText: ''
			};
	}
};

module.exports.getVisiblityByID = getVisiblityByID = function (id) {
	switch (id) {
		case 1:
			return 'Публичный';

		case 2:
			return 'Приватный';

		default:
			return;
	}
};

module.exports.getBaseUrlTypeByID = getBaseUrlTypeByID = function (id) {
	switch (id) {
		case 1:
			return '/bugreports';

		case 2:
			return '/rempros';
			
		case 3:
			return '/bans';
		
		case 4:
			return '/unbans';
		
		case 5:
			return '/regens';
			
		case 6:
			return '/admreqs';
		
		case 7:
			return '/entroubles';

		default:
			return;
	}
};


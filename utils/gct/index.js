/**
 * GCT -
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */
// FIXME: Поменять на глобальную переменную
var gcdb = require('../gcdb');
var cfg = require('../../config/local.js');

module.exports.all = all = require('./all');
module.exports.user = user = require('./user');
module.exports.bugreport = bugreport = require('./bugreport');
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
				text: 'Будет исправлен',
				class: 'befixed'
			};

		case 13:
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
			return 'GC.Main Клиент';

		case 2:
			return 'GC.Main Сервер (GreenServer)';

		case 3:
			return 'GreenCubes.org сайт';

		case 4:
			return 'Форум GreenCubes';

		case 5:
			return 'GreenCubes.Wiki';

		case 6:
			return 'GreenCubes.Ticket';

		case 7:
			return 'GC.RPG Клиент';

		case 8:
			return 'GC.RPG Сервер';

		case 9:
			return 'GC.Apocalyptic Клиент';

		case 10:
			return 'GC.Apocalyptic Сервер';

		default:
			return 'Не указано';
	}
};

module.exports.getVisiblityByID = getVisiblityByID = function (id) {
	switch (id) {
		case 1:
			return 'Публичный';

		case 2:
			return 'Виден только администраторам';

		default:
			return;
	}
};


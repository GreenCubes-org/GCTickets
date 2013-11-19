/**
 * Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.routes = {

		// Главная
		'/': 'view.listAllTpl',


		// Вывод и действия с тикетом
		'/id/:id': 'view.routeSingles',
			'/id/:id/edit': 'dev.hideFeature',
			'/id/:id/report': 'dev.hideFeature',

		// Действия с пользователем
		'/user/:user': 'dev.hideFeature',


		// Вход в аккаунт и выход из него
		'post /login': 'user.login',
		'/logout': 'user.logout',


		// Контроллер сервисных функций.
		'/500': 'dev.serverError',
		'/404': 'dev.notFound',
		'/hiddenfeature': 'dev.hideFeature',
		'/check': 'dev.check',


		// Работа с тикетами
		// Мои тикеты
		'/my': 'view.listMyTpl',
		'/my/read': 'view.postListNewestMy',
		'/my/read/:page': 'view.postList20My',

		// Новый тикет без типа
		'/new': 'create.main',

		// Все тикеты
		'/all': 'view.listAllTpl',
		'/all/read': 'view.postListNewestAll',
		'/all/read/:page': 'view.postList20All',

		// Багрепорты
		'/bugreports': 'view.listBugreportTpl',
		'/bugreports/read': 'view.postListNewestBugreport',
		'/bugreports/read/:page': 'view.postList20Bugreport',
		'/new/bugreport': 'create.bugreport',
		'post /new/bugreport': 'create.bugreportCreate',

		// Расприваты
		'/rempros': 'view.listRemproTpl',
		'/rempros/read': 'dev.hideFeature',
		'/rempros/read/:page': 'dev.hideFeature',
		'/new/rempro': 'create.rempro',

		// Баны
		'/bans': 'view.listBanTpl',
		'/bans/read': 'dev.hideFeature',
		'/bans/read/:page': 'dev.hideFeature',
		'/new/ban': 'create.ban',

		// Разбаны
		'/unbans': 'view.listUnbanTpl',
		'/unbans/read': 'dev.hideFeature',
		'/unbans/read/:page': 'dev.hideFeature',
		'/new/unban': 'create.unban', 

		// Регены
		'/regens': 'view.listRegenTpl',
		'/regens/read': 'dev.hideFeature',
		'/regens/read/:page': 'dev.hideFeature',
		'/new/regen': 'create.regen',

		// Обращения к администрации
		'/admreq': 'view.listAdmreqTpl',
		'/admreq/read': 'dev.hideFeature',
		'/admreq/read/:page': 'dev.hideFeature',
		'/new/admreq': 'create.admreq'
};

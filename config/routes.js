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
		'/': 'home.route',


		// Вывод и действия с тикетом
		'/id/:id': 'single.routeSingles',
		'/id/:id/edit': 'dev.hideFeature',
		'/id/:id/report': 'dev.hideFeature',
		'get /id/:id/comments': 'single.listSingleComments',
		'get /id/:id/comment/:cid/report': 'dev.hideFeature',
		'get /id/:id/comment/:cid/remove': 'single.deleteCommentTpl',
		'post /id/:id/comment': 'create.bugreportComment',

		// Действия с пользователем
		'/user/:user': 'dev.hideFeature',
		
		// Вход в аккаунт и выход из него
		'get /login': 'user.loginTpl',
		'post /login': 'user.login',
		'/logout': 'user.logout',


		// Контроллер сервисных функций.
		'/500': 'dev.serverError',
		'/404': 'dev.notFound',
		'/hiddenfeature': 'dev.hideFeature',
		'/check': 'dev.check',


		// Работа с тикетами
		// Мои тикеты
		'/my': 'list.listMyTpl',
		'/my/read': 'list.listNewestMy',
		'/my/read/:page': 'list.list20My',

		// Новый тикет без типа
		'/new': 'create.main',

		// Все тикеты
		'/all': 'list.listAllTpl',
		'/all/read': 'list.listNewestAll',
		'/all/read/:page': 'list.list20All',

		// Багрепорты
		'/bugreports': 'list.listBugreportTpl',
		'/bugreports/read': 'list.listNewestBugreport',
		'/bugreports/read/:page': 'list.list20Bugreport',
		'/new/bugreport': 'create.bugreport',
		'post /new/bugreport': 'create.bugreportCreate',

		// Расприваты
		'/rempros': 'list.listRemproTpl',
		'/rempros/read': 'dev.hideFeature',
		'/rempros/read/:page': 'dev.hideFeature',
		'/new/rempro': 'create.rempro',

		// Баны
		'/bans': 'list.listBanTpl',
		'/bans/read': 'dev.hideFeature',
		'/bans/read/:page': 'dev.hideFeature',
		'/new/ban': 'create.ban',

		// Разбаны
		'/unbans': 'list.listUnbanTpl',
		'/unbans/read': 'dev.hideFeature',
		'/unbans/read/:page': 'dev.hideFeature',
		'/new/unban': 'create.unban', 

		// Регены
		'/regens': 'list.listRegenTpl',
		'/regens/read': 'dev.hideFeature',
		'/regens/read/:page': 'dev.hideFeature',
		'/new/regen': 'create.regen',

		// Обращения к администрации
		'/admreq': 'list.listAdmreqTpl',
		'/admreq/read': 'dev.hideFeature',
		'/admreq/read/:page': 'dev.hideFeature',
		'/new/admreq': 'create.admreq'
};

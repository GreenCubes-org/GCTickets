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

	// Действия с пользователем
	// Профиль
	'/user/:user': 'user.profileTpl',

	// Вход в аккаунт и выход из него
	'get /login': 'user.loginTpl',
	'post /login': 'user.login',
	'/logout': 'user.logout',


	// Админпанель
	'/admin': 'admin.main',
	'/admin/users': 'admin.users',

	// Контроллер сервисных функций.
	'/500': 'dev.serverError',
	'/404': 'dev.notFound',
	'/hiddenfeature': 'dev.hideFeature',
	'/check': 'dev.check',

	// Работа с тикетами
	// Вывод и действия с тикетом
	'/id/:id': 'single.routeSingles',
	'/id/:id/edit': 'dev.hideFeature',
	'/id/:id/report': 'dev.hideFeature',
	'get /id/:id/comments': 'single.listSingleComments',
	'get /id/:id/comment/:cid/report': 'dev.hideFeature',
	'post /id/:id/comment/:cid/remove': 'single.deleteComment',
	'post /id/:id/comment': 'create.bugreportComment',

	// Мои тикеты
	'/my': 'list.listMyTpl',
	'/my/read': 'list.listNewestMy',
	'/my/read/:page': 'list.list20My',

	// Новый тикет без типа
	'/new': 'create.mainTpl',

	// Все тикеты
	'/all': 'list.listAllTpl',
	'/all/read': 'list.listNewestAll',
	'/all/read/:page': 'list.list20All',

	// Багрепорты
	'/bugreports': 'list.listBugreportTpl',
	'/bugreports/read': 'list.listNewestBugreport',
	'/bugreports/read/:page': 'list.list20Bugreport',
	'get /new/bugreport': 'create.bugreportTpl',
	'post /new/bugreport': 'create.bugreport',

	// Расприваты
	'/rempros': 'list.listRemproTpl',
	'/rempros/read': 'dev.hideFeature',
	'/rempros/read/:page': 'dev.hideFeature',
	'get /new/rempro': 'create.remproTpl',

	// Баны
	'/bans': 'list.listBanTpl',
	'/bans/read': 'dev.hideFeature',
	'/bans/read/:page': 'dev.hideFeature',
	'get /new/ban': 'create.banTpl',

	// Разбаны
	'/unbans': 'list.listUnbanTpl',
	'/unbans/read': 'dev.hideFeature',
	'/unbans/read/:page': 'dev.hideFeature',
	'get /new/unban': 'create.unbanTpl',

	// Регены
	'/regens': 'list.listRegenTpl',
	'/regens/read': 'dev.hideFeature',
	'/regens/read/:page': 'dev.hideFeature',
	'get /new/regen': 'create.regenTpl',

	// Обращения к администрации
	'/admreq': 'list.listAdmreqTpl',
	'/admreq/read': 'dev.hideFeature',
	'/admreq/read/:page': 'dev.hideFeature',
	'get /new/admreq': 'create.admreqTpl'
};

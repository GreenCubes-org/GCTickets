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
	'/user/:user': 'dev.hideFeature',

	// Вход в аккаунт и выход из него
	'get /login': 'user.loginTpl',
	'post /login': 'user.login',
	'/logout': 'user.logout',


	// Админпанель
	'/admin': 'admin.main',
	'/admin/debug':'admin.debug',
	'/admin/users': 'dev.hideFeature',
	'/admin/users/rights': 'admin.usersRights',
	'/admin/users/sessions': 'dev.hideFeature',
	'/admin/tickets': 'dev.hideFeature',
	'/admin/tickets/list': 'dev.hideFeature',

	// Контроллер сервисных функций.
	'/500': 'dev.serverError',
	'/404': 'dev.notFound',
	'/hiddenfeature': 'dev.hideFeature',
	'/check': 'dev.check',

	// Работа с тикетами
	// Вывод и действия с тикетом
	'/id/:id': 'single.routeSingle',
	'get /id/:id/edit': 'edit.routeSingleTpl',
	'post /id/:id/edit': 'edit.routeSingle',
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
};

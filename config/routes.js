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

	'/admin/users/roles': 'admin.usersRights',
	'post /admin/users/roles/new': 'admin.setRights',
	'/admin/users/roles/remove/:uid': 'admin.removeRights',

	'/admin/users/bans': 'admin.usersBans',
	'post /admin/users/bans/new': 'admin.setBan',
	'/admin/users/bans/remove/:id': 'admin.removeBan',

	// Контроллер сервисных функций.
	'/500': 'dev.serverError',
	'/404': 'dev.notFound',
	'/hiddenfeature': 'dev.hideFeature',
	'/check': 'dev.check',

	// Работа с тикетами
	// Вывод и действия с тикетом
	'/id/:id': 'view.routeView',
	'get /id/:id/edit': 'edit.routeViewTpl',
	'post /id/:id/edit': 'edit.routeView',
	'get /id/:id/delete': 'edit.deleteTpl',
	'post /id/:id/delete': 'edit.deletePost',
	'/id/:id/report': 'dev.hideFeature',
	'get /id/:id/comments': 'comment.listViewComments',
	'get /id/:id/comment/:cid/report': 'dev.hideFeature',
	'post /id/:id/comment/:cid/remove': 'comment.deleteComment',
	'post /id/:id/comment': 'comment.newComment',

	// Мои тикеты
	'/my': 'list.listMyTpl',
	'/my/read': 'list.listNewest',
	'/my/read/:page': 'list.list20',
	'/my/:status': 'list.listMyTpl',
	'/my/:status/read': 'list.listNewest',
	'/my/:status/read/:page': 'list.list20',

	// Новый тикет без типа
	'/new': 'create.mainTpl',

	// Все тикеты
	'/all': 'list.listAllTpl',
	'/all/read': 'list.listNewest',
	'/all/read/:page': 'list.list20',
	'/all/:status': 'list.listAllTpl',
	'/all/:status/read': 'list.listNewest',
	'/all/:status/read/:page': 'list.list20',

	// Багрепорты
	'/bugreports': 'list.listBugreportTpl',
	'/bugreports/read': 'list.listNewest',
	'/bugreports/read/:page': 'list.list20',
	'/bugreports/:status': 'list.listBugreportTpl',
	'/bugreports/:status/read': 'list.listNewest',
	'/bugreports/:status/read/:page': 'list.list20',
	'get /new/bugreport': 'create.bugreportTpl',
	'post /new/bugreport': 'create.bugreport',

	// Расприваты
	'/rempros': 'list.listRemproTpl',
	'/rempros/read': 'list.listNewest',
	'/rempros/read/:page': 'list.list20',
	'/rempros/:status': 'list.listBugreportTpl',
	'/rempros/:status/read': 'list.listNewest',
	'/rempros/:status/read/:page': 'list.list20',
	'get /new/rempro': 'create.remproTpl',
	'post /new/rempro': 'create.rempro'
};

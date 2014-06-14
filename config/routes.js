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
	'get /comments': 'comment.listViewComments',
	'get /comments/:cid/report': 'dev.hideFeature',
	'post /comments/:cid/remove': 'comment.deleteComment',
	'post /comments/new': 'comment.newComment',

	// Мои тикеты
	'/my': 'list.listTwenty',
	'/my/:page': 'list.listTwenty',

	// Новый тикет без типа
	'/new': 'create.mainTpl',

	// Все тикеты
	'/all': 'list.listTwenty',
	'/all/:param': 'list.listTwenty',

	// Багрепорты
	'/bugreports': 'list.listTwenty',
	'/bugreports/:param': 'list.listTwenty',
	'/bugreports/:param/:page': 'list.listByProduct',
	'get /new/bugreport': 'create.bugreportTpl',
	'post /new/bugreport': 'create.bugreport',

	// Расприваты
	'/rempros': 'list.listTwenty',
	'/rempros/:param': 'list.listTwenty',
	'get /new/rempro': 'create.remproTpl',
	'post /new/rempro': 'create.rempro'
};

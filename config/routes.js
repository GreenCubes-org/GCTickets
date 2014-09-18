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
	'/user': 'user.profile',
	'/user/:page': 'user.profile',
	'/users/:user': 'user.profile',
	'/users/:user/:page': 'user.profile',

	'get /settings': 'user.settingsTpl',
	'post /settings': 'user.settings',

	// Вход в аккаунт и выход из него
	'get /login': 'user.login',
	//'post /login': 'user.login',
	'/logout': 'user.logout',
	'/oauth/callback': 'user.callback',

	// Оповещения
	'get /notifs': 'notif.listNotifications',
	'delete /notifs': 'notif.removeNotifications',

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
	'/id/:tid': 'view.routeView',
	'get /id/:tid/edit': 'edit.routeViewTpl',
	'post /id/:tid/edit': 'edit.routeView',
	'post /id/:tid/changevisibility': 'edit.changeVisibility',
	'post /id/:tid/delete': 'edit.deletePost',
	'/id/:tid/report': 'dev.hideFeature',
	'get /comments': 'comment.listViewComments',
	'get /comments/:cid': 'comment.getComment',
	'put /comments/:cid': 'comment.editComment',
	'delete /comments/:cid': 'comment.deleteComment',
	'post /comments/new': 'comment.newComment',

	// Новый тикет без типа
	'/new': 'create.mainTpl',

	// Все тикеты
	'/all': 'list.listTwenty',
	'/all/:param': 'list.listTwenty',

	// Багрепорты
	'/bugreports': 'list.listTwenty',
	'/bugreports/:param': 'list.listTwenty',
	'/bugreports/:param/:page': 'list.listTwenty',
	'get /new/bugreport': 'create.bugreportTpl',
	'post /new/bugreport': 'create.bugreport',

	// Расприваты
	'/rempros': 'list.listTwenty',
	'/rempros/:param': 'list.listTwenty',
	'get /new/rempro': 'create.remproTpl',
	'post /new/rempro': 'create.rempro'
};

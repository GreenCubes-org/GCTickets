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
	'get /login': 'user.loginTpl',
	'post /login': 'user.login',
	'/logout': 'user.logout',

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

	// Панель игровой информации
	'/gameinfo': 'gameinfo.main',

	'/gameinfo/player/info': 'gameinfo.playerInfo', // DONE?
	'/gameinfo/player/loginlog': 'gameinfo.playerLoginlog',
	'/gameinfo/player/moneylog': 'gameinfo.playerMoneylog',
	'/gameinfo/player/inventory': 'gameinfo.playerInventory', // DONE?
	'/gameinfo/player/chestslog': 'gameinfo.playerChestslog',

	'/gameinfo/world/regioninfo': 'gameinfo.worldRegioninfo', // DONE?
	'/gameinfo/world/chestlog': 'gameinfo.worldChestlog',
	'/gameinfo/world/blockslog': 'gameinfo.worldBlockslog', // DONE?

	// Контроллер сервисных функций.
	'/500': 'dev.serverError',
	'/404': 'dev.notFound',
	'/hiddenfeature': 'dev.hideFeature',
	'/check': 'dev.check',

	'put /cu': {
		controller: 'home',
		action: 'hiddenupload',
		cors: false
	},

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
	//'/new': 'create.mainTpl',

	// Все тикеты
	'/all': 'list.listTwenty',
	'/all/:param': 'list.listTwenty',

	// Багрепорты
	'/bugreports': 'list.listTwenty',
	'/bugreports/:param': 'list.listTwenty',
	'/bugreports/:param/:page': 'list.listTwenty',
	'get /new/bugreport': 'create.bugreportTpl',
	'post /new/bugreport': 'create.bugreportPost',

	// Расприваты
	'/rempros': 'list.listTwenty',
	'/rempros/:param': 'list.listTwenty',
	'get /new/rempro': 'create.remproTpl',
	'post /new/rempro': 'create.remproPost',

	// Заявки на бан
	'/bans': 'list.listTwenty',
	'/bans/:param': 'list.listTwenty',
	'get /new/ban': 'create.banTpl',
	'post /new/ban': 'create.banPost',

	// Заявки на разбан
	'/unbans': 'list.listTwenty',
	'/unbans/:param': 'list.listTwenty',
	'get /new/unban': 'create.unbanTpl',
	'post /new/unban': 'create.unbanPost'

};

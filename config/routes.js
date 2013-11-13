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
		'/': 'view.listAll',


		// Временные адреса для вывода тикета/страницы пользователя
		'/id/:id': 'view.routeSingles',//if err res.send('thing not exist')
		'/@:user': 'dev.hideFeature',


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
		'/my': 'view.listMy',

		// Новый тикет без типа
		'/new': 'create.main',

		// Все тикеты
		'/all': 'view.listAll',
			 'get /all/read': 'dev.hideFeature',//'list.all.last',

		// Багрепорты
		'/bugreports': 'view.listBugreport',
			 'get /bugreports/read': 'view.postListBugreport',//'list.bytype.last',
			 'get /new/bugreport': 'create.bugreport',
			 'post /new/bugreport': 'create.bugreportCreate',
		
		// Расприваты
		'/rempros': 'view.listRempro',
			 'get /rempro/read': 'dev.hideFeature',
			 '/new/rempro': 'create.rempro',

		// Баны
		'/bans': 'view.listBan',
			 'get /ban/read': 'dev.hideFeature',
			 '/new/ban': 'create.ban',

		// Разбаны
		'/unbans': 'view.listUnban',
			 'get /unban/read': 'dev.hideFeature',
			 '/new/unban': 'create.unban', 

		// Регены
		'/regen': 'view.listRegen',
			 'get /regen/read': 'dev.hideFeature',//'list.bytype.last'
			 '/new/regen': 'create.regen',

		// Обращения к администрации
		'/admreq': 'view.listAdmreq',
			 'get /admreq/read': 'dev.hideFeature',//'list.bytype.last'
			 '/new/admreq': 'create.admreq'
};

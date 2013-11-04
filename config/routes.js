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
  '/': 'home.index',


  // Временные адреса для вывода тикета/страницы пользователя
  '/id/:id': 'dev.hideFeature',//if err res.send('thing not exist')
  '/@:user': 'dev.hideFeature',


  // Вход в аккаунт и выход из него
  'get /login': 'home.login',
  'post /login': 'home.doLogin',
  '/logout': 'home.logout',


  // Контроллер сервисных функций.
  '/500': 'dev.serverError',
  '/404': 'dev.notFound',
  '/hiddenfeature': 'dev.hideFeature',
  '/check': 'dev.check',


  // Работа с тикетами
  // Мои тикеты
  '/my': 'list.my',

  // Новый тикет без типа
  '/new': 'create.main',

  // Все тикеты
  '/all': 'list.all',
    'get /all/read': 'dev.hideFeature',//'list.all.last',

  // Багрепорты
  '/bugreports': 'list.bugreport',
    'get /bugreports/read': 'list.bugreportList',//'list.bytype.last',
    'get /new/bugreport': 'create.bugreport',
    'post /new/bugreport': 'create.bugreportCreate',
  
  // Расприваты
  '/rempros': 'list.rempro',
    'get /rempro/read': 'dev.hideFeature',
    '/new/rempro': 'create.rempro',

  // Баны
  '/bans': 'list.ban',
    'get /ban/read': 'dev.hideFeature',
    '/new/ban': 'create.ban',

  // Разбаны
  '/unbans': 'list.unban',
    'get /unban/read': 'dev.hideFeature',
    '/new/unban': 'create.unban', 

  // Регены
  '/regen': 'list.regen',
    'get /regen/read': 'dev.hideFeature',//'list.bytype.last'
    '/new/regen': 'create.regen',

  // Обращения к администрации
  '/admreq': 'list.admreq',
    'get /admreq/read': 'dev.hideFeature',//'list.bytype.last'
    '/new/admreq': 'create.admreq'
};

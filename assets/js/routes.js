var app = app || {};

/* Login pages */
crossroads.addRoute('/', app.main.index);
crossroads.addRoute('/login', app.main.login);

/* List pages */
crossroads.addRoute('/all', app.list.main);
crossroads.addRoute('/all/{status}', app.list.main);
crossroads.addRoute('/bugreports', app.list.main);
crossroads.addRoute('/bugreports/{status}', app.list.main);
crossroads.addRoute('/rempros', app.list.main);
crossroads.addRoute('/rempros/{status}', app.list.main);
crossroads.addRoute('/bans', app.list.main);
crossroads.addRoute('/bans/{status}', app.list.main);
crossroads.addRoute('/unbans', app.list.main);
crossroads.addRoute('/unbans/{status}', app.list.main);
crossroads.addRoute('/admreqs', app.list.main);
crossroads.addRoute('/admreqs/{status}', app.list.main);
crossroads.addRoute('/regens', app.list.main);
crossroads.addRoute('/regens/{status}', app.list.main);
crossroads.addRoute('/user', app.list.main);
crossroads.addRoute('/users/{user}', app.list.main);

/* Ticket creation pages */
crossroads.addRoute('/new/bugreport', app.create.main);
crossroads.addRoute('/new/rempro', app.create.main);
crossroads.addRoute('/new/ban', app.create.main);
crossroads.addRoute('/new/unban', app.create.main);

/* Ticket pages */
crossroads.addRoute('/id/{id}', app.view.main);
crossroads.addRoute('/id/{id}/edit', app.view.edit);

/* Admin pages */
crossroads.addRoute('/admin/users/roles', app.admin.roles);
crossroads.addRoute('/admin/users/bans', app.admin.bans);

/* Game information panel pages */
crossroads.addRoute('/gameinfo/player/info', app.gameinfo.player);
crossroads.addRoute('/gameinfo/player/loginlog', app.gameinfo.playerLoginlog);
crossroads.addRoute('/gameinfo/player/inventory', app.gameinfo.player);
crossroads.addRoute('/gameinfo/player/chatlog', app.gameinfo.playerChatlog);
crossroads.addRoute('/gameinfo/player/commandslog', app.gameinfo.playerCommandslog);
crossroads.addRoute('/gameinfo/player/chestslog', app.gameinfo.playerChestslog);

crossroads.addRoute('/gameinfo/world/moneylog', app.gameinfo.worldMoneylog);
crossroads.addRoute('/gameinfo/world/regioninfo', app.gameinfo.worldRegioninfo);
crossroads.addRoute('/gameinfo/world/blockslog', app.gameinfo.worldBlockslog);
crossroads.addRoute('/gameinfo/world/chestlog', app.gameinfo.worldChestlog);

/* Settings pages */
crossroads.addRoute('/settings', app.settings);

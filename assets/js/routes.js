var app = app || {};

/* Main page */
crossroads.addRoute('/', app.main.mainpage);

/* Ticket pages */
crossroads.addRoute('/id/{id}', app.tickets.main);
crossroads.addRoute('/id/{id}/edit', app.tickets.edit);
crossroads.addRoute('/tickets', app.tickets.list);

/* User pages */
crossroads.addRoute('/settings', app.users.settings);

crossroads.addRoute('/user', app.users.main);
crossroads.addRoute('/users/{user}', app.users.main);

/* Ticket creation pages */
crossroads.addRoute('/new/bugreport', app.tickets.createUnban);
crossroads.addRoute('/new/rempro', app.tickets.createUnban);
crossroads.addRoute('/new/ban', app.tickets.createUnban);
crossroads.addRoute('/new/unban', app.tickets.createUnban);

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

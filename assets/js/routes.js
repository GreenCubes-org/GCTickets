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
crossroads.addRoute('/gameinfo/player/info', app.ingameinfo.player);
crossroads.addRoute('/gameinfo/player/loginlog', app.ingameinfo.playerLoginlog);
crossroads.addRoute('/gameinfo/player/inventory', app.ingameinfo.player);
crossroads.addRoute('/gameinfo/player/chatlog', app.ingameinfo.playerChatlog);
crossroads.addRoute('/gameinfo/player/commandslog', app.ingameinfo.playerCommandslog);
crossroads.addRoute('/gameinfo/player/chestslog', app.ingameinfo.playerChestslog);

crossroads.addRoute('/gameinfo/world/moneylog', app.ingameinfo.worldMoneylog);
crossroads.addRoute('/gameinfo/world/regioninfo', app.ingameinfo.worldRegioninfo);
crossroads.addRoute('/gameinfo/world/blockslog', app.ingameinfo.worldBlockslog);
crossroads.addRoute('/gameinfo/world/chestlog', app.ingameinfo.worldChestlog);

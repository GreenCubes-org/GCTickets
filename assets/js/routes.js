var app = app || {};

/* Login pages */
crossroads.addRoute('/', app.main.index);
crossroads.addRoute('/login', app.main.login);

/* List pages */
crossroads.addRoute('/all', app.list.get);
crossroads.addRoute('/all/{status}', app.list.filterByStatus);
crossroads.addRoute('/bugreports', app.list.get);
crossroads.addRoute('/bugreports/{status}', app.list.filterByStatus);
crossroads.addRoute('/rempros', app.list.get);
crossroads.addRoute('/rempros/{status}', app.list.filterByStatus);
crossroads.addRoute('/bans', app.list.get);
crossroads.addRoute('/bans/{status}', app.list.filterByStatus);
crossroads.addRoute('/unbans', app.list.get);
crossroads.addRoute('/unbans/{status}', app.list.filterByStatus);
crossroads.addRoute('/admreqs', app.list.get);
crossroads.addRoute('/admreqs/{status}', app.list.filterByStatus);
crossroads.addRoute('/regens', app.list.get);
crossroads.addRoute('/regens/{status}', app.list.filterByStatus);
crossroads.addRoute('/my', app.list.get);
crossroads.addRoute('/my/{status}', app.list.filterByStatus);

/* Ticket creation pages */
crossroads.addRoute('/new/bugreport', app.create.main);
crossroads.addRoute('/new/rempro', app.create.main);

/* Ticket pages */
crossroads.addRoute('/id/{id}', app.view.main);
crossroads.addRoute('/id/{id}/edit', app.view.edit);

/* Admin pages */
crossroads.addRoute('/admin/users/roles', app.admin.roles);
crossroads.addRoute('/admin/users/bans', app.admin.bans);

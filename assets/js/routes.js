var app = app || {};

/* Login pages */
crossroads.addRoute('/', app.main.index);
crossroads.addRoute('/login', app.main.login);

/* List pages */
crossroads.addRoute('/all', app.list.get);
crossroads.addRoute('/bugreports', app.list.get);
crossroads.addRoute('/rempros', app.list.get);
crossroads.addRoute('/bans', app.list.get);
crossroads.addRoute('/unbans', app.list.get);
crossroads.addRoute('/admreqs', app.list.get);
crossroads.addRoute('/regens', app.list.get);
crossroads.addRoute('/my', app.list.get);

/* Ticket creation pages */
crossroads.addRoute('/new/bugreport', app.create.main);
crossroads.addRoute('/new/rempro', app.create.main);

/* Ticket pages */
crossroads.addRoute('/id/{id}', app.view.main);
crossroads.addRoute('/id/{id}/edit', app.view.edit);

/* Admin pages */
crossroads.addRoute('/admin/users/roles', app.admin.roles);
crossroads.addRoute('/admin/users/bans', app.admin.bans);

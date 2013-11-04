/**
 * Utils
 *
 * @module		:: Utils
 * @description	:: Вспомогательные функции
 */
var gcdb = require('./gcdb');

module.exports = function (){
  return '42';
  };
module.exports.getStatusByID = getStatusByID = function(id) {
  switch (id) {
    case 1:
      return 'Новый';
    case 2:
      return 'На рассмотрении';
    case 3:
      return 'Отклонён';
    case 4:
      return 'Требует уточнения';
    case 5:
      return 'Выполнен';
    default:
      return;
  }
};

module.exports.getProductByID = getProductByID = function(id) {
  switch (id) {
    case 1:
      return 'GC.Main Клиент';
    case 2:
      return 'GC.Main Сервер(GreenServer)';
    case 3:
      return 'GreenCubes.org сайт';
    case 4:
      return 'GreenCubes.Wiki';
    case 5:
      return 'GreenCubes.Ticket';
    case 6:
      return 'GC.RPG Клиент';
    case 7:
      return 'GC.RPG Сервер';
    case 8:
      return 'GC.Apocalyptic Клиент';
    case 9:
      return 'GC.Apocalyptic Сервер';
    default:
      return;
  }
};

module.exports.bugreport = bugreport = {
  serializeList: function(array, cb) {
    
    array.map(function(obj) {
      gcdb.user.getByID(obj.owner, function(err, result) {
        if (err) cb(err);
        
        return null, {
          id: obj.id,
          title: obj.title,
          status: getStatusByID(obj.status),
          owner: result,
          createdAt: obj.createdAt
        };
      })
    })
  }
};

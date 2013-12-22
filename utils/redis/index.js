/**
 * Cache redis
 *
 * @module    :: Utils
 * @description :: Функция подключения к кеширующему redis серверу.
 */
//FIXME: Поменять на глобальную переменную
var cfg = require('../../config/local');
var redis = require('redis').createClient();

if (cfg.redis.pass) redis.auth(cfg.redis.pass);

redis.select(cfg.redis.db.app);

redis.on('error', function (err) {
  console.log("[REDIS][ERR]: " + err);
});

module.exports = redis;

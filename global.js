var SOCKET_LIST = [];
var INIT_DATA = { player: [], projectile: [], enemy: [], lobby: [] };
var REMOVE_DATA = { player: [], projectile: [], enemy: [] };
var enemySpawn = null;
var clientRooms = {};
var Rooms = {}

module.exports = {
  SOCKET_LIST,
  INIT_DATA,
  REMOVE_DATA,
  clientRooms,
  Rooms
};

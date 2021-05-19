var SOCKET_LIST = [];
var INIT_DATA = { player: [], projectile: [], enemy: [], object : [] };
var REMOVE_DATA = { player: [], projectile: [], enemy: [], object : [], lobby:[] };
var clientRooms = {};
var Rooms = {};

module.exports = {
  SOCKET_LIST,
  INIT_DATA,
  REMOVE_DATA,
  clientRooms,
  Rooms
};

global = require("./global.js");
/** Class representing  Lobby */

class Lobby {
  /**
   * Create an Lobby.
   * @param {String} map - the map
   * @param {String} mode - the mode
   * @param {Number} id - Id of the room
   */
  constructor(map, mode, id) {
    this.map = map;
    this.mode = mode;
    this.id = id;
    this.maxCapacity = 4;
    this.beginning = new Date();
    this.objects = true;

    switch (mode) {
      case "ffa":
        this.maxFrag = 20;
        break;
      case "survival":
        this.timer = 5;
        this.numberEnemies = Math.random() * 10 + 3;
        this.respawnTime = Math.random() * 20 + 5;
        break;
      case "hardcore":
        this.multiply = 1.5;
        this.objects = false;
        break;
    }
  }
}

module.exports = Lobby;

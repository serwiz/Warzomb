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
    this.capacity = 4;
    this.numberPlayers = 0;
    this.beginning = new Date();
    this.state = false;
    
    //interval variables
    this.staminaId = null;
    this.objectId = null;
    switch (mode) {
      case "ffa":
        this.maxFrag = 1;
        break;
      case "survival":
        this.numberEnemies = Math.random() * 10 + 3;
        this.respawnTime = Math.random() * 20 + 5;
        this.wave = 1;
        this.spawnActivation = false;
        this.spawnId = null;
        break;
    }
  }
}


module.exports = Lobby;

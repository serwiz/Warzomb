const Map = require("./Map.js");
/** Class representing an Element of the game*/
class Element {
  /**
   * Create an Element.
   * @param {list} config - list of parameters
   */
  constructor(config) {
    switch(config.spawn){
      case 1:
        this.x = Map.spawn[1][1] * Map.TILE_SIZE;
        this.y = Map.spawn[1][0] * Map.TILE_SIZE;
        break;
      case 2:
        this.x = Map.spawn[2][1] * Map.TILE_SIZE;
        this.y = Map.spawn[2][0] * Map.TILE_SIZE;
        break;
      case 3:
        this.x = Map.spawn[3][1] * Map.TILE_SIZE;
        this.y = Map.spawn[3][0] * Map.TILE_SIZE;
        break;
      case 4: 
      this.x = Map.spawn[4][1] * Map.TILE_SIZE;
      this.y = Map.spawn[4][0] * Map.TILE_SIZE;
        break;
    }

    this.id = "";
    this.speedX = 0;
    this.speedY = 0;
    this.map = "";
    // variables for keyboard events
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;

    if (config) {
      if (config.x) this.x = config.x;
      if (config.y) this.y = config.y;
      if (config.id) this.id = config.id;
    }
  }

  /**
   *  Test if there is a collision with an object
   *  @param {Point} point - object with position
   *  @param {String} map - map's name
   */
  wallDetection(point, map) {
    var x = Math.floor(point.x / Map.TILE_SIZE);
    var y = Math.floor(point.y / Map.TILE_SIZE);

    if (x < 0 || x >= Map.array2D[map][0].length) {
      return true;
    }
    if (y < 0 || y >= Map.array2D[map].length) {
      return true;
    }
    return !Map.array2D[map][y][x];
  }

  /** Update the position of the element 
   * @param {String} map - map's name
  */
  updatePosition(map) {
    var right_hitbox = { x: this.x + 15, y: this.y };
    var left_hitbox = { x: this.x - 15, y: this.y };
    var up_hitbox = { x: this.x, y: this.y - 5 };
    var down_hitbox = { x: this.x, y: this.y + 30 };
    if (this.wallDetection(right_hitbox,map)) {
      this.x -= 5;
    } else {
      if (this.pressingRight) this.x += this.speedX;
    }
    if (this.wallDetection(left_hitbox,map)) {
      this.x += 5;
    } else {
      if (this.pressingLeft) this.x += this.speedX;
    }
    if (this.wallDetection(down_hitbox,map)) {
      this.y -= 5;
    } else {
      if (this.pressingDown) this.y += this.speedY;
    }
    if (this.wallDetection(up_hitbox,map)) {
      this.y += 5;
    } else {
      if (this.pressingUp) this.y += this.speedY;
    }
  }

  /** Get the distance between the 2 objects
   * @param {object} object - the object used to compare the distance with.
   */
  evaluateDistance(object) {
    var a = this.x - object.x;
    var b = this.y - object.y;
    return Math.sqrt(a * a + b * b);
  }
}

module.exports = Element;

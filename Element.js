const Map = require("./Map.js");
/** Class representing an Element of the game*/
class Element {
  /**
   * Create an Element.
   * @param {list} config - list of parameters
   */
  constructor(config) {
    this.x = Math.random() * Map.WIDTH;
    this.y = Math.random() * Map.HEIGHT;
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

    while (this.wallDetection({ x: this.x, y: this.y })) {
      this.x = Math.random() * Map.WIDTH;
      this.y = Math.random() * Map.HEIGHT;
    }
  }

  /**
   *  Test if there is a collision with an object
   *  @param {Point} point - object with position
   */
  wallDetection(point) {
    var x = Math.floor(point.x / Map.TILE_SIZE);
    var y = Math.floor(point.y / Map.TILE_SIZE);

    if (x < 0 || x >= Map.array2D[0].length) {
      return true;
    }
    if (y < 0 || y >= Map.array2D.length) {
      return true;
    }
    return !Map.array2D[y][x];
  }

  /** Update the position of the element */
  updatePosition() {
    var right_hitbox = { x: this.x + 15, y: this.y };
    var left_hitbox = { x: this.x - 15, y: this.y };
    var up_hitbox = { x: this.x, y: this.y - 5 };
    var down_hitbox = { x: this.x, y: this.y + 30 };
    if (this.wallDetection(right_hitbox)) {
      this.x -= 5;
    } else {
      if (this.pressingRight) this.x += this.speedX;
    }
    if (this.wallDetection(left_hitbox)) {
      this.x += 5;
    } else {
      if (this.pressingLeft) this.x += this.speedX;
    }
    if (this.wallDetection(down_hitbox)) {
      this.y -= 5;
    } else {
      if (this.pressingDown) this.y += this.speedY;
    }
    if (this.wallDetection(up_hitbox)) {
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

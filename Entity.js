const global = require("./global.js");
const Lobby = require("./Lobby.js");
const Element = require("./Element.js");
const Map = require("./Map.js");
/**
 * Class representing a player.
 * @extends Element
 */
class Player extends Element {
  /**
   * Create a player.
   * @param {list} config - list of parameters
   */
  constructor(config) {
    super(config);
    // user info
    this.name = null;
    this.class = null;
    this.room = null;

    // ingame data
    this.life = 100;
    this.maxLife = 100; // for healing for instance
    this.speedMove = 6;
    this.direction = 4; // 1 right, 2 left, 3 up, 4 down

    this.pressingX = false; // default attack
    this.pressingA = false; // skill 1
    this.pressingE = false; // Ultimate

    // scoreboard data
    this.score = 0;
    this.frag = 0;
    this.death = 0;

    this.ready = false;

    Player.list[this.id] = this;
    global.INIT_DATA.player.push({
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name,
      hp: this.life,
      hpmax: this.maxLife,
      score: this.score,
      frag: this.frag,
      death: this.death,
      direction: this.direction,
      ready: this.ready
    });
  }

  /**
   * Update the speed and the direction.
   * Note that 0,0 is at the top left of the screen then moving down will increase the Y value
   */
  updateSpeed() {
    if (this.pressingRight && this.x < Map.WIDTH) {
      // going right
      this.speedX = this.speedMove;
      this.direction = 1;
    } else if (this.pressingLeft && this.x > 0) {
      // going left
      this.speedX = -this.speedMove;
      this.direction = 2;
    } else this.speedX = 0;
    if (this.pressingUp && this.y > 0) {
      // going up
      this.speedY = -this.speedMove;
      this.direction = 3;
    } else if (this.pressingDown && this.y < Map.HEIGHT) {
      // going down
      this.speedY = this.speedMove;
      this.direction = 4;
    } else this.speedY = 0;
  }

  /**
   * Update the whole player : his speed, direction, position and create projectiles
   */
  updateMove() {
    this.updateSpeed();
    this.updatePosition();

    if (this.pressingX) {
      this.attack();
    }
  }

  /**
   * Create a projectile.
   */
  shoot() {
    var p = new Projectile({
      direction: this.direction,
      user: this.id,
      x: -Number.MAX_VALUE,
      y: -Number.MAX_VALUE,
      map: this.map
    });
    p.x = this.x;
    p.y = this.y;
  }

  /**
   * Warrior's attack
   */
  slash() {
    var diffX = null;
    var diffY = null;
    for (var i in Enemy.list) {
      if (this.direction === 1 || this.direction === 2) {
        diffX = Math.abs(this.x - Enemy.list[i].x);
        if (diffX <= 10) {
          Enemy.list[i].life -= 8;
          if (
            !this.wallDetection({
              x: Enemy.list[i].x + 3,
              y: Enemy.list[i].y
            }) &&
            this.direction === 1
          )
            Enemy.list[i].x += 3;
          else if (
            !this.wallDetection({
              x: Enemy.list[i].x - 3,
              y: Enemy.list[i].y
            }) &&
            this.direction === 2
          )
            Enemy.list[i].x -= 3;
        }
      } else if (this.direction === 3 || this.direction === 4) {
        diffY = Math.abs(this.y - Enemy.list[i].y);
        if (diffY <= 10) {
          Enemy.list[i].life -= 8;
          if (
            !this.wallDetection({
              x: Enemy.list[i].x,
              y: Enemy.list[i].y - 3
            }) &&
            this.direction === 3
          )
            Enemy.list[i].y -= 3;
          else if (
            !this.wallDetection({
              x: Enemy.list[i].x,
              y: Enemy.list[i].y + 3
            }) &&
            this.direction === 4
          )
            Enemy.list[i].y += 3;
        }
      }
      if (Enemy.list[i].life <= 0) {
        if (Player.list[this.id]) {
          this.score += 2;
        }

        global.REMOVE_DATA.enemy.push(Enemy.list[i].id);
        delete Enemy.list[i];
      }
    }
    for (var i in global.SOCKET_LIST)
      global.SOCKET_LIST[i].emit("slash", {
        user: this.id,
        direction: this.direction
      });
  }
  /**
   * Call the right type of attack
   */
  attack() {
    if (this.class === "sorcerer" || this.class === "archer") {
      this.shoot();
    } else if (this.class === "warrior" || this.class === "tank") {
      this.slash();
    }
  }

  triggerObject() {
    // apply effect
  }

  /**
   * Initialize a list with the player parameters and return it.
   * @return {list} the player's parameters
   */
  initList() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name,
      hp: this.life,
      hpmax: this.maxLife,
      score: this.score,
      frag: this.frag,
      death: this.death,
      class: this.class,
      direction: this.direction,
      ready: this.ready,
      room: this.room
    };
  }
}

/** static elements for Player */
Player.list = {}; // a list of players connected

/**
 * Retrieve info about all the players connected.
 * @return {list} info about the players.
 */
Player.infoPlayers = function() {
  var data = [];
  for (var i in Player.list) {
    if (global.clientRooms[this.id] === global.clientRooms[Player.list[i].id])
      data.push(Player.list[i].initList());
  }
  return data;
};

/**
 * When someone is connected, create a player, wait for keyboard inputs and send info to the client side
 * @param {socket} socket - Socket with the player's ID.
 */
Player.onConnect = function(socket) {
  var player = new Player({ id: socket.id, map: global.map });
  socket.on("keyPress", function(data) {
    if (data.inputId === "left") player.pressingLeft = data.state;
    else if (data.inputId === "right") player.pressingRight = data.state;
    else if (data.inputId === "up") player.pressingUp = data.state;
    else if (data.inputId === "down") player.pressingDown = data.state;
    else if (data.inputId === "attack") player.pressingX = data.state;
  });

  // send info about the players and projectiles to the client side. a player know the others.
  var playerInfo = Player.infoPlayers();
  var projectileInfo = Projectile.infoProjectiles();
  var enemyInfo = Enemy.infoEnemies();

  socket.emit("init", {
    Id: socket.id,
    player: playerInfo,
    projectile: projectileInfo,
    enemy: enemyInfo
  });
};

/**
 * When someone is disconnected, remove the player from the server
 * @param {socket} socket - Socket with the player's ID.
 */
Player.onDisconnect = function(socket) {
  delete Player.list[socket.id];
  global.REMOVE_DATA.player.push(socket.id);
  socket.leave(global.clientRooms[socket.id]);
  delete global.clientRooms[socket.id]
 
};

/**
 * Updating info about each player and send it.
 * @return {list} info about updated players
 */
Player.checkInfoPlayers = function() {
  var info = [];
  for (var i in Player.list) {
    var player = Player.list[i];
    player.updateMove();
    info.push({
      id: player.id,
      class: player.class,
      room: player.room,
      x: player.x,
      y: player.y,
      hp: player.life,
      score: player.score,
      frag: player.frag,
      death: player.death,
      direction: player.direction,
      ready: player.ready
    });
  }
  return info;
};

/**
 * Class representing an enemy.
 * @extends Element
 */
class Enemy extends Element {
  /**
   * Create an enemy.
   * @param {list} config - list of parameters
   */
  constructor(config) {
    super(config);

    while (this.wallDetection({ x: this.x, y: this.y })) {
      this.x = Math.random() * Map.WIDTH;
      this.y = Math.random() * Map.HEIGHT;
    }

    this.life = 40;
    this.maxLife = 40; // for healing for instance
    this.speedMove = config.speed; // 1 tile
    this.direction = 4; // 1 right, 2 left, 3 up, 4 down
    Enemy.list[this.id] = this;
    global.INIT_DATA.enemy.push({
      id: this.id,
      x: this.x,
      y: this.y,
      hp: this.life,
      hpmax: this.maxLife,
      map: this.map,
      direction: this.direction
    });
  }

  /**
   * Update the enemy position depending on the closest Player
   * Note : 800 is fixed for the moment. It is the size of the map
   */
  updatePosition() {
    var tmpDistance = 0;
    var closest = 2000;
    var playerIndex = 0;

    // checking if there is at least 1 player in the list and targeting if to close to him
    if (Object.keys(Player.list).length) {
      // looking for the closest player
      for (var i in Player.list) {
        var player = Player.list[i];
        tmpDistance = this.evaluateDistance(player);
        if (tmpDistance < closest) {
          closest = tmpDistance;
          playerIndex = i;
        }
      }

      var diffX = Player.list[playerIndex].x - this.x;
      var diffY = Player.list[playerIndex].y - this.y;
      if (tmpDistance > 5) {
        if (diffX > 0) {
          this.x += this.speedMove;
          this.direction = 1;
        } else {
          this.x -= this.speedMove;
          this.direction = 2;
        }
        if (diffY > 0) {
          this.y += this.speedMove;
          this.direction = 4;
        } else {
          this.y -= this.speedMove;
          this.direction = 3;
        }
      }
    }
  }

  /**
   * Initialize a list with the player parameters and return it.
   * @return {list} the player's parameters
   */
  initList() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      hp: this.life,
      hpmax: this.maxLife,
      map: this.map,
      direction: this.direction
    };
  }
}

/**
 * Create an enemy with random parameters
 */
Enemy.randomGenerateEnemy = function() {
  var x = Math.random() * Map.WIDTH;
  var y = Math.random() * Map.HEIGHT;
  var id = Math.random();
  var speedMove = 1;
  new Enemy({ id: id, x: x, y: y, speed: speedMove });
};
/** static elements for Enemy */
Enemy.list = {};

/**
 * Updating info about each enemies and send it.
 * @return {list} info about updated projectiles
 */
Enemy.checkInfoEnemies = function() {
  var info = [];
  for (var i in Enemy.list) {
    var enemy = Enemy.list[i];
    enemy.updatePosition();
    info.push({
      id: enemy.id,
      x: enemy.x,
      y: enemy.y,
      hp: enemy.life,
      direction: enemy.direction
    });
  }
  return info;
};

/**
 * Retrieve info about all the players connected.
 * @return {list} info about the players.
 */
Enemy.infoEnemies = function() {
  var data = [];
  for (var i in Enemy.list) {
    data.push(Enemy.list[i].initList());
  }
  return data;
};

/** Class representing a Projectile.
 * @extends Element
 */

class Projectile extends Element {
  /**
   * Create a projectile.
   * @param {list} config - list of parameters
   */
  constructor(config) {
    super(config);
    this.id = Math.random();
    switch (config.direction) {
      case 1:
        this.speedX = 8;
        this.speedY = 0;
        break;
      case 2:
        this.speedX = -8;
        this.speedY = 0;
        break;
      case 3:
        this.speedX = 0;
        this.speedY = -8;
        break;
      case 4:
        this.speedX = 0;
        this.speedY = 8;
        break;
      default:
        break;
    }
    this.user = config.user; // the shooter
    this.timer = 0;
    this.toRemove = false;
    Projectile.list[this.id] = this;
    global.INIT_DATA.projectile.push({
      id: this.id,
      x: this.x,
      y: this.y,
      lobby: global.clientRooms[this.user]
    });
  }

  /**
   * Update the projectile's info
   */
  updateProjectile() {
    if (this.timer++ > 50) this.toRemove = true;
    this.x += this.speedX;
    this.y += this.speedY;

    for (var i in Player.list) {
      var object = Player.list[i];
      if (
        this.evaluateDistance(object) < 10 &&
        this.user !== object.id &&
        global.clientRooms[this.user] === global.clientRooms[object.id]
      ) {
        object.life -= 5;

        // respawn
        if (object.life <= 0) {
          object.death += 1;
          if (Player.list[this.user]) {
            Player.list[this.user].score += 10;
            Player.list[this.user].frag += 1;
          }

          object.life = object.maxLife;
          object.x = Math.random() * Map.WIDTH;
          object.y = Math.random() * Map.HEIGHT;
        }
        this.toRemove = true;
      }
    }
    for (var i in Enemy.list) {
      var object = Enemy.list[i];
      if (
        this.evaluateDistance(object) < 10 &&
        this.user !== object.id &&
        global.clientRooms[this.user] === global.clientRooms[object.id]
      ) {
        object.life -= 5;

        if (object.life <= 0) {
          if (Player.list[this.user]) {
            Player.list[this.user].score += 2;
          }

          global.REMOVE_DATA.enemy.push(object.id);
          delete Enemy.list[i];
        }
        this.toRemove = true;
      }
    }
    if (this.wallDetection(this)) {
      this.toRemove = true;
    }
  }

  /**
   * Initialize a list with the projectile parameters and return it.
   * @return {list} the projectile's parameters
   */
  initList() {
    return {
      id: this.id,
      x: this.x,
      y: this.y
    };
  }
}

// static elements for Projectile
Projectile.list = {}; // a list of projectiles on the mao

/**
 * Updating info about each projectile and send it.
 * @return {list} info about updated projectiles
 */
Projectile.checkInfoProjectiles = function() {
  var info = [];
  for (var i in Projectile.list) {
    var projectile = Projectile.list[i];
    projectile.updateProjectile();
    if (projectile.toRemove) {
      delete Projectile.list[i];
      global.REMOVE_DATA.projectile.push(projectile.id);
    } else {
      info.push({
        id: projectile.id,
        x: projectile.x,
        y: projectile.y
      });
    }
  }
  return info;
};
/**
 * Retrieve info about all the projectiles.
 * @return {list} info about the projectiles.
 */
Projectile.infoProjectiles = function() {
  var data = [];
  for (var i in Projectile.list) {
    data.push(Projectile.list[i].initList());
  }
  return data;
};

module.exports = { Player, Enemy, Projectile };

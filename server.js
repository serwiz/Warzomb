/** modules */
const express = require("express");
const app = express();
const server = require("http").Server(app);

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});
server.listen(process.env.PORT || 3000);

// allow us to use files
app.use(express.static("public"));
app.use(express.static("views"));
app.use("/tileset/images", express.static(__dirname + "/tileset/images"));

////////////////////////////////////////////////
// Global variables
var SOCKET_LIST = [];
var INIT_DATA = { player: [], projectile: [] };
var REMOVE_DATA = { player: [], projectile: [] };

///////////////////////////////////////////////
// Class declaration

/** Class representing an Element of the game*/

class Element {
  /**
   * Create an Element.
   */
  constructor() {
    this.x = 250;
    this.y = 250;
    this.id = "";
    this.speedX = 0;
    this.speedY = 0;
  }

  /** Update the position of the element */
  updatePosition() {
    this.x += this.speedX;
    this.y += this.speedY;
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

/**
 * Class representing a player.
 * @extends Element
 */
class Player extends Element {
  /**
   * Create a player.
   * @param {number} id - player's ID.
   */
  constructor(id) {
    super();
    this.id = id;
    this.name = "username";
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.pressingX = false;
    this.speedMove = 10; // 1 tile
    this.direction = 1; // 1 right, 2 left, 3 up, 4 down

    this.life = 100;
    this.maxLife = 100; // for healing for instance
    this.score = 0;
    Player.list[id] = this;
    INIT_DATA.player.push({
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name,
      hp: this.life,
      hpmax: this.maxLife,
      score: this.score
    });
  }

  /**
   * Update the speed and the direction.
   * Note that 0,0 is at the top left of the screen then moving down will increase the Y value
   */
  updateSpeed() {
    if (this.pressingRight) {
      // going right
      this.speedX = this.speedMove;
      this.direction = 1;
    } else if (this.pressingLeft) {
      // going left
      this.speedX = -this.speedMove;
      this.direction = 2;
    } else this.speedX = 0;
    if (this.pressingUp) {
      // going up
      this.speedY = -this.speedMove;
      this.direction = 3;
    } else if (this.pressingDown) {
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
      this.shoot();
    }
  }

  /**
   * Create a projectile.
   */
  shoot() {
    var p = new Projectile(this.direction, this.id);
    p.x = this.x;
    p.y = this.y;
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
      score: this.score
    };
  }
}

/** static elements for Player */
Player.list = {}; // a list of players connected


/**
 * When someone is connected, create a player, wait for keyboard inputs and send info to the client side
 * @param {socket} socket - Socket with the player's ID.
 */
Player.onConnect = function(socket) {
  var player = new Player(socket.id);
  console.log("a player is joining the room : " + player.name);
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
  socket.emit("init", {
    Id: socket.id,
    player: playerInfo,
    projectile: projectileInfo
  });
};

/**
 * Retrieve info about all the players connected.
 * @return {list} info about the players.
 */
Player.infoPlayers = function() {
  var data = [];
  for (var i in Player.list) {
    data.push(Player.list[i].initList());
  }
  return data;
};

/**
 * When someone is disconnected, remove the player from the server
 * @param {socket} socket - Socket with the player's ID.
 */
Player.onDisconnect = function(socket) {
  delete Player.list[socket.id];
  REMOVE_DATA.player.push(socket.id);
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
      x: player.x,
      y: player.y,
      hp: player.life,
      score: player.score
    });
  }
  return info;
};

/////////////////////////////////////////////////

/** Class representing a Projectile.
 * @extends Element
 */

class Projectile extends Element {
  /**
   * Create a projectile.
   * @param {number} direction - the direction of the shooter
   * @param {number} user - ID of the shooter.
   */
  constructor(direction, user) {
    super();
    this.x = -200; 
    this.y = -200;
    this.id = Math.random();
    switch (direction) {
      case 1:
        this.speedX = 10;
        this.speedY = 0;
        break;
      case 2:
        this.speedX = -10;
        this.speedY = 0;
        break;
      case 3:
        this.speedX = 0;
        this.speedY = -10;
        break;
      case 4:
        this.speedX = 0;
        this.speedY = 10;
        break;
      default:
        break;
    }
    this.user = user; // the shooter
    this.timer = 0;
    this.toRemove = false;
    Projectile.list[this.id] = this;
    INIT_DATA.projectile.push({
      id: this.id,
      x: this.x,
      y: this.y
    });
  }

  /**
   * Update the projectile's info
   */
  updateProjectile() {
    if (this.timer++ > 100) this.toRemove = true;
    this.updatePosition();

    for (var i in Player.list) {
      var object = Player.list[i];
      if (this.evaluateDistance(object) < 10 && this.user !== object.id) {
        object.life -= 5;

        // respawn
        if (object.life <= 0) {
          if (Player.list[this.user]) Player.list[this.user].score += 1;

          object.life = object.maxLife;
          object.x = Math.random() * 500;
          object.y = Math.random() * 500;
        }
        this.toRemove = true;
      }
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
      REMOVE_DATA.projectile.push(projectile.id);
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

/////////////////////////////////////////////////
/** communication */
const io = require("socket.io")(server);

/**
 * on connection, create a socket and set everything for the player.
 * @param {socket} socket - object representing the link between client and server
 */
io.sockets.on("connection", function(socket) {
  console.log("server connected");
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  Player.onConnect(socket);

  /**
   * On disconnection, delete the player from the server.
   */
  socket.on("disconnect", function() {
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });

  /**
   * When receiving a message call, emit a request to print the message to all the players connected
   * @param {data} - the message to send.
   */
  socket.on("sendMessage", function(data) {
    console.log("someone sent a message");
    for (var i in SOCKET_LIST) {
      SOCKET_LIST[i].emit("printMessage", data);
    }
  });
});

/**
 * "Updating" the server given an interval.
 * le premier argument est l'action à effectuer et le 2e l'intervalle de temps
 */
setInterval(function() {
  var infoPlayers = Player.checkInfoPlayers();
  var infoProjectiles = Projectile.checkInfoProjectiles();
  var pack = { player: infoPlayers, projectile: infoProjectiles };

  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    // sending request of update
    if (Object.entries(INIT_DATA).length !== 0) socket.emit("init", INIT_DATA);
    socket.emit("update", pack);
    if (Object.entries(REMOVE_DATA).length !== 0)
      socket.emit("delete", REMOVE_DATA);
  }
  INIT_DATA.player = [];
  INIT_DATA.bullet = [];
  REMOVE_DATA.player = [];
  REMOVE_DATA.bullet = [];
}, 1000 / 25);
/////////////////////////////////

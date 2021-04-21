/** server */
const express = require("express");
const app = express();
const server = require("http").createServer(app);

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});
server.listen(process.env.PORT || 3000);

// allow us to use files
app.use(express.static("public"));
app.use(express.static("views"));
app.use("/tileset/images", express.static(__dirname + "/tileset/images"));
////////////////////////////////////////////////
/** Post form for configure the game */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.post("/selection", function(req, res) {
  const result = req.body;
  var schema = yup.object().shape({
    map: yup
      .string()
      .required()
      .oneOf(["forest", "mountain", "?"]),
    class: yup
      .string()
      .required()
      .oneOf(["warrior", "?"]),
    mode: yup
      .string()
      .required()
      .oneOf(["ffa", "?"])
  });
  
  var test = {
    map: result.map,
    class: result.class,
    mode: result.mode
  };

  schema.validate(test).then(function(value) {
    console.log ("Test passé");
    console.log(result);
  });

  schema.validate(test).catch(function(err) {
    err.message;
    err.errors;
  });
});
////////////////////////////////////////////////
/** yup */
const yup = require("yup");

////////////////////////////////////////////////
/** admin Firbase */
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

////////////////////////////////////////////////
// Global variables
var SOCKET_LIST = [];
var INIT_DATA = { player: [], projectile: [], ennemy: [] };
var REMOVE_DATA = { player: [], projectile: [], ennemy: [] };

///////////////////////////////////////////////
// Class declaration

/** Class representing an Element of the game*/

class Element {
  /**
   * Create an Element.
   */
  constructor(config) {
    this.x = 250;
    this.y = 250;
    this.id = "";
    this.speedX = 0;
    this.speedY = 0;
    this.map = "";

    if (config) {
      if (config.x) this.x = config.x;
      if (config.y) this.y = config.y;
      if (config.id) this.id = config.id;
      if (config.map) this.map = config.map;
    }
  }

  /** Update the position of the element */
  updatePosition() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > 512) {
      this.speedX = -this.speedX;
    }
    if (this.y < 0 || this.y > 512) {
      this.speedY = -this.speedY;
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

/**
 * Class representing a player.
 * @extends Element
 */
class Player extends Element {
  /**
   * Create a player.
   * @param {number} id - player's ID.
   */
  constructor(config) {
    super(config);
    // user info
    this.name = "pseudo";

    // variables for keyboard events
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.pressingX = false;

    // ingame data
    this.life = 100;
    this.maxLife = 100; // for healing for instance
    this.speedMove = 8; // 1 tile
    this.direction = 1; // 1 right, 2 left, 3 up, 4 down

    // scoreboard data
    this.score = 0;
    this.frag = 0;
    this.death = 0;

    Player.list[this.id] = this;
    INIT_DATA.player.push({
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name,
      hp: this.life,
      hpmax: this.maxLife,
      score: this.score,
      frag: this.frag,
      death: this.death,
      map: this.map
    });
  }

  /**
   * Update the speed and the direction.
   * Note that 0,0 is at the top left of the screen then moving down will increase the Y value
   */
  updateSpeed() {
    if (this.pressingRight && this.x < 512) {
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
    } else if (this.pressingDown && this.y < 512) {
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
    var p = new Projectile({
      direction: this.direction,
      user: this.id,
      x: -200,
      y: -200,
      map: this.map
    });
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
      score: this.score,
      frag: this.frag,
      death: this.death,
      map: this.map
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
  var player = new Player({ id: socket.id });
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
  var ennemyInfo = Ennemy.infoEnnemies();
  socket.emit("init", {
    Id: socket.id,
    player: playerInfo,
    projectile: projectileInfo,
    ennemy: ennemyInfo
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
      score: player.score,
      frag: player.frag,
      death: player.death
    });
  }
  return info;
};
/////////////////////////////////////////////////////

/**
 * Class representing an ennemy.
 * @extends Element
 */
class Ennemy extends Element {
  constructor(config) {
    super(config);
    this.life = 40;
    this.maxLife = 40; // for healing for instance
    this.speedMove = config.speed; // 1 tile
    this.direction = 1; // 1 right, 2 left, 3 up, 4 down
    Ennemy.list[this.id] = this;
    INIT_DATA.ennemy.push({
      id: this.id,
      x: this.x,
      y: this.y,
      hp: this.life,
      hpmax: this.maxLife,
      map: this.map
    });
  }

  /**
   * Update the ennemy position depending on the closest Player
   * Note : 512 is fixed for the moment. It is the size of the map
   */
  updatePosition() {
    var closest = 512;
    var tmpDistance = 0;
    var playerIndex = 0;

    // checking if there is at least 1 player in the list
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
      // updating position
      var diffX = Player.list[playerIndex].x - this.x;
      var diffY = Player.list[playerIndex].y - this.y;

      if (tmpDistance > 10) {
        if (diffX > 0) this.x += this.speedMove;
        else this.x -= this.speedMove;

        if (diffY > 0) this.y += this.speedMove;
        else this.y -= this.speedMove;
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
      map: this.map
    };
  }
}
/**
 * Create an ennemy with random parameters
 */
function randomGenerateEnnemy() {
  var x = Math.random() * 512;
  var y = Math.random() * 512;
  var id = Math.random();
  var speedMove = 2;
  return new Ennemy({ id: id, x: x, y: y, speed: speedMove });
}
/** static elements for Ennemy */
Ennemy.list = {};

/**
 * Updating info about each ennemies and send it.
 * @return {list} info about updated projectiles
 */
Ennemy.checkInfoEnnemies = function() {
  var info = [];
  for (var i in Ennemy.list) {
    var ennemy = Ennemy.list[i];
    ennemy.updatePosition();
    info.push({
      id: ennemy.id,
      x: ennemy.x,
      y: ennemy.y,
      hp: ennemy.life
    });
  }
  return info;
};

/**
 * Retrieve info about all the players connected.
 * @return {list} info about the players.
 */
Ennemy.infoEnnemies = function() {
  var data = [];
  for (var i in Ennemy.list) {
    data.push(Ennemy.list[i].initList());
  }
  return data;
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
    INIT_DATA.projectile.push({
      id: this.id,
      x: this.x,
      y: this.y,
      map: this.map
    });
  }

  /**
   * Update the projectile's info
   */
  updateProjectile() {
    if (this.timer++ > 50) this.toRemove = true;
    this.updatePosition();

    for (var i in Player.list) {
      var object = Player.list[i];
      if (this.evaluateDistance(object) < 10 && this.user !== object.id) {
        object.life -= 5;

        // respawn
        if (object.life <= 0) {
          object.death += 1;
          if (Player.list[this.user]) {
            Player.list[this.user].score += 10;
            Player.list[this.user].frag += 1;
          }

          object.life = object.maxLife;
          object.x = Math.random() * 512;
          object.y = Math.random() * 512;
        }
        this.toRemove = true;
      }
    }
    for (var i in Ennemy.list) {
      var object = Ennemy.list[i];
      if (this.evaluateDistance(object) < 10 && this.user !== object.id) {
        object.life -= 5;

        if (object.life <= 0) {
          if (Player.list[this.user]) {
            Player.list[this.user].score += 2;
          }
          delete Ennemy.list[i];
          REMOVE_DATA.ennemy.push(object.id);
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
      y: this.y,
      map: this.map
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
    if (!Object.keys(Player.list).length) Ennemy.list = {};
  });

  /**
   * When receiving a message call, emit a request to print the message to all the players connected
   * @param {data} - the message to send.
   */
  socket.on("sendMessage", function(data) {
    var schema = yup.object().shape({
      message: yup
        .string()
        .required()
        .matches(
          /^(?!.*<[^>]+>).*/,
          "Seems like you tried to insert a html tag... "
        )
    });
    var test = { message: data };

    schema.validate(test).then(function(value) {
      console.log("someone sent a message");
      for (var i in SOCKET_LIST) {
        SOCKET_LIST[i].emit("printMessage", value.message);
      }
    });

    schema.validate(test).catch(function(err) {
      const errorMessage =
        "!!! SERVER MESSAGE : Your message has not been send. A html tag has been detected. Not allowed !!!";
      for (var i in SOCKET_LIST) {
        SOCKET_LIST[i].emit("printMessage", errorMessage.fontcolor("red"));
      }
      err.message;
      err.errors;
    });
  });
});

/**
 * "Updating" the server given an interval.
 * le premier argument est l'action à effectuer et le 2e l'intervalle de temps
 */
setInterval(function() {
  var infoPlayers = Player.checkInfoPlayers();
  var infoProjectiles = Projectile.checkInfoProjectiles();
  var infoEnnemies = Ennemy.checkInfoEnnemies();
  var pack = {
    player: infoPlayers,
    projectile: infoProjectiles,
    ennemy: infoEnnemies
  };

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
  INIT_DATA.ennemy = [];
  REMOVE_DATA.player = [];
  REMOVE_DATA.bullet = [];
  REMOVE_DATA.ennemy = [];
}, 1000 / 25);

/**
 * "Updating" the server given an interval.
 *  This one is for zombies generating.
 * random interval given.
 */
setInterval(function() {
  if (
    Object.keys(Ennemy.list).length + 1 <= 3 &&
    Object.keys(Player.list).length
  ) {
    var e = randomGenerateEnnemy();
  }
}, 5000);
/////////////////////////////////

/** server */
const express = require("express");
const app = express();
const server = require("http").createServer(app);

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});
server.listen(process.env.PORT || 3000);
//////////////////////////////////////////////////////
/* modules */
const yup = require("yup");
const global = require("./global.js");
const Lobby = require("./Lobby.js");
const Entity = require("./Entity.js");
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const Map = require("./Map.js");
const configPlayer = require("./config.json");
// parse application
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/////////////////////////////////////////////////////////
// allow us to use files
app.use(express.static("public"));
app.use(express.static("views"));
app.use("/tileset/images", express.static(__dirname + "/tileset/images"));
app.use("/credits.txt", (request, response) => {
  response.sendFile(__dirname + "/credits.txt");
});
////////////////////////////////////////////////

var admin = require("firebase-admin");
const { config } = require("process");
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aws-warzomb-default-rtdb.firebaseio.com/"
});

//////////////////////////////////////////////

/* insertion of the game in the database */
let partie = function writeUserData(
  id_partie,
  datedeb,
  datefin,
  joueur_id,
  score,
  result
) {
  admin
    .database()
    .ref("parties/" + Math.floor(Math.random() * 50))
    .set({
      id_partie: id_partie,
      datedeb: datedeb,
      datefin: datefin,
      joueur_id: joueur_id,
      score: score,
      result: result
    });
};

let Historique = function(id_j = 0) {
  var data;
  admin
    .database()
    .ref()
    .child("parties")
    .child(id_j)
    .get()
    .then(snapshot => {
      if (snapshot.exists()) {
        data = snapshot.toJSON();
        return data;
      } else {
        console.log(" aucune donnees ! ");
        data = null;
      }
    })
    .catch(error => {
      console.error(error);
    });
};

/**
 * on connection, create a socket and set everything for the player.
 * @param {socket} socket - object representing the link between client and server
 */
io.sockets.on("connection", function(socket) {
  console.log("server connected");
  socket.id = Math.random();
  if (global.SOCKET_LIST[socket.id] === undefined) {
    global.SOCKET_LIST[socket.id] = socket;
    Entity.Player.onConnect(socket);
  }

  /**
   * Retrieves info about the lobbies in the server
   */
  socket.on("getLobbies", function() {
    var info = {};
    for (var i in global.Rooms) {
      if (io.sockets.adapter.rooms.get(i) === undefined) delete global.Rooms[i];
      else if (!global.Rooms[i].state) {
        var param = {
          room: i + "'s room",
          mode: global.Rooms[i].mode,
          map: global.Rooms[i].map,
          size: global.Rooms[i].numberPlayers + "/" + global.Rooms[i].capacity
        };
        info[i] = param;
      }
    }
    socket.emit("listLobbies", info);
  });

  /**
   * Create a lobby
   * @param {list} room - a list of parameters linked to the party
   */
  socket.on("newGame", function(room) {
    global.clientRooms[socket.id] = room.name;
    global.Rooms[room.name] = new Lobby(room.map, room.mode, room.name);
    socket.emit("gameRoom", room.name);
    socket.join(room.name);
    global.Rooms[room.name].numberPlayers += 1;
    Entity.Player.list[socket.id].setParameters(configPlayer[room.class]);
    Entity.Player.list[socket.id].room = room.name;

    // for play again, random pos is given
    Entity.Player.list[socket.id].setSpawn();
    if (room.mode === "survival") {
      Entity.Player.list[socket.id].alive = true;
    }
    var playerInfo = Entity.Player.infoPlayers();
    var projectileInfo = Entity.Projectile.infoProjectiles();
    var enemyInfo = Entity.Enemy.infoEnemies();
    socket.emit("init", {
      Id: socket.id,
      player: playerInfo,
      projectile: projectileInfo,
      enemy: enemyInfo,
      id: socket.id,
      map: room.map,
      mode: room.mode,
      room: room.name
    });
  });

  /**
   * Manages lobbies when someone is trying to join one of them
   * @param {list} data - a list of parameters linked to the party
   */
  socket.on("joinGame", function(room) {
    const lobby = io.sockets.adapter.rooms.get(room.name);
    var players = null;

    if (lobby) {
      players = lobby.sockets;
    }

    if (players) {
      var numberPlayers = Object.keys(players).length;
    }

    if (numberPlayers === 0) {
      socket.emit("unknown");
      return;
    } else if (numberPlayers > 3) {
      socket.emit("full");
      return;
    }

    // settings parameters for the player
    global.clientRooms[socket.id] = room.name;
    socket.join(room.name);
    socket.emit("gameRoom", room.name);
    global.Rooms[room.name].numberPlayers += 1;
    Entity.Player.list[socket.id].room = room.name;
    Entity.Player.list[socket.id].name = room.player;
    Entity.Player.list[socket.id].setParameters(configPlayer[room.char]);
    var check = false;
    do {
      Entity.Player.list[socket.id].setSpawn();
      for (var j in Entity.Player.list) {
        if (
          Entity.Player.list[socket.id].x === Entity.Player.list[j].x &&
          Entity.Player.list[socket.id].y === Entity.Player.list[j].y &&
          Entity.Player.list[j].id !== socket.id
        ) {
          check = true;
          break;
        }
      }
    } while (check);
    if (global.Rooms[room.name].mode === "survival") {
      Entity.Player.list[socket.id].alive = true;
    }

    var playerInfo = Entity.Player.infoPlayers();
    var projectileInfo = Entity.Projectile.infoProjectiles();
    var enemyInfo = Entity.Enemy.infoEnemies();
    socket.emit("init", {
      Id: socket.id,
      player: playerInfo,
      projectile: projectileInfo,
      enemy: enemyInfo,
      id: socket.id,
      map: global.Rooms[room.name].map,
      room: room.name,
      mode: global.Rooms[room.name].mode
    });
    for (var i in global.SOCKET_LIST) {
      if (
        global.clientRooms[i] === global.clientRooms[socket.id] &&
        global.SOCKET_LIST[i].id !== socket.id
      ) {
        global.SOCKET_LIST[i].emit(
          "printMessage",
          Entity.Player.list[socket.id].name.fontcolor("green") +
            " joins".fontcolor("green")
        );
      }
    }
  });

  /**
   * Insert a party in the database and clean everything related to the game
   * @param {list} data - a list of parameters linked to the party
   */
  socket.on("endGame", function(data) {
    // Inserting the party in the Database
    if (!data.name.includes("Guest_"))
      partie(
        data["room"],
        global.Rooms[data.room].beginning,
        data["datefin"],
        data["name"],
        data["score"],
        data["result"]
      );

    socket.leave(data.room);
    global.REMOVE_DATA.player.push(socket.id);
    var countPlayers = 0;
    for (var i in Entity.Player.list) {
      if (Entity.Player.list[i].room === data.room) countPlayers += 1;
    }

    if (countPlayers === 2 && global.Rooms[data.room].mode === "ffa") {
      for (var i in Entity.Player.list) {
        if (Entity.Player.list[i].id !== socket.id) {
          var message = "Victory";
          global.SOCKET_LIST[i].emit("closeGame", message);
          Entity.Player.list[i].reset();
          global.SOCKET_LIST[i].leave(data.room);
          global.REMOVE_DATA.player.push(i);
        }
      }
    }
    // removing properties
    if (
      global.Rooms[data.room].mode === "survival" &&
      io.sockets.adapter.rooms.get(data.room) === undefined
    ) {
      clearInterval(global.Rooms[data.room].spawnId);
      for (var i in Entity.Enemy.list) {
        if (Entity.Enemy.list[i].room === data.room) {
          global.REMOVE_DATA.enemy.push(Entity.Enemy.list[i].id);
          delete Entity.Enemy.list[i];
        }
      }
    }
    if (io.sockets.adapter.rooms.get(data.room) === undefined) {
      clearInterval(global.Rooms[data.room].objectId);
      clearInterval(global.Rooms[data.room].staminaId);
      for (var i in Entity.Item.list) {
        if (Entity.Item.list[i].room === data.room) {
          global.REMOVE_DATA.object.push(Entity.Item.list[i].id);
          delete Entity.Item.list[i];
        }
      }
      delete global.Rooms[data.room];
    }
    delete global.clientRooms[socket.id];
    global.REMOVE_DATA.lobby.push(data.room);

    var message = null;
    if (data.result === "win")
      // the winner
      message = "Victory";
    else if (data.result === "lose") message = "Lose";
    else message = "Your score : " + Entity.Player.list[socket.id].score; // this is for survival
    socket.emit("closeGame", message);
    Entity.Player.list[socket.id].reset();
  });

  /**
   * Set the name of the player in the server side
   * @param {String} name - name of the player
   */
  socket.on("setName", function(name) {
    if (Entity.Player.list[socket.id])
      Entity.Player.list[socket.id].name = name;
  });

  /**
   * Set the state of the player in the server side
   * @param {String} state - state of the player
   */
  socket.on("getReady", function(state) {
    Entity.Player.list[socket.id].ready = state;
  });

  /**
   * On disconnection, delete the player from the server and delete all the enemies.
   */
  socket.on("disconnect", function() {
    if (
      global.clientRooms[socket.id] !== undefined &&
      io.sockets.adapter.rooms.get(global.clientRooms[socket.id]) === undefined
    ) {
      clearInterval(global.Rooms[global.clientRooms[socket.id]].staminaId);
      clearInterval(global.Rooms[global.clientRooms[socket.id]].objectId);
      if (global.Rooms[global.clientRooms[socket.id]].mode === "survival")
        clearInterval(global.Rooms[global.clientRooms[socket.id]].spawnId);
    }

    delete global.SOCKET_LIST[socket.id];
    Entity.Player.onDisconnect(socket);

    if (!Object.keys(Entity.Player.list).length) {
      Entity.Enemy.list = {};
      Entity.Item.list = {};
    }
  });

  socket.on("sendPrivateMessage", function(data) {
    if (data.message !== "") {
      var schema = yup.object().shape({
        name: yup
          .string()
          .required()
          .matches(
            /^(?!.*<[^>]+>).*/,
            "Seems like you tried to insert a html tag... "
          ),
        message: yup
          .string()
          .required()
          .matches(
            /^(?!.*<[^>]+>).*/,
            "Seems like you tried to insert a html tag... "
          ),
        dest: yup
          .string()
          .required()
          .matches(
            /^(?!.*<[^>]+>).*/,
            "Seems like you tried to insert a html tag... "
          )
      });

      // checking if player exists
      var requestPm = null;
      for (var i in Entity.Player.list) {
        if (
          Entity.Player.list[i].name === data.dest &&
          global.clientRooms[i] === global.clientRooms[socket.id] &&
          data.dest !== Entity.Player.list[socket.id].name
        )
          requestPm = i;
      }

      // checking if message is correct
      if (requestPm) {
        schema.validate(data).then(function(value) {
          socket.emit(
            "printMessage",
            "To ".fontcolor("purple") +
              value.dest.fontcolor("purple") +
              ": ".fontcolor("purple") +
              value.message
          );
          global.SOCKET_LIST[requestPm].emit(
            "printMessage",
            "From ".fontcolor("purple") +
              value.name.fontcolor("purple") +
              ": ".fontcolor("purple") +
              value.message
          );
        });
      } else {
        const errorMessage = "User does not exist or is not connected";
        socket.emit("printMessage", errorMessage.fontcolor("red"));
      }

      schema.validate(data).catch(function(err) {
        const errorMessage =
          "!!! SERVER MESSAGE : Your message has not been send. A html tag has been detected. Not allowed !!!";

        socket.emit("printMessage", errorMessage.fontcolor("red"));

        err.message;
        err.errors;
      });
    }
  });

  /**
   * When receiving a message call, emit a request to print the message
   * If yup scheme is not respected, server will send a custom message instead
   * @param {data} - the message to send.
   */
  socket.on("sendMessage", function(data) {
    if (data.message !== "") {
      var schema = yup.object().shape({
        name: yup
          .string()
          .required()
          .matches(
            /^(?!.*<[^>]+>).*/,
            "Seems like you tried to insert a html tag... "
          ),
        message: yup
          .string()
          .required()
          .matches(
            /^(?!.*<[^>]+>).*/,
            "Seems like you tried to insert a html tag... "
          )
      });

      schema.validate(data).then(function(value) {
        for (var i in global.SOCKET_LIST) {
          if (global.clientRooms[i] === global.clientRooms[socket.id]) {
            global.SOCKET_LIST[i].emit(
              "printMessage",
              value.name.fontcolor("blue") +
                ": ".fontcolor("blue") +
                value.message
            );
          }
        }
      });

      schema.validate(data).catch(function(err) {
        const errorMessage =
          "!!! SERVER MESSAGE : Your message has not been send. A html tag has been detected. Not allowed !!!";

        socket.emit("printMessage", errorMessage.fontcolor("red"));

        err.message;
        err.errors;
      });
    }
  });
});

/**
 * "Updating" the server given an interval.
 * le premier argument est l'action à effectuer et le 2e l'intervalle de temps
 */
setInterval(function() {
  var infoPlayers = Entity.Player.checkInfoPlayers();
  var infoProjectiles = Entity.Projectile.checkInfoProjectiles();
  var infoEnemies = Entity.Enemy.checkInfoEnemies();
  var infoObjects = Entity.Item.checkInfoObjects();
  var pack = {
    player: infoPlayers,
    projectile: infoProjectiles,
    enemy: infoEnemies,
    object: infoObjects
  };
  for (var i in global.SOCKET_LIST) {
    var socket = global.SOCKET_LIST[i];
    // sending request of update
    if (Object.entries(global.INIT_DATA).length !== 0)
      socket.emit("init", global.INIT_DATA);
    socket.emit("update", pack);
    if (Object.entries(global.REMOVE_DATA).length !== 0)
      socket.emit("delete", global.REMOVE_DATA);
  }
  global.INIT_DATA.player = [];
  global.INIT_DATA.projectile = [];
  global.INIT_DATA.enemy = [];
  global.INIT_DATA.object = [];

  global.REMOVE_DATA.player = [];
  global.REMOVE_DATA.projectile = [];
  global.REMOVE_DATA.enemy = [];
  global.REMOVE_DATA.object = [];
  global.REMOVE_DATA.lobby = [];
}, 1000 / 40);

/**
 * Set everything needed for a game on the server.
 */
app.post("/start", function(req, res) {
  global.Rooms[req.body.room].state = true;
  if (!global.Rooms[req.body.room].objects) {
    global.Rooms[req.body.room].objectId = setInterval(function() {
      if (Object.keys(Entity.Player.list).length) {
        var o = Entity.Item.generateObject(req.body.room);
      }
    }, 15000);
    global.Rooms[req.body.room].objects = true;
  }

  global.Rooms[req.body.room].staminaId = setInterval(function() {
    for (var i in Entity.Player.list) {
      if (
        Entity.Player.list[i] &&
        Entity.Player.list[i].stamina < Entity.Player.list[i].maxStamina
      ) {
        Entity.Player.list[i].stamina += 1;
      }
    }
  }, 2000);

  if (global.Rooms[req.body.room].mode === "survival") {
    if (!global.Rooms[req.body.room].spawnActivation) {
      global.Rooms[req.body.room].spawnId = setInterval(function() {
        if (
          Object.keys(Entity.Enemy.list).length + 1 <=
            global.Rooms[req.body.room].numberEnemies &&
          Object.keys(Entity.Player.list).length
        ) {
          var e = Entity.Enemy.randomGenerateEnemy(req.body.room);
        }
      }, global.Rooms[req.body.room].respawnTime * 1000);
      global.Rooms[req.body.room].spawnActivation = true;
    }
  }

  res.send("game's ready");
});

/* retrieve all  game parts */
app.post("/parties", function(req, res) {
  admin
    .database()
    .ref()
    .child("parties")
    .get()
    .then(snapshot => {
      if (snapshot.exists()) {
        var data = snapshot.toJSON();
        res.send(data);
      } else {
        console.log(" aucune donnees ! ");
        data = null;
        var data = snapshot.toJSON();
        res.send(data);
      }
    })
    .catch(error => {
      console.error(error);
    });
});

/**
 * Increase the difficulty after an amount of time for a survival mode
 */
app.post("/nextWave", function(req, res) {
  if (
    global.Rooms[req.body.room] !== undefined &&
    global.Rooms[req.body.room].mode === "survival"
  ) {
    if (global.Rooms[req.body.room].wave < 10)
      global.Rooms[req.body.room].wave += 1;
  }
  res.send("next wave");
});

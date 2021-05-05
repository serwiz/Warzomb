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

/* base de donnees */
////////////////////////////////////////////////
var admin = require("firebase-admin");
const { config } = require("process");
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aws-warzomb-default-rtdb.firebaseio.com/"
});

////////////////////////////////////////////////

const yup = require("yup");
const global = require("./global.js");
const Lobby = require("./Lobby.js");
const Entity = require("./Entity.js");
const io = require("socket.io")(server);

////////////////////

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

/* creation of the IMAGE table using the config file */
let image = function writeDataImage() {
  var config = require("./config.json");
  admin
    .database()
    .ref("image_url/")
    .set(config);
};

image();

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
  global.SOCKET_LIST[socket.id] = socket;
  Entity.Player.onConnect(socket);

  /**
   * Retrieves info about the lobbies in the server
   */
  socket.on("getLobbies", function() {
    var info = {};
    for (var i in global.Rooms) {
      if (io.sockets.adapter.rooms.get(i) === undefined) delete global.Rooms[i];
      else info[i] = global.Rooms[i];
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
    Entity.Player.list[socket.id].class = room.class;
    Entity.Player.list[socket.id].room = room.name;
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
      name: room.name
    });
  });

  /**
   * Manages lobbies when someone is trying to join one of them
   * @param {list} room - a list of parameters linked to the party
   */
  socket.on("joinGame", function(roomName) {
    const lobby = io.sockets.adapter.rooms.get(roomName);
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

    global.clientRooms[socket.id] = roomName;
    socket.join(roomName);
    socket.emit("gameRoom", roomName);
    Entity.Player.list[socket.id].room = roomName;
    Entity.Player.list[socket.id].class = "warrior";
    var playerInfo = Entity.Player.infoPlayers();
    var projectileInfo = Entity.Projectile.infoProjectiles();
    var enemyInfo = Entity.Enemy.infoEnemies();
    socket.emit("init", {
      Id: socket.id,
      player: playerInfo,
      projectile: projectileInfo,
      enemy: enemyInfo,
      id: socket.id,
      map: global.Rooms[roomName].map,
      name: roomName,
      mode : global.Rooms[roomName].mode
    });
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

    // removing properties
    if (global.Rooms[data.room].mode === "survival")
      clearInterval(Entity.enemySpawn);

    var message = null;
    for (var i in global.SOCKET_LIST) {
      if (i === data.id)
        // the winner
        message = "Victory";
      else message = "Lose";
      socket.emit("closeGame", message); // nothing client side for the moment
    }
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
    delete global.SOCKET_LIST[socket.id];
    Entity.Player.onDisconnect(socket);
    if (!Object.keys(Entity.Player.list).length) Entity.Enemy.list = {};
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
  var pack = {
    player: infoPlayers,
    projectile: infoProjectiles,
    enemy: infoEnemies
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

  global.REMOVE_DATA.player = [];
  global.REMOVE_DATA.projectile = [];
  global.REMOVE_DATA.enemy = [];
}, 1000 / 25);

/**
 * "Updating" the server given an interval.
 *  This one is for zombies generation.
 * random interval given.
 */

app.get("/start", function(req, res) {
  Entity.enemySpawn = setInterval(function() {
    if (
      Object.keys(Entity.Enemy.list).length + 1 <= 3 &&
      Object.keys(Entity.Player.list).length
    ) {
      var e = Entity.Enemy.randomGenerateEnemy();
    }
  }, 5000);
  res.send("Zombies now spawn");
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

/////////////////////////////////

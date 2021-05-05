/**
 * When receiving the call, initialize the objects
 * @param {list} data - list of players and projectiles to create on the client side
 */
socket.on("init", function(data) {
  if (data.Id) {
    playerId = data.Id;
  }

  if (data.map) {
    if (data.map === "forest") map.src = srcForest;
    else map.src = srcMountain;
  }

  if (data.name) clientPlayer.list[data.id].room = data.name;

  if (data.name && data.map && data.mode) {
    Option.list[data.name] = new Option({
      name: data.room,
      mode: data.mode,
      map: data.map
    });
  }

  if (data.player)
    for (var i = 0; i < data.player.length; i++) {
      //player
      clientPlayer(data.player[i]);
      clientPlayer.list[data.player[i].id].name = socket.name;
      socket.emit("setName", socket.name);
    }

  if (data.projectile)
    for (var i = 0; i < data.projectile.length; i++) {
      clientProjectile(data.projectile[i]);
    }
  if (data.enemy)
    for (var i = 0; i < data.enemy.length; i++) {
      clientEnemy(data.enemy[i]);
    }
  
});

/**
 * When receiving the call, update info
 *  @param {list} data - list of players and projectiles to create on the client side
 */
socket.on("update", function(data) {
  for (var i = 0; i < data.player.length; i++) {
    var player = clientPlayer.list[data.player[i].id];
    if (player) {
      // position
      if (data.player[i].x !== undefined) {
        if (data.player[i].direction === 1) {
          if (!player.inAction && data.player[i].x !== player.x) {
            if (player.frameX < 8) player.frameX++;
            else player.frameX = 0;
            player.frameY = 11;
          } else if (player.inAction && data.player[i].x === player.x) {
            if (player.frameX < 6) player.frameX++;
            else {
              player.frameX = 0;
              player.inAction = false;
              player.frameY = 11;
            }
          }
        } else if (data.player[i].direction === 2) {
          if (!player.inAction && data.player[i].x !== player.x) {
            if (player.frameX < 8) player.frameX++;
            else player.frameX = 0;
            player.frameY = 9;
          } else if (player.inAction && data.player[i].x === player.x) {
            if (player.frameX < 6) player.frameX++;
            else {
              player.frameX = 0;
              player.inAction = false;
              player.frameY = 9;
            }
          }
        }
        player.x = data.player[i].x;
      }

      if (data.player[i].y !== undefined) {
        if (data.player[i].direction === 4) {
          if (!player.inAction && data.player[i].y !== player.y) {
            if (player.frameX < 8) player.frameX++;
            else player.frameX = 0;
            player.frameY = 10;
          } else if (player.inAction && data.player[i].y === player.y) {
            if (player.frameX < 6) player.frameX++;
            else {
              player.frameX = 0;
              player.inAction = false;
              player.frameY = 10;
            }
          }
        } else if (data.player[i].direction === 3) {
          if (!player.inAction && data.player[i].y !== player.y) {
            if (player.frameX < 8) player.frameX++;
            else player.frameX = 0;
            player.frameY = 8;
          } else if (player.inAction && data.player[i].y === player.y) {
            if (player.frameX < 6) player.frameX++;
            else {
              player.frameX = 0;
              player.inAction = false;
              player.frameY = 8;
            }
          }
        }
        player.y = data.player[i].y;
      }

      // stats
      if (data.player[i].hp !== undefined) player.life = data.player[i].hp;
      if (data.player[i].score !== undefined)
        player.score = data.player[i].score;
      if (data.player[i].death !== undefined)
        player.death = data.player[i].death;
      if (data.player[i].frag !== undefined) player.frag = data.player[i].frag;
      if (data.player[i].ready !== undefined)
        player.ready = data.player[i].ready;
      if (data.player[i].direction !== undefined)
        player.direction = data.player[i].direction;
      if (data.player[i].room !== undefined) player.room = data.player[i].room;
      if (data.player[i].class !== undefined) {
        player.class = data.player[i].class;
        if (data.player[i].class === "warrior")
          player.character.src = srcWarrior;
        if (data.player[i].class === "sorcerer") player.character.src = srcMage;
        if (data.player[i].class === "tank") player.character.src = srcTank;
        if (data.player[i].class === "archer") player.character.src = srcArcher;
      }
    }
  }
  for (var i = 0; i < data.projectile.length; i++) {
    var p = clientProjectile.list[data.projectile[i].id];
    if (p) {
      if (data.projectile[i].x !== undefined) p.x = data.projectile[i].x;
      if (data.projectile[i].y !== undefined) p.y = data.projectile[i].y;
    }
  }
  if (data.enemy)
    for (var i = 0; i < data.enemy.length; i++) {
      var e = clientEnemy.list[data.enemy[i].id];
      if (e) {
        if (data.enemy[i].x !== undefined && data.enemy[i].x !== e.x) {
          e.x = data.enemy[i].x;
          if (data.enemy[i].direction === 1) {
            if (e.frameX < 8) e.frameX++;
            else e.frameX = 0;
            e.frameY = 11;
          } else {
            if (e.frameX < 8) e.frameX++;
            else e.frameX = 0;
            e.frameY = 9;
          }
        }
        if (data.enemy[i].y !== undefined && data.enemy[i].y !== e.y) {
          e.y = data.enemy[i].y;
          if (data.enemy[i].direction === 4) {
            if (e.frameX < 8) e.frameX++;
            else e.frameX = 0;
            e.frameY = 10;
          } else {
            if (e.frameX < 8) e.frameX++;
            else e.frameX = 0;
            e.frameY = 8;
          }
        }
        if (data.enemy[i].hp !== undefined) e.life = data.enemy[i].hp;
        if (data.enemy[i].direction !== undefined)
          e.direction = data.enemy[i].direction;
      }
    }
});

/**
 * When receiving the call, delete info
 *  @param {list} data - list of players and projectiles to create on the client side
 */
socket.on("delete", function(data) {
  for (var i = 0; i < data.player.length; i++) {
    delete clientPlayer.list[data.player[i]];
  }
  for (var i = 0; i < data.projectile.length; i++) {
    delete clientProjectile.list[data.projectile[i]];
  }
  for (var i = 0; i < data.enemy.length; i++) {
    delete clientEnemy.list[data.enemy[i]];
  }
});

/**
 * When receiving the call, create the animation for the slash
 *  @param {list} data - info about the player who's attacking
 */
socket.on("slash", function(data) {
  if (!clientPlayer.list[data.user].inAction) {
    clientPlayer.list[data.user].inAction = true;

    // updating the sprite
    switch (data.direction) {
      case 1:
        clientPlayer.list[data.user].frameX = 0;
        clientPlayer.list[data.user].frameY = 3;
        break;
      case 2:
        clientPlayer.list[data.user].frameX = 0;
        clientPlayer.list[data.user].frameY = 1;
        break;
      case 3:
        clientPlayer.list[data.user].frameX = 0;
        clientPlayer.list[data.user].frameY = 0;
        break;
      case 4:
        clientPlayer.list[data.user].frameX = 0;
        clientPlayer.list[data.user].frameY = 2;
        break;
      default:
        break;
    }
  }
});

/**
 * When receiving the call, create the animation for the death
 *  @param {list} data - info about the player who's dead
 */
socket.on("die", function(data) {});

/**
 * Display lobbies on the website
 * @param  {list} data - list of info about lobbies saved in the server
 */
socket.on("listLobbies", function(data) {
  $(".option").hide();
  $(".menu").hide();
  $("#table-container").show();

  $("table tbody").empty();
  $.each(data, function(index) {
    $("table tbody").append("<tr>");
    $.each(data[index], function(key, value) {
      $("table tbody ").append("<td>" + value + "</td>");
    });
    $("table tbody ").append("</tr>");
  });

  $("#table-container tbody ").click(function() {
    var room = $(this)
      .find("td")
      .eq(2)
      .html();
    joinGame(room);
  });
});

/**
 * Set room's name on client side
 * @param  {String} roomName - room's name
 */
socket.on("gameRoom", function(roomName) {
  gameRoom = roomName;
});

socket.on("unknown", function() {
  console.log("no rooms");
});
socket.on("full", function() {
  console.log("game full");
});

socket.on("closeGame", function(message) {
  console.log(message);
});

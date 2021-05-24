/**
 * When receiving the call, initialize the objects
 * @param {list} data - list of players and projectiles to create on the client side
 */
socket.on("init", function(data) {
  if (data.Id) {
    playerId = data.Id;
  }
  if (data.room) gameRoom = data.room;

  if (data.map) {
    if (data.map === "forest") map.src = srcForest;
    else if (data.map === "cavern") map.src = srcCavern;
    else if (data.map === "city") map.src = srcCity;
    else if (data.map === "desert") map.src = srcDesert;
    else if (data.map === "swamp") map.src = srcSwamp;
  }
  if (data.room && data.map && data.mode) {
    Option.list[data.room] = new Option({
      room: data.room,
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
  if (data.room) clientPlayer.list[data.id].room = data.room;

  if (data.projectile)
    for (var i = 0; i < data.projectile.length; i++) {
      clientProjectile(data.projectile[i]);
    }
  if (data.enemy)
    for (var i = 0; i < data.enemy.length; i++) {
      clientEnemy(data.enemy[i]);
    }

  if (data.object) {
    for (var i = 0; i < data.object.length; i++) {
      clientObject(data.object[i]);
    }
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
      if (
        data.player[i].x !== undefined &&
        Option.list[player.room] !== undefined &&
        Option.list[player.room].start
      ) {
        if (data.player[i].direction === 1) {
          if (!player.inAction && data.player[i].x !== player.x) {
            if (player.frameX < 8) player.frameX++;
            else player.frameX = 0;
            player.frameY = 11;
          } else if (player.inAction && data.player[i].x === player.x) {
            if (player.frameX < 5 && player.class !== "archer") player.frameX++;
            else if (player.frameX < 12 && player.class === "archer")
              player.frameX++;
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
            if (player.frameX < 5 && player.class !== "archer") player.frameX++;
            else if (player.frameX < 12 && player.class === "archer")
              player.frameX++;
            else {
              player.frameX = 0;
              player.inAction = false;
              player.frameY = 9;
            }
          }
        }
      }
      player.x = data.player[i].x;
      if (
        data.player[i].y !== undefined &&
        Option.list[player.room] !== undefined &&
        Option.list[player.room].start
      ) {
        if (data.player[i].direction === 4) {
          if (!player.inAction && data.player[i].y !== player.y) {
            if (player.frameX < 8) player.frameX++;
            else player.frameX = 0;
            player.frameY = 10;
          } else if (player.inAction && data.player[i].y === player.y) {
            if (player.frameX < 5 && player.class !== "archer") player.frameX++;
            else if (player.frameX < 12 && player.class === "archer")
              player.frameX++;
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
            if (player.frameX < 5 && player.class !== "archer") player.frameX++;
            else if (player.frameX < 12 && player.class === "archer")
              player.frameX++;
            else {
              player.frameX = 0;
              player.inAction = false;
              player.frameY = 8;
            }
          }
        }
      }
      player.y = data.player[i].y;

      // stats
      if (data.player[i].hp !== undefined) {
        player.life = data.player[i].hp;
        if (player.life > player.maxLife) player.life = player.maxLife;
      }
      if (data.player[i].score !== undefined)
        player.score = data.player[i].score;
      if (data.player[i].death !== undefined)
        player.death = data.player[i].death;
      if (data.player[i].ready !== undefined)
        player.ready = data.player[i].ready;
      if (data.player[i].direction !== undefined)
        player.direction = data.player[i].direction;
      if (data.player[i].room !== undefined) player.room = data.player[i].room;
      if (data.player[i].stamina !== undefined) {
        player.stamina = data.player[i].stamina;
        if (player.stamina > player.maxStamina)
          player.stamina = player.maxStamina;
      }
      if (data.player[i].ult !== undefined) {
        player.ult = data.player[i].ult;
        if (player.ult > player.maxUlt) player.ult = player.maxUlt;
      }
      if (data.player[i].class !== undefined) {
        player.class = data.player[i].class;
        if (data.player[i].class === "warrior")
          player.character.src = srcWarrior;
        if (data.player[i].class === "sorcerer") player.character.src = srcMage;
        if (data.player[i].class === "tank") player.character.src = srcTank;
        if (data.player[i].class === "archer") player.character.src = srcArcher;
      }

      if (data.player[i].frag !== undefined) player.frag = data.player[i].frag;
    }
  }
  if (data.projectile)
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
          if (data.enemy[i].y > e.y) {
            if (e.frameX < 8) e.frameX++;
            else e.frameX = 0;
            e.frameY = 10;
          } else {
            if (e.frameX < 8) e.frameX++;
            else e.frameX = 0;
            e.frameY = 8;
          }
        }
        if (data.enemy[i].y === e.y && data.enemy[i].x === e.x && !e.inAction) {
          e.frameX = 0;
          switch (data.enemy[i].direction) {
            case 1:
              e.frameY = 11;
              break;
            case 2:
              e.frameY = 9;
              break;
            case 3:
              e.frameY = 8;
              break;
            case 4:
              e.frameY = 10;
              break;
          }
        }
        e.x = data.enemy[i].x;
        e.y = data.enemy[i].y;
        if (data.enemy[i].hp !== undefined) e.life = data.enemy[i].hp;
        if (data.enemy[i].direction !== undefined)
          e.direction = data.enemy[i].direction;
      }
    }

  if (data.object)
    for (var i = 0; i < data.object.length; i++) {
      var o = clientObject.list[data.object[i].id];
      if (o) {
        if (data.object[i].x !== undefined) o.x = data.object[i].x;
        if (data.object[i].y !== undefined) o.y = data.object[i].y;
        if (data.object[i].property !== undefined)
          o.property = data.object[i].property;
        if (o.frameX < 8) o.frameX++;
        else o.frameX = 1;
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
  for (var i = 0; i < data.object.length; i++) {
    delete clientObject.list[data.object[i]];
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
 * When receiving the call, create the animation for the shoot
 *  @param {list} data - info about the player who's attacking
 */
socket.on("shoot", function(data) {
  if (!clientPlayer.list[data.user].inAction) {
    clientPlayer.list[data.user].inAction = true;

    // updating the sprite
    if (data.type === "fireball") {
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
    } else {
      switch (data.direction) {
        case 1:
          clientPlayer.list[data.user].frameX = 0;
          clientPlayer.list[data.user].frameY = 19;
          break;
        case 2:
          clientPlayer.list[data.user].frameX = 0;
          clientPlayer.list[data.user].frameY = 17;
          break;
        case 3:
          clientPlayer.list[data.user].frameX = 0;
          clientPlayer.list[data.user].frameY = 16;
          break;
        case 4:
          clientPlayer.list[data.user].frameX = 0;
          clientPlayer.list[data.user].frameY = 18;
          break;
        default:
          break;
      }
    }
  }
});
/**
 * When receiving the call, create the animation for the  skill
 *  @param {list} data - info about the player who's attacking
 */
socket.on("skill", function(data) {
  if (
    !clientPlayer.list[data.user].inAction &&
    !clientPlayer.list[data.user].useSkill &&
    clientPlayer.list[data.user].class !== "archer"
  ) {
    clientPlayer.list[data.user].inAction = true;
    clientPlayer.list[data.user].useSkill = true;

    // updating the sprite
    switch (data.direction) {
      case 1:
        clientPlayer.list[data.user].frameX = 0;
        clientPlayer.list[data.user].frameY = 3;
        if (data.class === "warrior") {
          clientPlayer.list[data.user].skill.src = srcFireLionR;
        } else if (data.class === "tank") {
          clientPlayer.list[data.user].skill.src = srcSnakeR;
        }
        break;
      case 2:
        clientPlayer.list[data.user].frameX = 0;
        clientPlayer.list[data.user].frameY = 1;
        if (data.class === "warrior") {
          clientPlayer.list[data.user].skill.src = srcFireLionL;
        } else if (data.class === "tank") {
          clientPlayer.list[data.user].skill.src = srcSnakeL;
        }
        break;
      case 3:
        clientPlayer.list[data.user].frameX = 0;
        clientPlayer.list[data.user].frameY = 0;
        if (data.class === "warrior") {
          clientPlayer.list[data.user].skill.src = srcFireLionU;
        } else if (data.class === "tank") {
          clientPlayer.list[data.user].skill.src = srcSnakeU;
        }
        break;
      case 4:
        clientPlayer.list[data.user].frameX = 0;
        clientPlayer.list[data.user].frameY = 2;
        if (data.class === "warrior") {
          clientPlayer.list[data.user].skill.src = srcFireLionD;
        } else if (data.class === "tank") {
          clientPlayer.list[data.user].skill.src = srcSnakeD;
        }
        break;
      default:
        break;
    }
  }
});

/**
 * Display lobbies on the website
 * @param  {list} data - list of info about lobbies saved in the server
 */
socket.on("listLobbies", function(data) {
  $(".option").show();
  $(".room").hide();
  $(".validation").hide();
  $(".map_selection").hide();
  $(".mode_selection").hide();
  $(".menu").hide();
  $("#table-container").show();
  $(".class_selection").show();
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
      .eq(0)
      .html();
    var char = $("input[name=class]:checked").val();
    joinGame(room.slice(0, room.indexOf("'")), char);
  });
});

/**
 * Set room's name on client side
 * @param  {String} roomName - room's name
 */
socket.on("gameRoom", function(roomName) {
  gameRoom = roomName;
  $("button[name=backLobby]").hide();
  $("#hourglass").hide();
  $("#table-container").hide();
  $(".option").hide();
  $(".menu").hide();
  $(".main").show();
});

socket.on("unknown", function() {
  console.log("no rooms");
});
socket.on("full", function() {
  console.log("game full");
});

/**
 * Displays end screen with the result : win or lose
 * @param  {String} message - result of the game
 */
socket.on("closeGame", function(message) {
  clearInterval(timer);
  gameRoom = null;
  timer = null;
  drawEndScreen(message);
});

/**
 * Finishes the game and send a request to store the part
 * @param  {list} data - info about the room
 */
socket.on("gameOver", function(data) {
  if (
    clientPlayer.list[playerId].room === data.room &&
    Option.list[data.room].mode === "ffa"
  ) {
    socket.emit("endGame", {
      room: clientPlayer.list[playerId].room.toString(),
      datefin: new Date().toString(),
      name: clientPlayer.list[playerId].name,
      score:
        clientPlayer.list[playerId].frag.toString() +
        "/" +
        clientPlayer.list[playerId].death.toString() +
        "/" +
        clientPlayer.list[playerId].score.toString(),
      result: playerId === data.winner ? "win" : "lose",
      id: clientPlayer.list[playerId].id
    });
  } else if (
    clientPlayer.list[playerId].room === data.room &&
    Option.list[data.room].mode === "survival"
  ) {
    socket.emit("endGame", {
      room: clientPlayer.list[playerId].room.toString(),
      datefin: new Date().toString(),
      name: clientPlayer.list[playerId].name,
      score:
        clientPlayer.list[playerId].frag.toString() +
        "/" +
        clientPlayer.list[playerId].score.toString(),
      result: "/",
      id: clientPlayer.list[playerId].id,
      time: minutes + seconds / 60
    });
    clearInterval(timer);
    timer = null;
    $("#timer").empty();
  }
  Option.list[gameRoom].start = false;
});

/**
 * Retrieves info about the enemy who's attacking and animate the character
 * @param  {list} data - info about the enemy who's attacking
 */
socket.on("EnemyAttack", function(data) {
  if (!clientEnemy.list[data.id].inAction) {
    clientEnemy.list[data.id].inAction = true;

    // updating the sprite
    switch (data.direction) {
      case 1:
        clientEnemy.list[data.id].frameX = 0;
        clientEnemy.list[data.id].frameY = 3;
        break;
      case 2:
        clientEnemy.list[data.id].frameX = 0;
        clientEnemy.list[data.id].frameY = 1;
        break;
      case 3:
        clientEnemy.list[data.id].frameX = 0;
        clientEnemy.list[data.id].frameY = 0;
        break;
      case 4:
        clientEnemy.list[data.id].frameX = 0;
        clientEnemy.list[data.id].frameY = 2;
        break;
      default:
        break;
    }
  }
});

/**
 * When receiving the call, create the animation for the ultimate
 * @param  {list} data - info about the the ultimate
 */
socket.on("ultimate", function(data) {
  // updating the sprite
  if (data.class === "sorcerer") {
    clientPlayer.list[data.user].ultSkill.src = srcThunder;
    clientPlayer.list[data.user].target = data.target;
    clientPlayer.list[data.user].useUlt = true;
  } else if (data.class === "tank") {
    clientPlayer.list[data.user].ultSkill.src = srcShield;
    clientPlayer.list[data.user].useUlt = true;
  }
});

/**
 * When receiving the call, stop the ultimate animation
 * @param  {list} data - info about the the ultimate
 */
socket.on("cancelUltimate", function(data) {
  if (data.class === "tank") {
    clientPlayer.list[data.user].useUlt = false;
  }
});

/**
 * main function to update and draw the game;
 */

function mainGame() {
  if (!playerId) return;
  // map
  game.clearRect(0, 0, game.canvas.width, game.canvas.width);
  game.drawImage(map, 0, 0);
  if (
    clientPlayer.list[playerId].score !== lastScore ||
    clientPlayer.list[playerId].frag !== lastFrag ||
    clientPlayer.list[playerId].death !== lastDeath
  ) {
    left_game.clearRect(0, 0, 300, 500);

    lastScore = clientPlayer.list[playerId].score;
    lastFrag = clientPlayer.list[playerId].frag;
    lastDeath = clientPlayer.list[playerId].death;
    drawHud();
  }
  if (clientPlayer.list[playerId].life !== lastLife) {
    right_game.clearRect(0, 0, 100, 100);
    lastLife = clientPlayer.list[playerId].life;
    drawHpBar();
  }
  drawObjects(clientPlayer.list, clientProjectile.list, clientEnemy.list);
}

/**
 * draw the players and the projectiles
 * @param {list} players - list of players
 * @param {list} players - list of projectiles
 */
function drawObjects(players, projectiles, ennemies) {
  // size of the sprites
  var width = 64;
  var height = 64;
  const scale = 2;

  // players
  for (var i in players) {
    if (gameRoom && players[i].room === gameRoom) {
      if (players[i].inAction) {
        width = 192;
        height = 192;
        game.drawImage(
          players[i].character,
          players[i].frameX * width,
          players[i].frameY * height + 1345,
          width,
          height,
          players[i].x - width / scale,
          players[i].y - height / scale,
          width,
          height
        );
      } else {
        game.drawImage(
          players[i].character,
          players[i].frameX * width,
          players[i].frameY * height,
          width,
          height,
          players[i].x - width / scale,
          players[i].y - height / scale,
          width,
          height
        );
      }
    }
  }

  width = 64;
  height = 64;
  // projectiles
  for (var i in projectiles)
    game.drawImage(
      fireball,
      0,
      0,
      fireball.width,
      fireball.height,
      projectiles[i].x - 5,
      projectiles[i].y - 5,
      width / scale,
      height / scale
    );

  // ennemies
  for (var i in ennemies) {
    game.fillStyle = "red";
    var hpBar = (30 * ennemies[i].life) / ennemies[i].maxLife;
    game.fillRect(
      ennemies[i].x - (hpBar / scale) * 3,
      ennemies[i].y - height,
      hpBar,
      4
    );
    game.drawImage(
      ennemies[i].character,
      ennemies[i].frameX * width,
      ennemies[i].frameY * height,
      width,
      height,
      ennemies[i].x - (width / scale) * 2,
      ennemies[i].y - (height / scale) * 2,
      width,
      height
    );
  }
}

/**
 * draw the HuD, for the moment only the score is displayed
 */
function drawHud() {
  left_game.fillStyle = "black";
  left_game.fillText(
    clientPlayer.list[playerId].frag +
      "/" +
      clientPlayer.list[playerId].death +
      "/" +
      clientPlayer.list[playerId].score,
    0,
    50
  );
}

function drawName() {
  left_game.fillStyle = "black";
  if (playerId) left_game.fillText(clientPlayer.list[playerId].name, 0, 20);
}

function drawHpBar() {
  // hpBar
  var hpBar =
    (100 * clientPlayer.list[playerId].life) /
    clientPlayer.list[playerId].maxLife;
  right_game.strokeStyle = "black";
  right_game.fillStyle = "red";
  if (hpBar < 0) hpBar = 0;
  right_game.fillRect(0, 0, hpBar, 20);
  right_game.strokeRect(0, 0, 100, 20);

  right_game.fillStyle = "white";
  right_game.fillText(
    "HP: " +
      clientPlayer.list[playerId].life +
      "/" +
      clientPlayer.list[playerId].maxLife,
    0,
    18,
    80
  );
}

function drawEndScreen() {
  game.clearRect(0, 0, game.canvas.width, game.canvas.width);
  game.fillStyle = "#1E1E1E";
  game.globalAlpha = 0.6;
  game.fillRect(0, 0, game.canvas.width, game.canvas.width);
  game.fillStyle = "black";
  $("#announcement").text("Game Ends");
  $("#quit").show();
  $("#new").show();
  $("#ready").hide();
  $("#surrender").hide();
  $(".class-container").hide();
  $(".chat-container").hide();
  $(".general-container").hide();
  $(".info-player-container").hide();
  $(".timer-container").hide();
  $(".skill-container").hide();
}

/**
 * Repeat allows us to call the function a number of times
 * @param {function} func - the function to call
 * @param {Number} times - number of times the function needs to be called
 */

function repeat(func, times) {
  func();
  times && --times && repeat(func, times);
}

/**
 * Makes an html tag content blink
 */
function blink() {
  $("#announcement").text("Game Starts");
  $("#announcement").fadeOut(500);
  $("#announcement").fadeIn(500);
}

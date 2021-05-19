
// for cross browser
window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    window.setTimeout(callback, 100);
  };
}());
/**
 * main function to update and draw the game;
 */
function mainGame() {
  window.requestAnimFrame(mainGame);
  if (!playerId || !gameRoom) return;
  // map
  game.clearRect(0, 0, WIDTH, HEIGHT);
  game.drawImage(map, 0, 0);
  if (
    clientPlayer.list[playerId].score !== lastScore ||
    clientPlayer.list[playerId].frag !== lastFrag ||
    clientPlayer.list[playerId].death !== lastDeath
  ) {
    left_game.clearRect(0, 0, left_game.canvas.width, left_game.canvas.height);

    lastScore = clientPlayer.list[playerId].score;
    lastFrag = clientPlayer.list[playerId].frag;
    lastDeath = clientPlayer.list[playerId].death;
    drawHud();
  }
  if (clientPlayer.list[playerId].life !== lastLife || clientPlayer.list[playerId].stamina !== lastStamina || clientPlayer.list[playerId].ult !== lastUlt) {
    right_game.clearRect(0, 0, right_game.canvas.width, right_game.canvas.height);
    lastLife = clientPlayer.list[playerId].life;
    lastStamina = clientPlayer.list[playerId].stamina;
    lastUlt = clientPlayer.list[playerId].ult;
    drawBars();
  }
  drawObjects(clientPlayer.list, clientProjectile.list, clientEnemy.list, clientObject.list);
}

/**
 * draws the players and the projectiles
 * @param {list} players - list of players
 * @param {list} players - list of projectiles
 * @param {list} enemies - list of enemies
 * @param {list} objects - list of objects
 */
function drawObjects(players, projectiles, enemies, objects) {
  // size of the sprites
  var width = 64;
  var height = 64;
  const scale = 2;
  var tmp = 0;
  // players
  for (var i in players) {
    if (gameRoom && players[i].room === gameRoom) {
      if (players[i].inAction) {
        if (players[i].class === "warrior" || players[i].class === "tank") {
          width = 192;
          height = 192;
          tmp = 1346;
        }
        game.drawImage(
          players[i].character,
          players[i].frameX * width,
          players[i].frameY * height + tmp,
          width,
          height,
          players[i].x - width / scale,
          players[i].y - height / scale,
          width,
          height
        );
      } else {
        width = 64;
        height = 64;
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

      if(players[i].useSkill && (players[i].class === "warrior" || players[i].class === "tank")) {
        width = 128;
        height = 128;
        var xDraw = null;
        var yDraw = null;
        switch (players[i].direction) {
          case 1:
            xDraw = 90;
            yDraw = 0;
            break;
          case 2:
            xDraw = -90;
            yDraw = 0;
            break;
          case 3:
            xDraw = 0;
            yDraw = -60;
            break;
          case 4:
            xDraw = 0;
            yDraw = 90;
            break;
        }

        game.drawImage (
          players[i].skill, 
          players[i].frameSkillX * width,
          players[i].frameSkillY * height,
          width, 
          height, 
          players[i].x - width / scale + xDraw,
          players[i].y - height / scale + yDraw,
          width ,
          height)
        
        if (players[i].frameSkillX < 3) players[i].frameSkillX ++;
        else {
          players[i].frameSkillX = 0;
          players[i].frameSkillY += 1;
        } 
        if (players[i].frameSkillY > 3){
          players[i].useSkill = false;
          players[i].frameSkillX = 0;
          players[i].frameSkillY = 0;
        } 
      }

      if(players[i].useUlt && players[i].class === "sorcerer" && players[i].target) {
        var target = Option.list[players[i].room].mode === "survival" ? enemies[players[i].target] : players[players[i].target];
        width = 128;
        height = 128;
        game.drawImage (
          players[i].ultSkill, 
          players[i].frameUltX * width,
          players[i].frameUltY * height,
          width, 
          height, 
          target.x - width / (scale) ,
          target.y - height /(scale)  ,
          width ,
          height)
        
        if (players[i].frameUltX < 3) players[i].frameUltX ++;
        else {
          players[i].frameUltX = 0;
          players[i].frameUltY += 1;
        } 
        if (players[i].frameUltY > 3){
          players[i].useUlt = false;
          players[i].frameUltX = 0;
          players[i].frameUltY = 0;
          players[i].target = null;
        } 
      } else if (players[i].useUlt && players[i].class === "tank") {
        width = 128;
        height = 128;
        game.drawImage (
          players[i].ultSkill, 
          players[i].frameUltX * width,
          players[i].frameUltY * height,
          width, 
          height, 
          players[i].x - width / (scale * 2) ,
          players[i].y - height /(scale * 2)  ,
          width / scale + 30,
          height / scale + 30)
        
        if (players[i].frameUltX < 3) players[i].frameUltX ++;
        else {
          players[i].frameUltX = 0;
          players[i].frameUltY += 1;
        } 
        if (players[i].frameUltY > 3){
          players[i].frameUltX = 0;
          players[i].frameUltY = 0;
        } 
      }
    }
  }
  width = 64;
  height = 64;
  // projectiles
  for (var i in projectiles)
  if (gameRoom && projectiles[i].room === gameRoom) {
    if (projectiles[i].type === "arrow") {
      switch (projectiles[i].direction) {
        case 1:
          projectiles[i].frameX = 4;
          break;
        case 2:
          projectiles[i].frameX = 0;
          break;
        case 3:
          projectiles[i].frameX = 2;
          break;
        case 4:
          projectiles[i].frameX = 6;
          break;
      }
  
    } else {
      // sorcerer
      projectiles[i].frameX = 0;
    }
    game.drawImage(
      projectiles[i].sprite,
      projectiles[i].frameX * width,
      0,
      width,
      height,
      projectiles[i].x ,
      projectiles[i].y ,
      width /scale,
      height / scale
    );
  }
  // enemies
  for (var i in enemies) {
    if (gameRoom && enemies[i].room === gameRoom) {
      game.fillStyle = "red";
    var hpBar = (30 * enemies[i].life) / enemies[i].maxLife;
    game.fillRect(
      enemies[i].x - (hpBar / scale) * 3,
      enemies[i].y ,
      hpBar,
      4
    );

    if (enemies[i].inAction) {
      width = 192;
      height = 192;
      tmp = 1346;
      game.drawImage(
        enemies[i].character,
        enemies[i].frameX * width,
        enemies[i].frameY * height + tmp,
        width,
        height,
        enemies[i].x - width/scale,
        enemies[i].y - height/scale,
        width,
        height
      );
      if (enemies[i].frameX < 5) enemies[i].frameX ++;
        else {
          tmp = 0;
          enemies[i].frameX = 0;
          enemies[i].inAction = false;
          switch(enemies[i].direction) {
            case 1:
              enemies[i].frameY = 11;
              break;
            case 2:
              enemies[i].frameY = 9;
              break;
            case 3:
              enemies[i].frameY = 8;
              break;
            case 4:
              enemies[i].frameY = 10;
              break;
          }
        } 
    } else {
      width = 64;
      height = 64;
      game.drawImage(
        enemies[i].character,
        enemies[i].frameX * width,
        enemies[i].frameY * height,
        width,
        height,
        enemies[i].x - width / scale,
        enemies[i].y - height / scale,
        width,
        height
      );
    }
    } 
  }

  for (var i in objects) {
    width = 24;
    height = 24;
    if (gameRoom && gameRoom === objects[i].room) {
      game.drawImage(
        objects[i].sprite,
        objects[i].frameX * width,
        objects[i].frameY * height,
        width ,
        height ,
        objects[i].x - (width / scale) * 2,
        objects[i].y - (height / scale) * 2,
        width + 8,
        height + 8
      );
    }
    }
    
}

/**
 * draws the HuD, for the moment only the score is displayed
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
    50,
    left_game.canvas.width  
  );
}

/**
 * draws the bars on the top right of the screen
 */
function drawBars() {
  // hpBar
  var hpBar =
    (100 * clientPlayer.list[playerId].life) /
    clientPlayer.list[playerId].maxLife;
  right_game.strokeStyle = "black";
  right_game.fillStyle = "#E43C3C";
  if (hpBar < 0) hpBar = 0;
  right_game.fillRect(0, 0, hpBar * right_game.canvas.width / 100, right_game.canvas.height / 3);
  right_game.strokeRect(0, 0, right_game.canvas.width, right_game.canvas.height / 3);

  right_game.fillStyle = "white";
  right_game.fillText(
    "HP: " +
      clientPlayer.list[playerId].life +
      "/" +
      clientPlayer.list[playerId].maxLife,
    20,
    right_game.canvas.height / 6 + 10,
    right_game.canvas.width
  );
  var staminaBar =
    (100 * clientPlayer.list[playerId].stamina) /
    clientPlayer.list[playerId].maxStamina;
  right_game.strokeStyle = "black";
  right_game.fillStyle = "#00CFDF";
  if (staminaBar < 0) staminaBar = 0;
  right_game.fillRect(0, right_game.canvas.height / 3, staminaBar * right_game.canvas.width / 100, right_game.canvas.height / 3);
  right_game.strokeRect(0, right_game.canvas.height / 3, right_game.canvas.width, right_game.canvas.height / 3);

  right_game.fillStyle = "white";
  right_game.fillText(
    "ST: " +
      clientPlayer.list[playerId].stamina +
      "/" +
      clientPlayer.list[playerId].maxStamina,
    20,
    right_game.canvas.height / 2 + 10,
    right_game.canvas.width 
  );

  var ultBar =
  (100 * clientPlayer.list[playerId].ult) /
  clientPlayer.list[playerId].maxUlt;
  right_game.strokeStyle = "black";
  right_game.fillStyle = "#695B95";
  if (ultBar < 0) ultBar = 0;
  right_game.fillRect(0, 100, ultBar * right_game.canvas.width / 100, right_game.canvas.height / 3);
  right_game.strokeRect(0, 100,right_game.canvas.width, right_game.canvas.height / 3);

  right_game.fillStyle = "white";
  right_game.fillText(
    "ULT: " +
      clientPlayer.list[playerId].ult +
      "/" +
      clientPlayer.list[playerId].maxUlt,
    20,
    right_game.canvas.height - 15,
    right_game.canvas.width 
);
}

/**
 * draws the end screen when the game is finished
 */
function drawEndScreen(result) {
  game.clearRect(0, 0, WIDTH, HEIGHT);
  game.fillStyle = "#1E1E1E";
  game.globalAlpha = 0.8;
  game.fillRect(0, 0, WIDTH, HEIGHT);
  game.fillStyle = "black";
  $("#announcement").html("Game Ends <br/>" + result + "<br/> time: " + minutes + ":" + seconds);
  $("#quit").show();
  $("#new").show();
  $("#ready").hide();
  $("#hourglass").hide();
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
 * Makes an html tag content blink for beginning of a game
 */
function blinkStart() {
  $("#announcement").text("Game Starts");
  $("#announcement").fadeOut(500);
  $("#announcement").fadeIn(500);
}

/**
 * Makes an html tag content blink for survival mode
 */
 function blinkWave() {
  $("#announcement").text("The enemies are getting stronger...");
  $("#announcement").fadeOut(500);
  $("#announcement").fadeIn(500);
}


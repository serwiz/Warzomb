/** events handler */

/**
 * When receiving the call, do one of the actions according to the event's value
 *  @param {event} event - key pressed event
 */
document.onkeydown = function(event) {
  if (!playerId) return;
  if (
    clientPlayer.list[playerId] !== undefined &&
    !clientPlayer.list[playerId].alive
  )
    return;
  if (
    gameRoom &&
    Option.list[gameRoom] !== undefined &&
    !Option.list[gameRoom].start
  )
    return;
  if (
    clientPlayer.list[playerId] !== undefined &&
    (clientPlayer.list[playerId].inAction ||
      clientPlayer.list[playerId].useSkill)
  )
    return;
  if (typing) {
    return;
  }
  if (event.keyCode === 68)
    //d
    socket.emit("keyPress", { inputId: "right", state: true });
  else if (event.keyCode === 83)
    //s
    socket.emit("keyPress", { inputId: "down", state: true });
  else if (event.keyCode === 81)
    //q
    socket.emit("keyPress", { inputId: "left", state: true });
  else if (event.keyCode === 90)
    // z
    socket.emit("keyPress", { inputId: "up", state: true });
  else if (event.keyCode === 88)
    // x
    socket.emit("keyPress", { inputId: "attack", state: true });
  else if (event.keyCode === 65)
    // a
    socket.emit("keyPress", { inputId: "skill", state: true });
  else if (event.keyCode === 69)
    // e
    socket.emit("keyPress", { inputId: "ultimate", state: true });
};

/**
 * When receiving the call, do one of the actions according to the event's value
 *  @param {event} event - key released event
 */
document.onkeyup = function(event) {
  if (event.keyCode === 68)
    //d
    socket.emit("keyPress", { inputId: "right", state: false });
  else if (event.keyCode === 83)
    //s
    socket.emit("keyPress", { inputId: "down", state: false });
  else if (event.keyCode === 81)
    //q
    socket.emit("keyPress", { inputId: "left", state: false });
  else if (event.keyCode === 90)
    // z
    socket.emit("keyPress", { inputId: "up", state: false });
  else if (event.keyCode === 88)
    // x
    socket.emit("keyPress", { inputId: "attack", state: false });
  else if (event.keyCode === 65)
    // a
    socket.emit("keyPress", { inputId: "skill", state: false });
  else if (event.keyCode === 69)
    // e
    socket.emit("keyPress", { inputId: "ultimate", state: false });

  //user pressed and released enter key
  if (event.keyCode === 13) {
    if (!typing) {
      //user is not already typing, focus our chat text form
      chatInput.focus();
    } else {
      //user sent a message, unfocus our chat form
      chatInput.blur();
    }
  }
};

/**
 * Changes the state of the user : either the user is writing on the chat or the user is playing
 */
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("chat-input").addEventListener("focus", function() {
    typing = true;
    $(".chat-container").css("opacity", 1);
  });
  document.getElementById("chat-input").addEventListener("blur", function() {
    typing = false;
    $(".chat-container").css("opacity", 0.3);
  });
});

/**
 * Removes enter key functionnaity from the Ready button
 */
$("#ready").on("keydown", function(e) {
  if (e.keyCode == 13) {
    return false;
  }
});

/**
 * Changes the state of the player
 */
function getReady() {
  var countPlayers = 0;
  for (var i in clientPlayer.list) {
    if (clientPlayer.list[i].room === gameRoom) countPlayers++;
  }
  if (countPlayers === 1 && Option.list[gameRoom].mode === "ffa") {
    return;
  }
  if (clientPlayer.list[playerId].ready) {
    clientPlayer.list[playerId].ready = false;
    console.log("player " + playerId + " is not ready");
  } else {
    clientPlayer.list[playerId].ready = true;
    console.log("player " + playerId + " is ready");
  }

  socket.emit("getReady", clientPlayer.list[playerId].ready);
}

/**
 * Allows a player to surrender when clicking on the button surrender.
 * Asks a confirmation and if confirmed, the player lose the game and is redirected to the home page
 */
function surrender() {
  if (confirm("Do you want to surrender?")) {
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
      result: "lose",
      id: clientPlayer.list[playerId].id
    });

    gameRoom = null;
    clearInterval(timer);
    timer = null;
    minutes = 0;
    seconds = 0;
    $("#timer").empty();
  }
}

/**
 * Redirects the player on the creation page
 */
function playAgain() {
  $("#announcement").empty();
  $(".chatBox").empty();
  game.globalAlpha = 1;
  minutes = 0;
  seconds = 0;
  goToMenu();
}

/**
 * Redirects the player on index
 */
function Quit() {
  // return index
  $(".chatBox").empty();
  game.globalAlpha = 1;
  minutes = 0;
  seconds = 0;
  window.location.replace("index.html");
}

/**
 * Stops the game when needed when something outside endGame or surrender happen, typically when a player has lost the connection
 */
function interruptGame() {
  if (
    Option.list[gameRoom] !== undefined &&
    Option.list[gameRoom].mode === "ffa" &&
    Option.list[gameRoom].start
  ) {
    var countPlayers = 0;
    for (var i in clientPlayer.list) {
      if (clientPlayer.list[i].room === gameRoom) {
        countPlayers += 1;
      }
    }
    if (countPlayers === 1) {
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
        result: "win",
        id: clientPlayer.list[playerId].id
      });
    }
  }
}

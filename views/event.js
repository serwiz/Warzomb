////////////////////////////////////////////////////////
/** events handler */

/**
 * When receiving the call, do one of the actions according to the event's value
 *  @param {event} event - key pressed event
 */
document.onkeydown = function(event) {
  if (playerId && gameRoom)
    if (!Option.list[gameRoom].start) {
      return;
    }
  if (clientPlayer.list[playerId].inAction) return;
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
 * Change the state of the user : either the user is writing on the chat or the user is playing
 */
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("chat-input").addEventListener("focus", function() {
    typing = true;
  });
  document.getElementById("chat-input").addEventListener("blur", function() {
    typing = false;
  });
});

/**
 * Remove enter key functionnaity from the Ready button
 */
$("#ready").on("keydown", function(e) {
  if (e.keyCode == 13) {
    return false;
  }
});

/**
 * Change the state of the player
 */
function getReady() {
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
 * Allow a player to surrender when clicking on the button surrender.
 * Ask a confirmation and if confirmed, the player lose the game and is redirected to the home page
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
    endGame();
  }
}

function playAgain() {
  goToMenu();
}
function Quit() {
  // return index
  gameRoom = null;
  window.location.replace("index.html");
}

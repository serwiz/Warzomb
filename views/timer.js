/**
 * Time related functions
 */
var minutes = 0;
var seconds = 0;

/**
 * set a timer
 */
function setTimer() {
  $("#hourglass").show();
  timer = setInterval(function() {
    document.getElementById("timer").innerText = minutes + ":" + seconds;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    var chrono = seconds + 60 * minutes;
    if (chrono % 45 === 0 && chrono !== 0) {
      $.ajax({
        url: "/nextWave",
        method: "POST",
        data: { room: gameRoom }
      })
        .done(function(response) {
          console.log(response);
          repeat(blinkWave, 5);
          setTimeout(function() {
            $("#announcement").empty();
          }, 5000);
        })
        .fail(function(error) {
          console.log("request fail");
          error.message;
          error.errors;
        })
        .always(function() {
          console.log("Request done");
        });
    }
    seconds++;
  }, 1000);
}

/**
 * Check if all the players are ready in the room
 */
function checkReady() {
  if (Object.keys(clientPlayer.list).length) {
    for (var i in clientPlayer.list) {
      if (clientPlayer.list[i].room !== gameRoom) continue;
      else if (!clientPlayer.list[i].ready) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Start a game when everybody is ready or when the timer is finished
 */
function startGame() {
  if (checkReady()) {
    if (Option.list[gameRoom]!== undefined)
      Option.list[gameRoom].start = true;
    // displaying the right HUD
    $("#ready").hide();
    $("#surrender").show();
    $(".class-container").show();
    $(".chat-container").show();
    $(".general-container").show();
    $(".info-player-container").show();
    $(".timer-container").show();
    $(".skill-container").show();
    clearInterval(pregame);
    pregame = null;
    if (Option.list[gameRoom].mode === "survival") {
      $.ajax({
        url: "/start",
        method: "POST",
        data: { room: gameRoom }
      })
        .done(function(response) {
          console.log(response);
          setTimer();
          repeat(blinkStart, 5);
          setTimeout(function() {
            $("#announcement").empty();
          }, 5000);
        })
        .fail(function(error) {
          console.log("request fail");
          error.message;
          error.errors;
        })
        .always(function() {
          console.log("Request done");
        });
    } else if (Option.list[gameRoom].mode === "ffa") {
      $.ajax({
        url: "/start",
        method: "POST",
        data: { room: gameRoom }
      })
        .done(function(response) {
          console.log(response);
          repeat(blinkStart, 5);
          setTimeout(function() {
            $("#announcement").empty();
          }, 5000);
        })
        .fail(function(error) {
          console.log("request fail");
          error.message;
          error.errors;
        })
        .always(function() {
          console.log("Request done");
        });
    }
    return;
  }
}

/**
 * Time related functions
 */
var minutes = 3;
var seconds = 0;

/**
 * set a timer
 */
function setTimer() {
  var x = setInterval(function() {
    document.getElementById("timer").innerText = minutes + ":" + seconds;
    if (!seconds && minutes) {
      minutes--;
      seconds = 60;
    }
    if (seconds) seconds--;

    // If the count down is over, write some text
    if (minutes <= 0 && seconds <= 0) {
      clearInterval(x);
      $("#timer").empty();
    }
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

    clearInterval(time);
    if (Option.list[gameRoom].mode === "survival") {
      $.ajax({
        url: "/start",
        method: "GET"
      })
        .done(function(response) {
          minutes = 0;
          seconds = 0;
          console.log(response);
          repeat(blink, 5);
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
      console.log("mode ffa");
      repeat(blink, 5);
      setTimeout(function() {
        $("#announcement").empty();
      }, 5000);
    } else if (Option.list[1].mode === "hardcore") {
      console.log("mode hardcore");
    }
    return;
  }
}

/**
 * Display EndScreen when the game is finished
 */
function endGame() {
  //clearInterval(main);
  drawEndScreen();
}

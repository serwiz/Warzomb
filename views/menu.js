/**
 * Display Loby page
 */
function goToLobby() {
  $(".menu").hide();
  $(".option").hide();
  $("button[name=backLobby]").show();
  $("button[name=join]").show();
  $(".lobbies").show();
  $(".main").hide();
  socket.emit("getLobbies");
}

/**
 * Display room's creation page
 */
function goToCreation() {
  $(".room").show();
  $(".validation").show();
  $(".map_selection").show();
  $(".mode_selection").show();
  $(".option").show();
  $(".menu").hide();
  $(".main").hide();
}

/**
 * Display menu page
 */
function goToMenu() {
  $(".option").hide();
  $(".main").hide();
  $("button[name=backLobby]").hide();
  $("button[name=join]").hide();
  $("#table-container").hide();
  $(".menu").show();
  $('input[type="radio"]').prop("checked", false);
}

/**
 * Create a new room
 */
function newGame() {
  var room = {
    name: socket.name,
    mode: $("input[name=mode]:checked").val(),
    map: $("input[name=map]:checked").val(),
    class: $("input[name=class]:checked").val()
  };
  if (room.mode !== undefined && room.map !== undefined && room.class !== undefined) {
    socket.emit("newGame", room);
    $("#quit").hide();
    $("#new").hide();
    $("#ready").show();
    $("#surrender").show();
    $(".class-container").show();
    $(".chat-container").show();
    $(".general-container").show();
    $(".info-player-container").show();
    $(".timer-container").show();
    $(".skill-container").show();
    $(".option").hide();
    $(".menu").hide();
    $("#hourglass").hide();
    $(".main").show();
  
    Option.list[room.name] = new Option(room);
    if (!pregame) pregame = setInterval(function() {startGame()}, 1000);
  
    if (room.map === "forest") map.src = srcForest;
    else if (room.map === "cavern") map.src = srcCavern;
    else if (room.map === "city") map.src = srcCity;
    else if (room.map === "desert") map.src = srcDesert;
    else if (room.map === "swamp") map.src = srcSwamp; 
  }

}

/**
 * Join a room
 */
function joinGame(name, char) {
  if (char !== undefined) {
    $("#quit").hide();
    $("#new").hide();
    $("#ready").show();
    $("#surrender").show();
    $(".class-container").show();
    $(".chat-container").show();
    $(".general-container").show();
    $(".info-player-container").show();
    $(".timer-container").show();
    $(".skill-container").show();
    $(".option").hide();
    $(".menu").hide();
    $("#hourglass").hide();
    $(".main").show();
    gameRoom = name;
    if (!pregame) pregame = setInterval(function() {startGame()}, 1000);
    socket.emit("joinGame", {name:name, char:char,player:socket.name});
  }
  
}

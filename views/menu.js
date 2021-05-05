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
  $(".option").show();
  $(".menu").hide();
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
    name: $("input[name=roomName]").val(),
    mode: $("input[name=mode]:checked").val(),
    map: $("input[name=map]:checked").val(),
    class: $("input[name=class]:checked").val()
  };
  socket.emit("newGame", room);
  $(".option").hide();
  $(".menu").hide();
  $("#hourglass").hide();
  $(".main").show();

  Option.list[room.name] = new Option(room);

  if ($("input[name=map]:checked").val() === "forest") map.src = srcForest;
  else map.src = srcMountain;
}

/**
 * Join a room
 */
function joinGame(name) {
  socket.emit("joinGame", name);
  $("button[name=backLobby]").hide();
  $("#hourglass").hide();
  $("#table-container").hide();
  $("button[name=join]").hide();
  $(".option").hide();
  $(".menu").hide();
  $(".main").show();
}

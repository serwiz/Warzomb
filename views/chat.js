 /** chat */
      var chatText = document.getElementById("chat-text");
      var chatInput = document.getElementById("chat-input");
      var chatForm = document.getElementById("chat-form");

      /**
       * When receiving the call, print the message
       * @param {String} data - message to print
       */

      socket.on("printMessage", function(data) {
        chatText.innerHTML += '<div class="chatCell">' + data + "</div>";
        chatText.scrollTop = chatText.scrollHeight;
      });

      /**
       * When sending a message, emit a call to the server
       * @param {event} e - submit event
       */
      chatForm.onsubmit = function(e) {
        //prevent the form from refreshing the page
        e.preventDefault();
        //ask to send the message to all the players
        if (chatInput.value[0] === "/") {
          const data = {
            name: clientPlayer.list[playerId].name,
            message: chatInput.value.slice(chatInput.value.indexOf(" ") + 1),
            dest: chatInput.value.slice(1, chatInput.value.indexOf(" "))
          };
          socket.emit("sendPrivateMessage", data);
        } else {
          const data = {
            name: clientPlayer.list[playerId].name,
            message: chatInput.value
          };
          socket.emit("sendMessage", data);
        }
        chatInput.value = "";
      };

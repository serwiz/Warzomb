/**
 * Retrieve parties and display them
 */

var firebase = app_fireBase;
var name = null;

$(document).ready(function () {

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      name = user.displayName;
      $.ajax({
        url: "/parties",
        data: { "user": name },
        method: "POST"
      })
        .done(function (data) {
          var div = document.getElementById("res");
          div.innerHTML +=
            '<table id = "table"><thead><tr><td>id de la partie</td>\
                     <td>date de début</td>  <td>date de fin</td>   <td>id du joueur</td>    <td>score</td> <td>resultat</td> </tr></thead></table >';

          //envoie sur la page sous frme de table
          var table = document.getElementById("table");

          table.innerHTML += "<tbody></tbody>";

          var tbody = document.querySelector("#table tbody")

          for (var i in data) {
            tbody.innerHTML +=
              "<tr><td>" +
              data[i]["id_partie"] +
              "</td>" +
              "<td>" +
              data[i]["datedeb"] +
              "</td>" +
              "<td>" +
              data[i]["datefin"] +
              "</td>" +
              "<td>" +
              data[i]["joueur_id"] +
              "</td>" +
              "<td>" +
              data[i]["score"] +
              "</td>" +
              "<td>" +
              data[i]["result"] +
              "</td>" +
              "</tr>";
          }

        })
        .fail(function (error) {
          console.log("request fail");
          error.message;
          error.errors;
        })

        .always(function () {
          console.log("Request done");
        });

    } else {
      console.log("no user detected");
      window.location.replace("index.html");
    }
  });
});
});

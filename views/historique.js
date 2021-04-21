var socket = io();

socket.emit("get_history", {});
       
var  div = document.getElementById("res");
/** pour l'instant  on recup toutes les parties on vera une fois le jeu mis en place */
socket.on("rep_geth", function (data)
{     

    div.innerHTML += "<table id = \"table\"><tr><td>id_partie</td>\
                   <td>datedeb</td>  <td>datefin</td>   <td>joueur_id</td>    <td>score</td> </tr></table >";
   
    //envoie sur la page sous frme de table 
    var table = document.getElementById("table");
   
    for (var i in data)
    {
        table.innerHTML += "<tr><td>" + data[i]["id_partie"] + "</td>" + "<td>" + data[i]["datedeb"] + "</td>" + "<td>" + data[i]["datefin"] + "</td>" +
            "<td>" + data[i]["joueur_id"] + "</td>" + "<td>" + data[i]["score"] + "</td>" + "</tr>" ;
    }
       
});

    


$(document).ready(function () {

            $.ajax({
                url: "/classement",
                method: "POST"
            }).done(function (data) {
                    var div = document.getElementById("rank");
                    div.innerHTML +=
                       "<table id=\"classment\">\
                            <tr><td> <img height=\"30px\" width=\"40px\" src=\"../tileset/images/first.png\"></td><td><h4>" + data[1]["joueur_id"] +"</h4></td></tr>\
                            <tr><td> <img height=\"30px\" width=\"40px\" src=\"../tileset/images/second.png\"></td><td><h4>" + data[2]["joueur_id"] +"</h4></td></tr>\
                            <tr><td> <img height=\"30px\" width=\"40px\" src=\"../tileset/images/third.png\"></td><td><h4>" + data[3]["joueur_id"] +"</h4></td></tr>\
                        </table>" ;


                })
                .fail(function (error) {
                    console.log("request fail");
                    error.message;
                    error.errors;
                })

                .always(function () {
                    console.log("Request done");
                });

});

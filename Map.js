/**
* Map file
* Note : array will be replace by a file load from our database. For the moment it is just here for tests
*/
// values are retrieved from the map json file


const TILE_SIZE = 32;
const WIDTH = 1280;
const HEIGHT = 960

var array = [1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 1245, 0, 0, 0, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 0, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 1245, 0, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245, 1245];

// converting a 1D array into a 2D
var array2D = [];
for (var i = 0; i < HEIGHT/ TILE_SIZE; i++) {
  array2D[i] = [];
  for (var j = 0; j < WIDTH/ TILE_SIZE; j++) {
    if (array[i * WIDTH/ TILE_SIZE + j]) array2D[i][j] = 0;
    else array2D[i][j] = 1;
  }
}


module.exports = { array2D, TILE_SIZE, WIDTH, HEIGHT };

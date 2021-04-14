/**
* Client side
*/

/**
* Create a "class" containing info about a player
* @param {list} config - a list of parameters to set the player's info.
 */
var clientPlayer = function(config) {
  var self = {};
  self.id = config.id;
  self.name = config.name;
  self.x = config.x;
  self.y = config.y;
  self.life = config.hp;
  self.maxLife = config.hpmax;
  self.score = config.score;

  clientPlayer.list[self.id] = self;
  
  return self;
};
clientPlayer.list = {};

/**
* Create a "class" containing info about a projectile
* @param {list} config - a list of parameters to set the projectile's info.
 */
var clientProjectile = function(config) {
  var self = {};
  self.id = config.id;
  self.x = config.x;
  self.y = config.y;
  clientProjectile.list[self.id] = self;
  return self;
};
clientProjectile.list = {};

var playerId = null;


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
  self.map = config.map;

  self.frag = config.frag;
  self.death = config.death;

  clientPlayer.list[self.id] = self;

  return self;
};
clientPlayer.list = {};

/**
 * Create a "class" containing info about an annemy
 * @param {list} config - a list of parameters to set the player's info.
 */
var clientEnnemy = function(config) {
  var self = {};
  self.id = config.id;
  self.x = config.x;
  self.y = config.y;
  self.life = config.hp;
  self.maxLife = config.hpmax;
  self.map = config.map;

  clientEnnemy.list[self.id] = self;

  return self;
};
clientEnnemy.list = {};

/**
 * Create a "class" containing info about a projectile
 * @param {list} config - a list of parameters to set the projectile's info.
 */
var clientProjectile = function(config) {
  var self = {};
  self.id = config.id;
  self.x = config.x;
  self.y = config.y;
  self.map = config.map;
  clientProjectile.list[self.id] = self;
  return self;
};
clientProjectile.list = {};


/** global variables for a player, keep track for updates */
var playerId = null;
var lastScore = null;
var lastFrag = null;
var lastDeath = null;
var lastLife = null;
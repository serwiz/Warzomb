/**
 * Client side
 */

const srcMage = "/tileset/images/sorcerer";
const srcWarrior = "/tileset/images/warrior";
const srcTank = "/tileset/images/tank";
const srcArcher = "/tileset/images/archer";
var fireball = new Image();
fireball.src = "tileset/images/fireball";

/**
 * Create a "class" containing info about the game
 * @param {list} config - a list of parameters to set the lobby's info
 */
var Option = function(config) {
  var self = {};
  self.id = config.name;
  self.mode = config.mode;
  self.map = config.map;
  self.start = false;
  self.objects = true;
  switch (config.mode) {
    case "ffa":
      self.maxFrag = 20;
      break;
    case "survival":
      self.timer = 5;
      break;
    case "hardcore":
      self.objects = false;
  }
  Option.list[self.id] = self;
  return self;
};
Option.list = {};
/**
 * Create a "class" containing info about a player
 * @param {list} config - a list of parameters to set the player's info.
 */
var clientPlayer = function(config) {
  var self = {};
  self.room = config.name;
  self.class = config.class;
  self.id = config.id;
  self.name = config.name;
  self.x = config.x;
  self.y = config.y;
  self.life = config.hp;
  self.maxLife = config.hpmax;
  self.score = config.score;
  self.direction = config.direction;
  self.frameX = 0;
  self.frameY = 10;
  self.character = new Image();

  self.frag = config.frag;
  self.death = config.death;

  self.ready = false;
  self.inAction = config.ready;

  clientPlayer.list[self.id] = self;

  switch (config.class) {
    case "warrior":
      self.character.src = srcWarrior;
      break;
    case "sorcerer":
      self.character.src = srcMage;
      break;
    case "archer":
      self.character.src = srcArcher;
      break;
    case "tank":
      self.character.src = srcTank;
      break;
  }

  return self;
};
clientPlayer.list = {};

/**
 * Create a "class" containing info about an annemy
 * @param {list} config - a list of parameters to set the player's info.
 */
var clientEnemy = function(config) {
  var self = {};
  self.id = config.id;
  self.x = config.x;
  self.y = config.y;

  self.sight = config.sight;
  self.hostility = config.hostility;
  self.life = config.hp;
  self.maxLife = config.hpmax;
  self.map = config.map;
  self.direction = config.direction;
  self.frameX = 0;
  self.frameY = 10;
  self.character = new Image();
  self.character.src = "tileset/images/zombie";

  clientEnemy.list[self.id] = self;

  return self;
};
clientEnemy.list = {};

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

/** global variables for a player, keep track for updates */
var playerId = null;
var lastScore = null;
var lastFrag = null;
var lastDeath = null;
var lastLife = null;
var gameRoom = null;

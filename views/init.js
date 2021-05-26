/**
 * Client side
 */

const srcMage = "/tileset/images/sorcerer";
const srcWarrior = "/tileset/images/warrior";
const srcTank = "/tileset/images/tank";
const srcArcher = "/tileset/images/archer";

const srcFireball = "tileset/images/fireball";
const srcArrow = "tileset/images/projectile";

// skill
const srcFireLionR = "tileset/images/firelion_right";
const srcFireLionL = "tileset/images/firelion_left";
const srcFireLionU = "tileset/images/firelion_up";
const srcFireLionD = "tileset/images/firelion_down";

const srcSnakeR = "tileset/images/snake_right";
const srcSnakeL = "tileset/images/snake_left";
const srcSnakeU = "tileset/images/snake_up";
const srcSnakeD = "tileset/images/snake_down";

const srcShield = "tileset/images/shield";
const srcThunder = "tileset/images/lightningclaw";

// ultimate


/**
 * Create a "class" containing info about the game
 * @param {list} config - a list of parameters to set the lobby's info
 */
var Option = function(config) {
  var self = {};
  self.id = config.room;
  self.mode = config.mode;
  self.map = config.map;
  self.start = false;
  switch (config.mode) {
    case "ffa":
      self.maxFrag = 20;
      break;
    case "survival":
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
  // param
  self.room = config.room;
  self.class = config.class;
  self.id = config.id;
  self.name = config.name;
  self.x = config.x;
  self.y = config.y;
  self.direction = config.direction;

  //ingame stats
  self.stamina = config.stamina;
  self.maxStamina = config.maxStamina;
  self.ult = config.ult;
  self.maxUlt = config.maxUlt;
  self.frag = config.frag;
  self.death = config.death;
  self.life = config.hp;
  self.maxLife = config.hpmax;
  self.score = config.score;
  // state
  self.ready = config.ready;
  self.inAction = false;
  self.useSkill = false;
  self.target = null;
  self.useUlt = false;
  self.alive = config.alive;
  // image
  self.character = new Image();
  self.skill = new Image();
  self.ultSkill = new Image();
  self.frameX = 0;
  self.frameY = 10;
  self.frameSkillX = 0;
  self.frameSkillY = 0;
  self.frameUltX = 0;
  self.frameUltY = 0;
 
  clientPlayer.list[self.id] = self;

  switch (self.class) {
    case "warrior":
      self.character.src = srcWarrior;
      $(".skill1").css("background-image", "url(" + "../tileset/images/sword_icon" + ")");
      $(".skill2").css("background-image", "url(" + "../tileset/images/lion_icon" + ")");
      $(".skill3").css("background-image", "url(" + "../tileset/images/berserk_icon" + ")");
      break;
    case "sorcerer":
      self.character.src = srcMage;
      $(".skill1").css("background-image", "url(" + "../tileset/images/fireball_icon" + ")");
      $(".skill2").css("background-image", "url(" + "../tileset/images/sorc_icon" + ")");
      $(".skill3").css("background-image", "url(" + "../tileset/images/thunder_icon" + ")");
      break;
    case "archer":
      self.character.src = srcArcher;
      $(".skill1").css("background-image", "url(" + "../tileset/images/bow_icon" + ")");
      $(".skill2").css("background-image", "url(" + "../tileset/images/ranger_icon" + ")");
      $(".skill3").css("background-image", "url(" + "../tileset/images/arrow_icon" + ")");
      break;
    case "tank":
      self.character.src = srcTank;
      $(".skill1").css("background-image", "url(" + "../tileset/images/mass_icon" + ")");
      $(".skill2").css("background-image", "url(" + "../tileset/images/snake_icon" + ")");
      $(".skill3").css("background-image", "url(" + "../tileset/images/shield_icon" + ")");
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

  self.room = config.room;
  self.life = config.hp;
  self.maxLife = config.hpmax;
  self.map = config.map;
  self.direction = config.direction;
  self.frameX = 0;
  self.frameY = 10;
  self.character = new Image();
  self.character.src = "tileset/images/zombie";
  self.inAction = false;

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
  self.type = config.type;
  self.id = config.id;
  self.room = config.room;
  self.x = config.x;
  self.y = config.y;
  self.frameX = 0;
  self.sprite = new Image();
   (config.type === "arrow") ?  self.sprite.src = srcArrow : self.sprite.src = srcFireball;
  self.lobby  = config.lobby;
  self.direction = config.direction;
  clientProjectile.list[self.id] = self;
  return self;
};
clientProjectile.list = {};

/**
 * Create a "class" containing info about an object
 * @param {list} config - a list of parameters to set the object's info.
 */
var clientObject = function (config) {
  var self = {}
  self.room = config.room;
  self.id = config.id;
  self.x = config.x;
  self.y = config.y;
  self.property = config.property;
  self.sprite = new Image();
  self.frameX = 1;
  if (config.property === "heal") {
    self.frameY = 5;
  } else if (config.property === "stamina") {
    self.frameY = 3;
  } else {
    self.frameY = 4;
  }
  self.sprite.src = "tileset/images/potions";
  clientObject.list [self.id] = self;
  return self;
}
clientObject.list = {};

/** global variables for a player, keep track for updates */
var playerId = null;
var lastScore = null;
var lastFrag = null;
var lastDeath = null;
var lastLife = null;
var lastStamina = null;
var lastUlt = null;
var gameRoom = null;
var timer = null;

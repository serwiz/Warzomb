const global = require("./global.js");
const Lobby = require("./Lobby.js");
const Element = require("./Element.js");
const Map = require("./Map.js");
/**
 * Class representing a player.
 * @extends Element
 */
class Player extends Element {
  /**
   * Create a player.
   * @param {list} config - list of parameters
   */
  constructor(config) {
    super(config);
    // user info
    this.name = null;
    this.class = null;
    this.room = null;

    // ingame data
    this.life = 100;
    this.maxLife = 100; // for healing for instance
    this.speedMove = 6;
    this.direction = 4; // 1 right, 2 left, 3 up, 4 down
    this.stamina = 100;
    this.maxStamina = 100;
    this.ult = 0;
    this.maxUlt = 100;
    this.atk = 5;

    this.pressingX = false; // default attack
    this.pressingA = false; // skill 1
    this.pressingE = false; // Ultimate

    // scoreboard data
    this.score = 0;
    this.frag = 0;
    this.death = 0;

    this.ready = false;
    this.alive = true;

    Player.list[this.id] = this;
    global.INIT_DATA.player.push({
      id: this.id,
      x: this.x,
      y: this.y,
      room: this.room,
      name: this.name,
      hp: this.life,
      hpmax: this.maxLife,
      score: this.score,
      frag: this.frag,
      death: this.death,
      direction: this.direction,
      ready: this.ready,
      stamina: this.stamina,
      maxStamina: this.maxStamina,
      ult: this.ult,
      maxUlt: this.maxUlt,
      alive: this.alive
    });
  }

  /**
   * set paramaters for a specific class
   * @param {List} config - list of parameters
   */
  setParameters(config) {
    this.life = config.maxLife;
    this.maxLife = config.maxLife;
    this.speedMove = config.speedMove;
    this.stamina = config.maxStamina;
    this.maxStamina = config.maxStamina;
    this.atk = config.atk;
    this.class = config.class;
    this.alive = true;
  }

  /**
   * Set a random spawn
   */
  setSpawn() {
    switch (Math.floor(Math.random() * 4 + 1)) {
      case 1:
        this.x = Map.spawn[1][1] * Map.TILE_SIZE;
        this.y = Map.spawn[1][0] * Map.TILE_SIZE;
        break;
      case 2:
        this.x = Map.spawn[2][1] * Map.TILE_SIZE;
        this.y = Map.spawn[2][0] * Map.TILE_SIZE;
        break;
      case 3:
        this.x = Map.spawn[3][1] * Map.TILE_SIZE;
        this.y = Map.spawn[3][0] * Map.TILE_SIZE;
        break;
      case 4:
        this.x = Map.spawn[4][1] * Map.TILE_SIZE;
        this.y = Map.spawn[4][0] * Map.TILE_SIZE;
        break;
    }
  }

  /**
   * Reset everything about a player when he starts a new game
   */
  reset() {
    this.life = this.maxLife;
    this.score = 0;
    this.frag = 0;
    this.death = 0;
    this.direction = 4;
    this.ready = false;
    this.stamina = this.maxStamina;
    this.ult = 0;
    this.room = null;
    if (this.alive) this.alive = true;
  }

  /**
   * Update the speed and the direction.
   * Note that 0,0 is at the top left of the screen then moving down will increase the Y value
   */
  updateSpeed() {
    if (this.pressingRight && this.x < Map.WIDTH) {
      // going right
      this.speedX = this.speedMove;
      this.direction = 1;
    } else if (this.pressingLeft && this.x > 0) {
      // going left
      this.speedX = -this.speedMove;
      this.direction = 2;
    } else this.speedX = 0;
    if (this.pressingUp && this.y > 0) {
      // going up
      this.speedY = -this.speedMove;
      this.direction = 3;
    } else if (this.pressingDown && this.y < Map.HEIGHT) {
      // going down
      this.speedY = this.speedMove;
      this.direction = 4;
    } else this.speedY = 0;
  }

  /**
   * Update the whole player : his speed, direction, position and create projectiles
   */
  updateMove() {
    this.updateSpeed();
    if (
      this.room != undefined &&
      global.Rooms[this.room].map &&
      global.Rooms[this.room].state
    )
      this.updatePosition(global.Rooms[this.room].map);
    this.triggerObject();

    if (this.pressingX) {
      this.attack();
    } else if (this.pressingA) {
      // skill
      this.skill();
    } else if (this.pressingE) {
      //ultimate
      this.ultimate();
    }
  }

  /**
   * Create a projectile.
   */
  shoot() {
    var type = null;
    this.class === "archer" ? (type = "arrow") : (type = "fireball");
    var p = new Projectile({
      direction: this.direction,
      user: this.id,
      x: -Number.MAX_VALUE,
      y: -Number.MAX_VALUE,
      map: this.map,
      type: type
    });
    p.x = this.x;
    p.y = this.y;
    for (var i in global.SOCKET_LIST) {
      if (global.clientRooms[i] === global.clientRooms[this.id])
        global.SOCKET_LIST[i].emit("shoot", {
          user: this.id,
          direction: this.direction,
          type: type
        });
    }
  }

  /**
   * Warrior's attack
   */
  slash() {
    // doing the right actin depending of the mode
    if (this.room && global.Rooms[this.room].mode === "ffa") {
      for (var i in Player.list) {
        if (
          Player.list[i].room === this.room &&
          Player.list[i].id !== this.id
        ) {
          if (this.direction === 1) {
            var x = Math.floor(this.x / Map.TILE_SIZE);
            var y = Math.floor(this.y / Map.TILE_SIZE);
            var xPlayer = Math.floor(Player.list[i].x / Map.TILE_SIZE);
            var yPlayer = Math.floor(Player.list[i].y / Map.TILE_SIZE);
            if (Player.list[i].shield !== undefined && Player.list[i].shield) {
            } else if (x + 1 === xPlayer && yPlayer === y) {
              Player.list[i].life -= this.atk;
              this.ult += 1;
            }
          }
          // right
          else if (this.direction === 2) {
            var x = Math.floor(this.x / Map.TILE_SIZE);
            var y = Math.floor(this.y / Map.TILE_SIZE);
            var xPlayer = Math.floor(Player.list[i].x / Map.TILE_SIZE);
            var yPlayer = Math.floor(Player.list[i].y / Map.TILE_SIZE);
            if (Player.list[i].shield !== undefined && Player.list[i].shield) {
            } else if (x - 1 === xPlayer && yPlayer === y) {
              Player.list[i].life -= this.atk;
              this.ult += 1;
            }
            // left
          } else if (this.direction === 3) {
            var x = Math.floor(this.x / Map.TILE_SIZE);
            var y = Math.floor(this.y / Map.TILE_SIZE);
            var xPlayer = Math.floor(Player.list[i].x / Map.TILE_SIZE);
            var yPlayer = Math.floor(Player.list[i].y / Map.TILE_SIZE);
            if (Player.list[i].shield !== undefined && Player.list[i].shield) {
            } else if (x === xPlayer && yPlayer === y - 1) {
              Player.list[i].life -= this.atk;
              this.ult += 1;
            }
            // up
          } else {
            var x = Math.floor(this.x / Map.TILE_SIZE);
            var y = Math.floor(this.y / Map.TILE_SIZE);
            var xPlayer = Math.floor(Player.list[i].x / Map.TILE_SIZE);
            var yPlayer = Math.floor(Player.list[i].y / Map.TILE_SIZE);

            if (Player.list[i].shield !== undefined && Player.list[i].shield) {
            } else if (x === xPlayer && yPlayer === y + 1) {
              Player.list[i].life -= this.atk;
              this.ult += 1;
            }
            // down
          }

          if (Player.list[i].life <= 0) {
            Player.list[i].death += 1;
            if (Player.list[this.id]) {
              this.frag += 1;
              this.score += 5;
              this.ult += 5;
            }

            Player.list[i].life = Player.list[i].maxLife;
            Player.list[i].x = Math.random() * Map.WIDTH;
            Player.list[i].y = Math.random() * Map.HEIGHT;
            while (
              Player.list[i].wallDetection(
                {
                  x: Player.list[i].x,
                  y: Player.list[i].y
                },
                global.Rooms[this.room].map
              )
            ) {
              Player.list[i].x = Math.random() * Map.WIDTH;
              Player.list[i].y = Math.random() * Map.HEIGHT;
            }
          }
        }
      }
    } else if (this.room && global.Rooms[this.room].mode === "survival") {
      for (var i in Enemy.list) {
        if (Enemy.list[i].room === this.room) {
          if (this.direction === 1) {
            var x = Math.floor(this.x / Map.TILE_SIZE);
            var y = Math.floor(this.y / Map.TILE_SIZE);
            var xEnemy = Math.floor(Enemy.list[i].x / Map.TILE_SIZE);
            var yEnemy = Math.floor(Enemy.list[i].y / Map.TILE_SIZE);
            if (
              x + 1 === xEnemy &&
              (y - 1 === yEnemy || y === yEnemy || y + 1 === yEnemy)
            ) {
              Enemy.list[i].life -= this.atk;
              this.ult += 1;
            }
          }
          // right
          else if (this.direction === 2) {
            var x = Math.floor(this.x / Map.TILE_SIZE);
            var y = Math.floor(this.y / Map.TILE_SIZE);
            var xEnemy = Math.floor(Enemy.list[i].x / Map.TILE_SIZE);
            var yEnemy = Math.floor(Enemy.list[i].y / Map.TILE_SIZE);

            if (
              x - 1 === xEnemy &&
              (y - 1 === yEnemy || y === yEnemy || y + 1 === yEnemy)
            ) {
              Enemy.list[i].life -= this.atk;
              this.ult += 1;
            }
            // left
          } else if (this.direction === 3) {
            var x = Math.floor(this.x / Map.TILE_SIZE);
            var y = Math.floor(this.y / Map.TILE_SIZE);
            var xEnemy = Math.floor(Enemy.list[i].x / Map.TILE_SIZE);
            var yEnemy = Math.floor(Enemy.list[i].y / Map.TILE_SIZE);

            if (
              y - 1 === yEnemy &&
              (x - 1 === xEnemy || x === xEnemy || x + 1 === xEnemy)
            ) {
              Enemy.list[i].life -= this.atk;
              this.ult += 1;
            }
            // up
          } else {
            var x = Math.floor(this.x / Map.TILE_SIZE);
            var y = Math.floor(this.y / Map.TILE_SIZE);
            var xEnemy = Math.floor(Enemy.list[i].x / Map.TILE_SIZE);
            var yEnemy = Math.floor(Enemy.list[i].y / Map.TILE_SIZE);

            if (
              y + 1 === yEnemy &&
              (x - 1 === xEnemy || x === xEnemy || x + 1 === xEnemy)
            ) {
              Enemy.list[i].life -= this.atk;
              this.ult += 1;
            }
            // down
          }
          if (Enemy.list[i].life <= 0) {
            if (Player.list[this.id]) {
              this.frag += 1;
              this.score += 2;
              this.ult += 5;
            }

            global.REMOVE_DATA.enemy.push(Enemy.list[i].id);
            delete Enemy.list[i];
          }
        }
      }
    }

    for (var i in global.SOCKET_LIST) {
      if (global.clientRooms[i] === global.clientRooms[this.id])
        global.SOCKET_LIST[i].emit("slash", {
          user: this.id,
          direction: this.direction
        });
    }
  }
  /**
   * Call the right type of attack
   */
  attack() {
    if (this.stamina < 5) return;
    else this.stamina -= 5;
    if (this.stamina <= 0) this.stamina = 0;
    if (this.class === "sorcerer" || this.class === "archer") {
      this.shoot();
    } else if (this.class === "warrior" || this.class === "tank") {
      this.slash();
    }
    if (
      global.Rooms[this.room] !== undefined &&
      global.Rooms[this.room].maxFrag &&
      this.frag >= global.Rooms[this.room].maxFrag
    ) {
      for (var i in global.SOCKET_LIST) {
        if (global.clientRooms[this.id] === global.clientRooms[i])
          global.SOCKET_LIST[i].emit("gameOver", {
            room: this.room,
            winner: this.id
          });
      }
    }
  }

  /**
   * Call the right type of skill
   */
  skill() {
    if (
      this.class === "archer" &&
      this.speedUp !== undefined &&
      this.speedUp === true
    )
      return;
    if (this.stamina < 10) return;
    else this.stamina -= 10;
    if (this.stamina <= 0) this.stamina = 0;
    switch (this.class) {
      case "warrior":
        if (this.room && global.Rooms[this.room].mode === "ffa") {
          for (var i in Player.list) {
            if (
              Player.list[i].room === this.room &&
              Player.list[i].id !== this.id
            ) {
              var x = Math.floor(this.x / Map.TILE_SIZE);
              var y = Math.floor(this.y / Map.TILE_SIZE);
              var xPlayer = Math.floor(Player.list[i].x / Map.TILE_SIZE);
              var yPlayer = Math.floor(Player.list[i].y / Map.TILE_SIZE);

              if (this.direction === 1) {
                if (
                  Player.list[i].shield !== undefined &&
                  Player.list[i].shield
                ) {
                } else if (
                  y === yPlayer &&
                  (x + 1 === xPlayer || x + 2 === xPlayer || x + 3 === xPlayer)
                ) {
                  Player.list[i].life -= this.atk * 2;
                  this.ult += 3;
                }
              } else if (this.direction === 2) {
                if (
                  Player.list[i].shield !== undefined &&
                  Player.list[i].shield
                ) {
                } else if (
                  y === yPlayer &&
                  (x - 1 === xPlayer || x - 2 === xPlayer || x - 3 === xPlayer)
                ) {
                  Player.list[i].life -= this.atk * 2;
                  this.ult += 3;
                }
              } else if (this.direction === 3) {
                if (
                  Player.list[i].shield !== undefined &&
                  Player.list[i].shield
                ) {
                } else if (
                  x === xPlayer &&
                  (y - 1 === yPlayer || y - 2 === yPlayer || y - 3 === yPlayer)
                ) {
                  Player.list[i].life -= this.atk * 2;
                  this.ult += 3;
                } else {
                  if (
                    Player.list[i].shield !== undefined &&
                    Player.list[i].shield
                  ) {
                  } else if (
                    x === xPlayer &&
                    (y + 1 === yPlayer ||
                      y + 2 === yPlayer ||
                      y + 3 === yPlayer)
                  ) {
                    Player.list[i].life -= this.atk * 2;
                    this.ult += 3;
                  }
                }
              }

              if (Player.list[i].life <= 0) {
                Player.list[i].death += 1;
                if (Player.list[this.id]) {
                  this.frag += 1;
                  this.score += 5;
                  this.ult += 5;
                }
                if (Player.list[this.id].ult > Player.list[this.id].maxUlt)
                  Player.list[this.id].ult = Player.list[this.id].maxUlt;

                Player.list[i].life = Player.list[i].maxLife;
                Player.list[i].x = Math.random() * Map.WIDTH;
                Player.list[i].y = Math.random() * Map.HEIGHT;
                while (
                  Player.list[i].wallDetection(
                    {
                      x: Player.list[i].x,
                      y: Player.list[i].y
                    },
                    global.Rooms[this.room].map
                  )
                ) {
                  Player.list[i].x = Math.random() * Map.WIDTH;
                  Player.list[i].y = Math.random() * Map.HEIGHT;
                }
              }
            }
          }
        } else if (this.room && global.Rooms[this.room].mode === "survival") {
          for (var i in Enemy.list) {
            if (
              Enemy.list[i].room === this.room &&
              Enemy.list[i].id !== this.id
            ) {
              var x = Math.floor(this.x / Map.TILE_SIZE);
              var y = Math.floor(this.y / Map.TILE_SIZE);
              var xEnemy = Math.floor(Enemy.list[i].x / Map.TILE_SIZE);
              var yEnemy = Math.floor(Enemy.list[i].y / Map.TILE_SIZE);

              if (this.direction === 1) {
                if (
                  (y =
                    yEnemy &&
                    (x + 1 === xEnemy || x + 2 === xEnemy || x + 3 === xEnemy))
                ) {
                  Enemy.list[i].life -= this.atk * 2;
                  this.ult += 3;
                }
              } else if (this.direction === 2) {
                if (
                  (y =
                    yEnemy &&
                    (x - 1 === xEnemy || x - 2 === xEnemy || x - 3 === xEnemy))
                ) {
                  Enemy.list[i].life -= this.atk * 2;
                  this.ult += 3;
                }
              } else if (this.direction === 3) {
                if (
                  (x =
                    xEnemy &&
                    (y - 1 === yEnemy || y - 2 === yEnemy || y - 3 === yEnemy))
                ) {
                  Enemy.list[i].life -= this.atk * 2;
                  this.ult += 3;
                } else {
                  if (
                    (x =
                      xEnemy &&
                      (y + 1 === yEnemy ||
                        y + 2 === yEnemy ||
                        y + 3 === yEnemy))
                  ) {
                    Enemy.list[i].life -= this.atk * 2;
                    this.ult += 3;
                  }
                }
              }
              if (Enemy.list[i].life <= 0) {
                if (Player.list[this.id]) {
                  this.frag += 1;
                  this.score += 5;
                  this.ult += 5;
                }
                if (this.ult > this.maxUlt) this.ult = this.maxUlt;
                global.REMOVE_DATA.enemy.push(Enemy.list[i].id);
                delete Enemy.list[i];
              }
            }
          }
        }
        break;
      case "sorcerer":
        this.ult += 5;
        if (this.ult > this.maxUlt) this.ult = this.maxUlt;
        var lastSpeed = this.speedMove;
        var lastAtk = this.atk;
        if (!this.speedUp) {
          this.speedMove *= 1.3;
          this.speedUp = true;
        }
        if (!this.attackUp) {
          this.atk *= 1.5;
          this.attackUp = true;
        }
        setTimeout(() => {
          this.speedMove = lastSpeed;
          this.atk = lastAtk;
          this.speedUp = false;
          this.attackUp = false;
        }, 6000);
        break;
      case "tank":
        if (this.room && global.Rooms[this.room].mode === "ffa") {
          for (var i in Player.list) {
            if (
              Player.list[i].room === this.room &&
              Player.list[i].id !== this.id
            ) {
              var x = Math.floor(this.x / Map.TILE_SIZE);
              var y = Math.floor(this.y / Map.TILE_SIZE);
              var xPlayer = Math.floor(Player.list[i].x / Map.TILE_SIZE);
              var yPlayer = Math.floor(Player.list[i].y / Map.TILE_SIZE);

              if (this.direction === 1) {
                if (
                  Player.list[i].shield !== undefined &&
                  Player.list[i].shield
                ) {
                } else if (
                  y === yPlayer &&
                  (x + 1 === xPlayer || x + 2 === xPlayer || x + 3 === xPlayer)
                ) {
                  Player.list[i].life -= this.atk * 2;
                  this.life += this.atk * 2;
                  this.ult += 3;
                }
              } else if (this.direction === 2) {
                if (
                  Player.list[i].shield !== undefined &&
                  Player.list[i].shield
                ) {
                } else if (
                  y === yPlayer &&
                  (x - 1 === xPlayer || x - 2 === xPlayer || x - 3 === xPlayer)
                ) {
                  Player.list[i].life -= this.atk * 2;
                  this.life += this.atk * 2;
                  this.ult += 3;
                }
              } else if (this.direction === 3) {
                if (
                  Player.list[i].shield !== undefined &&
                  Player.list[i].shield
                ) {
                } else if (
                  x === xPlayer &&
                  (y - 1 === yPlayer || y - 2 === yPlayer || y - 3 === yPlayer)
                ) {
                  Player.list[i].life -= this.atk * 2;
                  this.life += this.atk * 2;
                  this.ult += 3;
                } else {
                  if (
                    Player.list[i].shield !== undefined &&
                    Player.list[i].shield
                  ) {
                  } else if (
                    x === xPlayer &&
                    (y + 1 === yPlayer ||
                      y + 2 === yPlayer ||
                      y + 3 === yPlayer)
                  ) {
                    Player.list[i].life -= this.atk * 2;
                    this.life += this.atk * 2;
                    this.ult += 3;
                  }
                }
              }

              if (Player.list[i].life <= 0) {
                Player.list[i].death += 1;
                if (Player.list[this.id]) {
                  this.frag += 1;
                  this.score += 5;
                  this.ult += 5;
                  this.life += this.atk * 2.5;
                }

                Player.list[i].life = Player.list[i].maxLife;
                Player.list[i].x = Math.random() * Map.WIDTH;
                Player.list[i].y = Math.random() * Map.HEIGHT;
                while (
                  Player.list[i].wallDetection(
                    {
                      x: Player.list[i].x,
                      y: Player.list[i].y
                    },
                    global.Rooms[this.room].map
                  )
                ) {
                  Player.list[i].x = Math.random() * Map.WIDTH;
                  Player.list[i].y = Math.random() * Map.HEIGHT;
                }
              }
              if (this.ult > this.maxUlt) this.ult = this.maxUlt;
              if (this.life > this.maxLife) this.life = this.maxLife;
            }
          }
        } else if (this.room && global.Rooms[this.room].mode === "survival") {
          for (var i in Enemy.list) {
            if (
              Enemy.list[i].room === this.room &&
              Enemy.list[i].id !== this.id
            ) {
              var x = Math.floor(this.x / Map.TILE_SIZE);
              var y = Math.floor(this.y / Map.TILE_SIZE);
              var xEnemy = Math.floor(Enemy.list[i].x / Map.TILE_SIZE);
              var yEnemy = Math.floor(Enemy.list[i].y / Map.TILE_SIZE);

              if (this.direction === 1) {
                if (
                  (y =
                    yEnemy &&
                    (x + 1 === xEnemy || x + 2 === xEnemy || x + 3 === xEnemy))
                ) {
                  Enemy.list[i].life -= this.atk * 2;
                  this.life += this.atk * 2;
                  this.ult += 3;
                }
              } else if (this.direction === 2) {
                if (
                  (y =
                    yEnemy &&
                    (x - 1 === xEnemy || x - 2 === xEnemy || x - 3 === xEnemy))
                ) {
                  Enemy.list[i].life -= this.atk * 2;
                  this.life += this.atk * 2;
                  this.ult += 3;
                }
              } else if (this.direction === 3) {
                if (
                  (x =
                    xEnemy &&
                    (y - 1 === yEnemy || y - 2 === yEnemy || y - 3 === yEnemy))
                ) {
                  Enemy.list[i].life -= this.atk * 2;
                  this.life += this.atk * 2;
                  this.ult += 3;
                } else {
                  if (
                    (x =
                      xEnemy &&
                      (y + 1 === yEnemy ||
                        y + 2 === yEnemy ||
                        y + 3 === yEnemy))
                  ) {
                    Enemy.list[i].life -= this.atk * 2;
                    this.life += this.atk * 2;
                    this.ult += 3;
                  }
                }
              }
              if (Enemy.list[i].life <= 0) {
                if (Player.list[this.id]) {
                  this.frag += 1;
                  this.score += 5;
                  this.ult += 5;
                  this.life += this.atk * 2.5;
                }

                global.REMOVE_DATA.enemy.push(Enemy.list[i].id);
                delete Enemy.list[i];
              }
              if (this.ult > this.maxUlt) this.ult = this.maxUlt;
              if (this.life > this.maxLife) this.life = this.maxLife;
            }
          }
        }
        break;
      case "archer":
        var lastSpeed = this.speedMove;
        var lastRange = this.maxTimer;
        if (!this.speedUp) {
          this.speedMove *= 1.4;
          this.speedUp = true;
        }

        this.maxTimer *= 2;
        setTimeout(() => {
          this.speedMove = lastSpeed;
          this.maxTimer = lastRange;
          this.speedUp = false;
        }, 8000);
        break;
    }
    for (var i in global.SOCKET_LIST) {
      if (global.clientRooms[i] === global.clientRooms[this.id])
        global.SOCKET_LIST[i].emit("skill", {
          user: this.id,
          direction: this.direction,
          class: this.class
        });
    }
    if (
      global.Rooms[this.room].maxFrag &&
      this.frag >= global.Rooms[this.room].maxFrag
    ) {
      for (var i in global.SOCKET_LIST) {
        if (global.clientRooms[this.id] === global.clientRooms[i])
          global.SOCKET_LIST[i].emit("gameOver", {
            room: this.room,
            winner: this.id
          });
      }
    }
  }

  /**
   * Call the right type of ultimate
   */
  ultimate() {
    if (this.ult !== 100) return;
    else this.ult = 0;
    switch (this.class) {
      case "warrior":
        var lastSpeed = this.speedMove;
        var lastAtk = this.atk;
        this.life -= this.life * (10 / 100);
        this.atk *= 3;
        this.speedMove *= 1.5;
        this.stamina += this.stamina * (80 / 100);
        setTimeout(() => {
          this.atk = lastAtk;
          this.speedMove = lastSpeed;
        }, 15000);
        break;
      case "sorcerer":
        var dist = null;
        var closest = Number.MAX_VALUE;
        var index = null;
        this.life += this.atk * 2.5;
        if (this.life > this.maxLife) this.life = this.maxLife;
        if (this.room && global.Rooms[this.room].mode === "ffa") {
          for (var i in Player.list) {
            var player = Player.list[i];
            dist = this.evaluateDistance(player);
            if (dist < closest) {
              closest = dist;
              index = i;
            }
          }
          if (
            Player.list[index].shield !== undefined &&
            Player.list[index].shield
          ) {
          } else if (closest < 200) {
            Player.list[index].life -= this.atk * 8;
            if (Player.list[index].life <= 0) {
              if (Player.list[this.id]) {
                this.frag += 1;
                this.score += 5;
              }

              Player.list[index].life = Player.list[index].maxLife;
              Player.list[index].x = Math.random() * Map.WIDTH;
              Player.list[index].y = Math.random() * Map.HEIGHT;
              while (
                Player.list[index].wallDetection(
                  {
                    x: Player.list[index].x,
                    y: Player.list[index].y
                  },
                  global.Rooms[this.room].map
                )
              ) {
                Player.list[index].x = Math.random() * Map.WIDTH;
                Player.list[index].y = Math.random() * Map.HEIGHT;
              }
            }
            for (var i in global.SOCKET_LIST) {
              if (global.clientRooms[i] === global.clientRooms[this.id])
                global.SOCKET_LIST[i].emit("ultimate", {
                  user: this.id,
                  class: this.class,
                  target: index
                });
            }
          } else {
            this.ult = this.maxUlt / 2;
            return;
          }
        } else if (this.room && global.Rooms[this.room].mode === "survival") {
          for (var i in Enemy.list) {
            var enemy = Enemy.list[i];
            dist = this.evaluateDistance(enemy);
            if (dist < closest) {
              closest = dist;
              index = i;
            }
          }
          if (closest < 200) {
            Enemy.list[index].life -= this.atk * 8;
            for (var i in global.SOCKET_LIST) {
              if (global.clientRooms[i] === global.clientRooms[this.id])
                global.SOCKET_LIST[i].emit("ultimate", {
                  user: this.id,
                  class: this.class,
                  target: index
                });
            }
          } else {
            this.ult = this.maxUlt / 2;
            return;
          }
        }
        break;
      case "tank": // heal zone =-> peut etre convertir en shield
        this.shield = true;
        for (var i in global.SOCKET_LIST) {
          if (global.clientRooms[i] === global.clientRooms[this.id])
            global.SOCKET_LIST[i].emit("ultimate", {
              user: this.id,
              class: this.class
            });
        }
        setTimeout(() => {
          global.SOCKET_LIST[i].emit("cancelUltimate", {
            user: this.id,
            class: this.class
          });
          this.shield = false;
        }, 12000);
        break;
      case "archer":
        this.ultArrow = true;
        this.shoot();
        break;
    }
    if (
      global.Rooms[this.room].maxFrag &&
      this.frag >= global.Rooms[this.room].maxFrag
    ) {
      for (var i in global.SOCKET_LIST) {
        if (global.clientRooms[this.id] === global.clientRooms[i])
          global.SOCKET_LIST[i].emit("gameOver", {
            room: this.room,
            winner: this.id
          });
      }
    }
  }
  /**
   * Trigger the object if the player walks on it
   */
  triggerObject() {
    var xObject = null;
    var yObject = null;
    for (var i in Item.list) {
      xObject = Math.floor(Item.list[i].x / Map.TILE_SIZE);
      yObject = Math.floor(Item.list[i].y / Map.TILE_SIZE);

      if (
        Math.floor(this.x / Map.TILE_SIZE) === xObject &&
        Math.floor((this.y + 15) / Map.TILE_SIZE) === yObject &&
        Item.list[i].room === this.room
      ) {
        Item.list[i].toRemove = true;
        if (Item.list[i].property === "heal" && this.life > 0) {
          this.life += 20;
          if (this.life > this.maxLife) {
            this.life = this.maxLife;
          }
        } else if (Item.list[i].property === "stamina") {
          this.stamina += 20;
          if (this.stamina > this.maxStamina) {
            this.stamina = this.maxStamina;
          }
        } else {
          this.ult += 20;
          if (this.ult > this.maxUlt) {
            this.ult = this.maxUlt;
          }
        }
      }
    }
  }

  /**
   * Initialize a list with the player parameters and return it.
   * @return {list} the player's parameters
   */
  initList() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name,
      hp: this.life,
      hpmax: this.maxLife,
      score: this.score,
      frag: this.frag,
      death: this.death,
      class: this.class,
      direction: this.direction,
      ready: this.ready,
      room: this.room,
      stamina: this.stamina,
      maxStamina: this.maxStamina,
      ult: this.ult,
      maxUlt: this.maxUlt,
      alive: this.alive
    };
  }
}

/** static elements for Player */
Player.list = {}; // a list of players connected

/**
 * Retrieve info about all the players connected.
 * @return {list} info about the players.
 */
Player.infoPlayers = function() {
  var data = [];
  for (var i in Player.list) {
    data.push(Player.list[i].initList());
  }
  return data;
};

/**
 * When someone is connected, create a player, wait for keyboard inputs and send info to the client side
 * @param {socket} socket - Socket with the player's ID.
 */
Player.onConnect = function(socket) {
  var player = new Player({
    id: socket.id,
    spawn: Math.floor(Math.random() * 4 + 1)
  });
  socket.on("keyPress", function(data) {
    if (data.inputId === "left") player.pressingLeft = data.state;
    else if (data.inputId === "right") player.pressingRight = data.state;
    else if (data.inputId === "up") player.pressingUp = data.state;
    else if (data.inputId === "down") player.pressingDown = data.state;
    else if (data.inputId === "attack") player.pressingX = data.state;
    else if (data.inputId === "skill") player.pressingA = data.state;
    else if (data.inputId === "ultimate") player.pressingE = data.state;
  });

  // send info about the players and projectiles to the client side. a player know the others.
  var playerInfo = Player.infoPlayers();
  var projectileInfo = Projectile.infoProjectiles();
  var enemyInfo = Enemy.infoEnemies();

  socket.emit("init", {
    Id: socket.id,
    player: playerInfo,
    projectile: projectileInfo,
    enemy: enemyInfo
  });
};

/**
 * When someone is disconnected, remove the player from the server
 * @param {socket} socket - Socket with the player's ID.
 */
Player.onDisconnect = function(socket) {
  if (global.Rooms[global.clientRooms[socket.id]] !== undefined) {
    global.Rooms[global.clientRooms[socket.id]].numberPlayers -= 1;
    if (global.Rooms[global.clientRooms[socket.id]].numberPlayers < 2) {
      for (var i in Player.list) {
        if (
          Player.list[i].room === global.clientRooms[socket.id] &&
          socket.id !== Player.list[i].id &&
          global.Rooms[Player.list[i].room].mode === "ffa"
        ) {
          global.SOCKET_LIST[i].emit("gameOver", {
            room: global.clientRooms[socket.id],
            winner: Player.list[i].id
          });
        }
      }
    }
  }

  delete Player.list[socket.id];
  global.REMOVE_DATA.player.push(socket.id);
  socket.leave(global.clientRooms[socket.id]);
  if (global.clientRooms[socket.id] !== undefined)
    delete global.clientRooms[socket.id];
};

/**
 * Updating info about each player and send it.
 * @return {list} info about updated players
 */
Player.checkInfoPlayers = function() {
  var info = [];
  for (var i in Player.list) {
    var player = Player.list[i];
    player.updateMove();
    info.push({
      id: player.id,
      class: player.class,
      room: player.room,
      x: player.x,
      y: player.y,
      hp: player.life,
      score: player.score,
      frag: player.frag,
      death: player.death,
      direction: player.direction,
      ready: player.ready,
      stamina: player.stamina,
      ult: player.ult,
      alive: player.alive
    });
  }
  return info;
};

/**
 * Class representing an enemy.
 * @extends Element
 */
class Enemy extends Element {
  /**
   * Create an enemy.
   * @param {list} config - list of parameters
   */
  constructor(config) {
    super(config);
    this.life = 40;
    this.maxLife = 40; // for healing for instance
    this.speedMove = config.speed; // 1 tile
    this.direction = 4; // 1 right, 2 left, 3 up, 4 down
    this.room = config.room;
    this.atk = config.atk;
    while (
      this.wallDetection({ x: this.x, y: this.y }, global.Rooms[this.room].map)
    ) {
      this.x = Math.random() * Map.WIDTH;
      this.y = Math.random() * Map.HEIGHT;
    }
    Enemy.list[this.id] = this;
    global.INIT_DATA.enemy.push({
      id: this.id,
      x: this.x,
      y: this.y,
      hp: this.life,
      hpmax: this.maxLife,
      map: this.map,
      direction: this.direction,
      room: this.room
    });
  }

  /**
   * Update the enemy position depending on the closest Player
   * @param {String} map - map's name
   */
  updatePosition(map) {
    var tmpDistance = 0;
    var closest = Number.MAX_VALUE;
    var playerIndex = null;
    var diffX = null;
    var diffY = null;

    // checking if there is at least 1 player in the list and targeting if  close to him
    if (Object.keys(Player.list).length) {
      // looking for the closest player
      for (var i in Player.list) {
        if (
          this.room === Player.list[i].room &&
          Player.list[i].alive !== undefined &&
          Player.list[i].alive
        ) {
          var player = Player.list[i];
          tmpDistance = this.evaluateDistance(player);
          if (tmpDistance < closest) {
            closest = tmpDistance;
            playerIndex = i;
          }
        }
      }
      if (playerIndex !== null) {
        var aStar = require("javascript-astar");
        var graph = new aStar.Graph(Map.array2D[map], { diagonal: false });

        var startX = this.x;
        var startY = this.y;
        var start =
          graph.grid[Math.floor(startY / Map.TILE_SIZE)][
            Math.floor(startX / Map.TILE_SIZE)
          ];
        var end =
          graph.grid[Math.floor(Player.list[playerIndex].y / Map.TILE_SIZE)][
            Math.floor(Player.list[playerIndex].x / Map.TILE_SIZE)
          ];
        var result = aStar.astar.search(graph, start, end);
        // y is x in our matrix
        var nextMove = result[1];
        if (nextMove) {
          diffX = nextMove.x - start.x;
          diffY = nextMove.y - start.y;

          if (diffX > 0) {
            this.y += this.speedMove;
            this.direction = 4;
          } else if (diffX < 0) {
            this.y -= this.speedMove;
            this.direction = 3;
          }
          if (diffY > 0) {
            this.x += this.speedMove;
            this.direction = 1;
          } else if (diffY < 0) {
            this.x -= this.speedMove;
            this.direction = 2;
          }
        } else if (closest >= 85 && (!diffX || !diffY)) {
          if (!diffX) {
            if (Math.floor(Player.list[playerIndex].x) > Math.floor(this.x)) {
              this.x += this.speedMove;
              this.direction = 1;
            } else {
              this.x -= this.speedMove;
              this.direction = 2;
            }
          } else if (!diffY) {
            if (Math.floor(Player.list[playerIndex].y) > Math.floor(this.y)) {
              this.y += this.speedMove;
              this.direction = 4;
            } else {
              this.y -= this.speedMove;
              this.direction = 3;
            }
          }
        } else if (closest < 85) {
          diffX = Math.floor(Player.list[playerIndex].x - this.x);
          diffY = Math.floor(Player.list[playerIndex].y - this.y);
          if (diffX === 0) {
            if (diffY > 0) {
              this.direction = 4;
            } else if (diffY < 0) {
              this.direction = 3;
            }
          } else if (diffY === 0) {
            if (diffX > 0) {
              this.direction = 1;
            } else if (diffX < 0) {
              this.direction = 2;
            }
          } else {
            if (diffX > 0) {
              this.direction = 1;
            } else if (diffX < 0) {
              this.direction = 2;
            }
          }
          if (this.timerAttack === undefined) {
            this.timerAttack = 0;
            this.attack(playerIndex);
          }
          if (this.timerAttack === 15) {
            this.timerAttack = 0;
            this.attack(playerIndex);
          } else {
            this.timerAttack += 1;
          }
        }
      }
    }
  }

  attack(target) {
    if (
      Player.list[target].shield !== undefined &&
      Player.list[target].shield
    ) {
      return;
    } else {
      Player.list[target].life -= this.atk;
    }
    if (Player.list[target].life <= 0) {
      Player.list[target].life = 0;
      var checkContinue = false;

      if (Player.list[target].alive) Player.list[target].alive = false;
      for (var i in Player.list) {
        if (
          Player.list[i].alive &&
          Player.list[i].room === Player.list[target].room
        ) {
          checkContinue = true;
          break;
        }
      }
    }
    if (checkContinue !== undefined && !checkContinue) {
      for (var i in global.SOCKET_LIST) {
        if (Player.list[i].room === Player.list[target].room){
          global.SOCKET_LIST[i].emit("gameOver", {
            room: this.room
          });
        global.REMOVE_DATA.player.push(i);
        }
      }
    } else {
      for (var i in global.SOCKET_LIST) {
        if (Player.list[i].room === Player.list[target].room)
          global.SOCKET_LIST[i].emit("EnemyAttack", {
            id: this.id,
            direction: this.direction
          });
      }
    }
  }

  /**
   * Initialize a list with the player parameters and return it.
   * @return {list} the player's parameters
   */
  initList() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      hp: this.life,
      hpmax: this.maxLife,
      map: this.map,
      direction: this.direction,
      room: this.room
    };
  }
}

/**
 * Create an enemy with random parameters
 * @param {String} roomName - room's name where enemy will appear.
 */
Enemy.randomGenerateEnemy = function(roomName) {
  var x = Math.random() * Map.WIDTH;
  var y = Math.random() * Map.HEIGHT;
  var id = Math.random();
  var speedMove = 1 + global.Rooms[roomName].wave * 0.2;
  var atk = 2 + global.Rooms[roomName].wave * 0.5;
  new Enemy({ id: id, x: x, y: y, speed: speedMove, room: roomName, atk: atk });
};
/** static elements for Enemy */
Enemy.list = {};

/**
 * Updating info about each enemies and send it.
 * @return {list} info about updated projectiles
 */
Enemy.checkInfoEnemies = function() {
  var info = [];
  for (var i in Enemy.list) {
    var enemy = Enemy.list[i];
    enemy.updatePosition(global.Rooms[Enemy.list[i].room].map);
    info.push({
      id: enemy.id,
      x: enemy.x,
      y: enemy.y,
      hp: enemy.life,
      direction: enemy.direction
    });
  }
  return info;
};

/**
 * Retrieve info about all the players connected.
 * @return {list} info about the players.
 */
Enemy.infoEnemies = function() {
  var data = [];
  for (var i in Enemy.list) {
    data.push(Enemy.list[i].initList());
  }
  return data;
};

/** Class representing a Projectile.
 * @extends Element
 */

class Projectile extends Element {
  /**
   * Create a projectile.
   * @param {list} config - list of parameters
   */
  constructor(config) {
    super(config);
    this.id = Math.random();
    switch (config.direction) {
      case 1:
        this.speedX = 4;
        this.speedY = 0;
        break;
      case 2:
        this.speedX = -4;
        this.speedY = 0;
        break;
      case 3:
        this.speedX = 0;
        this.speedY = -4;
        break;
      case 4:
        this.speedX = 0;
        this.speedY = 4;
        break;
      default:
        break;
    }
    this.direction = config.direction;
    this.type = config.type;
    this.user = config.user; // the shooter
    this.timer = 0;
    switch (Player.list[this.user].class) {
      case "archer":
        this.maxTimer = 60;
        break;
      case "sorcerer":
        this.maxTimer = 40;
        break;
    }
    this.toRemove = false;
    this.room = Player.list[this.user].room;
    Projectile.list[this.id] = this;
    global.INIT_DATA.projectile.push({
      id: this.id,
      x: this.x,
      y: this.y,
      room: this.room,
      type: this.type,
      direction: this.direction
    });
  }

  /**
   * Update the projectile's info
   */
  updateProjectile() {
    if (this.timer++ > this.maxTimer) this.toRemove = true;
    this.x += this.speedX;
    this.y += this.speedY;
    if (
      global.Rooms[this.room] !== undefined &&
      global.Rooms[this.room].mode === "ffa"
    ) {
      for (var i in Player.list) {
        var object = Player.list[i];
        if (
          this.testHit(object) &&
          this.user !== object.id &&
          global.clientRooms[this.user] === global.clientRooms[object.id]
        ) {
          if (object.shield !== undefined && object.shield) {
          } else if (
            this.ultArrow === true &&
            this.direction === object.direction
          ) {
            object.life = 0;
            this.ultArrow = false;
          } else if (
            this.ultArrow === true &&
            this.direction !== object.direction
          ) {
            object.life -= this.atk * 5;
            this.ultArrow = false;
          } else {
            object.life -= Player.list[this.user].atk;
            Player.list[this.user].ult += 1;
          }
          // respawn
          if (object.life <= 0) {
            object.death += 1;
            if (Player.list[this.user]) {
              Player.list[this.user].score += 5;
              Player.list[this.user].frag += 1;
              Player.list[this.user].ult += 5;
            }
            object.life = object.maxLife;
            object.x = Math.random() * Map.WIDTH;
            object.y = Math.random() * Map.HEIGHT;
            while (
              this.wallDetection(
                { x: object.x, y: object.y },
                global.Rooms[object.room].map
              )
            ) {
              object.x = Math.random() * Map.WIDTH;
              object.y = Math.random() * Map.HEIGHT;
            }
          }
          if (Player.list[this.user].ult > Player.list[this.user].maxUlt)
            Player.list[this.user].ult = Player.list[this.user].maxUlt;
          this.toRemove = true;
        }
      }
    } else if (
      global.Rooms[this.room] !== undefined &&
      global.Rooms[this.room].mode === "survival"
    ) {
      for (var i in Enemy.list) {
        var object = Enemy.list[i];
        if (
          this.testHit(object) &&
          this.user !== object.id &&
          this.room === object.room
        ) {
          if (this.ultArrow === true && this.direction === object.direction) {
            object.life = 0;
            this.ultArrow = false;
          } else if (
            this.ultArrow === true &&
            this.direction !== object.direction
          ) {
            object.life -= this.atk * 5;
            this.ultArrow = false;
          } else {
            object.life -= Player.list[this.user].atk;
            Player.list[this.user].ult += 1;
          }

          if (object.life <= 0) {
            if (Player.list[this.user]) {
              Player.list[this.user].score += 2;
              Player.list[this.user].frag += 1;
              Player.list[this.user].ult += 5;
            }
            global.REMOVE_DATA.enemy.push(object.id);
            delete Enemy.list[i];
          }
          if (Player.list[this.user].ult > Player.list[this.user].maxUlt)
            Player.list[this.user].ult = Player.list[this.user].maxUlt;
          this.toRemove = true;
        }
      }
      if (this.wallDetection(this, global.Rooms[this.room].map)) {
        this.toRemove = true;
      }
    }
  }

  /**
   * Checkif the projectile touch the object
   * @param {Object} object - represent an enemy or a player
   * @returns {boolean} true if it touch, false otherwise
   */
  testHit(object) {
    var right_hitbox = { x: this.x + 15, y: this.y };
    var left_hitbox = { x: this.x - 15, y: this.y };
    var up_hitbox = { x: this.x, y: this.y - 5 };
    var down_hitbox = { x: this.x, y: this.y + 30 };
    var right_hitboxO = { x: object.x + 15, y: object.y };
    var left_hitboxO = { x: object.x - 15, y: object.y };
    var up_hitboxO = { x: object.x, y: object.y - 5 };
    var down_hitboxO = { x: object.x, y: object.y + 30 };
    if (
      this.hit(right_hitbox, right_hitboxO) ||
      this.hit(left_hitbox, left_hitboxO) ||
      this.hit(down_hitbox, up_hitboxO) ||
      this.hit(up_hitbox, down_hitboxO)
    ) {
      return true;
    }
    return false;
  }

  /**
   *  Test if there is a collision with an object
   *  use in testHit function
   *  @param {Point} point - object with position
   *  @param {Point} object - the entity the projectile is trying to touch
   */
  hit(point, object) {
    var x = Math.floor(point.x / Map.TILE_SIZE);
    var y = Math.floor(point.y / Map.TILE_SIZE);
    var xObject = Math.floor(object.x / Map.TILE_SIZE);
    var yObject = Math.floor(object.y / Map.TILE_SIZE);

    if (xObject === x && yObject === y) return true;
    return false;
  }
  /**
   * Initialize a list with the projectile parameters and return it.
   * @returns {list} the projectile's parameters
   */
  initList() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      room: this.room,
      type: this.type,
      direction: this.direction
    };
  }
}

// static elements for Projectile
Projectile.list = {}; // a list of projectiles on the mao

/**
 * Updating info about each projectile and send it.
 * @return {list} info about updated projectiles
 */
Projectile.checkInfoProjectiles = function() {
  var info = [];
  for (var i in Projectile.list) {
    var projectile = Projectile.list[i];
    projectile.updateProjectile();
    if (projectile.toRemove) {
      delete Projectile.list[i];
      global.REMOVE_DATA.projectile.push(projectile.id);
    } else {
      info.push({
        id: projectile.id,
        x: projectile.x,
        y: projectile.y
      });
    }
  }
  return info;
};
/**
 * Retrieve info about all the projectiles.
 * @return {list} info about the projectiles.
 */
Projectile.infoProjectiles = function() {
  var data = [];
  for (var i in Projectile.list) {
    data.push(Projectile.list[i].initList());
  }
  return data;
};

/** Class representing an Item.
 * @extends Element
 */
class Item extends Element {
  /**
   * Create an object.
   * @param {list} config - list of parameters
   */
  constructor(config) {
    super(config);

    this.id = Math.random();
    this.property = config.property;
    this.toRemove = false;
    this.room = config.room;
    while (
      this.wallDetection({ x: this.x, y: this.y }, global.Rooms[this.room].map)
    ) {
      this.x = Math.random() * Map.WIDTH;
      this.y = Math.random() * Map.HEIGHT;
    }
    Item.list[this.id] = this;
    global.INIT_DATA.object.push({
      property: this.property,
      id: this.id,
      x: this.x,
      y: this.y,
      room: this.room
    });
  }
}
Item.list = {};

/**
 * Generate an item
 * @return {String} roomName - name of the room where item is generated
 */
Item.generateObject = function(roomName) {
  var x = Math.random() * Map.WIDTH;
  var y = Math.random() * Map.HEIGHT;
  var choice = Math.floor(Math.random() * 3); // to randomly choose between a heal or a stamina boost
  var proprety = "";

  if (choice === 1) {
    property = "heal";
  } else if (choice === 2) {
    property = "stamina";
  } else {
    property = "ult";
  }
  new Item({ x: x, y: y, property: property, room: roomName });
};

/**
 * Updating info about each object and send it.
 * @return {list} info about updated objects
 */
Item.checkInfoObjects = function() {
  var info = [];
  for (var i in Item.list) {
    var object = Item.list[i];
    if (object.toRemove) {
      delete Item.list[i];
      global.REMOVE_DATA.object.push(object.id);
    } else {
      info.push({
        id: object.id,
        x: object.x,
        y: object.y,
        property: object.property
      });
    }
  }
  return info;
};

module.exports = { Player, Enemy, Projectile, Item };

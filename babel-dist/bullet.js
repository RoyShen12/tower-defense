function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let BulletManager =
/*#__PURE__*/
function () {
  /** @type {BulletManager} */
  function BulletManager() {
    _classCallCheck(this, BulletManager);

    if (!BulletManager.instance) {
      /** @type {BulletBase[]} */
      this.bullets = [];
      /** @type {Map<string, typeof BulletBase>} */

      this.__bctor_cache = new Map();
      BulletManager.instance = this;
    }

    return BulletManager.instance;
  }
  /**
   * @param {(mst: MonsterBase) => void} emitter
   * @param {string} bulletName
   * @param {Position} position
   * @param {number} atk
   * @param {MonsterBase} target
   * @param {ImageBitmap | string} image
   * @param  {...any} extraArgs
   * @returns {BulletBase}
   */


  _createClass(BulletManager, [{
    key: "Factory",
    value: function Factory(emitter, bulletName, position, atk, target, image, ...extraArgs) {
      let ctor = null;

      if (this.__bctor_cache.has(bulletName)) {
        ctor = this.__bctor_cache.get(bulletName);
      } else {
        ctor = eval(bulletName);

        this.__bctor_cache.set(bulletName, ctor);
      }

      const bb = new ctor(position, atk, target, image, ...extraArgs);
      bb.setDamageEmitter(emitter);
      this.bullets.push(bb);
      return bb;
    }
  }, {
    key: "run",
    value: function run(monsters) {
      this.bullets.forEach(b => b.run(monsters));
    }
  }, {
    key: "render",
    value: function render(ctx) {
      this.bullets.forEach(b => b.render(ctx));
    }
  }, {
    key: "scanSwipe",
    value: function scanSwipe() {
      this.bullets = this.bullets.filter(b => {
        if (b.fulfilled) b.destory();
        return !b.fulfilled;
      });
    }
  }]);

  return BulletManager;
}();

_defineProperty(BulletManager, "instance", null);

let CannonBullet =
/*#__PURE__*/
function (_BulletBase) {
  _inherits(CannonBullet, _BulletBase);

  /**
   * @param {(monster: MonsterBase) => number} ratioCalc
   */
  function CannonBullet(position, atk, target, bimg, explosionDmg, explosionRadius, burnDotDamage, burnDotInterval, burnDotDuration, extraBV, ratioCalc) {
    var _this;

    _classCallCheck(this, CannonBullet);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(CannonBullet).call(this, position, 2, 1, 'rgba(15,244,11,.9)', 'rgba(15,12,11,.6)', atk, CannonBullet.bulletVelocity + (extraBV || 0), target));
    _this.aimPosition = null;
    _this.explosionDmg = explosionDmg;
    _this.explosionRadius = explosionRadius;
    _this.burnDotDamage = burnDotDamage;
    _this.burnDotInterval = burnDotInterval;
    _this.burnDotDuration = burnDotDuration;
    _this.ratioCalc = ratioCalc;
    return _this;
  }

  _createClass(CannonBullet, [{
    key: "run",

    /**
     * 加农炮弹在丢失目标后仍会向最后记录的目标位置飞行并爆炸
     * @override
     */
    value: function run(monsters) {
      if (!this.target) {
        this.position.moveTo(this.aimPosition, this.speed);
      } else {
        this.position.moveTo(this.target.position, this.speed);

        if (this.target.isDead) {
          this.aimPosition = this.target.position.copy();
          this.target = null;
        }
      }

      if (this.isReaching) {
        this.hit(this.target, monsters);
        this.fulfilled = true;
      }
    }
    /**
     * 击中敌人后会引起爆炸
     * 并点燃敌人，造成周期伤害
     * @param {MonsterBase} monster
     * @param {MonsterBase[]} monsters
     */

  }, {
    key: "hit",
    value: function hit(monster, monsters) {
      if (monster) _get(_getPrototypeOf(CannonBullet.prototype), "hit", this).call(this, monster, this.ratioCalc(monster));
      const target = this.target ? this.target.position : this.aimPosition;
      const positionTL = new Position(target.x - this.explosionRadius, target.y - this.explosionRadius); // render explosion

      Game.callAnimation('explo_3', positionTL, this.explosionRadius * 2, this.explosionRadius * 2, .5, 0); // make exploding dmg

      monsters.forEach(m => {
        if (Position.distancePow2(m.position, target) < this.explosionRadius * this.explosionRadius) {
          m.health -= this.explosionDmg * (1 - m.armorResistance) * this.ratioCalc(m);
          this.emitter(m);
          Tools.installDot(m, 'beBurned', this.burnDotDuration, this.burnDotInterval, this.burnDotDamage * this.ratioCalc(m), false, this.emitter.bind(this)); // if (!m.beBurned && !m.isDead) {
          //   let dotCount = 0
          //   // 目标标记灼烧
          //   m.beBurned = true
          //   const itv = setInterval(() => {
          //     if (++dotCount > this.burnDotCount) {
          //       // 效果结束、移除灼烧状态、结束计时器
          //       m.beBurned = false
          //       clearInterval(itv)
          //       return
          //     }
          //     if (m.health > 0) {
          //       // 跳DOT
          //       m.health -= this.burnDotDamage * (1 - m.armorResistance) * this.ratioCalc(m)
          //       this.emitter(m)
          //     }
          //     if (m.health <= 0) {
          //       clearInterval(itv)
          //     }
          //   }, this.burnDotInterval)
          // }
        }
      });
    }
  }, {
    key: "isReaching",
    get: function () {
      if (this.aimPosition) return Position.distancePow2(this.position, this.aimPosition) < Math.pow(20 + this.radius, 2);
      return _get(_getPrototypeOf(CannonBullet.prototype), "isReaching", this);
    }
  }, {
    key: "burnDotCount",
    get: function () {
      return this.burnDotDuration / this.burnDotInterval;
    }
  }]);

  return CannonBullet;
}(BulletBase);

_defineProperty(CannonBullet, "bulletVelocity", 4);

let ClusterBomb =
/*#__PURE__*/
function (_CannonBullet) {
  _inherits(ClusterBomb, _CannonBullet);

  function ClusterBomb(...args) {
    var _this2;

    _classCallCheck(this, ClusterBomb);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(ClusterBomb).call(this, ...args));
    _this2.radius += 4;
    _this2.borderStyle = 'rgba(14,244,11,.9)';
    _this2.fill = 'rgba(215,212,11,.6)';
    _this2.speed += 2;
    return _this2;
  }

  _createClass(ClusterBomb, [{
    key: "clusterExplode",
    value: function clusterExplode(monsters, radius, dist, dmg, degree, waitFrame) {
      const childExplodePositions = _.range(0, 360, degree).map(d => {
        const vec = new PolarVector(dist, d);
        const pos = this.position.copy().move(vec);
        const positionTL = new Position(pos.x - radius, pos.y - radius);
        Game.callAnimation('explo_3', positionTL, radius * 2, radius * 2, .5, 0, waitFrame);
        return pos;
      });

      monsters.forEach(m => {
        childExplodePositions.filter(ep => Position.distancePow2(m.position, ep) < radius * radius).forEach(() => {
          m.health -= dmg * (1 - m.armorResistance) * this.ratioCalc(m);
          this.emitter(m);
          Tools.installDot(m, 'beBurned', this.burnDotDuration, this.burnDotInterval, this.burnDotDamage * this.ratioCalc(m), false, this.emitter.bind(this)); // if (!m.beBurned && !m.isDead) {
          //   let dotCount = 0
          //   // 目标标记灼烧
          //   m.beBurned = true
          //   const itv = setInterval(() => {
          //     if (++dotCount > this.burnDotCount) {
          //       // 效果结束、移除灼烧状态、结束计时器
          //       m.beBurned = false
          //       clearInterval(itv)
          //       return
          //     }
          //     if (m.health > 0) {
          //       // 跳DOT
          //       m.health -= this.burnDotDamage * (1 - m.armorResistance) * this.ratioCalc(m)
          //       this.emitter(m)
          //     }
          //     if (m.health <= 0) {
          //       clearInterval(itv)
          //     }
          //   }, this.burnDotInterval)
          // }
        });
      });
    }
    /**
     * 集束炸弹命中或到达目的地后会爆炸，分裂出[n]枚小型炸弹
     * @override
     * @param {MonsterBase[]} monsters
     */

  }, {
    key: "hit",
    value: function hit(monster, monsters) {
      if (monster) _get(_getPrototypeOf(ClusterBomb.prototype), "hit", this).call(this, monster, monsters);
      this.clusterExplode(monsters, this.childExplodeRadius, this.childBombDistance, this.childExplodeDamage, 45, 10);
    }
  }, {
    key: "childExplodeRadius",
    get: function () {
      return this.explosionRadius * .5;
    }
  }, {
    key: "childBombDistance",
    get: function () {
      return this.explosionRadius * .5;
    }
  }, {
    key: "childExplodeDamage",
    get: function () {
      return this.explosionDmg * .8;
    }
  }]);

  return ClusterBomb;
}(CannonBullet);

let ClusterBombEx =
/*#__PURE__*/
function (_ClusterBomb) {
  _inherits(ClusterBombEx, _ClusterBomb);

  function ClusterBombEx(...args) {
    var _this3;

    _classCallCheck(this, ClusterBombEx);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(ClusterBombEx).call(this, ...args));
    _this3.radius += 2;
    _this3.fill = 'rgba(245,242,11,.8)';
    return _this3;
  }

  _createClass(ClusterBombEx, [{
    key: "hit",
    value: function hit(monster, monsters) {
      _get(_getPrototypeOf(ClusterBombEx.prototype), "hit", this).call(this, monster, monsters);

      this.clusterExplode(monsters, this.grandChildExplodeRadius, this.grandChildBombDistance, this.grandChildExplodeDamage, 30, 20);
    }
  }, {
    key: "grandChildExplodeRadius",
    get: function () {
      return _get(_getPrototypeOf(ClusterBombEx.prototype), "childExplodeRadius", this) * .5;
    }
  }, {
    key: "grandChildBombDistance",
    get: function () {
      return _get(_getPrototypeOf(ClusterBombEx.prototype), "childBombDistance", this) * 2;
    }
  }, {
    key: "grandChildExplodeDamage",
    get: function () {
      return _get(_getPrototypeOf(ClusterBombEx.prototype), "childExplodeDamage", this) * .8;
    }
  }]);

  return ClusterBombEx;
}(ClusterBomb);

let NormalArrow =
/*#__PURE__*/
function (_BulletBase2) {
  _inherits(NormalArrow, _BulletBase2);

  function NormalArrow(position, atk, target, image, critChance, critRatio, trapChance, trapDuration, extraBV, isSecKill) {
    var _this4;

    _classCallCheck(this, NormalArrow);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(NormalArrow).call(this, position, 8, 0, null, image, atk, NormalArrow.bulletVelocity + (extraBV || 0), target));
    _this4.critChance = critChance;
    _this4.critRatio = critRatio;
    _this4.willTrap = Math.random() > 1 - trapChance / 100;
    _this4.trapDuration = trapDuration;
    _this4.isSecKill = isSecKill;
    return _this4;
  }
  /**
   * @param {MonsterBase} monster
   */


  _createClass(NormalArrow, [{
    key: "hit",
    value: function hit(monster) {
      if (this.isSecKill) {
        monster.health -= monster.health + 1;
        this.emitter(monster);
        return;
      } // 摇骰子，确定本次是否暴击


      const lottery = Math.random();
      const isCrit = lottery < this.critChance;
      const critMagnification = isCrit ? this.critRatio : 1; // console.log(critMagnification + ' X')
      // 穿甲

      monster.health -= this.Atk * critMagnification * (1 - monster.armorResistance * .7);
      this.emitter(monster);
      /**
       * 束缚
       */

      if (this.willTrap) {
        monster.registerImprison(this.trapDuration / 1000 * 60);
      }
    }
  }]);

  return NormalArrow;
}(BulletBase);

_defineProperty(NormalArrow, "bulletVelocity", 18);

let PoisonCan =
/*#__PURE__*/
function (_BulletBase3) {
  _inherits(PoisonCan, _BulletBase3);

  /**
   * @param {number} poisonAtk
   * @param {number} poisonItv ms
   * @param {number} poisonDur ms
   */
  function PoisonCan(position, atk, target, image, poisonAtk, poisonItv, poisonDur, extraBV) {
    var _this5;

    _classCallCheck(this, PoisonCan);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(PoisonCan).call(this, position, 2, 1, 'rgba(244,22,33,1)', 'rgba(227,14,233,.9)', atk, PoisonCan.bulletVelocity + (extraBV || 0), target));
    _this5.poisonAtk = poisonAtk;
    _this5.poisonItv = poisonItv;
    _this5.poisonDur = poisonDur;
    return _this5;
  }
  /**
   * @param {MonsterBase} monster
   */


  _createClass(PoisonCan, [{
    key: "hit",
    value: function hit(monster) {
      _get(_getPrototypeOf(PoisonCan.prototype), "hit", this).call(this, monster); // 毒罐的dot伤害
      // 无法对已中毒或死亡的目标施毒


      Tools.installDot(monster, 'bePoisoned', this.poisonDur, this.poisonItv, this.poisonAtk, true, this.emitter.bind(this)); // if (monster.bePoisoned || monster.isDead) {
      //   return
      // }
      // else {
      //   let dotCount = 0
      //   // 目标标记中毒
      //   monster.bePoisoned = true
      //   const itv = setInterval(() => {
      //     if (++dotCount > this.poisonDur / this.poisonItv) {
      //       // 效果结束、移除中毒状态、结束计时器
      //       monster.bePoisoned = false
      //       clearInterval(itv)
      //       return
      //     }
      //     if (monster.health > 0) {
      //       // 跳DOT
      //       // 无视防御
      //       monster.health -= this.poisonAtk
      //       this.emitter(monster)
      //     }
      //     if (monster.health <= 0) {
      //       clearInterval(itv)
      //     }
      //   }, this.poisonItv)
      // }
    }
  }]);

  return PoisonCan;
}(BulletBase);

_defineProperty(PoisonCan, "bulletVelocity", 6);
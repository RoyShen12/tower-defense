function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let MonsterManager = function () {
  function MonsterManager() {
    _classCallCheck(this, MonsterManager);

    this.monsters = [];
    this.__mctor_cache = new Map();
  }

  _createClass(MonsterManager, [{
    key: "Factory",
    value: function Factory(monsterName, position, image, level, ...extraArgs) {
      let ctor = null;

      if (this.__mctor_cache.has(monsterName)) {
        ctor = this.__mctor_cache.get(monsterName);
      } else {
        ctor = eval(monsterName);

        this.__mctor_cache.set(monsterName, ctor);
      }

      const nm = new ctor(position, image, level, ...extraArgs);
      this.monsters.push(nm);
      return nm;
    }
  }, {
    key: "run",
    value: function run(pathGetter, lifeToken, towers, monsters) {
      this.monsters.forEach(m => {
        m.run(pathGetter(m.position), lifeToken, towers, monsters);
      });
    }
  }, {
    key: "render",
    value: function render(ctx, imgCtl) {
      this.monsters.forEach(m => m.render(ctx, imgCtl));
    }
  }, {
    key: "scanSwipe",
    value: function scanSwipe(emitCallback) {
      this.monsters = this.monsters.filter(m => {
        if (m.isDead) {
          emitCallback(m.reward);
          m.destory();
        }

        return !m.isDead;
      });
    }
  }, {
    key: "totalCurrentHealth",
    get: function () {
      return _.sumBy(this.monsters, '__inner_current_health');
    }
  }, {
    key: "maxLevel",
    get: function () {
      return this.monsters.length > 0 ? _.maxBy(this.monsters, '__inner_level').__inner_level : 0;
    }
  }]);

  return MonsterManager;
}();

_defineProperty(MonsterManager, "monsterCtors", {
  Swordman: 'Swordman',
  Axeman: 'Axeman',
  LionMan: 'LionMan',
  HighPriest: 'HighPriest',
  Devil: 'Devil'
});

let Swordman = function (_MonsterBase) {
  _inherits(Swordman, _MonsterBase);

  function Swordman(position, image, level) {
    var _this;

    _classCallCheck(this, Swordman);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Swordman).call(this, position, Game.callGridSideSize() / 3 - 2, 0, null, image, level, Swordman.rwd, Swordman.spd, Swordman.hth, Swordman.amr));
    _this.name = '邪恶的剑士';
    _this.description = '曾今是流浪的剑士，如今被大魔神控制';
    return _this;
  }

  return Swordman;
}(MonsterBase);

_defineProperty(Swordman, "imgName", '$spr::m_act_white_sword');

_defineProperty(Swordman, "sprSpd", 4);

_defineProperty(Swordman, "rwd", lvl => 20 * lvl + 20);

_defineProperty(Swordman, "spd", lvl => Math.min(.3 + lvl / 60, 1.15));

_defineProperty(Swordman, "hth", lvl => 120 + lvl * 40);

_defineProperty(Swordman, "amr", lvl => 3 + lvl / 8);

let Axeman = function (_MonsterBase2) {
  _inherits(Axeman, _MonsterBase2);

  function Axeman(position, image, level) {
    var _this2;

    _classCallCheck(this, Axeman);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Axeman).call(this, position, Game.callGridSideSize() / 3 - 2, 0, null, image, level, Axeman.rwd, Axeman.spd, Axeman.hth, Axeman.amr));
    _this2.name = '蛮族斧手';
    _this2.description = '';
    return _this2;
  }

  return Axeman;
}(MonsterBase);

_defineProperty(Axeman, "imgName", '$spr::m_act_green_axe');

_defineProperty(Axeman, "sprSpd", 4);

_defineProperty(Axeman, "rwd", lvl => 30 * lvl + 20);

_defineProperty(Axeman, "spd", lvl => Math.min(.25 + lvl / 80, 1));

_defineProperty(Axeman, "hth", lvl => 300 + lvl * 100);

_defineProperty(Axeman, "amr", lvl => 5 + lvl / 6);

let LionMan = function (_MonsterBase3) {
  _inherits(LionMan, _MonsterBase3);

  function LionMan(position, image, level) {
    var _this3;

    _classCallCheck(this, LionMan);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(LionMan).call(this, position, Game.callGridSideSize() / 3 - 2, 0, null, image, level, LionMan.rwd, LionMan.spd, LionMan.hth, LionMan.amr));
    _this3.name = '狮人';
    _this3.description = '';
    return _this3;
  }

  return LionMan;
}(MonsterBase);

_defineProperty(LionMan, "imgName", '$spr::m_lion');

_defineProperty(LionMan, "sprSpd", 6);

_defineProperty(LionMan, "rwd", lvl => 40 * lvl + 20);

_defineProperty(LionMan, "spd", lvl => Math.min(.38 + lvl / 70, 1.2));

_defineProperty(LionMan, "hth", lvl => 580 + lvl * 122);

_defineProperty(LionMan, "amr", lvl => 22 + lvl / 5);

let HighPriest = function (_MonsterBase4) {
  _inherits(HighPriest, _MonsterBase4);

  function HighPriest(position, image, level) {
    var _this4;

    _classCallCheck(this, HighPriest);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(HighPriest).call(this, position, Game.callGridSideSize() / 2 - 1, 0, null, image, level, HighPriest.rwd, HighPriest.spd, HighPriest.hth, HighPriest.amr));
    _this4.lastHealTime = performance.now();
    _this4.isBoss = true;
    _this4.name = '龙人萨满';
    _this4.type = '首领';
    _this4.description = '';
    return _this4;
  }

  _createClass(HighPriest, [{
    key: "inHealingRange",
    value: function inHealingRange(target) {
      return Position.distancePow2(target.position, this.position) < this.Hrng * this.Hrng;
    }
  }, {
    key: "healing",
    value: function healing(target) {
      target.health += this.Hpow;
    }
  }, {
    key: "makeEffect",
    value: function makeEffect(towers, monsters) {
      if (this.canHeal) {
        const position = new Position(this.position.x - this.Hrng / 2, this.position.y - this.Hrng / 2);
        Game.callAnimation('healing_1', position, this.Hrng, this.Hrng, 1, 0);
        monsters.forEach(m => {
          if (this.inHealingRange(m)) {
            this.healing(m);
          }
        });
        this.lastHealTime = performance.now();
      }
    }
  }, {
    key: "renderHealthBar",
    value: function renderHealthBar(context) {
      _get(_getPrototypeOf(HighPriest.prototype), "renderHealthBar", this).call(this, context);

      const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius;
      context.save();
      context.fillStyle = this.healthBarTextFillStyle;
      context.font = this.healthBarTextFontStyle;
      context.fillText(`${Tools.chineseFormatter(this.health, 1)}/${Tools.chineseFormatter(this.maxHealth, 1)}`, this.position.x + this.radius + xaxisOffset + 2, this.position.y + this.inscribedSquareSideLength / 1.5 + 5);
      context.restore();
    }
  }, {
    key: "healthBarWidth",
    get: function () {
      return this.radius * 2.5;
    }
  }, {
    key: "healthBarHeight",
    get: function () {
      return 4;
    }
  }, {
    key: "canHeal",
    get: function () {
      return performance.now() - this.lastHealTime > this.Hitv;
    }
  }, {
    key: "Hitv",
    get: function () {
      const base = HighPriest.healingInterval(this.__inner_level);
      return _.random(base - 200, base + 200, false);
    }
  }, {
    key: "Hpow",
    get: function () {
      return HighPriest.healingPower(this.__inner_level);
    }
  }, {
    key: "Hrng",
    get: function () {
      return HighPriest.healingRange(this.__inner_level);
    }
  }]);

  return HighPriest;
}(MonsterBase);

_defineProperty(HighPriest, "imgName", '$spr::m_b_worm_dragon');

_defineProperty(HighPriest, "sprSpd", 6);

_defineProperty(HighPriest, "rwd", lvl => 240 * lvl + 1320);

_defineProperty(HighPriest, "spd", () => .11);

_defineProperty(HighPriest, "hth", lvl => 14400 + lvl * 8000);

_defineProperty(HighPriest, "amr", () => 14);

_defineProperty(HighPriest, "healingInterval", () => 5000);

_defineProperty(HighPriest, "healingPower", lvl => 40 * (Math.floor(lvl / 25) + 1));

_defineProperty(HighPriest, "healingRange", () => 30);

let Devil = function (_MonsterBase5) {
  _inherits(Devil, _MonsterBase5);

  function Devil(position, image, level) {
    var _this5;

    _classCallCheck(this, Devil);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(Devil).call(this, position, Game.callGridSideSize() / 1.4 + 3, 0, null, image, level, Devil.rwd, Devil.spd, Devil.hth, Devil.amr));
    _this5.isBoss = true;
    _this5.name = '地狱之王';
    _this5.type = '首领';
    _this5.description = '';
    return _this5;
  }

  _createClass(Devil, [{
    key: "renderHealthBar",
    value: function renderHealthBar(context) {
      _get(_getPrototypeOf(Devil.prototype), "renderHealthBar", this).call(this, context);

      const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius;
      context.save();
      context.fillStyle = this.healthBarTextFillStyle;
      context.font = this.healthBarTextFontStyle;
      context.fillText(`${Tools.chineseFormatter(this.health, 1)}/${Tools.chineseFormatter(this.maxHealth, 1)}`, this.position.x + this.radius + xaxisOffset + 2, this.position.y + this.inscribedSquareSideLength / 1.5 + 5);
      context.restore();
    }
  }, {
    key: "healthBarWidth",
    get: function () {
      return this.radius * 2.5;
    }
  }, {
    key: "healthBarHeight",
    get: function () {
      return 4;
    }
  }]);

  return Devil;
}(MonsterBase);

_defineProperty(Devil, "imgName", '$spr::m_devil');

_defineProperty(Devil, "sprSpd", 6);

_defineProperty(Devil, "rwd", lvl => 340 * lvl + 420);

_defineProperty(Devil, "spd", lvl => .14);

_defineProperty(Devil, "hth", lvl => 15500 + lvl * 13000);

_defineProperty(Devil, "amr", lvl => 32 + lvl);

_defineProperty(Devil, "summonInterval", () => 7000);
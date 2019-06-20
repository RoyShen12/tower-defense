var _class, _temp, _class2, _temp2, _class3, _temp3;

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

const __testMode = localStorage.getItem('debug_mode') === '1';

const TowerManager = new Proxy((_temp = _class = function () {
  function _TowerManager() {
    _classCallCheck(this, _TowerManager);

    this.towers = [];
    this.independentTowers = [];
    this.towerChangeHash = -1;
  }

  _createClass(_TowerManager, [{
    key: "Factory",
    value: function Factory(towerName, position, image, bulletImage, radius, ...extraArgs) {
      const nt = new (eval(towerName))(position, image, bulletImage, radius, ...extraArgs);
      this.constructor.independentCtors.includes(nt.constructor.name) ? this.independentTowers.push(nt) : this.towers.push(nt);
      return nt;
    }
  }, {
    key: "run",
    value: function run(monsters) {
      this.towers.forEach(t => {
        if (t.gem) t.gem.tickHook(t, monsters);
        t.run(monsters);
      });
      this.independentTowers.forEach(t => {
        t.run(monsters);
      });
    }
  }, {
    key: "render",
    value: function render(ctx) {
      this.towers.forEach(t => t.render(ctx));
    }
  }, {
    key: "rapidRender",
    value: function rapidRender(ctxRapid, monsters) {
      this.towers.forEach(t => t.rapidRender(ctxRapid, monsters));
      this.independentTowers.forEach(t => t.rapidRender(ctxRapid, monsters));
    }
  }, {
    key: "makeHash",
    value: function makeHash() {
      const c = _.sumBy(this.towers, 'level');

      const l = this.towers.length;
      return c + l + c * l;
    }
  }, {
    key: "scanSwipe",
    value: function scanSwipe(emitCallback) {
      this.towers = this.towers.filter(t => {
        if (t.isSold) {
          emitCallback(t.sellingPrice);
          t.destory();
        }

        return !t.isSold;
      });
      this.independentTowers = this.independentTowers.filter(t => {
        if (t.isSold) {
          emitCallback(t.sellingPrice);
          t.destory();
        }

        return !t.isSold;
      });
      const currentTowerChangeHash = this.makeHash();
      const needRender = currentTowerChangeHash !== this.towerChangeHash;
      this.towerChangeHash = currentTowerChangeHash;
      return needRender;
    }
  }, {
    key: "totalDamage",
    get: function () {
      return this.towers.reduce((cv, pv) => cv + pv.__total_damage, 0);
    }
  }, {
    key: "totalKill",
    get: function () {
      return this.towers.reduce((cv, pv) => cv + pv.__kill_count, 0);
    }
  }]);

  return _TowerManager;
}(), _defineProperty(_class, "independentCtors", ['_Jet']), _defineProperty(_class, "towerCtors", [{
  dn: '弓箭塔',
  c: 'MaskManTower',
  od: 1,
  n: 'archer0',
  n2: 'archer1',
  n3: 'archer2',
  n4: 'archer3',
  p: new Proxy({}, {
    get(t, p, r) {
      if (p === 'length') return 180;else return Math.ceil(Math.pow(1.1, +p) * 10);
    }

  }),
  r: lvl => lvl * 0.8 + 180,
  a: lvl => lvl * 2 + 2,
  h: () => 1,
  s: lvl => Math.floor(lvl / 20) + 2,
  bctor: 'NormalArrow',
  bn: 'normal_arrow',
  bn2: 'flame_arrow'
}, {
  dn: '加农炮塔',
  c: 'CannonShooter',
  od: 2,
  n: 'cannon0',
  n2: 'cannon1',
  n3: 'cannon2',
  p: new Proxy({}, {
    get(t, p, r) {
      if (p === 'length') return 170;else return Math.ceil(Math.pow(1.1, +p) * 15);
    }

  }),
  r: lvl => lvl * 0.75 + 120,
  a: lvl => lvl * 2 + 2,
  h: lvl => 0.7 + lvl * 0.004,
  s: () => 1,
  expr: lvl => Math.min(20 + lvl * 2, 90),
  expatk: atk => atk * 3.8 + 120,
  bdatk: atk => atk / 12,
  bdatk2: atk => atk / 10,
  bdatk3: atk => atk / 8,
  bdatk4: atk => atk / 6,
  bdatk5: atk => atk / 4,
  bditv: lvl => 500,
  bddur: lvl => 8000,
  bctor: 'CannonBullet',
  bctor2: 'ClusterBomb',
  bctor3: 'ClusterBombEx'
}, {
  dn: '冰霜塔',
  c: 'FrostTower',
  od: 3,
  n: 'ice',
  p: new Proxy({}, {
    get(t, p, r) {
      if (p === 'length') return 70;else return Math.ceil(Math.pow(1.1, +p) * 320);
    }

  }),
  r: lvl => lvl * 2.5 + 100,
  a: () => 0,
  h: () => Infinity,
  s: () => 0,
  sr: lvl => Tools.MathFx.naturalLogFx(.1, .12)(lvl)
}, {
  dn: '毒气塔',
  c: 'PoisonTower',
  od: 4,
  n: 'poison_t',
  p: new Proxy({}, {
    get(t, p, r) {
      if (p === 'length') return 190;else return Math.ceil(Math.pow(1.1, +p) * 50);
    }

  }),
  r: lvl => lvl * 0.8 + 100,
  a: lvl => Math.round(lvl / 20 + 2),
  h: lvl => 2.1 + lvl * 0.1,
  s: () => 1,
  patk: lvl => lvl * 4 * Math.max(lvl / 25, 1) + 90,
  pitv: lvl => Math.max(600 - lvl * 20, 50),
  pdur: () => 5000,
  bctor: 'PoisonCan'
}, {
  dn: '电能塔',
  c: 'TeslaTower',
  od: 5,
  n: 'tesla0',
  n2: 'tesla1',
  n3: 'tesla2',
  p: new Proxy({}, {
    get(t, p, r) {
      if (p === 'length') return 180;else return Math.ceil(Math.pow(1.1, +p) * 105);
    }

  }),
  r: () => 70,
  a: lvl => 18 + Math.round((lvl / 2 + 3) * (lvl / 2 + 3)),
  h: lvl => 0.75 + lvl * 0.01,
  s: () => 0
}, {
  dn: '魔法塔',
  c: 'BlackMagicTower',
  od: 6,
  n: 'magic0',
  n2: 'magic1',
  n3: 'magic2',
  n4: 'magic3',
  p: new Proxy({}, {
    get(t, p, r) {
      if (p === 'length') return 150;else return Math.ceil(Math.pow(1.1, +p) * 200);
    }

  }),
  r: lvl => lvl * 1 + 140,
  a: lvl => 5000 + Math.round((lvl + 4) * (lvl + 4)),
  a2: lvl => 9000 + Math.round((lvl + 8) * (lvl + 8)),
  a3: lvl => 15000 + Math.round((lvl + 16) * (lvl + 16)),
  a4: lvl => 42000 + Math.round((lvl + 32) * (lvl + 32)),
  h: () => 0.125,
  s: () => 1,
  ide: lvl => Math.min(lvl * 0.022 + 0.1, 10),
  idr: lvl => 10000 + 100 * lvl
}, {
  dn: '航母',
  c: 'CarrierTower',
  od: 7,
  n: 'carrier0',
  n1: 'carrier1',
  n2: 'carrier2',
  cn: 'plane_1',
  p: new Proxy({}, {
    get(t, p, r) {
      if (p === 'length') return 200;else return Math.ceil(Math.pow(1.1, +p) * 1000);
    }

  }),
  r: () => 150,
  a: lvl => 25 + lvl * 8,
  h: lvl => 0.8 + lvl * 0.01,
  s: () => 1,
  child: lvl => 1 + Math.floor(lvl / 20),
  spd: () => 5
}]), _defineProperty(_class, "rankPostfixL1", '老兵'), _defineProperty(_class, "rankPostfixL2", '身经百战'), _defineProperty(_class, "rankPostfixL3", '大师'), _temp), {
  get: function (target, property, reciever) {
    if (typeof property === 'string' && /[A-Z]/.test(property[0])) {
      const tryFind = target.towerCtors.find(tc => tc.c === property);

      if (tryFind) {
        return tryFind;
      }
    }

    return Reflect.get(target, property, reciever);
  }
});

let TestTower = function (_TowerBase) {
  _inherits(TestTower, _TowerBase);

  function TestTower(position, image, bimage, radius) {
    var _this;

    _classCallCheck(this, TestTower);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TestTower).call(this, position, radius, 0, null, image, TowerManager.TestTower.p, TowerManager.TestTower.a, TowerManager.TestTower.h, TowerManager.TestTower.s, TowerManager.TestTower.r));
    _this.canInsertGem = false;
    _this.bulletCtorName = TowerManager.TestTower.bctor;
    _this.name = TowerManager.TestTower.dn;
    _this.description = 'TOWER FOR TEST DAMAGE';
    return _this;
  }

  return TestTower;
}(TowerBase);

_defineProperty(TestTower, "TestBullet", function (_BulletBase) {
  _inherits(_TestBullet, _BulletBase);

  function _TestBullet(position, atk, target) {
    _classCallCheck(this, _TestBullet);

    return _possibleConstructorReturn(this, _getPrototypeOf(_TestBullet).call(this, position, 3, 0, null, 'rgba(15,44,11,1)', atk, 50, target));
  }

  return _TestBullet;
}(BulletBase));

let CannonShooter = function (_TowerBase2) {
  _inherits(CannonShooter, _TowerBase2);

  function CannonShooter(position, image, bimg, radius) {
    var _this2;

    _classCallCheck(this, CannonShooter);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(CannonShooter).call(this, position, radius, 1, 'rgba(156,43,12,.5)', image, TowerManager.CannonShooter.p, TowerManager.CannonShooter.a, TowerManager.CannonShooter.h, TowerManager.CannonShooter.s, TowerManager.CannonShooter.r));
    _this2.bulletCtorName = TowerManager.CannonShooter.bctor;
    _this2.levelEpdRngFx = TowerManager.CannonShooter.expr;
    _this2.levelEpdAtkFx = TowerManager.CannonShooter.expatk;
    _this2.levelBrnAtkFx = TowerManager.CannonShooter.bdatk;
    _this2.levelBrnItvFx = TowerManager.CannonShooter.bditv;
    _this2.levelBrnDurFx = TowerManager.CannonShooter.bddur;
    _this2.name = TowerManager.CannonShooter.dn;
    _this2.extraExplosionDamage = 0;
    _this2.extraExplosionRange = 0;
    _this2.extraExplosionDamageRatio = 1;
    _this2.extraExplosionRangeRatio = 1;
    _this2.extraRange = 0;
    _this2.extraBulletV = 0;
    _this2.inner_desc_init = '发射火炮，在命中后会爆炸\n+ 附加灼烧效果';
    _this2.description = _this2.inner_desc_init;
    return _this2;
  }

  _createClass(CannonShooter, [{
    key: "levelUp",
    value: function levelUp(currentMoney) {
      const ret = _get(_getPrototypeOf(CannonShooter.prototype), "levelUp", this).call(this, currentMoney);

      if (ret !== 0) {
        switch (this.level) {
          case 5:
            this.rankUp();
            this.name = '榴弹塔';
            this.image = Game.callImageBitMap(TowerManager.CannonShooter.n2);
            this.description += CannonShooter.rankUpDesc1;
            this.borderStyle = 'rgba(206,43,12,.7)';
            this.extraExplosionDamage = 100;
            this.extraExplosionRange = 10;
            this.extraBulletV = 2;
            this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk2;
            break;

          case 10:
            this.rankUp();
            this.name = '导弹塔';
            this.image = Game.callImageBitMap(TowerManager.CannonShooter.n3);
            this.description += CannonShooter.rankUpDesc2;
            this.borderStyle = 'rgba(246,43,12,.9)';
            this.extraExplosionDamage = 150;
            this.extraRange = 100;
            this.extraBulletV = 14;
            this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk3;
            break;

          case 15:
            this.rankUp();
            this.name = '集束炸弹塔';
            this.description += CannonShooter.rankUpDesc3;
            this.extraExplosionDamage = 200;
            this.extraRange = 150;
            this.extraExplosionRange = 20;
            this.bulletCtorName = TowerManager.CannonShooter.bctor2;
            this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk4;
            break;

          case 30:
            this.rankUp();
            this.name = '云爆塔';
            this.description += CannonShooter.rankUpDesc4;
            this.extraExplosionDamage = 250;
            this.extraRange = 200;
            this.extraExplosionRange = 30;
            this.bulletCtorName = TowerManager.CannonShooter.bctor3;
            this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk5;
            break;

          case 40:
            this.rankUp();
            Object.defineProperty(this, 'extraExplosionDamage', {
              enumerable: true,

              get() {
                return 250 + Math.floor((this.level - 40) * 30);
              }

            });
            this.name += ` ${TowerManager.rankPostfixL1}I`;
            break;

          case 50:
            this.rankUp();
            this.name = this.name.replace('I', 'II');
            break;

          case 60:
            this.rankUp();
            this.name = this.name.replace('II', 'III');
            break;

          case 70:
            this.rankUp();
            this.name = this.name.replace('III', 'IV');
            this.extraExplosionDamageRatio = 1.5;
            break;

          case 80:
            this.rankUp();
            this.name = this.name.replace('IV', 'V');
            this.extraExplosionDamageRatio = 1.5 * 1.5;
            break;

          case 90:
            this.rankUp();
            this.name = this.name.replace(TowerManager.rankPostfixL1, TowerManager.rankPostfixL2).replace('V', 'I');
            this.extraExplosionDamageRatio = 1.5 * 1.5 * 1.5;
            this.extraExplosionRangeRatio = 1.1;
            break;

          case 100:
            this.rankUp();
            this.name = this.name.replace('I', 'II');
            this.extraExplosionDamageRatio = 1.5 * 1.5 * 1.5 * 1.5;
            this.extraExplosionRangeRatio = 1.2;
            break;
        }
      }

      return ret;
    }
  }, {
    key: "produceBullet",
    value: function produceBullet() {
      this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk, this.target, this.bulletImage, this.EpdAtk, this.EpdRng, this.BrnAtk, this.BrnItv, this.BrnDur, this.extraBulletV, this.calculateDamageRatio.bind(this));
    }
  }, {
    key: "EpdRng",
    get: function () {
      return (this.levelEpdRngFx(this.level) + this.extraExplosionRange) * this.extraExplosionRangeRatio;
    }
  }, {
    key: "EpdAtk",
    get: function () {
      return (this.levelEpdAtkFx(this.Atk) + this.extraExplosionDamage) * this.extraExplosionDamageRatio;
    }
  }, {
    key: "BrnAtk",
    get: function () {
      return this.levelBrnAtkFx(this.Atk);
    }
  }, {
    key: "BrnItv",
    get: function () {
      return this.levelBrnItvFx(this.level);
    }
  }, {
    key: "BrnDur",
    get: function () {
      return this.levelBrnDurFx(this.level);
    }
  }, {
    key: "Rng",
    get: function () {
      return _get(_getPrototypeOf(CannonShooter.prototype), "Rng", this) + this.reviceRange(this.extraRange);
    }
  }, {
    key: "informationSeq",
    get: function () {
      return _get(_getPrototypeOf(CannonShooter.prototype), "informationSeq", this).concat([['爆炸半径', Tools.roundWithFixed(this.EpdRng, 1)], ['爆炸伤害', Tools.chineseFormatter(this.EpdAtk, 3)], ['每跳灼烧伤害', Math.round(this.BrnAtk)], ['灼烧伤害频率', Tools.roundWithFixed(this.BrnItv / 1000, 1) + ' 秒'], ['灼烧持续', Tools.roundWithFixed(this.BrnDur / 1000, 1) + ' 秒']]);
    }
  }]);

  return CannonShooter;
}(TowerBase);

_defineProperty(CannonShooter, "rankUpDesc1", '\n+ 爆炸范围和伤害得到加强');

_defineProperty(CannonShooter, "rankUpDesc2", '\n+ 射程得到大幅加强');

_defineProperty(CannonShooter, "rankUpDesc3", '\n+ 命中后向四周抛出小型炸弹');

_defineProperty(CannonShooter, "rankUpDesc4", '\n+ 小型炸弹将分裂两次');

let MaskManTower = function (_TowerBase3) {
  _inherits(MaskManTower, _TowerBase3);

  function MaskManTower(position, image, bimage, radius) {
    var _this3;

    _classCallCheck(this, MaskManTower);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(MaskManTower).call(this, position, radius, 1, 'rgba(26,143,12,.3)', image, TowerManager.MaskManTower.p, TowerManager.MaskManTower.a, TowerManager.MaskManTower.h, TowerManager.MaskManTower.s, TowerManager.MaskManTower.r));
    _this3.bulletCtorName = TowerManager.MaskManTower.bctor;
    _this3.bulletImage = bimage;
    _this3.multipleTarget = [];
    _this3.name = TowerManager.MaskManTower.dn;
    _this3.extraRange = 0;
    _this3.extraHaste = 0;
    _this3.extraPower = 0;
    _this3.extraArrow = 0;
    _this3.trapChance = 0;
    _this3.trapDuration = 0;
    _this3.extraBulletV = 0;
    _this3.inner_desc_init = '每次向多个敌人射出箭矢\n+ 有几率暴击\n+ 拥有固定 30%的护甲穿透';
    _this3.description = _this3.inner_desc_init;
    _this3.critChance = 0.1;
    _this3.critDamageRatio = 2;
    _this3.secKillChance = 0;
    return _this3;
  }

  _createClass(MaskManTower, [{
    key: "enhanceCrit",
    value: function enhanceCrit(chanceDelta = .05, ratioDelta = 1) {
      if (this.critChance < 0.75) this.critChance += chanceDelta;
      this.critDamageRatio += ratioDelta;
    }
  }, {
    key: "levelUp",
    value: function levelUp(currentMoney) {
      const ret = _get(_getPrototypeOf(MaskManTower.prototype), "levelUp", this).call(this, currentMoney);

      if (ret !== 0) {
        switch (this.level) {
          case 5:
            this.rankUp();
            this.name = '弩箭塔';
            this.image = Game.callImageBitMap(TowerManager.MaskManTower.n2);
            this.description += MaskManTower.rankUpDesc1;
            this.borderStyle = 'rgba(26,143,12,.5)';
            this.extraRange = 160;
            this.extraPower = 10;
            this.extraBulletV = 2;
            break;

          case 10:
            this.rankUp();
            this.name = '火枪塔';
            this.image = Game.callImageBitMap(TowerManager.MaskManTower.n3);
            this.secKillChance = 0.003;
            this.description += MaskManTower.rankUpDesc2.replace('$', Math.round(this.secKillChance * 1000));
            this.borderStyle = 'rgba(26,203,12,.7)';
            this.enhanceCrit(0.15, 6);
            this.extraPower = 20;
            this.extraBulletV = 4;
            break;

          case 15:
            this.rankUp();
            this.name = '精灵神射手塔';
            this.description += MaskManTower.rankUpDesc3;
            this.image = Game.callImageBitMap(TowerManager.MaskManTower.n4);
            this.borderStyle = 'rgba(26,255,12,.9)';
            this.enhanceCrit(0.1);
            this.extraRange = 180;
            this.trapChance = 5;
            this.trapDuration = 3000;
            this.extraBulletV = 8;
            Object.defineProperty(this, 'extraHaste', {
              enumerable: true,

              get() {
                return 0.5 + (this.level - 15) * 0.004;
              }

            });
            this.extraArrow = 16;
            break;

          case 20:
            this.rankUp();
            this.name += ` ${TowerManager.rankPostfixL1}I`;
            this.enhanceCrit(0.05, 2);
            break;

          case 30:
            this.rankUp();
            this.name = this.name.replace('I', 'II');
            this.enhanceCrit();
            this.trapChance = 6;
            this.trapDuration = 3500;
            break;

          case 40:
            this.rankUp();
            this.name = this.name.replace('II', 'III');
            this.enhanceCrit();
            this.trapChance = 7;
            this.trapDuration = 4000;
            break;

          case 50:
            this.rankUp();
            this.name = this.name.replace('III', 'IV');
            this.enhanceCrit();
            this.trapChance = 7.5;
            this.trapDuration = 4300;
            break;

          case 60:
            this.rankUp();
            this.name = this.name.replace('IV', 'V');
            this.enhanceCrit();
            this.trapChance = 8;
            this.trapDuration = 4400;
            break;

          case 70:
            this.rankUp();
            this.name = this.name.replace(TowerManager.rankPostfixL1, TowerManager.rankPostfixL2).replace('V', 'I');
            this.enhanceCrit(0.05, 2);
            this.trapChance = 9;
            this.trapDuration = 4500;
            break;

          case 80:
            this.rankUp();
            this.name = this.name.replace('I', 'II');
            this.enhanceCrit();
            this.trapChance = 10;
            break;

          case 90:
            this.rankUp();
            this.name = this.name.replace('II', 'III');
            this.enhanceCrit();
            break;
        }
      }

      return ret;
    }
  }, {
    key: "isThisTargetAvailable",
    value: function isThisTargetAvailable(target) {
      if (!target || target.isDead) return false;else return this.inRange(target);
    }
  }, {
    key: "reChooseTarget",
    value: function reChooseTarget(targetList, index) {
      for (const t of _.shuffle(targetList)) {
        if (this.inRange(t)) {
          this.multipleTarget[index] = t;
          return;
        }
      }

      this.multipleTarget[index] = null;
    }
  }, {
    key: "produceBullet",
    value: function produceBullet(idx) {
      if (this.multipleTarget[idx]) {
        const ratio = this.calculateDamageRatio(this.multipleTarget[idx]);
        this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.multipleTarget[idx], this.bulletImage, this.critChance, this.critDamageRatio, this.trapChance, this.trapDuration, this.extraBulletV, Math.random() < this.secKillChance);
      }
    }
  }, {
    key: "run",
    value: function run(monsters) {
      if (this.canShoot) {
        for (let x_i = 0; x_i < this.Slc; x_i++) {
          if (!this.isThisTargetAvailable(this.multipleTarget[x_i])) {
            this.reChooseTarget(monsters, x_i);
          }
        }

        this.shoot(monsters);
      }
    }
  }, {
    key: "gemHitHook",
    value: function gemHitHook(idx, msts) {
      if (this.gem && this.multipleTarget[idx]) {
        this.gem.hitHook(this, this.multipleTarget[idx], msts);
      }
    }
  }, {
    key: "DPS",
    get: function () {
      return _get(_getPrototypeOf(MaskManTower.prototype), "DPS", this) * (this.critChance * this.critDamageRatio + 1 - this.critChance);
    }
  }, {
    key: "informationSeq",
    get: function () {
      return _get(_getPrototypeOf(MaskManTower.prototype), "informationSeq", this).concat([['暴击率', Tools.roundWithFixed(this.critChance * 100, 1) + '%'], ['暴击伤害', Tools.roundWithFixed(this.critDamageRatio * 100, 0) + '%']]);
    }
  }, {
    key: "Rng",
    get: function () {
      return _get(_getPrototypeOf(MaskManTower.prototype), "Rng", this) + this.reviceRange(this.extraRange);
    }
  }, {
    key: "HstPS",
    get: function () {
      return _get(_getPrototypeOf(MaskManTower.prototype), "HstPS", this) + this.extraHaste;
    }
  }, {
    key: "Atk",
    get: function () {
      return _get(_getPrototypeOf(MaskManTower.prototype), "Atk", this) + this.extraPower;
    }
  }, {
    key: "Slc",
    get: function () {
      return _get(_getPrototypeOf(MaskManTower.prototype), "Slc", this) + this.extraArrow;
    }
  }]);

  return MaskManTower;
}(TowerBase);

_defineProperty(MaskManTower, "rankUpDesc1", '\n+ 射程和攻击力得到加强');

_defineProperty(MaskManTower, "rankUpDesc2", '\n+ 暴击能力得到大幅加强\n+ 有 $‰ 的几率直接杀死目标');

_defineProperty(MaskManTower, "rankUpDesc3", '\n+ 命中的箭矢将有几率束缚敌人');

let FrostTower = function (_TowerBase4) {
  _inherits(FrostTower, _TowerBase4);

  function FrostTower(position, image, bimg, radius) {
    var _this4;

    _classCallCheck(this, FrostTower);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(FrostTower).call(this, position, radius, 1, 'rgba(161,198,225,.6)', image, TowerManager.FrostTower.p, TowerManager.FrostTower.a, TowerManager.FrostTower.h, TowerManager.FrostTower.s, TowerManager.FrostTower.r));
    _this4.canInsertGem = false;
    _this4.levelSprFx = TowerManager.FrostTower.sr;
    _this4.name = TowerManager.FrostTower.dn;
    _this4.inner_desc_init = '在自身周围形成一个圆形的减速场\n- 无法攻击\n- 无法镶嵌传奇宝石';
    _this4.description = _this4.inner_desc_init;
    _this4.trackingList = [];

    _this4.extraEffect = () => {};

    _this4.lastFreezeTime = performance.now();
    _this4.armorDecreasingStrength = 0.9;
    return _this4;
  }

  _createClass(FrostTower, [{
    key: "levelUp",
    value: function levelUp(currentMoney) {
      const ret = _get(_getPrototypeOf(FrostTower.prototype), "levelUp", this).call(this, currentMoney);

      if (ret !== 0) {
        switch (this.level) {
          case 5:
            this.rankUp();
            this.name = '暴风雪I';
            this.description += FrostTower.rankUpDesc1;
            this.freezeInterval = 1000;
            this.freezeDuration = 400;

            this.extraEffect = msts => {
              if (this.canFreeze) {
                msts.forEach(mst => {
                  Game.callAnimation('icicle', new Position(mst.position.x - mst.radius, mst.position.y), mst.radius * 2, mst.radius * 2);
                  mst.registerFreeze(this.freezeDurationTick);
                });
                this.lastFreezeTime = performance.now();
              }
            };

            break;

          case 10:
            this.rankUp();
            this.name = '暴风雪II';
            this.description += FrostTower.rankUpDesc2.replace('$', Math.round((1 - this.armorDecreasingStrength) * 100));
            this.freezeInterval = 5000;
            this.freezeDuration = 600;

            this.extraEffect = msts => {
              if (this.canFreeze) {
                msts.forEach(mst => {
                  Game.callAnimation('icicle', new Position(mst.position.x - mst.radius, mst.position.y), mst.radius * 2, mst.radius * 2);
                  mst.registerFreeze(this.freezeDurationTick);
                  mst.inner_armor *= this.armorDecreasingStrength;
                });
                this.lastFreezeTime = performance.now();
              }
            };

            break;

          case 15:
            this.rankUp();
            this.name = '暴风雪III';
            this.description += FrostTower.rankUpDesc3;
            this.freezeInterval = 4400;
            this.freezeDuration = 800;
            break;

          case 20:
            this.rankUp();
            this.name = '暴风雪IV';
            this.freezeInterval = 4200;
            this.freezeDuration = 860;
            break;

          case 25:
            this.rankUp();
            this.name = '暴风雪V';
            this.freezeInterval = 4000;
            this.freezeDuration = 880;
            break;

          case 30:
            this.rankUp();
            this.name = '暴风雪VI';
            this.freezeInterval = 3800;
            this.freezeDuration = 900;
            break;

          case 35:
            this.rankUp();
            this.name = '暴风雪VII';
            this.freezeInterval = 3600;
            this.freezeDuration = 920;
            break;
        }
      }

      return ret;
    }
  }, {
    key: "run",
    value: function run(monsters) {
      const inRanged = monsters.filter(mst => {
        const i = this.inRange(mst);

        if (i) {
          if (mst.speedRatio === 1 || 1 - this.SPR < mst.speedRatio) mst.speedRatio = 1 - this.SPR;
        } else {
          mst.speedRatio !== 1 ? mst.speedRatio = 1 : void 0;
        }

        return i;
      });
      this.extraEffect(inRanged);
    }
  }, {
    key: "render",
    value: function render(ctx) {
      _get(_getPrototypeOf(FrostTower.prototype), "render", this).call(this, ctx);
    }
  }, {
    key: "rapidRender",
    value: function rapidRender(context) {
      if (this.canFreeze) return;
      context.fillStyle = 'rgba(25,25,25,.3)';
      Tools.renderSector(context, this.position.x, this.position.y, this.radius, 0, Math.PI * 2 * (1 - (performance.now() - this.lastFreezeTime) / this.freezeInterval), false).fill();
    }
  }, {
    key: "canFreeze",
    get: function () {
      return performance.now() - this.lastFreezeTime > this.freezeInterval;
    }
  }, {
    key: "freezeDurationTick",
    get: function () {
      return this.freezeDuration / 1000 * 60;
    }
  }, {
    key: "SPR",
    get: function () {
      return this.levelSprFx(this.level);
    }
  }, {
    key: "informationSeq",
    get: function () {
      const removing = ['攻击速度', '伤害', 'DPS', '弹药储备'];
      return _get(_getPrototypeOf(FrostTower.prototype), "informationSeq", this).filter(line => !removing.some(rm => rm === line[0])).concat([['减速强度', Tools.roundWithFixed(this.SPR * 100, 2) + '%']]);
    }
  }]);

  return FrostTower;
}(TowerBase);

_defineProperty(FrostTower, "rankUpDesc1", '\n+ 周期性造成范围冻结');

_defineProperty(FrostTower, "rankUpDesc2", '\n+ 每次冻结都能削减敌方 $% 护甲');

_defineProperty(FrostTower, "rankUpDesc3", '\n+ 冻结能力加强');

let PoisonTower = function (_TowerBase5) {
  _inherits(PoisonTower, _TowerBase5);

  function PoisonTower(position, image, bimg, radius) {
    var _this5;

    _classCallCheck(this, PoisonTower);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(PoisonTower).call(this, position, radius, 1, 'rbga(45,244,12,.4)', image, TowerManager.PoisonTower.p, TowerManager.PoisonTower.a, TowerManager.PoisonTower.h, TowerManager.PoisonTower.s, TowerManager.PoisonTower.r));
    _this5.bulletCtorName = TowerManager.PoisonTower.bctor;
    _this5.levelPatkFx = TowerManager.PoisonTower.patk;
    _this5.levelPitvFx = TowerManager.PoisonTower.pitv;
    _this5.levelPdurFx = TowerManager.PoisonTower.pdur;
    _this5.extraBulletV = 0;
    _this5.name = TowerManager.PoisonTower.dn;
    _this5.inner_desc_init = '发射毒气弹持续杀伤，总是积极切换目标\n+ 攻击速度很快\n+ 附加中毒效果\n+ 无视防御的伤害';
    _this5.description = _this5.inner_desc_init;
    return _this5;
  }

  _createClass(PoisonTower, [{
    key: "reChooseTarget",
    value: function reChooseTarget(targetList) {
      const unPoisoned = targetList.filter(m => !m.bePoisoned);
      const unTargeted = unPoisoned.filter(m => {
        return this.bulletCtl.bullets.every(b => b.constructor.name === this.bulletCtorName && b.target !== m);
      });

      for (const t of unTargeted) {
        if (this.inRange(t)) {
          this.target = t;
          return;
        }
      }

      for (const t of unPoisoned) {
        if (this.inRange(t)) {
          this.target = t;
          return;
        }
      }

      for (const t of _.shuffle(targetList)) {
        if (this.inRange(t)) {
          this.target = t;
          return;
        }
      }

      this.target = null;
    }
  }, {
    key: "produceBullet",
    value: function produceBullet() {
      const ratio = this.calculateDamageRatio(this.target);
      this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.target, this.bulletImage, this.Patk * ratio, this.Pitv, this.Pdur, this.extraBulletV);
    }
  }, {
    key: "Pitv",
    get: function () {
      return this.levelPitvFx(this.level);
    }
  }, {
    key: "Pdur",
    get: function () {
      return this.levelPdurFx(this.level);
    }
  }, {
    key: "Patk",
    get: function () {
      return this.levelPatkFx(this.level) * this.__atk_ratio * this.__anger_gem_atk_ratio;
    }
  }, {
    key: "DOTPS",
    get: function () {
      return 1000 / this.Pitv * this.Patk;
    }
  }, {
    key: "informationSeq",
    get: function () {
      return _get(_getPrototypeOf(PoisonTower.prototype), "informationSeq", this).concat([['每跳毒素伤害', Math.round(this.Patk)], ['毒素伤害频率', Tools.roundWithFixed(this.Pitv / 1000, 1) + ' 秒'], ['毒素持续', Math.round(this.Pdur / 1000) + ' 秒']]);
    }
  }, {
    key: "isCurrentTargetAvailable",
    get: function () {
      return false;
    }
  }]);

  return PoisonTower;
}(TowerBase);

let TeslaTower = function (_TowerBase6) {
  _inherits(TeslaTower, _TowerBase6);

  _createClass(TeslaTower, null, [{
    key: "renderLighteningCop",
    value: function renderLighteningCop(ctx, x1, y1, x2, y2, displace) {
      if (displace < TeslaTower.curveDetail) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      } else {
        const mid_x = (x2 + x1) / 2 + (Math.random() - .5) * displace;
        const mid_y = (y2 + y1) / 2 + (Math.random() - .5) * displace;
        this.renderLighteningCop(ctx, x1, y1, mid_x, mid_y, displace / 2);
        this.renderLighteningCop(ctx, x2, y2, mid_x, mid_y, displace / 2);

        if (Math.random() > .5) {
          const pos = new Position(x2, y2).dithering(displace / 3);
          this.renderLighteningCop(ctx, mid_x, mid_y, pos.x, pos.y, displace / 2);
        }
      }
    }
  }, {
    key: "shockRenderFrames",
    get: function () {
      return 2;
    }
  }, {
    key: "curveDetail",
    get: function () {
      return 10;
    }
  }]);

  function TeslaTower(position, image, bimg, radius) {
    var _this6;

    _classCallCheck(this, TeslaTower);

    _this6 = _possibleConstructorReturn(this, _getPrototypeOf(TeslaTower).call(this, position, radius, 1, 'rgba(252,251,34,.4)', image, TowerManager.TeslaTower.p, TowerManager.TeslaTower.a, TowerManager.TeslaTower.h, TowerManager.TeslaTower.s, TowerManager.TeslaTower.r));
    _this6.renderPermit = 0;
    _this6.name = TowerManager.TeslaTower.dn;
    _this6.extraRange = 0;
    _this6.extraHaste = 0;

    _this6.extraEffect = () => {};

    _this6.shockDuration = 5000;
    _this6.shockChargingChance = .2;
    _this6.shockChargingPowerRatio = .25;
    _this6.shockLeakingChance = .02;
    _this6.monsterShockingRenderingQueue = [];
    _this6.inner_desc_init = '向周围小范围释放电击造成中等伤害\n+ 有几率使目标带电';
    _this6.description = _this6.inner_desc_init;
    return _this6;
  }

  _createClass(TeslaTower, [{
    key: "levelUp",
    value: function levelUp(currentMoney) {
      const ret = _get(_getPrototypeOf(TeslaTower.prototype), "levelUp", this).call(this, currentMoney);

      if (ret !== 0) {
        switch (this.level) {
          case 12:
            this.rankUp();
            this.name = '特斯拉塔';
            this.image = Game.callImageBitMap(TowerManager.TeslaTower.n2);
            this.description += TeslaTower.rankUpDesc1;
            this.borderStyle = 'rgba(222,201,34,.6)';
            this.extraHaste = 0.75;
            this.shockChargingChance = .3;
            this.shockDuration = 8000;
            this.shockChargingPowerRatio = .75;
            this.shockLeakingChance = .05;
            break;

          case 24:
            this.rankUp();
            this.name = '闪电风暴塔';
            this.image = Game.callImageBitMap(TowerManager.TeslaTower.n3);
            this.description += TeslaTower.rankUpDesc2;
            this.borderStyle = 'rgba(162,161,34,.8)';
            this.extraRange = 80;
            this.shockChargingChance = .4;
            this.shockDuration = 12000;
            this.shockChargingPowerRatio = 1.5;
            this.shockLeakingChance = .12;
            break;
        }
      }

      return ret;
    }
  }, {
    key: "shock",
    value: function shock(monster) {
      const ratio = this.calculateDamageRatio(monster);
      monster.health -= this.Atk * (1 - monster.armorResistance) * ratio;
      this.recordDamage(monster);

      if (this.canCharge) {
        monster.registerShock(this.shockDurationTick, this.Atk * ratio * this.shockChargingPowerRatio, this, this.shockLeakingChance);
      }
    }
  }, {
    key: "run",
    value: function run(monsters) {
      if (this.canShoot) {
        this.gemAttackHook(monsters);
        this.renderPermit = TeslaTower.shockRenderFrames;
        monsters.forEach(mst => {
          if (this.inRange(mst)) {
            this.shock(mst);

            if (this.gem) {
              this.gem.hitHook(this, mst, monsters);
            }
          }
        });
        this.recordShootTime();
      }
    }
  }, {
    key: "calculateRandomCirclePoint",
    value: function calculateRandomCirclePoint() {
      const x = _.random(this.position.x - this.Rng, this.position.x + this.Rng, true);

      return {
        x,
        y: Math.random() > .5 ? this.position.y - Math.pow(this.Rng * this.Rng - Math.pow(x - this.position.x, 2), 0.5) : Math.pow(this.Rng * this.Rng - Math.pow(x - this.position.x, 2), 0.5) + this.position.y
      };
    }
  }, {
    key: "renderLightening",
    value: function renderLightening(ctx) {
      const {
        x,
        y
      } = this.calculateRandomCirclePoint();
      TeslaTower.renderLighteningCop(ctx, this.position.x, this.position.y, x, y, this.Rng / 2);
    }
  }, {
    key: "rapidRender",
    value: function rapidRender(ctx, monsters) {
      if (monsters.every(m => !this.inRange(m))) {
        return;
      }

      if (this.renderPermit > 0) {
        this.renderPermit--;
        ctx.strokeStyle = 'rgba(232,33,214,.5)';
        const t = ctx.lineWidth;
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let i = 0; i < 10; i++) {
          this.renderLightening(ctx);
        }

        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = t;
      }

      ctx.strokeStyle = 'rgba(153,204,255,.5)';
      ctx.beginPath();
      this.monsterShockingRenderingQueue = this.monsterShockingRenderingQueue.filter(msrq => {
        TeslaTower.renderLighteningCop(ctx, ...msrq.args);
        return --msrq.time > 0;
      });
      ctx.closePath();
      ctx.stroke();
    }
  }, {
    key: "canCharge",
    get: function () {
      return Math.random() > 1 - this.shockChargingChance;
    }
  }, {
    key: "shockDurationTick",
    get: function () {
      return this.shockDuration / 1000 * 60;
    }
  }, {
    key: "Rng",
    get: function () {
      return _get(_getPrototypeOf(TeslaTower.prototype), "Rng", this) + this.reviceRange(this.extraRange);
    }
  }, {
    key: "HstPS",
    get: function () {
      return _get(_getPrototypeOf(TeslaTower.prototype), "HstPS", this) + this.extraHaste;
    }
  }, {
    key: "informationSeq",
    get: function () {
      const removing = ['弹药储备'];
      return _get(_getPrototypeOf(TeslaTower.prototype), "informationSeq", this).filter(line => !removing.some(rm => rm === line[0]));
    }
  }, {
    key: "lighteningAmount",
    get: function () {
      return [null, 10, 20][this.rank];
    }
  }]);

  return TeslaTower;
}(TowerBase);

_defineProperty(TeslaTower, "rankUpDesc1", '\n+ 攻击频率得到加强');

_defineProperty(TeslaTower, "rankUpDesc2", '\n+ 射程得到加强');

let BlackMagicTower = function (_TowerBase7) {
  _inherits(BlackMagicTower, _TowerBase7);

  function BlackMagicTower(position, image, bimg, radius) {
    var _this7;

    _classCallCheck(this, BlackMagicTower);

    _this7 = _possibleConstructorReturn(this, _getPrototypeOf(BlackMagicTower).call(this, position, radius, 1, 'rgba(223,14,245,.2)', image, TowerManager.BlackMagicTower.p, TowerManager.BlackMagicTower.a, TowerManager.BlackMagicTower.h, TowerManager.BlackMagicTower.s, TowerManager.BlackMagicTower.r));
    _this7.levelIdeFx = TowerManager.BlackMagicTower.ide;
    _this7.levelIdrFx = TowerManager.BlackMagicTower.idr;
    _this7.imprecationPower = 0;
    _this7.imprecationHaste = 1;
    _this7.name = TowerManager.BlackMagicTower.dn;
    _this7.extraPower = 0;
    _this7.voidSummonChance = 3;
    _this7.POTCHD = 0;
    _this7.inner_desc_init = '释放强力魔法\n- 准备时间非常长\n+ 附加诅咒，使目标受到的伤害提高\n+ 每次击杀增加 10 攻击力并提高 5% 攻击速度（最多提高 1600%）';
    _this7.description = _this7.inner_desc_init;
    return _this7;
  }

  _createClass(BlackMagicTower, [{
    key: "levelUp",
    value: function levelUp(currentMoney) {
      const ret = _get(_getPrototypeOf(BlackMagicTower.prototype), "levelUp", this).call(this, currentMoney);

      if (ret !== 0) {
        switch (this.level) {
          case 5:
            this.rankUp();
            this.name = '奥术魔法塔';
            this.image = Game.callImageBitMap(TowerManager.BlackMagicTower.n2);
            this.description = this.inner_desc_init + BlackMagicTower.rankUpDesc1;
            this.borderStyle = 'rgba(223,14,245,.4)';
            this.extraPower = 666;
            this.levelAtkFx = TowerManager.BlackMagicTower.a2;
            break;

          case 10:
            this.rankUp();
            this.name = '黑魔法塔';
            this.image = Game.callImageBitMap(TowerManager.BlackMagicTower.n3);
            this.description = this.inner_desc_init + BlackMagicTower.rankUpDesc2;
            this.borderStyle = 'rgba(223,14,245,.6)';
            this.extraPower = 2664;
            this.levelAtkFx = TowerManager.BlackMagicTower.a3;
            break;

          case 15:
            this.rankUp();
            this.name = '虚空塔';
            this.image = Game.callImageBitMap(TowerManager.BlackMagicTower.n4);
            this.description = this.inner_desc_init + BlackMagicTower.rankUpDesc3;
            this.borderStyle = 'rgba(223,14,245,.8)';
            this.extraPower = 10654;
            this.levelAtkFx = TowerManager.BlackMagicTower.a4;
            this.POTCHD = .08;
            break;
        }
      }

      return ret;
    }
  }, {
    key: "reChooseTarget",
    value: function reChooseTarget(targetList) {
      this.target = _.maxBy(targetList.filter(t => this.inRange(t)), '__inner_current_health');
    }
  }, {
    key: "produceBullet",
    value: function produceBullet() {
      const w = 82;
      const h = 50;
      const position = new Position(this.target.position.x - w / 2, this.target.position.y - h / 2);
      Game.callAnimation('magic_2', position, w, h, 1, 2);
      this.target.health -= this.Atk * this.calculateDamageRatio(this.target) + this.target.__inner_current_health * this.POTCHD;
      this.recordDamage(this.target);

      if (this.target.isDead) {
        this.imprecationPower += 10;
        if (this.imprecationHaste * 100 - 100 < 1600) this.imprecationHaste += 0.05;
      }

      this.target.registerImprecate(this.Idr / 1000 * 60, this.Ide);
    }
  }, {
    key: "rapidRender",
    value: function rapidRender(ctx) {
      if (this.HstPS < 45) this.renderPreparationBar(ctx);
    }
  }, {
    key: "HstPS",
    get: function () {
      return _get(_getPrototypeOf(BlackMagicTower.prototype), "HstPS", this) * this.imprecationHaste;
    }
  }, {
    key: "Atk",
    get: function () {
      return _get(_getPrototypeOf(BlackMagicTower.prototype), "Atk", this) + this.imprecationPower + this.extraPower;
    }
  }, {
    key: "Ide",
    get: function () {
      return this.levelIdeFx(this.level) + 1;
    }
  }, {
    key: "Idr",
    get: function () {
      return this.levelIdrFx(this.level);
    }
  }, {
    key: "informationSeq",
    get: function () {
      return _get(_getPrototypeOf(BlackMagicTower.prototype), "informationSeq", this).concat([['诅咒易伤', Tools.roundWithFixed(this.Ide * 100 - 100, 2) + '%'], ['诅咒时间', Tools.roundWithFixed(this.Idr / 1000, 2) + ' 秒'], ['额外攻击力', Tools.chineseFormatter(this.imprecationPower, 0)], ['额外攻击速度', Tools.roundWithFixed(this.imprecationHaste * 100 - 100, 1) + '%']]);
    }
  }]);

  return BlackMagicTower;
}(TowerBase);

_defineProperty(BlackMagicTower, "rankUpDesc1", '\n+ 伤害得到加强');

_defineProperty(BlackMagicTower, "rankUpDesc2", '\n+ 伤害得到大幅加强');

_defineProperty(BlackMagicTower, "rankUpDesc3", '\n+ 伤害得到大幅加强，附加目标当前生命值 8% 的额外伤害');

_defineProperty(BlackMagicTower, "deniedGems", ['GogokOfSwiftness']);

let LaserTower = function (_TowerBase8) {
  _inherits(LaserTower, _TowerBase8);

  function LaserTower(position, image, bimg, radius) {
    var _this8;

    _classCallCheck(this, LaserTower);

    _this8 = _possibleConstructorReturn(this, _getPrototypeOf(LaserTower).call(this, position, radius, 1, 'rgba(17,54,245,.2)', image, TowerManager.LaserTower.p, TowerManager.LaserTower.a, TowerManager.LaserTower.h, TowerManager.LaserTower.s, TowerManager.LaserTower.r));
    _this8.lasers = [];
    _this8.levelFlameAtkFx = TowerManager.LaserTower.fatk;
    _this8.levelFlameWidthFx = TowerManager.LaserTower.fw;
    _this8.levelLaserSwipeDistanceFx = TowerManager.LaserTower.lsd;
    _this8.name = TowerManager.LaserTower.dn;
    _this8.extraFlameDamage = 0;
    _this8.extraLuminousDamage = 0;
    _this8.extraLaserTransmitter = 0;
    _this8.extraFlameWidth = 0;
    _this8.extraRange = 0;
    _this8.lineStyles = [['rgba(244,188,174,.4)', 'rgba(204,21,12,.7)'], ['rgba(244,188,174,.4)', 'rgba(254,21,12,.7)'], ['rgba(204,204,255,.4)', 'rgba(0,51,253,.7)'], ['rgba(204,204,255,.4)', 'rgba(0,51,253,.7)'], ['rgba(255,153,0,.4)', 'rgba(153,0,51,.7)']];
    _this8.inner_desc_init = '发射激光，横扫大面积的目标，造成范围的火焰伤害';
    _this8.description = _this8.inner_desc_init;
    return _this8;
  }

  _createClass(LaserTower, [{
    key: "levelUp",
    value: function levelUp(currentMoney) {
      const ret = _get(_getPrototypeOf(LaserTower.prototype), "levelUp", this).call(this, currentMoney);

      if (ret !== 0) {
        switch (this.level) {
          case 8:
            this.rankUp();
            this.name = '高能激光塔';
            this.image = Game.callImageBitMap(TowerManager.LaserTower.n2);
            this.description += LaserTower.rankUpDesc1;
            this.borderStyle = 'rgba(17,54,245,.3)';
            this.extraFlameDamage = 220;
            break;

          case 16:
            this.rankUp();
            this.name = '热能射线塔';
            this.image = Game.callImageBitMap(TowerManager.LaserTower.n3);
            this.description += LaserTower.rankUpDesc2;
            this.borderStyle = 'rgba(17,54,245,.4)';
            this.extraLuminousDamage = 140;
            break;

          case 32:
            this.rankUp();
            this.name = '多重热能射线塔';
            this.image = Game.callImageBitMap(TowerManager.LaserTower.n4);
            this.description += LaserTower.rankUpDesc3;
            this.borderStyle = 'rgba(17,54,245,.5)';
            this.levelSlcFx = TowerManager.LaserTower.s2;
            this.extraFlameDamage = 420;
            this.extraLuminousDamage = 220;
            break;

          case 64:
            this.rankUp();
            this.name = '巨像';
            this.image = Game.callImageBitMap(TowerManager.LaserTower.n5);
            this.description += LaserTower.rankUpDesc4;
            this.borderStyle = 'rgba(17,54,245,.8)';
            this.extraFlameDamage = 640;
            this.extraLuminousDamage = 380;
            this.levelSlcFx = TowerManager.LaserTower.s3;
            this.levelHstFx = TowerManager.LaserTower.h2;
            this.extraRange = 50;
            this.extraFlameWidth = 40;
            break;
        }
      }

      return ret;
    }
  }, {
    key: "produceBullet",
    value: function produceBullet(i, monsters) {
      const v = new Position(this.target.position.x, this.target.position.y);
      const r = this.Fwd / 2 + Game.callGridSideSize() / 3 - 2;
      const mvrc = .7;
      const arcTime = Math.ceil((this.Lsd / r - 2) / mvrc + 1) + 1;

      const swipeVector = _.maxBy(_.range(0, 360, 30).map(d => new PolarVector(this.Lsd, d)), sv => monsters.filter(mst => v.copy().move(sv.normalize().multiply(mvrc * (arcTime - 1) * r)).equal(mst.position, 1.2 * r)).length).dithering(1 / 30 * Math.PI);

      this.lasers.push(new LaserTower.Laser(this.position, this.target.position, this.LlW, 500, swipeVector, Tools.EaseFx.linear, this.laserLineStyle[0], this.laserLineStyle[1]));
      const flameArea = new Path2D();

      for (let i = 0; i < arcTime; i++) {
        const t = v.copy().move(swipeVector.normalize().multiply(mvrc * i * r));
        flameArea.arc(t.x, t.y, r, 0, Math.PI * 2);
      }

      this.target.health -= this.Atk * (1 - this.target.armorResistance) * this.calculateDamageRatio(this.target);
      this.recordDamage(this.target);
      monsters.forEach(mst => {
        if (Game.callCanvasContext('bg').isPointInPath(flameArea, mst.position.x, mst.position.y)) {
          mst.health -= this.extraLuminousDamage * this.calculateDamageRatio(mst);
          this.recordDamage(this.target);
          mst.health -= this.Fatk * (1 - mst.armorResistance) * this.calculateDamageRatio(mst);
          this.recordDamage(this.target);
        }
      });
    }
  }, {
    key: "rapidRender",
    value: function rapidRender(ctx) {
      this.lasers = this.lasers.filter(ls => {
        ls.renderStep(ctx);
        return !ls.fulfilled;
      });
    }
  }, {
    key: "Rng",
    get: function () {
      return _get(_getPrototypeOf(LaserTower.prototype), "Rng", this) + this.reviceRange(this.extraRange);
    }
  }, {
    key: "Slc",
    get: function () {
      return _get(_getPrototypeOf(LaserTower.prototype), "Slc", this) + this.extraLaserTransmitter;
    }
  }, {
    key: "Lsd",
    get: function () {
      return this.levelLaserSwipeDistanceFx(this.level);
    }
  }, {
    key: "Fatk",
    get: function () {
      return this.levelFlameAtkFx(this.level) + this.extraFlameDamage;
    }
  }, {
    key: "Fwd",
    get: function () {
      return this.levelFlameWidthFx(this.level) + this.extraFlameWidth;
    }
  }, {
    key: "LlW",
    get: function () {
      return 3 + Math.floor(this.rank / 2);
    }
  }, {
    key: "informationSeq",
    get: function () {
      return _get(_getPrototypeOf(LaserTower.prototype), "informationSeq", this).concat([['火焰伤害', Math.round(this.Fatk)], ['扫射距离', Tools.roundWithFixed(this.Lsd, 1)], ['扫射宽度', Tools.roundWithFixed(this.Fwd, 1)], ['额外火焰伤害', Math.round(this.extraFlameDamage)], ['额外电浆伤害', Math.round(this.extraLuminousDamage)]]);
    }
  }, {
    key: "laserLineStyle",
    get: function () {
      return this.lineStyles[this.rank];
    }
  }]);

  return LaserTower;
}(TowerBase);

_defineProperty(LaserTower, "Laser", (_temp2 = _class2 = function () {
  function _ColossusLaser(startPos, endPos, lineWidth, duration, swipeVector, easingFunc, ls1, ls2) {
    _classCallCheck(this, _ColossusLaser);

    this.sx = startPos.x;
    this.sy = startPos.y;
    this.ep = endPos.copy();
    this.swipeVector = swipeVector;
    this.lineWidth = lineWidth;
    this.lineStylesOuter = ls1;
    this.lineStylesInner = ls2;
    const updateTime = 1000 / 60;
    const updateCount = duration / updateTime;
    this.perUpdateDistance = 1 / updateCount;
    this.currentStep = 0;
    const maxAnimationCount = Math.floor(this.swipeVector.r / (Math.max(_ColossusLaser.animationW, _ColossusLaser.animationH) + 1));
    this.animationStepInterval = maxAnimationCount >= updateCount ? 1 : Math.ceil(updateTime / maxAnimationCount);
    this.stepPosition = 0;
    this.easingFx = easingFunc || Tools.EaseFx.linear;
    this.fulfilled = false;
  }

  _createClass(_ColossusLaser, [{
    key: "renderStep",
    value: function renderStep(ctx) {
      if (this.fulfilled) return;
      const stepEndPos = this.step;

      if (this.canAnimate) {
        Game.callAnimation(_ColossusLaser.animationName, stepEndPos, _ColossusLaser.animationW, _ColossusLaser.animationH, _ColossusLaser.animationSpeed, 400);
      }

      const pt = new Path2D();
      pt.moveTo(this.sx, this.sy);
      pt.lineTo(stepEndPos.x, stepEndPos.y);
      pt.closePath();
      const t = ctx.lineWidth;
      ctx.strokeStyle = this.lineStylesOuter;
      ctx.lineWidth = this.lineWidth + 2;
      ctx.stroke(pt);
      ctx.strokeStyle = this.lineStylesInner;
      ctx.lineWidth = this.lineWidth - 2;
      ctx.stroke(pt);
      ctx.lineWidth = t;
    }
  }, {
    key: "step",
    get: function () {
      if (this.stepPosition > 1) {
        this.fulfilled = true;
      }

      this.stepPosition += this.perUpdateDistance;
      this.currentStep++;
      const step = this.swipeVector.r * this.easingFx(this.stepPosition);
      return this.ep.copy().move(this.swipeVector.normalize().multiply(step));
    }
  }, {
    key: "canAnimate",
    get: function () {
      return this.currentStep % this.animationStepInterval === 0;
    }
  }]);

  return _ColossusLaser;
}(), _defineProperty(_class2, "animationW", 36), _defineProperty(_class2, "animationH", 36), _defineProperty(_class2, "animationName", 'explo_3'), _defineProperty(_class2, "animationSpeed", .5), _temp2));

_defineProperty(LaserTower, "rankUpDesc1", '\n+ 伤害得到加强');

_defineProperty(LaserTower, "rankUpDesc2", '\n+ 造成额外电浆伤害(无视防御)');

_defineProperty(LaserTower, "rankUpDesc3", '\n+ 发射多束射线');

_defineProperty(LaserTower, "rankUpDesc4", '\n+ 所有属性得到增强');

let CarrierTower = function (_TowerBase9) {
  _inherits(CarrierTower, _TowerBase9);

  _createClass(CarrierTower, null, [{
    key: "F1Mode",
    set: function (v) {
      Game.callChangeF1Mode(v);
      this.__inner_f1_mode = v;
    },
    get: function () {
      return this.__inner_f1_mode;
    }
  }, {
    key: "WeaponMode",
    set: function (v) {
      Game.callChangeCarrierWeaponMode(v);
      this.__inner_wp_mode = v;
    },
    get: function () {
      return this.__inner_wp_mode;
    }
  }]);

  function CarrierTower(position, image, bimg, radius) {
    var _this9;

    _classCallCheck(this, CarrierTower);

    _this9 = _possibleConstructorReturn(this, _getPrototypeOf(CarrierTower).call(this, position, radius, 1, 'rgba(56,243,12,.5)', image, TowerManager.CarrierTower.p, TowerManager.CarrierTower.a, TowerManager.CarrierTower.h, TowerManager.CarrierTower.s, TowerManager.CarrierTower.r));
    _this9.jets = 0;
    _this9.levelSpdFx = TowerManager.CarrierTower.spd;
    _this9.levelKcFx = TowerManager.CarrierTower.child;
    _this9.name = TowerManager.CarrierTower.dn;
    _this9.inner_desc_init = '自身无法攻击，释放搭载的载机进行战斗\n使用 [F1] 切换载机的自主/受控模式\n使用 [Q] 切换载机的武器\n+ 载机继承自身属性\n+ 可以对任意位置进行机动打击';
    _this9.description = _this9.inner_desc_init;
    return _this9;
  }

  _createClass(CarrierTower, [{
    key: "run",
    value: function run() {
      if (this.canShoot && this.jets < this.KidCount) {
        Game.callTowerFactory('CarrierTower.Jet', this.position.copy().dithering(this.radius * 2, this.radius), Game.callImageBitMap(TowerManager.CarrierTower.cn), null, Game.callGridSideSize() / 4, this);
        this.jets++;
      }
    }
  }, {
    key: "renderRange",
    value: function renderRange() {}
  }, {
    key: "destory",
    value: function destory() {
      _get(_getPrototypeOf(CarrierTower.prototype), "destory", this).call(this);

      Game.callIndependentTowerList().filter(tow => tow.carrierTower && tow.carrierTower === this).forEach(tow => tow.isSold = true);
    }
  }, {
    key: "informationSeq",
    get: function () {
      return _get(_getPrototypeOf(CarrierTower.prototype), "informationSeq", this).concat([['载机量', this.KidCount]]);
    }
  }, {
    key: "KidCount",
    get: function () {
      return this.levelKcFx(this.level);
    }
  }, {
    key: "Spd",
    get: function () {
      return this.levelSpdFx(this.level);
    }
  }]);

  return CarrierTower;
}(TowerBase);

_defineProperty(CarrierTower, "__inner_f1_mode", false);

_defineProperty(CarrierTower, "__inner_wp_mode", 1);

_defineProperty(CarrierTower, "deniedGems", ['ZeisStoneOfVengeance', 'GemOfAnger']);

_defineProperty(CarrierTower, "Jet", (_temp3 = _class3 = function (_TowerBase10) {
  _inherits(_Jet, _TowerBase10);

  function _Jet(position, image, bimg, radius, carrierTower) {
    var _this10;

    _classCallCheck(this, _Jet);

    _this10 = _possibleConstructorReturn(this, _getPrototypeOf(_Jet).call(this, position, radius, 0, null, image, [], carrierTower.levelAtkFx, carrierTower.levelHstFx, carrierTower.levelSlcFx, carrierTower.levelRngFx));
    _this10.controlable = true;
    _this10.name = '航母载机';
    _this10.carrierTower = carrierTower;
    _this10.canInsertGem = false;
    _this10.actMode = _Jet.JetActMode.autonomous;
    _this10.weaponMode = 1;
    _this10.destinationPosition = Position.O;
    _this10.inner_desc_init = '航母的载机\n+ 机动性极强\n+ 拥有 15mm 速射机枪和 30mm 反装甲机炮两种武器';
    _this10.description = _this10.inner_desc_init;
    return _this10;
  }

  _createClass(_Jet, [{
    key: "gemAttackHook",
    value: function gemAttackHook(...args) {
      this.carrierTower.gemAttackHook(...args);
    }
  }, {
    key: "gemHitHook",
    value: function gemHitHook(...args) {
      this.carrierTower.target = this.target;
      this.carrierTower.gemHitHook(...args);
    }
  }, {
    key: "calculateDamageRatio",
    value: function calculateDamageRatio(...args) {
      const ratio = this.carrierTower.calculateDamageRatio(...args);
      return ratio;
    }
  }, {
    key: "reChooseMostThreateningTarget",
    value: function reChooseMostThreateningTarget(targetList) {
      this.target = _.minBy(targetList, mst => {
        return Position.distancePow2(Game.callDestinationPosition(), mst.position);
      });
    }
  }, {
    key: "autonomouslyRun",
    value: function autonomouslyRun(monsters) {
      if (!this.hasCurrentTarget) {
        this.reChooseMostThreateningTarget(monsters);
      }

      if (this.hasCurrentTarget) {
        if (this.inRange(this.target)) {
          if (this.canShoot) {
            this.shoot(monsters);
          }
        } else {
            this.position.moveTo(this.target.position, this.Spd);
          }
      }
    }
  }, {
    key: "run",
    value: function run(monsters) {
      switch (this.actMode) {
        case _Jet.JetActMode.autonomous:
          this.autonomouslyRun(monsters);
          break;

        case _Jet.JetActMode.f1:
          _get(_getPrototypeOf(_Jet.prototype), "run", this).call(this, monsters);

          if (Position.distance(this.position, this.destinationPosition) > this.radius * 2) {
            this.position.moveTo(this.destinationPosition, this.Spd);
          }

          break;
      }
    }
  }, {
    key: "render",
    value: function render() {}
  }, {
    key: "renderLevel",
    value: function renderLevel() {}
  }, {
    key: "renderImage",
    value: function renderImage(ctx) {
      if (this.target) {
        BulletBase.prototype.renderImage.call(this, ctx);
      } else {
        _get(_getPrototypeOf(_Jet.prototype), "renderImage", this).call(this, ctx);
      }
    }
  }, {
    key: "rapidRender",
    value: function rapidRender(ctxRapid) {
      _get(_getPrototypeOf(_Jet.prototype), "render", this).call(this, ctxRapid);
    }
  }, {
    key: "recordDamage",
    value: function recordDamage(...args) {
      this.carrierTower.recordDamage(...args);
    }
  }, {
    key: "recordKill",
    value: function recordKill(...args) {
      this.carrierTower.recordKill(...args);
    }
  }, {
    key: "bulletCtorName",
    get: function () {
      return CarrierTower.Jet.JetWeapons.getCtorName(this.weaponMode);
    },
    set: function (v) {}
  }, {
    key: "attackSupplement",
    get: function () {
      return this.weaponMode === 1 ? this.carrierTower.Atk * -0.2 : Math.pow(this.level + 2, 1.566) * 3;
    }
  }, {
    key: "hasteSupplementRate",
    get: function () {
      return this.weaponMode === 1 ? 1 + this.level * 0.015 : 1 - this.level * 0.0025;
    }
  }, {
    key: "Atk",
    get: function () {
      return this.carrierTower.Atk + this.attackSupplement;
    }
  }, {
    key: "Slc",
    get: function () {
      return this.carrierTower.Slc + (this.weaponMode === 1 ? 1 : 0);
    }
  }, {
    key: "Rng",
    get: function () {
      return this.carrierTower.Rng;
    }
  }, {
    key: "HstPS",
    get: function () {
      return this.carrierTower.HstPS * this.hasteSupplementRate;
    }
  }, {
    key: "Spd",
    get: function () {
      return this.carrierTower.Spd;
    }
  }, {
    key: "level",
    get: function () {
      return this.carrierTower.level;
    },
    set: function (v) {}
  }, {
    key: "exploitsSeq",
    get: function () {
      return [];
    }
  }, {
    key: "informationSeq",
    get: function () {
      const removing = ['等级', '下一级', '售价'];
      return _get(_getPrototypeOf(_Jet.prototype), "informationSeq", this).filter(line => !removing.some(rm => rm === line[0]));
    }
  }, {
    key: "hasCurrentTarget",
    get: function () {
      return this.target && !this.target.isDead;
    }
  }, {
    key: "sellingPrice",
    get: function () {
      return 0;
    }
  }]);

  return _Jet;
}(TowerBase), _defineProperty(_class3, "JetActMode", {
  autonomous: 1,
  f1: 2,

  switch(oldMode) {
    return oldMode === this.autonomous ? this.f1 : this.autonomous;
  }

}), _defineProperty(_class3, "JetWeapons", {
  getCtorName(mode) {
    return mode === 1 ? 'CarrierTower.Jet.JetWeapons.MachineGun' : 'CarrierTower.Jet.JetWeapons.AutoCannons';
  },

  MachineGun: function (_BulletBase2) {
    _inherits(_MachineGun, _BulletBase2);

    function _MachineGun(position, atk, target) {
      _classCallCheck(this, _MachineGun);

      const bVelocity = 18;
      return _possibleConstructorReturn(this, _getPrototypeOf(_MachineGun).call(this, position, 1, 0, null, 'rgb(55,14,11)', atk, bVelocity, target));
    }

    _createClass(_MachineGun, [{
      key: "hit",
      value: function hit(monster, magnification = 1) {
        monster.health -= this.Atk * magnification * (1 - monster.armorResistance * 0.85);
        this.emitter(monster);
      }
    }]);

    return _MachineGun;
  }(BulletBase),
  AutoCannons: function (_BulletBase3) {
    _inherits(_AutoCannons, _BulletBase3);

    function _AutoCannons(position, atk, target) {
      _classCallCheck(this, _AutoCannons);

      const bVelocity = 6;
      return _possibleConstructorReturn(this, _getPrototypeOf(_AutoCannons).call(this, position, 2, 1, '#CC3333', '#99CC99', atk, bVelocity, target));
    }

    _createClass(_AutoCannons, [{
      key: "hit",
      value: function hit(monster, magnification = 1) {
        monster.health -= this.Atk * magnification * (1 - monster.armorResistance * .75) + monster.inner_armor * .75;
        this.emitter(monster);
      }
    }]);

    return _AutoCannons;
  }(BulletBase)
}), _temp3));
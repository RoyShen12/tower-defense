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

let Tools = function () {
  function Tools() {
    _classCallCheck(this, Tools);
  }

  _createClass(Tools, null, [{
    key: "k_m_b_Formatter",
    value: function k_m_b_Formatter(num, precise = 1, useBillion = false) {
      const thisAbs = Math.abs(num);

      if (thisAbs < 1e3) {
        return num;
      } else if (thisAbs < 1e6) {
        return this.roundWithFixed(num / 1000, precise) + ' k';
      } else if (thisAbs < 1e9) {
        return this.roundWithFixed(num / 1000000, precise) + ' m';
      } else {
        return useBillion ? Tools.formatterUs.format(Math.sign(num) * this.roundWithFixed(thisAbs / 1000000000, precise)) + ' b' : this.roundWithFixed(num / 1000000, precise) + ' m';
      }
    }
  }, {
    key: "chineseFormatter",
    value: function chineseFormatter(num, precise = 3, block = '') {
      const thisAbs = Math.abs(num);

      if (thisAbs < 1e4) {
        return this.roundWithFixed(num, precise) + '';
      } else if (thisAbs < 1e8) {
        return this.roundWithFixed(num / 1e4, precise) + block + '万';
      } else if (thisAbs < 1e12) {
        return this.roundWithFixed(num / 1e8, precise) + block + '亿';
      } else if (thisAbs < 1e16) {
        return this.roundWithFixed(num / 1e12, precise) + block + '兆';
      } else if (thisAbs < 1e20) {
        return this.roundWithFixed(num / 1e16, precise) + block + '京';
      } else {
          return this.roundWithFixed(num / 1e20, precise) + block + '垓';
        }
    }
  }, {
    key: "roundWithFixed",
    value: function roundWithFixed(num, fractionDigits) {
      const t = 10 ** fractionDigits;
      return Math.round(num * t) / t;
    }
  }, {
    key: "randomStr",
    value: function randomStr(bits) {
      return new Array(bits).fill(1).map(() => ((Math.random() * 16 | 0) & 0xf).toString(16)).join('');
    }
  }, {
    key: "randomSig",
    value: function randomSig() {
      return Math.random() < 0.5 ? 1 : -1;
    }
  }, {
    key: "isNumberSafe",
    value: function isNumberSafe(numberLike) {
      return numberLike !== '' && numberLike !== ' ' && !isNaN(numberLike);
    }
  }, {
    key: "renderSector",
    value: function renderSector(ctx, x, y, r, angle1, angle2, anticlock) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, r, angle1, angle2, anticlock);
      ctx.closePath();
      ctx.restore();
      return ctx;
    }
  }, {
    key: "renderRoundRect",
    value: function renderRoundRect(ctx, x, y, width, height, radius, fill = false, stroke = true) {
      radius = radius || 5;

      if (typeof radius === 'number') {
        radius = {
          tl: radius,
          tr: radius,
          br: radius,
          bl: radius
        };
      } else {
        const defaultRadius = {
          tl: 0,
          tr: 0,
          br: 0,
          bl: 0
        };

        for (const side in defaultRadius) {
          radius[side] = radius[side] || defaultRadius[side];
        }
      }

      ctx.beginPath();
      ctx.moveTo(x + radius.tl, y);
      ctx.lineTo(x + width - radius.tr, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
      ctx.lineTo(x + width, y + height - radius.br);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
      ctx.lineTo(x + radius.bl, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
      ctx.lineTo(x, y + radius.tl);
      ctx.quadraticCurveTo(x, y, x + radius.tl, y);
      ctx.closePath();

      if (fill) {
        ctx.fill();
      }

      if (stroke) {
        ctx.stroke();
      }
    }
  }, {
    key: "installDot",
    value: function installDot(target, dotDebuffName, duration, interval, singleAttack, isIgnoreArmor, damageEmitter) {
      if (typeof target[dotDebuffName] !== 'boolean') {
        console.log(target);
        throw new Error('target has no debuff mark as name ' + dotDebuffName);
      }

      if (target[dotDebuffName] || target.isDead) {
        return;
      } else {
        let dotCount = 0;
        target[dotDebuffName] = true;
        const itv = setInterval(() => {
          if (++dotCount > duration / interval) {
            target[dotDebuffName] = false;
            clearInterval(itv);
            return;
          }

          if (target.health > 0) {
            target.health -= singleAttack * (isIgnoreArmor ? 1 : 1 - target.armorResistance);
            damageEmitter(target);
          } else {
            clearInterval(itv);
          }
        }, interval);
      }
    }
  }, {
    key: "installDotDuplicated",
    value: function installDotDuplicated(target, dotDebuffName, duration, interval, singleAttack, isIgnoreArmor, damageEmitter) {
      if (!Array.isArray(target[dotDebuffName])) {
        console.log(target);
        throw new Error('target has no debuff mark as name ' + dotDebuffName);
      }

      if (target.isDead) {
        return;
      } else {
        const thisId = this.randomStr(8);
        let dotCount = 0;
        target[dotDebuffName].push(thisId);
        const itv = setInterval(() => {
          if (++dotCount > duration / interval) {
            target[dotDebuffName] = target[dotDebuffName].filter(d => d !== thisId);
            clearInterval(itv);
            return;
          }

          if (target.health > 0) {
            target.health -= singleAttack * (isIgnoreArmor ? 1 : 1 - target.armorResistance);
            damageEmitter(target);
          } else {
            clearInterval(itv);
          }
        }, interval);
      }
    }
  }]);

  return Tools;
}();

_defineProperty(Tools, "Dom", (_temp = _class = function () {
  function _Dom() {
    _classCallCheck(this, _Dom);
  }

  _createClass(_Dom, null, [{
    key: "__installOptionOnNode",
    value: function __installOptionOnNode(node, option) {
      _.forOwn(option, (v, k) => {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'function') {
          node[k] = v;
        } else if (typeof v === 'object') {
          _.forOwn(v, (subv, subk) => {
            node[k][subk] = [subv];
          });
        }
      });
    }
  }, {
    key: "genetateDiv",
    value: function genetateDiv(node, option) {
      option = option || {};
      const div = document.createElement('div');

      this.__installOptionOnNode(div, option);

      node.appendChild(div);
      return div;
    }
  }, {
    key: "generateImg",
    value: function generateImg(node, src, option) {
      option = option || {};
      const img = document.createElement('img');
      img.src = src;

      this.__installOptionOnNode(img, option);

      node.appendChild(img);
      return img;
    }
  }, {
    key: "generateTwoCol",
    value: function generateTwoCol(node, leftOpt, rightOpt, leftChildren = [], rightChildren = []) {
      leftOpt = leftOpt || {};
      rightOpt = rightOpt || {};
      const colL = document.createElement('div');
      colL.className = 'col';

      this.__installOptionOnNode(colL, leftOpt);

      leftChildren.forEach(child => colL.appendChild(child));
      const colR = document.createElement('div');
      colR.className = 'col';

      this.__installOptionOnNode(colR, rightOpt);

      rightChildren.forEach(child => colR.appendChild(child));
      node.appendChild(colL);
      node.appendChild(colR);
      return [colL, colR];
    }
  }, {
    key: "generateRow",
    value: function generateRow(node, className, option = {}, children = []) {
      if (!Array.isArray(children)) {
        console.log(arguments);
        throw new TypeError('Tools.generateRow wrong parameters');
      }

      const row = document.createElement('div');
      row.className = className || 'row';
      option = option || {};

      this.__installOptionOnNode(row, option);

      children.forEach(child => row.appendChild(child));
      node.appendChild(row);
      return row;
    }
  }, {
    key: "removeAllChildren",
    value: function removeAllChildren(node) {
      while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
      }
    }
  }, {
    key: "removeNodeTextAndStyle",
    value: function removeNodeTextAndStyle(node, className = 'row') {
      if (node.style.color) node.style.color = '';
      if (node.style.marginBottom) node.style.marginBottom = '';
      if (node.textContent) node.textContent = '';
      if (node.className != className) node.className = className;
    }
  }, {
    key: "bindLongPressEventHelper",
    value: function bindLongPressEventHelper(uniqueId, node, onPressFx, onPressFxCallDelay, onPressFxCallInterval, accDelay, accInterval) {
      accDelay = accDelay || Infinity;
      let timerInst = -1;

      if (!this._instance.has(uniqueId)) {
        this._instance.set(uniqueId, -1);
      }

      node.onmousedown = () => {
        timerInst = setTimeout(() => {
          const startLevel1 = performance.now();
          const intervalInst = setInterval(() => {
            const cancel = onPressFx();

            if (cancel) {
              clearInterval(this._instance.get(uniqueId));

              this._instance.set(uniqueId, -1);
            } else if (performance.now() - startLevel1 > accDelay) {
              clearInterval(this._instance.get(uniqueId));

              this._instance.set(uniqueId, setInterval(() => {
                const cancel = onPressFx();

                if (cancel) {
                  clearInterval(this._instance.get(uniqueId));

                  this._instance.set(uniqueId, -1);
                }
              }, accInterval));
            }
          }, onPressFxCallInterval);

          this._instance.set(uniqueId, intervalInst);
        }, onPressFxCallDelay);
      };

      const cancelTokenFx = () => {
        if (timerInst > 0) {
          clearTimeout(timerInst);
          timerInst = -1;
        }

        if (this._instance.get(uniqueId) > 0) {
          clearInterval(this._instance.get(uniqueId));

          this._instance.set(uniqueId, -1);
        }
      };

      node.onmouseup = cancelTokenFx;
      node.onmouseleave = cancelTokenFx;
    }
  }]);

  return _Dom;
}(), _defineProperty(_class, "_cache", new Map()), _defineProperty(_class, "_instance", new Map()), _temp));

_defineProperty(Tools, "Media", function _Media() {
  _classCallCheck(this, _Media);
});

_defineProperty(Tools, "formatterUs", new Intl.NumberFormat('en-US'));

_defineProperty(Tools, "formatterCh", new Intl.NumberFormat('zh-u-nu-hanidec'));

_defineProperty(Tools, "EaseFx", (_temp2 = _class2 = function _Ease() {
  _classCallCheck(this, _Ease);
}, _defineProperty(_class2, "c1", 1.70158), _defineProperty(_class2, "c2", _class2.c1 * 1.525), _defineProperty(_class2, "c3", _class2.c1 + 1), _defineProperty(_class2, "c4", 2 * Math.PI / 3), _defineProperty(_class2, "c5", 2 * Math.PI / 4.5), _defineProperty(_class2, "linear", x => x), _defineProperty(_class2, "easeInQuad", x => x * x), _defineProperty(_class2, "easeOutQuad", x => 1 - (1 - x) * (1 - x)), _defineProperty(_class2, "easeInOutQuad", x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2), _defineProperty(_class2, "easeInCubic", x => x * x * x), _defineProperty(_class2, "easeOutCubic", x => 1 - Math.pow(1 - x, 3)), _defineProperty(_class2, "easeInOutCubic", x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), _defineProperty(_class2, "easeInQuart", x => x * x * x * x), _defineProperty(_class2, "easeOutQuart", x => 1 - Math.pow(1 - x, 4)), _defineProperty(_class2, "easeInOutQuart", x => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2), _defineProperty(_class2, "easeInQuint", x => x * x * x * x * x), _defineProperty(_class2, "easeOutQuint", x => 1 - Math.pow(1 - x, 5)), _defineProperty(_class2, "easeInSine", x => 1 - Math.cos(x * Math.PI / 2)), _defineProperty(_class2, "easeOutSine", x => Math.sin(x * Math.PI / 2)), _defineProperty(_class2, "easeInOutSine", x => -(Math.cos(Math.PI * x) - 1) / 2), _defineProperty(_class2, "easeInExpo", x => x === 0 ? 0 : Math.pow(2, 10 * x - 10)), _defineProperty(_class2, "easeOutExpo", x => x === 1 ? 1 : 1 - Math.pow(2, -10 * x)), _defineProperty(_class2, "easeInCirc", x => 1 - Math.sqrt(1 - Math.pow(x, 2))), _defineProperty(_class2, "easeOutCirc", x => Math.sqrt(1 - Math.pow(x - 1, 2))), _defineProperty(_class2, "easeInOutCirc", x => x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2), _temp2));

_defineProperty(Tools, "compareProperties", (properties, cFx = (ela, elb) => ela - elb, ascend = true) => (a, b) => cFx(a[properties], b[properties]) * (ascend ? 1 : -1));

_defineProperty(Tools, "MathFx", (_temp3 = _class3 = function _Math() {
  _classCallCheck(this, _Math);
}, _defineProperty(_class3, "curveFx", (a, b, phi = 0) => x => a + b / (x + phi)), _defineProperty(_class3, "naturalLogFx", (a, b, c = 1) => x => a + b * Math.log(x + c)), _defineProperty(_class3, "exponentialFx", (a, b, phi = 0) => x => a * Math.pow(Math.E, b * (x + phi))), _defineProperty(_class3, "powerFx", (a, b, phi = 0) => x => a * Math.pow(x + phi, b)), _defineProperty(_class3, "sCurveFx", (a, b, phi = 0) => x => 1 / (a + b * Math.pow(Math.E, -(x + phi)))), _temp3));

let Base = function Base() {
  _classCallCheck(this, Base);

  this.id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
};

let RectangleBase = function (_Base) {
  _inherits(RectangleBase, _Base);

  function RectangleBase(positionTL, positionBR, bw, bs, bf, br) {
    var _this;

    _classCallCheck(this, RectangleBase);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RectangleBase).call(this));
    _this.cornerTL = positionTL;
    _this.cornerBR = positionBR;
    _this.width = _this.cornerBR.x - _this.cornerTL.x;
    _this.height = _this.cornerBR.y - _this.cornerTL.y;
    _this.borderWidth = bw;
    _this.borderStyle = bs;
    _this.fillStyle = bf;
    _this.borderRadius = br;
    return _this;
  }

  _createClass(RectangleBase, [{
    key: "renderBorder",
    value: function renderBorder(context) {
      context.strokeStyle = this.borderStyle;
      Tools.renderRoundRect(context, this.cornerTL.x, this.cornerTL.y, this.width, this.height, this.borderRadius, false, true);
    }
  }, {
    key: "renderInside",
    value: function renderInside(context) {
      context.fillStyle = this.fillStyle;
      Tools.renderRoundRect(context, this.cornerTL.x, this.cornerTL.y, this.width, this.height, this.borderRadius, true, false);
    }
  }]);

  return RectangleBase;
}(Base);

let CircleBase = function (_Base2) {
  _inherits(CircleBase, _Base2);

  function CircleBase(p, r, bw, bs) {
    var _this2;

    _classCallCheck(this, CircleBase);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(CircleBase).call(this));
    _this2.position = p;
    _this2.radius = r;
    _this2.borderWidth = bw;
    _this2.borderStyle = bs;
    return _this2;
  }

  _createClass(CircleBase, [{
    key: "renderBorder",
    value: function renderBorder(context) {
      if (this.borderWidth > 0) {
        context.strokeStyle = this.borderStyle;
        context.lineWidth = this.borderWidth;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.stroke();
      }
    }
  }, {
    key: "inscribedSquareSideLength",
    get: function () {
      return 2 * this.radius / Math.SQRT2;
    }
  }]);

  return CircleBase;
}(Base);

let ItemBase = function (_CircleBase) {
  _inherits(ItemBase, _CircleBase);

  function ItemBase(position, radius, borderWidth, borderStyle, image) {
    var _this3;

    _classCallCheck(this, ItemBase);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(ItemBase).call(this, position, radius, borderWidth, borderStyle));
    _this3.image = null;

    if (typeof image === 'string') {
      _this3.fill = image;
    } else if (image instanceof ImageBitmap) {
      _this3.image = image;
    } else if (image instanceof AnimationSprite) {
      _this3.image = image;
    } else if (image instanceof Promise) {
      image.then(r => _this3.image = r);
    }

    _this3.intervalTimers = [];
    _this3.timeoutTimers = [];
    return _this3;
  }

  _createClass(ItemBase, [{
    key: "renderSpriteFrame",
    value: function renderSpriteFrame(context, x, y) {
      this.image.renderOneFrame(context, new Position(x, y), this.inscribedSquareSideLength, this.inscribedSquareSideLength, 0, true, true, false);
    }
  }, {
    key: "renderImage",
    value: function renderImage(context) {
      const x = this.position.x - this.inscribedSquareSideLength * 0.5;
      const y = this.position.y - this.inscribedSquareSideLength * 0.5;

      if (this.image instanceof ImageBitmap) {
        context.drawImage(this.image, 0, 0, this.image.width, this.image.height, x, y, this.inscribedSquareSideLength, this.inscribedSquareSideLength);
      } else if (this.image instanceof AnimationSprite) {
        this.renderSpriteFrame(context, x, y);
      }
    }
  }, {
    key: "renderFilled",
    value: function renderFilled(context) {
      context.fillStyle = this.fill;
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    }
  }, {
    key: "render",
    value: function render(context) {
      _get(_getPrototypeOf(ItemBase.prototype), "renderBorder", this).call(this, context);

      if (this.image) {
        this.renderImage(context);
      } else if (this.fill) {
        this.renderFilled(context);
      }
    }
  }, {
    key: "rotateForward",
    value: function rotateForward(context, targetPos) {
      context.translate(this.position.x, this.position.y);
      let thelta = Math.atan((this.position.y - targetPos.y) / (this.position.x - targetPos.x));
      if (this.position.x > targetPos.x) thelta += Math.PI;
      context.rotate(thelta);
      return {
        restore() {
          context.resetTransform();
        }

      };
    }
  }, {
    key: "destory",
    value: function destory() {
      if (this.image instanceof AnimationSprite) {
        this.image.terminateLoop();
      }

      this.intervalTimers.forEach(t => clearInterval(t));
      this.timeoutTimers.forEach(t => clearTimeout(t));
    }
  }]);

  return ItemBase;
}(CircleBase);

let TowerBase = function (_ItemBase) {
  _inherits(TowerBase, _ItemBase);

  _createClass(TowerBase, null, [{
    key: "GemNameToGemCtor",
    value: function GemNameToGemCtor(gn) {
      return this.Gems.find(g => g.name === gn).ctor;
    }
  }, {
    key: "damageToPoint",
    value: function damageToPoint(damage) {
      return Math.round(damage / 1000);
    }
  }, {
    key: "GemsToOptionsInnerHtml",
    get: function () {
      return this.Gems.map((gemCtor, idx) => {
        return `<option value="${gemCtor.name}"${idx === 0 ? ' selected' : ''}${this.deniedGems.includes(gemCtor.name) ? ' disabled' : ''}>${gemCtor.ctor.gemName}${this.deniedGems.includes(gemCtor.name) ? ' - 不能装备到此塔' : ''}</option>`;
      }).join('');
    }
  }, {
    key: "levelUpPointEarnings",
    get: function () {
      return 10;
    }
  }, {
    key: "killNormalPointEarnings",
    get: function () {
      return 1;
    }
  }, {
    key: "killBossPointEarnings",
    get: function () {
      return 50;
    }
  }]);

  function TowerBase(position, radius, borderWidth, borderStyle, image, price, levelAtkFx, levelHstFx, levelSlcFx, levelRngFx) {
    var _this4;

    _classCallCheck(this, TowerBase);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(TowerBase).call(this, position, radius, borderWidth, borderStyle, image));
    _this4.bornStamp = performance.now();
    _this4.bulletCtl = new BulletManager();
    _this4.level = 0;
    _this4.price = price;
    _this4.rank = 0;
    _this4.levelAtkFx = levelAtkFx;
    _this4.levelHstFx = levelHstFx;
    _this4.levelSlcFx = levelSlcFx;
    _this4.levelRngFx = levelRngFx;
    _this4.target = null;
    _this4.lastShootTime = _this4.bornStamp;
    _this4.__kill_count = 0;
    _this4.__total_damage = 0;
    _this4.gem = null;
    _this4.canInsertGem = true;
    _this4.__hst_ps_ratio = 1;
    _this4.__atk_ratio = 1;
    _this4.__kill_extra_gold = 0;
    _this4.__on_boss_atk_ratio = 1;
    _this4.__on_trapped_atk_ratio = 1;
    _this4.__max_rng_atk_ratio = 1;
    _this4.__min_rng_atk_ratio = 1;
    _this4.__each_monster_damage_ratio = new Map();

    _this4.intervalTimers.push(setInterval(() => {
      const msts = Game.callMonsterList();
      Array.from(_this4.__each_monster_damage_ratio).filter(([k]) => msts.every(mst => mst.id !== k)).forEach(([k]) => _this4.__each_monster_damage_ratio.delete(k));
    }, 60000));

    _this4.description = undefined;
    _this4.name = undefined;
    _this4.bulletCtorName = undefined;
    _this4.isSold = false;
    return _this4;
  }

  _createClass(TowerBase, [{
    key: "reviceRange",
    value: function reviceRange(r) {
      return r * Game.callGridSideSize() / 39;
    }
  }, {
    key: "inlayGem",
    value: function inlayGem(gemCtorName) {
      this.gem = new (TowerBase.GemNameToGemCtor(gemCtorName))();
      this.gem.initEffect(this);
    }
  }, {
    key: "recordDamage",
    value: function recordDamage({
      lastAbsDmg,
      isDead,
      isBoss
    }) {
      this.__total_damage += lastAbsDmg;
      Game.updateGemPoint += TowerBase.damageToPoint(lastAbsDmg);

      if (isDead) {
        this.recordKill();
        Game.updateGemPoint += isBoss ? TowerBase.killBossPointEarnings : TowerBase.killNormalPointEarnings;

        if (this.gem) {
          this.gem.killHook(this, arguments[0]);
        }
      }
    }
  }, {
    key: "recordKill",
    value: function recordKill() {
      this.__kill_count++;
      Game.callMoney()[1](this.__kill_extra_gold);
    }
  }, {
    key: "inRange",
    value: function inRange(target) {
      const t = this.Rng + target.radius;
      return Position.distancePow2(target.position, this.position) < t * t;
    }
  }, {
    key: "reChooseTarget",
    value: function reChooseTarget(targetList) {
      for (const t of _.shuffle(targetList)) {
        if (this.inRange(t)) {
          this.target = t;
          return;
        }
      }

      this.target = null;
    }
  }, {
    key: "calculateDamageRatio",
    value: function calculateDamageRatio(mst) {
      const bossR = mst.isBoss ? this.__on_boss_atk_ratio : 1;
      const particularR = this.__each_monster_damage_ratio.get(mst.id) || 1;
      const trapR = mst.isTrapped ? this.__on_trapped_atk_ratio : 1;
      const R = Position.distance(this.position, mst.position) / this.Rng;
      const rangeR = this.__min_rng_atk_ratio * (1 - R) + this.__max_rng_atk_ratio * R;
      return bossR * particularR * trapR * rangeR;
    }
  }, {
    key: "produceBullet",
    value: function produceBullet(i, monsters) {
      const ratio = this.calculateDamageRatio(this.target);
      this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.target, this.bulletImage);
    }
  }, {
    key: "recordShootTime",
    value: function recordShootTime() {
      this.lastShootTime = performance.now();
    }
  }, {
    key: "run",
    value: function run(monsters) {
      if (this.canShoot) {
        if (!this.isCurrentTargetAvailable) {
          this.reChooseTarget(monsters);
        }

        if (this.target) {
          this.shoot(monsters);
        }
      }
    }
  }, {
    key: "shoot",
    value: function shoot(monsters) {
      this.gemAttackHook(monsters);

      for (let i = 0; i < this.Slc; i++) {
        this.produceBullet(i, monsters);
        this.gemHitHook(i, monsters);
      }

      this.recordShootTime();
    }
  }, {
    key: "gemHitHook",
    value: function gemHitHook(idx, msts) {
      if (this.gem) {
        this.gem.hitHook(this, this.target, msts);
      }
    }
  }, {
    key: "gemAttackHook",
    value: function gemAttackHook(msts) {
      if (this.gem) {
        this.gem.attackHook(this, msts);
      }
    }
  }, {
    key: "levelUp",
    value: function levelUp(currentMoney) {
      if (this.isMaxLevel) return 0;

      if (this.price[this.level + 1] > currentMoney) {
        return 0;
      } else {
        this.level += 1;
        const w = this.inscribedSquareSideLength * 1.5;
        Game.callAnimation('level_up', new Position(this.position.x - this.radius, this.position.y - this.radius * 2), w, w / 144 * 241, 3);
        Game.updateGemPoint += TowerBase.levelUpPointEarnings;
        return this.price[this.level];
      }
    }
  }, {
    key: "rankUp",
    value: function rankUp() {
      this.rank += 1;
      const w = this.inscribedSquareSideLength * 1.5;
      Game.callAnimation('rank_up', new Position(this.position.x - this.radius, this.position.y - this.radius * 2), w, w / 79 * 85, 3, 0, 25);
    }
  }, {
    key: "renderRange",
    value: function renderRange(context, style = 'rgba(177,188,45,.05)') {
      context.fillStyle = style;
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.Rng, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    }
  }, {
    key: "renderLevel",
    value: function renderLevel(context) {
      const ftmp = context.font;
      context.font = '6px TimesNewRoman';
      context.fillStyle = context.manager.towerLevelTextStyle;
      context.fillText('lv ' + this.levelHuman, this.position.x + this.radius * .78, this.position.y - this.radius * .78);
      context.font = ftmp;
    }
  }, {
    key: "renderRankStars",
    value: function renderRankStars(context) {
      if (this.rank > 0) {
        const l2 = Math.floor(this.rank / 4);
        const l1 = this.rank % 4;
        const py = this.position.y - this.radius * 1.25;
        const px = this.position.x - this.radius * .68;

        for (let i = 0; i < l2; i++) {
          context.drawImage(Game.callImageBitMap('p_ruby'), px + 7 * i, py, 8, 8);
        }

        for (let i = 0; i < l1; i++) {
          context.drawImage(Game.callImageBitMap('star_m'), px + 5 * i + 7 * l2, py, 8, 8);
        }
      }
    }
  }, {
    key: "renderPreparationBar",
    value: function renderPreparationBar(context) {
      if (this.canShoot) return;
      context.fillStyle = 'rgba(25,25,25,.3)';
      Tools.renderSector(context, this.position.x, this.position.y, this.radius, 0, Math.PI * 2 * (1 - (performance.now() - this.lastShootTime) / this.Hst), false).fill();
    }
  }, {
    key: "render",
    value: function render(context) {
      _get(_getPrototypeOf(TowerBase.prototype), "render", this).call(this, context);

      this.renderLevel(context);
      this.renderRankStars(context);
    }
  }, {
    key: "rapidRender",
    value: function rapidRender(ctxRapid, monsters) {}
  }, {
    key: "renderStatusBoard",
    value: function renderStatusBoard(bx1, bx2, by1, by2, showGemPanel, showMoreDetail, specifedWidth) {
      showGemPanel = showGemPanel && this.canInsertGem;
      const red = '#F51818';
      const green = '#94C27E';

      const renderDataType_1 = (rootNode, dataChunk, offset, showDesc) => {
        let jump = 0;
        dataChunk.forEach((data, idx) => {
          const showD = showDesc && this.constructor.informationDesc.has(data[0]);
          const row = rootNode.childNodes.item(idx + offset + jump);
          Tools.Dom.removeNodeTextAndStyle(row);

          if (!row.hasChildNodes()) {
            Tools.Dom.generateTwoCol(row);
          } else {
            Tools.Dom.removeNodeTextAndStyle(row.lastChild);
            Tools.Dom.removeNodeTextAndStyle(row.firstChild);
          }

          row.firstChild.textContent = data[0];
          row.lastChild.textContent = data[1];

          if (showD) {
            const rowD = rootNode.childNodes.item(idx + offset + jump + 1);
            Tools.Dom.removeNodeTextAndStyle(rowD);
            Tools.Dom.removeAllChildren(rowD);
            rowD.textContent = this.constructor.informationDesc.get(data[0]);
            rowD.style.color = '#909399';
            rowD.style.marginBottom = '5px';
            jump++;
          }

          if (data[0] === '售价' || data[0] === '类型') {
            row.lastChild.style.color = '#606266';
            renderDataType_dv(rootNode, idx + offset + jump + (showD ? 2 : 1));
            jump++;
          } else if (data[0] === '下一级') {
            if (this.isMaxLevel) row.lastChild.style.color = '#DCDFE6';else row.lastChild.style.color = this.price[this.level + 1] < Game.callMoney()[0] ? green : red;
          }
        });
      };

      const renderDataType_2 = (rootNode, dataChunk, offset) => {
        dataChunk.forEach((data, idx) => {
          const row = rootNode.childNodes.item(idx + offset);
          Tools.Dom.removeNodeTextAndStyle(row);
          Tools.Dom.removeAllChildren(row);
          if (data.includes('+')) row.style.color = 'rgba(204,51,51,1)';else if (data.includes('-')) row.style.color = 'rgba(0,102,204,1)';else row.style.color = '';
          row.textContent = data;
        });
      };

      const renderDataType_dv = (rootNode, offset) => {
        const div = rootNode.childNodes.item(offset);
        Tools.Dom.removeAllChildren(div);
        Tools.Dom.removeNodeTextAndStyle(div, 'division');
      };

      specifedWidth = specifedWidth || 140;
      const blockElement = Game.callElement('status_block');
      blockElement.style.display = 'block';
      blockElement.style.width = specifedWidth + 'px';
      blockElement.style.borderBottomLeftRadius = showGemPanel ? '0' : '';
      blockElement.style.borderBottomRightRadius = showGemPanel ? '0' : '';
      blockElement.style.borderBottom = showGemPanel ? '0' : '';
      const lineCount = this.informationSeq.length + this.descriptionChuned.length + this.exploitsSeq.length;
      const moreDescLineCount = showMoreDetail ? this.informationSeq.filter(f => this.constructor.informationDesc.has(f[0])).length : 0;
      const extraLineCount = 2 + 1 + moreDescLineCount;

      if (blockElement.childNodes.length > lineCount + extraLineCount) {
        blockElement.childNodes.forEach((child, index) => {
          if (index > lineCount - 1 + extraLineCount) {
            Tools.Dom.removeAllChildren(child);
            Tools.Dom.removeNodeTextAndStyle(child);
          }
        });
      }

      while (blockElement.childNodes.length < lineCount + extraLineCount) {
        Tools.Dom.generateRow(blockElement);
      }

      const l1 = this.informationSeq.length + 2 + moreDescLineCount;
      const l2 = l1 + this.exploitsSeq.length + 1;
      renderDataType_1(blockElement, this.informationSeq, 0, showMoreDetail);
      renderDataType_dv(blockElement, l1 - 1);
      renderDataType_1(blockElement, this.exploitsSeq, l1, false);
      renderDataType_dv(blockElement, l2 - 1);
      renderDataType_2(blockElement, this.descriptionChuned, l2);

      if (showGemPanel) {
        const gemElement = Game.callElement('gem_block');
        Tools.Dom.removeAllChildren(gemElement);
        gemElement.style.display = 'block';
        gemElement.style.width = specifedWidth + 'px';

        if (!this.gem) {
          let selected = TowerBase.Gems[0].name;
          Tools.Dom.generateRow(gemElement, null, {
            textContent: '选购一颗' + GemBase.gemName,
            style: {
              margin: '0 0 8px 0'
            }
          });

          if (showMoreDetail) {
            Tools.Dom.generateRow(gemElement, null, {
              textContent: GemBase.gemName + '可以极大得提高塔的能力，每个单位只能选择一枚' + GemBase.gemName + '镶嵌，之后可以使用点数升级继续提高' + GemBase.gemName + '的效用',
              style: {
                margin: '0 0 8px 0',
                color: '#909399'
              }
            });
          }

          const select = document.createElement('select');
          select.style.width = '100%';
          select.style.fontSize = '12px';

          select.onchange = () => {
            selected = select.value;
            const ctor = TowerBase.GemNameToGemCtor(selected);
            rowDesc.textContent = ctor.stasisDescription;
            rowimg.firstChild.src = ctor.imgSrc;
            rowPrice.lastChild.textContent = '$ ' + Tools.formatterUs.format(ctor.price);
            rowPrice.lastChild.style.color = ctor.price <= Game.callMoney()[0] ? green : red;

            if (ctor.price > Game.callMoney()[0]) {
              btn.setAttribute('disabled', 'disabled');
            } else {
              btn.removeAttribute('disabled');
            }
          };

          select.innerHTML = this.constructor.GemsToOptionsInnerHtml;
          Tools.Dom.generateRow(gemElement, 'row_nh', {
            style: {
              margin: '0 0 8px 0'
            }
          }, [select]);
          const rowimg = Tools.Dom.generateRow(gemElement);
          Tools.Dom.generateImg(rowimg, TowerBase.GemNameToGemCtor(selected).imgSrc, {
            className: 'lg_gem_img'
          });
          const rowPrice = Tools.Dom.generateRow(gemElement, null, {
            style: {
              marginBottom: '5px'
            }
          }, TowerBase.GemNameToGemCtor(selected).priceSpan);
          rowPrice.lastChild.style.color = TowerBase.GemNameToGemCtor(selected).price <= Game.callMoney()[0] ? green : red;
          const rowDesc = Tools.Dom.generateRow(gemElement, null, {
            textContent: TowerBase.GemNameToGemCtor(selected).stasisDescription,
            style: {
              lineHeight: '1.2',
              margin: '0 0 8px 0'
            }
          });
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = '确认';

          if (TowerBase.GemNameToGemCtor(selected).price > Game.callMoney()[0]) {
            btn.setAttribute('disabled', 'disabled');
          }

          btn.onclick = () => {
            const ct = TowerBase.GemNameToGemCtor(selected);
            const [money, emitter] = Game.callMoney();

            if (money > ct.price) {
              emitter(-ct.price);
              this.inlayGem(selected);
              this.renderStatusBoard(...arguments);
            }
          };

          Tools.Dom.generateRow(gemElement, null, null, [btn]);
        } else {
            const canUpdateNext = !this.gem.isMaxLevel && Game.updateGemPoint >= this.gem.levelUpPoint;
            Tools.Dom.generateRow(gemElement, null, {
              textContent: '升级你的' + GemBase.gemName
            });
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = '升级';
            btn.title = '长按快速升级';

            if (!canUpdateNext) {
              btn.setAttribute('disabled', 'disabled');
            } else {
              btn.removeAttribute('disabled');
            }

            btn.onclick = () => {
              Game.updateGemPoint -= this.gem.levelUp(Game.updateGemPoint);
              this.renderStatusBoard(...arguments);
            };

            Tools.Dom.bindLongPressEventHelper(this.id, btn, () => {
              if (!this.gem.isMaxLevel && Game.updateGemPoint >= this.gem.levelUpPoint) {
                btn.onclick(null);
                return false;
              } else {
                return true;
              }
            }, 200, 50, 1500, 10);
            Tools.Dom.generateRow(gemElement, null, {
              textContent: this.gem.gemName,
              style: {
                marginBottom: '10px'
              }
            });
            const [imgCol] = Tools.Dom.generateTwoCol(Tools.Dom.generateRow(gemElement, null, {
              style: {
                marginBottom: '5px'
              }
            }), null, null, [], [btn]);
            Tools.Dom.generateImg(imgCol, this.gem.imgSrc, {
              className: 'lg_gem_img'
            });
            Tools.Dom.generateRow(gemElement, null, {
              textContent: this.gem.level + '  级 / ' + this.gem.maxLevelHuman
            });
            Tools.Dom.generateTwoCol(Tools.Dom.generateRow(gemElement), {
              textContent: '下一级点数'
            }, {
              textContent: this.gem.isMaxLevel ? '最高等级' : Tools.formatterUs.format(this.gem.levelUpPoint),
              style: {
                color: canUpdateNext ? green : red
              }
            });
            Tools.Dom.generateRow(gemElement, null, {
              textContent: this.gem.description
            });
          }
      }

      const gemElement = Game.callElement('gem_block');
      const bHeight = blockElement.offsetHeight;
      const gHeight = gemElement.offsetHeight;
      let position = 2;

      if (this.position.x - bx1 < specifedWidth + this.radius) {
        position = 1;

        if (this.position.y - by1 < bHeight) {
          position = 4;
        }
      }

      if (this.position.y - by1 < bHeight) {
        position = 3;

        if (this.position.x - bx1 < specifedWidth + this.radius) {
          position = 4;
        }
      }

      const positionTLX = this.position.x - (position === 1 || position === 4 ? this.radius * -1 : specifedWidth + this.radius);
      let positionTLY = this.position.y + (position === 1 || position === 2 ? -1 : 0) * (bHeight + this.radius);
      const pyBhGh = positionTLY + bHeight + gHeight;

      if (position < 3 && positionTLY < 0) {
        positionTLY = 5;
      } else if (pyBhGh > innerHeight) {
        const overflowH = pyBhGh - innerHeight;
        positionTLY -= overflowH + 30;
      }

      blockElement.style.top = positionTLY + 'px';
      blockElement.style.left = positionTLX + 'px';

      if (showGemPanel) {
        gemElement.style.top = positionTLY + bHeight + 'px';
        gemElement.style.left = positionTLX + 'px';
      }
    }
  }, {
    key: "descriptionChuned",
    get: function () {
      if (!this.description) return [];
      return this.description.split('\n');
    }
  }, {
    key: "sellingPrice",
    get: function () {
      let s = 0;

      for (let i = 0; i < this.level + 1; i++) {
        s += this.price[i];
      }

      if (this.gem) s += this.gem.constructor.price;
      return Math.ceil(s * 0.7);
    }
  }, {
    key: "Atk",
    get: function () {
      return this.levelAtkFx(this.level) * this.__atk_ratio;
    }
  }, {
    key: "Hst",
    get: function () {
      return 1000 / this.HstPS;
    }
  }, {
    key: "HstPS",
    get: function () {
      return this.levelHstFx(this.level) * this.__hst_ps_ratio;
    }
  }, {
    key: "Slc",
    get: function () {
      return this.levelSlcFx(this.level);
    }
  }, {
    key: "Rng",
    get: function () {
      return this.reviceRange(this.levelRngFx(this.level)) + this.radius;
    }
  }, {
    key: "DPS",
    get: function () {
      return this.Atk * this.Slc * this.HstPS;
    }
  }, {
    key: "informationSeq",
    get: function () {
      const base = [[this.name, ''], ['等级', this.levelHuman], ['下一级', this.isMaxLevel ? '最高等级' : '$ ' + Tools.formatterUs.format(Math.round(this.price[this.level + 1]))], ['售价', '$ ' + Tools.formatterUs.format(Math.round(this.sellingPrice))], ['伤害', Tools.chineseFormatter(Math.round(this.Atk), 3)], ['攻击速度', Tools.roundWithFixed(this.HstPS, 2)], ['射程', Tools.formatterUs.format(Math.round(this.Rng))], ['弹药储备', Math.round(this.Slc)], ['DPS', Tools.chineseFormatter(this.DPS, 3)]];
      return base;
    }
  }, {
    key: "ADPS",
    get: function () {
      return this.__total_damage / (performance.now() - this.bornStamp) * 1000;
    }
  }, {
    key: "ADPSH",
    get: function () {
      return Tools.chineseFormatter(Tools.roundWithFixed(this.ADPS, 3), 3);
    }
  }, {
    key: "exploitsSeq",
    get: function () {
      return [['击杀', this.__kill_count], ['输出', Tools.chineseFormatter(this.__total_damage, 3)], ['每秒输出', this.ADPSH]];
    }
  }, {
    key: "isCurrentTargetAvailable",
    get: function () {
      if (!this.target || this.target.isDead) return false;else return this.inRange(this.target);
    }
  }, {
    key: "canShoot",
    get: function () {
      return performance.now() - this.lastShootTime > this.Hst;
    }
  }, {
    key: "isMaxLevel",
    get: function () {
      return this.price.length - 1 === this.level;
    }
  }, {
    key: "levelHuman",
    get: function () {
      return this.level + 1;
    }
  }]);

  return TowerBase;
}(ItemBase);

_defineProperty(TowerBase, "informationDesc", new Map([['等级', '鼠标单击图标或按[C]键来消耗金币升级，等级影响很多属性，到达某个等级可以晋升'], ['下一级', '升级到下一级需要的金币数量'], ['售价', '出售此塔可以返还的金币数量'], ['伤害', '此塔的基础攻击力'], ['攻击速度', '此塔的每秒攻击次数'], ['射程', '此塔的索敌距离，单位是像素'], ['弹药储备', '此塔每次攻击时发射的弹药数量'], ['DPS', '估计的每秒伤害']]));

_defineProperty(TowerBase, "Gems", [{
  ctor: PainEnhancer,
  name: 'PainEnhancer'
}, {
  ctor: GogokOfSwiftness,
  name: 'GogokOfSwiftness'
}, {
  ctor: MirinaeTeardropOfTheStarweaver,
  name: 'MirinaeTeardropOfTheStarweaver'
}, {
  ctor: SimplicitysStrength,
  name: 'SimplicitysStrength'
}, {
  ctor: BaneOfTheStricken,
  name: 'BaneOfTheStricken'
}, {
  ctor: GemOfEase,
  name: 'GemOfEase'
}, {
  ctor: BaneOfTheTrapped,
  name: 'BaneOfTheTrapped'
}, {
  ctor: ZeisStoneOfVengeance,
  name: 'ZeisStoneOfVengeance'
}, {
  ctor: EchoOfLight,
  name: 'EchoOfLight'
}]);

_defineProperty(TowerBase, "deniedGems", []);

_defineProperty(TowerBase, "GemsToOptions", TowerBase.Gems.map((gemCtor, idx) => {
  const option = document.createElement('option');
  option.setAttribute('value', gemCtor.name);

  if (idx === 0) {
    option.setAttribute('selected', 'selected');
  }

  option.textContent = `${gemCtor.ctor.gemName} $ ${gemCtor.ctor.price}`;
  return option;
}));

let MonsterBase = function (_ItemBase2) {
  _inherits(MonsterBase, _ItemBase2);

  function MonsterBase(position, radius, borderWidth, borderStyle, image, level, levelRwdFx, levelSpdFx, levelHthFx, levelAmrFx, levelShdFx) {
    var _this5;

    _classCallCheck(this, MonsterBase);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(MonsterBase).call(this, position, radius, borderWidth, borderStyle, image));
    _this5.__inner_level = level;
    _this5.maxHealth = Math.round(levelHthFx(level));
    _this5.__inner_current_health = _this5.maxHealth;
    _this5.maxShield = levelShdFx ? levelShdFx(level) : 0;
    _this5.__inner_current_shield = _this5.maxShield;
    _this5.inner_armor = levelAmrFx(level);
    _this5.__base_speed = levelSpdFx(level);
    _this5.speedRatio = 1;
    _this5.reward = Math.round(levelRwdFx(level));
    _this5.damage = 1;
    _this5.healthChangeHintQueue = [];
    _this5.bePoisoned = false;
    _this5.beBloodied = false;
    _this5.beBurned = false;
    _this5.beOnLightEcho = [];
    _this5.beShocked = false;
    _this5.shockDurationTick = 0;
    _this5.shockChargeAmount = 0;
    _this5.shockSource = null;
    _this5.shockLeakChance = 0;
    _this5.beTransformed = false;
    _this5.transformDurationTick = 0;
    _this5.beImprisoned = false;
    _this5.imprisonDurationTick = 0;
    _this5.beFrozen = false;
    _this5.freezeDurationTick = 0;
    _this5.beConfused = false;
    _this5.beImprecated = false;
    _this5.imprecatedRatio = 1;
    _this5.lastAbsDmg = 0;
    _this5.isBoss = false;
    _this5.isDead = false;
    _this5.name = null;
    _this5.description = null;
    _this5.exploitsSeq = [['赏金', Tools.chineseFormatter(_this5.reward, 0)]];
    _this5.type = '普通怪物';
    return _this5;
  }

  _createClass(MonsterBase, [{
    key: "makeEffect",
    value: function makeEffect(towers, monsters) {}
  }, {
    key: "runDebuffs",
    value: function runDebuffs() {
      if (this.shockDurationTick > 0) {
        this.beShocked = true;
        if (--this.shockDurationTick === 0) this.beShocked = false;
      }

      if (this.transformDurationTick > 0) {
        this.beTransformed = true;
        if (--this.transformDurationTick === 0) this.beTransformed = false;
      }

      if (this.imprisonDurationTick > 0) {
        this.beImprisoned = true;
        if (--this.imprisonDurationTick === 0) this.beImprisoned = false;
      }

      if (this.freezeDurationTick > 0) {
        this.beFrozen = true;
        if (--this.freezeDurationTick === 0) this.beFrozen = false;
      }
    }
  }, {
    key: "registerShock",
    value: function registerShock(durationTick, chargeAmount, source, leakChance) {
      if (durationTick > this.shockDurationTick) {
        this.shockDurationTick = Math.round(durationTick);
        this.shockChargeAmount = chargeAmount;
        this.shockSource = source;
        this.shockLeakChance = leakChance;
      }
    }
  }, {
    key: "registerTransform",
    value: function registerTransform(durationTick) {
      if (durationTick > this.transformDurationTick) {
        this.transformDurationTick = Math.round(durationTick);
      }
    }
  }, {
    key: "registerImprison",
    value: function registerImprison(durationTick) {
      if (durationTick > this.imprisonDurationTick) {
        this.imprisonDurationTick = Math.round(durationTick);
      }
    }
  }, {
    key: "registerFreeze",
    value: function registerFreeze(durationTick) {
      if (durationTick > this.freezeDurationTick) {
        this.freezeDurationTick = Math.round(durationTick);
      }
    }
  }, {
    key: "runShock",
    value: function runShock(monsters) {
      if (Math.random() < 1 - this.shockLeakChance) return;
      if (monsters.length < 2) return;

      const aim = _.minBy(monsters, mst => {
        if (mst === this) return Infinity;
        const dist = Position.distancePow2(mst.position, this.position);
        return dist;
      });

      aim.health -= this.shockChargeAmount * (1 - aim.armorResistance);
      this.health -= this.shockChargeAmount * (1 - this.armorResistance);
      this.shockSource.recordDamage(aim);
      this.shockSource.recordDamage(this);
      this.shockSource.monsterShockingRenderingQueue.push({
        time: TeslaTower.shockRenderFrames * 2,
        args: [this.position.x, this.position.y, aim.position.x, aim.position.y, Position.distance(aim.position, this.position) / 2]
      });
    }
  }, {
    key: "run",
    value: function run(path, lifeTokenEmitter, towers, monsters) {
      this.runDebuffs();
      if (this.beShocked) this.runShock(monsters);
      if (this.beImprisoned || this.beFrozen) return;

      if (path.length === 0) {
        lifeTokenEmitter(-this.damage);
        this.isDead = true;
      } else {
        this.position.moveTo(path[0], this.speedValue);
        this.makeEffect(towers, monsters);
      }
    }
  }, {
    key: "renderHealthChange",
    value: function renderHealthChange(context) {
      while (this.healthChangeHintQueue.length > 0) {
        context.fillText('- ' + this.healthChangeHintQueue.shift(), this.position.x + this.radius + 2, this.position.y + this.inscribedSquareSideLength / 1.5);
      }
    }
  }, {
    key: "renderHealthBar",
    value: function renderHealthBar(context) {
      if (this.health <= 0 || this.health / this.maxHealth > 1) return;
      const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius;
      context.strokeStyle = this.healthBarBorderStyle;
      context.strokeRect(this.position.x - this.radius - xaxisOffset, this.position.y + this.inscribedSquareSideLength / 1.5, this.healthBarWidth, this.healthBarHeight);
      context.fillStyle = this.healthBarFillStyle;
      context.fillRect(this.position.x - this.radius - xaxisOffset, this.position.y + this.inscribedSquareSideLength / 1.5, this.healthBarWidth * this.health / this.maxHealth, this.healthBarHeight);
    }
  }, {
    key: "renderLevel",
    value: function renderLevel(context) {
      context.fillStyle = context.manager.towerLevelTextStyle;
      context.fillText('lv ' + this.__inner_level, this.position.x + this.radius * 0.78, this.position.y - this.radius * 0.78);
    }
  }, {
    key: "renderDebuffs",
    value: function renderDebuffs(context, imgCtl) {
      const dSize = 10;
      const debuffs = [];

      if (this.bePoisoned) {
        debuffs.push(imgCtl.getImage('buff_poison'));
      }

      if (this.beBloodied) {
        debuffs.push(imgCtl.getImage('buff_bloody'));
      }

      if (this.beImprecated) {
        debuffs.push(imgCtl.getImage('buff_imprecate'));
      }

      if (this.beBurned) {
        debuffs.push(imgCtl.getImage('buff_burn'));
      }

      if (this.beOnLightEcho.length > 0) {
        debuffs.push(imgCtl.getImage('buff_light_echo'));
      }

      if (this.beImprisoned) {
        debuffs.push(imgCtl.getImage('buff_imprison'));
      }

      if (this.beFrozen) {
        debuffs.push(imgCtl.getImage('buff_freeze'));
      }

      if (this.beShocked) {
        debuffs.push(imgCtl.getImage('buff_shock'));
      }

      if (this.beTransformed) {
        debuffs.push(imgCtl.getImage('buff_transform'));
      }

      debuffs.forEach((dbf, idx) => {
        const x = this.position.x - this.radius + dSize * idx;
        const y = this.position.y - this.radius - dSize;
        context.drawImage(dbf, x, y, dSize - 1, dSize - 1);
      });
    }
  }, {
    key: "renderStatusBoard",
    value: function renderStatusBoard() {
      TowerBase.prototype.renderStatusBoard.call(this, ...arguments, 180);
    }
  }, {
    key: "render",
    value: function render(context, imgCtl) {
      const ftmp = context.font;
      context.font = '6px TimesNewRoman';

      _get(_getPrototypeOf(MonsterBase.prototype), "render", this).call(this, context);

      this.renderHealthBar(context);
      this.renderLevel(context);
      this.renderDebuffs(context, imgCtl);
      context.font = ftmp;
    }
  }, {
    key: "armorResistance",
    get: function () {
      return this.inner_armor / (100 + this.inner_armor);
    }
  }, {
    key: "speedValue",
    get: function () {
      if (this.beFrozen || this.beImprisoned) return 0;
      if (this.beConfused) return this.__base_speed * -0.5;
      return this.__base_speed * this.speedRatio;
    }
  }, {
    key: "health",
    get: function () {
      return this.__inner_current_health;
    },
    set: function (newHth) {
      const delta = newHth - this.__inner_current_health;
      if (delta === 0) return;

      if (delta < 0) {
        const actualDmg = -Math.round(delta * (this.beImprecated ? this.imprecatedRatio : 1));
        this.lastAbsDmg = Math.min(actualDmg, this.__inner_current_health);
        this.__inner_current_health -= this.lastAbsDmg;

        if (this.__inner_current_health <= 0) {
          this.isDead = true;
        }
      } else {
        this.__inner_current_health = Math.min(newHth, this.maxHealth);
      }
    }
  }, {
    key: "shield",
    get: function () {
      return this.__inner_current_shield;
    }
  }, {
    key: "healthBarHeight",
    get: function () {
      return 2;
    }
  }, {
    key: "healthBarWidth",
    get: function () {
      return this.radius * 2;
    }
  }, {
    key: "healthBarBorderStyle",
    get: function () {
      return 'rgba(45,244,34,1)';
    }
  }, {
    key: "healthBarFillStyle",
    get: function () {
      return 'rgba(245,44,34,1)';
    }
  }, {
    key: "isTrapped",
    get: function () {
      return this.beTransformed || this.beImprisoned || this.beFrozen || this.beConfused || this.speedRatio < 1;
    }
  }, {
    key: "descriptionChuned",
    get: function () {
      if (!this.description) return [];
      return this.description.split('\n');
    }
  }, {
    key: "informationSeq",
    get: function () {
      const base = [[this.name, ''], ['类型', this.type], ['生命值', Tools.chineseFormatter(Math.round(this.__inner_current_health), 3) + '/' + Tools.chineseFormatter(Math.round(this.maxHealth), 3)], ['移动速度', Tools.roundWithFixed(this.speedValue * 60, 1)], ['护甲', Tools.formatterUs.format(Math.round(this.inner_armor)) + '（减伤 ' + Tools.roundWithFixed(this.armorResistance * 100, 1) + '%）']];
      return base;
    }
  }]);

  return MonsterBase;
}(ItemBase);

_defineProperty(MonsterBase, "informationDesc", new Map());

let BulletBase = function (_ItemBase3) {
  _inherits(BulletBase, _ItemBase3);

  function BulletBase(position, radius, borderWidth, borderStyle, image, atk, speed, target) {
    var _this6;

    _classCallCheck(this, BulletBase);

    _this6 = _possibleConstructorReturn(this, _getPrototypeOf(BulletBase).call(this, position, radius, borderWidth, borderStyle, image));
    _this6.Atk = atk;
    _this6.speed = speed;
    _this6.target = target;
    _this6.fulfilled = false;
    return _this6;
  }

  _createClass(BulletBase, [{
    key: "setDamageEmitter",
    value: function setDamageEmitter(emitter) {
      this.emitter = emitter;
    }
  }, {
    key: "run",
    value: function run(monsters) {
      this.position.moveTo(this.target.position, this.speed);

      if (this.target.isDead) {
        this.fulfilled = true;
        this.target = null;
      } else if (this.isReaching) {
        this.hit(this.target, 1, monsters);
        this.fulfilled = true;
        this.target = null;
      } else if (this.position.outOfBoundary(Position.O, Game.callBoundaryPosition(), 50)) {
        console.log('a bullet has run out of the bound, and will be swipe by system.');
        console.log(this);
        this.fulfilled = true;
        this.target = null;
      }
    }
  }, {
    key: "hit",
    value: function hit(monster, magnification = 1) {
      monster.health -= this.Atk * magnification * (1 - monster.armorResistance);
      this.emitter(monster);
    }
  }, {
    key: "renderImage",
    value: function renderImage(context) {
      const transFormed = this.rotateForward(context, this.target.position);
      context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.inscribedSquareSideLength * -0.5, this.inscribedSquareSideLength * -0.5, this.inscribedSquareSideLength, this.inscribedSquareSideLength);
      transFormed.restore();
    }
  }, {
    key: "isReaching",
    get: function () {
      return Position.distancePow2(this.position, this.target.position) < Math.pow(this.target.radius + this.radius, 2);
    }
  }]);

  return BulletBase;
}(ItemBase);
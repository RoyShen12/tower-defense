function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @typedef {{x: number, y: number}} PositionLike
 */
let Position =
/*#__PURE__*/
function () {
  _createClass(Position, null, [{
    key: "distancePow2",

    /** 
     * @param {Position} a
     * @param {Position} b
     */
    value: function distancePow2(a, b) {
      const xm = a.x - b.x;
      const ym = a.y - b.y;
      return xm * xm + ym * ym;
    }
    /** 
     * @param {Position} a
     * @param {Position} b
     */

  }, {
    key: "distance",
    value: function distance(a, b) {
      return Math.sqrt(Position.distancePow2(a, b));
    }
    /** 
     * @param {number} x
     * @param {number} y
     */

  }]);

  function Position(x, y) {
    _classCallCheck(this, Position);

    /** @type {number} */
    this.x = x;
    /** @type {number} */

    this.y = y;
  }

  _createClass(Position, [{
    key: "copy",
    value: function copy() {
      return new Position(this.x, this.y);
    }
    /**
     * - 抖动
     * @param {number} amp 最大绝对抖动量
     * @param {number} minimalAmp 最小绝对抖动量
     */

  }, {
    key: "dithering",
    value: function dithering(amp, minimalAmp) {
      this.x += Tools.randomSig() * _.random(minimalAmp, amp, true);
      this.y += Tools.randomSig() * _.random(minimalAmp, amp, true);
      return this;
    }
    /** 
     * @param {PolarVector | Vector} speedVec
     */

  }, {
    key: "move",
    value: function move(speedVec) {
      if (speedVec instanceof PolarVector) {
        const baseUint = new Vector(1, 0).rotate(speedVec.theta).multiply(speedVec.r); // console.log(baseUint)

        this.x += baseUint.x;
        this.y += baseUint.y;
      } else {
        this.x += speedVec.x;
        this.y += speedVec.y;
      }

      return this;
    }
    /** 
     * @param {Position | PositionLike} pos
     * @param {number} speedValue
     */

  }, {
    key: "moveTo",
    value: function moveTo(pos, speedValue) {
      if (!speedValue) {
        this.x = pos.x;
        this.y = pos.y;
      } else {
        speedValue = Math.min(speedValue);
        const speedVec = Vector.unit(pos.x - this.x, pos.y - this.y).multiply(speedValue);
        this.x += speedVec.x;
        this.y += speedVec.y;
      }

      return this;
    }
    /**
     * @param {Position} other 
     * @param {number} epsilon 
     */

  }, {
    key: "equal",
    value: function equal(other, epsilon = 0) {
      return Math.abs(this.x - other.x) <= epsilon && Math.abs(this.y - other.y) <= epsilon;
    }
    /**
     * @param {Position} boundaryTL
     * @param {Position} boundaryBR
     */

  }, {
    key: "outOfBoundary",
    value: function outOfBoundary(boundaryTL, boundaryBR, epsilon = 0) {
      return boundaryTL.x - this.x > epsilon || boundaryTL.y - this.y > epsilon || this.x - boundaryBR.x > epsilon || this.y - boundaryBR.y > epsilon;
    }
  }, {
    key: "toString",
    value: function toString() {
      return `<${Tools.roundWithFixed(this.x, 1)}, ${Tools.roundWithFixed(this.y, 1)}>`;
    }
  }]);

  return Position;
}();

_defineProperty(Position, "O", new Position(0, 0));

let PolarVector =
/*#__PURE__*/
function () {
  /** 
   * @param {number} length
   * @param {number} direction
   */
  function PolarVector(length, direction) {
    _classCallCheck(this, PolarVector);

    /** @type {number} */
    this.r = length;
    /** @type {number} */

    this.theta = Math.PI / -180 * direction;
  }
  /**
   * - 极向量的抖动
   * - 有两个纬度，[theta]抖动和[R]抖动
   * @param {number} thetaAmp
   * @param {number} rAmp
   */


  _createClass(PolarVector, [{
    key: "dithering",
    value: function dithering(thetaAmp, rAmp) {
      this.theta += Tools.randomSig() * Math.random() * thetaAmp;
      this.r += Tools.randomSig() * Math.random() * rAmp;
      return this;
    }
  }, {
    key: "multiply",
    value: function multiply(f) {
      const p = this.copy();
      p.r *= f;
      return p;
    }
  }, {
    key: "normalize",
    value: function normalize() {
      const p = this.copy();
      p.r = 1;
      return p;
    }
  }, {
    key: "copy",
    value: function copy() {
      const t = new PolarVector(0, 0);
      t.r = this.r;
      t.theta = this.theta;
      return t;
    }
  }, {
    key: "toString",
    value: function toString() {
      return `(${Tools.roundWithFixed(this.r, 1)}, ${Tools.roundWithFixed(this.theta / Math.PI, 3)}π)`;
    }
  }]);

  return PolarVector;
}();

let Vector =
/*#__PURE__*/
function (_Position) {
  _inherits(Vector, _Position);

  _createClass(Vector, null, [{
    key: "unit",

    /** 
     * @param {number} x
     * @param {number} y
     */
    value: function unit(x, y) {
      const u = new Vector(x, y);
      const dvd = u.length();
      return u.divide(dvd);
    }
    /** 
     * @param {number} x
     * @param {number} y
     */

  }]);

  function Vector(x, y) {
    _classCallCheck(this, Vector);

    return _possibleConstructorReturn(this, _getPrototypeOf(Vector).call(this, x, y));
  }

  _createClass(Vector, [{
    key: "toPolar",
    value: function toPolar() {
      return new PolarVector(this.length(), Math.atan(this.y / this.x));
    }
  }, {
    key: "copy",
    value: function copy() {
      return new Vector(this.x, this.y);
    }
  }, {
    key: "length",
    value: function length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  }, {
    key: "normalize",
    value: function normalize() {
      const inv = 1 / this.length();
      return new Vector(this.x * inv, this.y * inv);
    }
  }, {
    key: "negate",
    value: function negate() {
      return new Vector(-1 * this.x, -1 * this.y);
    }
    /** 
     * @param {Vector} v
     */

  }, {
    key: "add",
    value: function add(v) {
      return new Vector(this.x + v.x, this.y + v.y);
    }
    /** 
     * @param {Vector} v
     */

  }, {
    key: "subtract",
    value: function subtract(v) {
      return new Vector(this.x - v.x, this.y - v.y);
    }
    /** 
     * @param {number} f
     */

  }, {
    key: "multiply",
    value: function multiply(f) {
      return new Vector(this.x * f, this.y * f);
    }
    /** 
     * @param {number} f
     */

  }, {
    key: "divide",
    value: function divide(f) {
      const invf = 1 / f;
      return new Vector(this.x * invf, this.y * invf);
    }
    /** 
     * @param {number} angle
     * @param {PositionLike} center
     */

  }, {
    key: "rotate",
    value: function rotate(angle, center = {
      x: 0,
      y: 0
    }) {
      return new Vector((this.x - center.x) * Math.cos(angle) - (this.y - center.y) * Math.sin(angle) + center.x, (this.x - center.x) * Math.sin(angle) + (this.y - center.y) * Math.cos(angle) + center.y);
    }
  }]);

  return Vector;
}(Position);

_defineProperty(Vector, "zero", new Vector(0, 0));
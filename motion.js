/**
 * @typedef {{x: number, y: number}} PositionLike
 */

class Position {

  static O = new Position(0, 0)

  /** 
   * @param {Position} a
   * @param {Position} b
   */
  static distancePow2(a, b) {
    const xm = a.x - b.x
    const ym = a.y - b.y
    return xm * xm + ym * ym
  }

  /** 
   * @param {Position} a
   * @param {Position} b
   */
  static distance(a, b) {
    return Math.sqrt(Position.distancePow2(a, b))
  }

  /** 
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {

    /** @type {number} */
    this.x = x
    /** @type {number} */
    this.y = y
  }

  copy() {
    return new Position(this.x, this.y)
  }
  
  /**
   * - 抖动
   * @param {number} amp 最大绝对抖动量
   * @param {number} minimalAmp 最小绝对抖动量
   */
  dithering(amp, minimalAmp) {
    this.x += Tools.randomSig() * _.random(minimalAmp, amp, true)
    this.y += Tools.randomSig() * _.random(minimalAmp, amp, true)
    return this
  }

  /** 
   * @param {PolarVector | Vector} speedVec
   */
  move(speedVec) {
    if (speedVec instanceof PolarVector) {
      const baseUint = new Vector(1, 0).rotate(speedVec.theta).multiply(speedVec.r)
      // console.log(baseUint)
      this.x += baseUint.x
      this.y += baseUint.y
    }
    else {
      this.x += speedVec.x
      this.y += speedVec.y
    }
    return this
  }

  /** 
   * @param {Position | PositionLike} pos
   * @param {number} speedValue
   */
  moveTo(pos, speedValue) {
    if (!speedValue) {
      this.x = pos.x
      this.y = pos.y
    }
    else {
      speedValue = Math.min(speedValue)
      const speedVec = Vector.unit(pos.x - this.x, pos.y - this.y).multiply(speedValue)
      this.x += speedVec.x
      this.y += speedVec.y
    }
    return this
  }

  /**
   * @param {Position} other 
   * @param {number} epsilon 
   */
  equal(other, epsilon = 0) {
    return Math.abs(this.x - other.x) <= epsilon && Math.abs(this.y - other.y) <= epsilon
  }

  /**
   * @param {Position} boundaryTL
   * @param {Position} boundaryBR
   */
  outOfBoundary(boundaryTL, boundaryBR, epsilon = 0) {
    return boundaryTL.x - this.x > epsilon || boundaryTL.y - this.y > epsilon || this.x - boundaryBR.x > epsilon || this.y - boundaryBR.y > epsilon
  }

  toString() {
    return `<${Tools.roundWithFixed(this.x, 1)}, ${Tools.roundWithFixed(this.y, 1)}>`
  }

}

class PolarVector {

  /** 
   * @param {number} length
   * @param {number} direction
   */
  constructor(length, direction) {
    /** @type {number} */
    this.r = length
    /** @type {number} */
    this.theta = Math.PI / -180 * direction
  }

  /**
   * - 极向量的抖动
   * - 有两个纬度，[theta]抖动和[R]抖动
   * @param {number} thetaAmp
   * @param {number} rAmp
   */
  dithering(thetaAmp, rAmp) {
    this.theta += Tools.randomSig() * Math.random() * thetaAmp
    this.r += Tools.randomSig() * Math.random() * rAmp
    return this
  }

  multiply(f) {
    const p = this.copy()
    p.r *= f
    return p
  }

  normalize() {
    const p = this.copy()
    p.r = 1
    return p
  }

  copy() {
    const t = new PolarVector(0, 0)
    t.r = this.r
    t.theta = this.theta
    return t
  }

  toString() {
    return `(${Tools.roundWithFixed(this.r, 1)}, ${Tools.roundWithFixed(this.theta / Math.PI, 3)}π)`
  }
}

class Vector extends Position {

  static zero = new Vector(0, 0)

  /** 
   * @param {number} x
   * @param {number} y
   */
  static unit(x, y) {
    const u = new Vector(x, y)
    const dvd = u.length()
    return u.divide(dvd)
  }

  /** 
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    super(x, y)
  }

  toPolar() {
    return new PolarVector(this.length(), Math.atan(this.y / this.x))
  }

  copy() {
    return new Vector(this.x, this.y)
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize() {
    const inv = 1 / this.length()
    return new Vector(this.x * inv, this.y * inv)
  }

  negate() {
    return new Vector(-1 * this.x, -1 * this.y)
  }

  /** 
   * @param {Vector} v
   */
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  /** 
   * @param {Vector} v
   */
  subtract(v) {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  /** 
   * @param {number} f
   */
  multiply(f) {
    return new Vector(this.x * f, this.y * f)
  }

  /** 
   * @param {number} f
   */
  divide(f) {
    const invf = 1 / f
    return new Vector(this.x * invf, this.y * invf)
  }

  /** 
   * @param {number} angle
   * @param {PositionLike} center
   */
  rotate(angle, center = { x: 0, y: 0 }) {
    return new Vector(
      (this.x - center.x) * Math.cos(angle) - (this.y - center.y) * Math.sin(angle) + center.x,
      (this.x - center.x) * Math.sin(angle) + (this.y - center.y) * Math.cos(angle) + center.y
    )
  }
}
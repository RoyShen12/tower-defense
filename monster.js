class MonsterManager {

  static monsterCtors = {
    Swordman: 'Swordman',
    Axeman: 'Axeman',
    LionMan: 'LionMan',
    HighPriest: 'HighPriest',
    Devil: 'Devil'
  }

  constructor() {

    /** @type {MonsterBase[]} */
    this.monsters = []

    /** @type {Map<string, typeof MonsterBase>} */
    this.__mctor_cache = new Map()
  }

  /**
   * @param {string} monsterName
   * @param {Position} position
   * @param {string | ImageBitmap | Promise<ImageBitmap> | AnimationSprite} image
   * @param {number} level
   *
   * @returns {MonsterBase}
   */
  Factory(monsterName, position, image, level, ...extraArgs) {

    let ctor = null

    if (this.__mctor_cache.has(monsterName)) {
      ctor = this.__mctor_cache.get(monsterName)
    }
    else {
      ctor = eval(monsterName)
      this.__mctor_cache.set(monsterName, ctor)
    }

    const nm = new ctor(position, image, level, ...extraArgs)
    this.monsters.push(nm)
    return nm
  }

  /**
   * @param {(pos: Position) => ({x:number,y:number}[])} pathGetter
   * @param {(changing: number) => void} lifeToken
   * @param {TowerBase[]} towers
   * @param {MonsterBase[]} monsters
   */
  run(pathGetter, lifeToken, towers, monsters) {
    this.monsters.forEach(m => {
      m.run(pathGetter(m.position), lifeToken, towers, monsters)
    })
  }

  render(ctx, imgCtl) {
    this.monsters.forEach(m => m.render(ctx, imgCtl))
  }

  scanSwipe(emitCallback) {
    this.monsters = this.monsters.filter(m => {
      if (m.isDead) {
        emitCallback(m.reward)
        m.destory()
      }
      return !m.isDead
    })
  }

  get totalCurrentHealth() {
    return _.sumBy(this.monsters, '__inner_current_health')
  }

  get maxLevel() {
    return this.monsters.length > 0 ? _.maxBy(this.monsters, '__inner_level').__inner_level : 0
  }
}

class Swordman extends MonsterBase {

  static imgName = '$spr::m_act_white_sword'
  static sprSpd = 4

  static rwd = lvl => 20 * lvl + 20
  static spd = lvl => Math.min(.3 + lvl / 60, 1.15)
  static hth = lvl => 120 + lvl * 40
  static amr = lvl => 3 + lvl / 8

  constructor(position, image, level) {
    super(
      position,
      Game.callGridSideSize() / 3 - 2,
      0,
      null,
      image,
      level,
      Swordman.rwd,
      Swordman.spd,
      Swordman.hth,
      Swordman.amr
    )
  }
}

class Axeman extends MonsterBase {

  static imgName = '$spr::m_act_green_axe'
  static sprSpd = 4

  static rwd = lvl => 30 * lvl + 20
  static spd = lvl => Math.min(.25 + lvl / 80, 1)
  static hth = lvl => 300 + lvl * 100
  static amr = lvl => 15 + lvl / 3

  constructor(position, image, level) {
    super(
      position,
      Game.callGridSideSize() / 3 - 2,
      0,
      null,
      image,
      level,
      Axeman.rwd,
      Axeman.spd,
      Axeman.hth,
      Axeman.amr
    )
  }
}

class LionMan extends MonsterBase {

  static imgName = '$spr::m_lion'
  static sprSpd = 6

  static rwd = lvl => 40 * lvl + 20
  static spd = lvl => Math.min(.38 + lvl / 70, 1.2)
  static hth = lvl => 580 + lvl * 122
  static amr = lvl => 22 + lvl

  constructor(position, image, level) {
    super(
      position,
      Game.callGridSideSize() / 3 - 2,
      0,
      null,
      image,
      level,
      LionMan.rwd,
      LionMan.spd,
      LionMan.hth,
      LionMan.amr
    )
  }
}

class HighPriest extends MonsterBase {
  static imgName = '$spr::m_b_worm_dragon'
  static sprSpd = 6

  static rwd = lvl => 240 * lvl + 1320
  static spd = () => .11
  static hth = lvl => 14400 + lvl * 8000
  static amr = () => 4

  static healingInterval = () => 3000
  static healingPower = lvl => 40 * (Math.floor(lvl / 9) + 1)
  static healingRange = () => 30

  constructor(position, image, level) {
    super(
      position,
      Game.callGridSideSize() / 2 - 1,
      0,
      null,
      image,
      level,
      HighPriest.rwd,
      HighPriest.spd,
      HighPriest.hth,
      HighPriest.amr
    )

    this.lastHealTime = performance.now()

    this.isBoss = true
  }

  get healthBarWidth() {
    return this.radius * 2.5
  }

  get healthBarHeight() {
    return 4
  }

  get canHeal() {
    return performance.now() - this.lastHealTime > this.Hitv
  }

  /**
   * 治疗间隔
   */
  get Hitv() {
    // @ts-ignore
    const base = HighPriest.healingInterval(this.__inner_level)
    return _.random(base - 200, base + 200, false)
  }

  /**
   * 治疗量
   */
  get Hpow() {
    // @ts-ignore
    return HighPriest.healingPower(this.__inner_level)
  }

  /**
   * 治疗范围
   */
  get Hrng() {
    // @ts-ignore
    return HighPriest.healingRange(this.__inner_level)
  }

  /** @param {MonsterBase} target */
  inHealingRange(target) {
    return Position.distancePow2(target.position, this.position) < this.Hrng * this.Hrng
  }

  /** @param {MonsterBase} target */
  healing(target) {
    target.health += this.Hpow
  }

  /**
   * 周期性治愈周围怪物单位
   * @override
   * @param {TowerBase[]} towers
   * @param {MonsterBase[]} monsters
   */
  makeEffect(towers, monsters) {

    if (this.canHeal) {

      const position = new Position(this.position.x - this.Hrng / 2, this.position.y - this.Hrng / 2)
      Game.callAnimation('healing_1', position, this.Hrng, this.Hrng, 1, 0)

      monsters.forEach(m => {
        if (this.inHealingRange(m)) {
          this.healing(m)
        }
      })

      this.lastHealTime = performance.now()
    }
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  renderHealthBar(context) {
    super.renderHealthBar(context)

    const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius

    context.save()
    context.fillStyle = 'rgba(0,0,0,1)'
    context.font = '8px TimesNewRoman'
    context.fillText(`${Tools.chineseFormatter(this.health, 1)}/${Tools.chineseFormatter(this.maxHealth, 1)}`, this.position.x - this.radius - xaxisOffset + this.healthBarWidth + 2, this.position.y + this.inscribedSquareSideLength / 1.5 + 5)
    context.restore()
  }
}

class Devil extends MonsterBase {

  static imgName = '$spr::m_devil'
  static sprSpd = 6

  static rwd = lvl => 340 * lvl + 420
  static spd = lvl => .14
  static hth = lvl => 15500 + lvl * 13000
  static amr = lvl => 32 + lvl * 8

  static summonInterval = () => 7000

  constructor(position, image, level) {
    super(
      position,
      Game.callGridSideSize() / 1.4 + 3,
      0,
      null,
      image,
      level,
      Devil.rwd,
      Devil.spd,
      Devil.hth,
      Devil.amr
    )

    this.isBoss = true
  }

  get healthBarWidth() {
    return this.radius * 2.5
  }

  get healthBarHeight() {
    return 4
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  renderHealthBar(context) {
    super.renderHealthBar(context)

    const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius

    context.save()
    context.fillStyle = 'rgba(0,0,0,1)'
    context.font = '8px TimesNewRoman'
    context.fillText(`${Tools.chineseFormatter(this.health, 1)}/${Tools.chineseFormatter(this.maxHealth, 1)}`, this.position.x - this.radius - xaxisOffset + this.healthBarWidth + 2, this.position.y + this.inscribedSquareSideLength / 1.5 + 5)
    context.restore()
  }
}

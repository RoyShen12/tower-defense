/// <reference path="./base.ts" />

class MonsterManager {

  static monsterCtors = {
    Swordman: 'Swordman',
    Axeman: 'Axeman',
    LionMan: 'LionMan',
    HighPriest: 'HighPriest',
    Devil: 'Devil'
  }
  public monsters: MonsterBase[] = []
  private __mctor_cache: Map<string, IMonsterBase> = new Map()

  Factory(monsterName: string, position: Position, image: string | ImageBitmap | AnimationSprite, level: number, ...extraArgs: any[]): MonsterBase {

    let ctor: IMonsterBase = null

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

  run(pathGetter: (pos: Position) => PositionLike[], lifeToken: (changing: number) => void, towers: TowerBase[], monsters: MonsterBase[]) {
    this.monsters.forEach(m => {
      m.run(pathGetter(m.position), lifeToken, towers, monsters)
    })
  }

  render(ctx: WrappedCanvasRenderingContext2D, imgCtl: ImageManger) {
    this.monsters.forEach(m => m.render(ctx as CanvasRenderingContext2D, imgCtl))
  }

  scanSwipe(emitCallback: (rwd: number) => void) {
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
    return this.monsters.length > 0 ? _.maxBy(this.monsters, '__inner_level').level : 0
  }
}

class Swordman extends MonsterBase {
  makeEffect(): void {}
  renderHealthChange(): void {}

  static imgName = '$spr::m_act_white_sword'
  static sprSpd = 4

  static rwd = (lvl: number) => 20 * lvl + 20
  static spd = (lvl: number) => Math.min(.3 + lvl / 60, 1.15)
  static hth = (lvl: number) => 120 + lvl * 40
  static amr = (lvl: number) => 3 + lvl / 8

  constructor(position: Position, image: string | AnimationSprite | ImageBitmap, level: number) {
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

    this.name = '邪恶的剑士'
    this.description = '曾今是流浪的剑士，如今被大魔神控制'
  }
}

class Axeman extends MonsterBase {
  makeEffect(): void {}
  renderHealthChange(): void {}

  static imgName = '$spr::m_act_green_axe'
  static sprSpd = 4

  static rwd = (lvl: number) => 30 * lvl + 20
  static spd = (lvl: number) => Math.min(.25 + lvl / 80, 1)
  static hth = (lvl: number) => 300 + lvl * 100
  static amr = (lvl: number) => 5 + lvl / 6

  constructor(position: Position, image: string | AnimationSprite | ImageBitmap, level: number) {
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

    this.name = '蛮族斧手'
    this.description = ''
  }
}

class LionMan extends MonsterBase {
  makeEffect(): void {}
  renderHealthChange(): void {}

  static imgName = '$spr::m_lion'
  static sprSpd = 6

  static rwd = (lvl: number) => 40 * lvl + 20
  static spd = (lvl: number) => Math.min(.38 + lvl / 70, 1.2)
  static hth = (lvl: number) => 580 + lvl * 122
  static amr = (lvl: number) => 22 + lvl / 5

  constructor(position: Position, image: string | AnimationSprite | ImageBitmap, level: number) {
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

    this.name = '狮人'
    this.description = ''
  }
}

class HighPriest extends MonsterBase {
  renderHealthChange(): void {}

  static imgName = '$spr::m_b_worm_dragon'
  static sprSpd = 6

  static rwd = (lvl: number) => 240 * lvl + 1320
  static spd = () => .11
  static hth = (lvl: number) => 14400 + lvl * 8000
  static amr = () => 14

  static healingInterval = (_lvl?: number) => 5000
  static healingPower = (lvl: number) => 40 * (Math.floor(lvl / 25) + 1)
  static healingRange = (_lvl?: number) => 30

  private lastHealTime: number = performance.now()

  constructor(position: Position, image: string | AnimationSprite | ImageBitmap, level: number) {
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

    this.isBoss = true

    this.name = '龙人萨满'
    this.type = '首领'
    this.description = ''
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
    const base = HighPriest.healingInterval(this.level)
    return _.random(base - 200, base + 200, false)
  }

  /**
   * 治疗量
   */
  get Hpow() {
    return HighPriest.healingPower(this.level)
  }

  /**
   * 治疗范围
   */
  get Hrng() {
    return HighPriest.healingRange(this.level)
  }

  /** @param {MonsterBase} target */
  inHealingRange(target: MonsterBase) {
    return Position.distancePow2(target.position, this.position) < this.Hrng * this.Hrng
  }

  /** @param {MonsterBase} target */
  healing(target: MonsterBase) {
    target.health += this.Hpow
  }

  /**
   * 周期性治愈周围怪物单位
   */
  makeEffect(_towers: TowerBase[], monsters: MonsterBase[]) {

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
  renderHealthBar(context: CanvasRenderingContext2D) {
    super.renderHealthBar(context)

    const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius

    context.save()
    context.fillStyle = this.healthBarTextFillStyle
    context.font = this.healthBarTextFontStyle
    context.fillText(`${Tools.chineseFormatter(this.health, 1)}/${Tools.chineseFormatter(this.maxHealth, 1)}`, this.position.x + this.radius + xaxisOffset + 2, this.position.y + this.inscribedSquareSideLength / 1.5 + 5)
    context.restore()
  }
}

class Devil extends MonsterBase {
  makeEffect(): void {}
  renderHealthChange(): void {}

  static imgName = '$spr::m_devil'
  static sprSpd = 6

  static rwd = (lvl: number) => 340 * lvl + 420
  static spd = (_lvl?: number) => .14
  static hth = (lvl: number) => 15500 + lvl * 13000
  static amr = (lvl: number) => 32 + lvl

  static summonInterval = () => 7000

  constructor(position: Position, image: string | AnimationSprite | ImageBitmap, level: number) {
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

    this.name = '地狱之王'
    this.type = '首领'
    this.description = ''
  }

  get healthBarWidth() {
    return this.radius * 2.5
  }

  get healthBarHeight() {
    return 4
  }

  renderHealthBar(context: CanvasRenderingContext2D) {
    super.renderHealthBar(context)

    const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius

    context.save()
    context.fillStyle = this.healthBarTextFillStyle
    context.font = this.healthBarTextFontStyle
    context.fillText(`${Tools.chineseFormatter(this.health, 1)}/${Tools.chineseFormatter(this.maxHealth, 1)}`, this.position.x + this.radius + xaxisOffset + 2, this.position.y + this.inscribedSquareSideLength / 1.5 + 5)
    context.restore()
  }
}

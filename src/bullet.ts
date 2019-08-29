/// <reference path="./base.ts" />

/**
 * 单例
 */
class BulletManager {

  static instance: BulletManager = null

  public bullets: BulletBase[]
  private __bctor_cache: Map<string, IBulletBase>

  constructor() {

    if (!BulletManager.instance) {
      this.bullets = []
      this.__bctor_cache = new Map()

      BulletManager.instance = this
    }

    return BulletManager.instance
  }

  Factory(emitter: typeof TowerBase.prototype.recordDamage, bulletName: string, position: Position, atk: number, target: MonsterBase, image: ImageBitmap | string, ...extraArgs: any[]): BulletBase {

    let ctor: IBulletBase = null

    if (this.__bctor_cache.has(bulletName)) {
      ctor = this.__bctor_cache.get(bulletName)
    }
    else {
      ctor = eval(bulletName)
      this.__bctor_cache.set(bulletName, ctor)
    }

    const bb = new ctor(position, atk, target, image, ...extraArgs)
    bb.setDamageEmitter(emitter)
    this.bullets.push(bb)
    return bb
  }

  run(monsters: MonsterBase[]) {
    this.bullets.forEach(b => b.run(monsters))
  }

  render(ctx: WrappedCanvasRenderingContext2D) {
    this.bullets.forEach(b => b.render(ctx as CanvasRenderingContext2D))
  }

  scanSwipe() {
    this.bullets = this.bullets.filter(b => {
      if (b.fulfilled) b.destory()
      return !b.fulfilled
    })
  }
}

class CannonBullet extends BulletBase {

  static bulletVelocity = 4

  protected aimPosition: Position
  protected explosionDmg: number
  protected explosionRadius: number
  protected burnDotDamage: number
  protected burnDotInterval: number
  protected burnDotDuration: number
  protected ratioCalc: (monster: MonsterBase) => number

  constructor(position: Position, atk: number, target: MonsterBase, _bimg: null, explosionDmg: number, explosionRadius: number, burnDotDamage: number, burnDotInterval: number, burnDotDuration: number, extraBV: number | null, ratioCalc: (monster: MonsterBase) => number) {
    super(position, 2, 1, 'rgba(15,244,11,.9)', 'rgba(15,12,11,.6)', atk, CannonBullet.bulletVelocity + (extraBV || 0), target)

    this.aimPosition = null

    this.explosionDmg = explosionDmg
    this.explosionRadius = explosionRadius
    this.burnDotDamage = burnDotDamage
    this.burnDotInterval = burnDotInterval
    this.burnDotDuration = burnDotDuration

    this.ratioCalc = ratioCalc
  }

  get isReaching() {
    if (this.aimPosition) return Position.distancePow2(this.position, this.aimPosition) < Math.pow(20 + this.radius, 2)
    return super.isReaching
  }

  get burnDotCount() {
    return this.burnDotDuration / this.burnDotInterval
  }

  /**
   * 加农炮弹在丢失目标后仍会向最后记录的目标位置飞行并爆炸
   */
  run(monsters: MonsterBase[]) {

    if (!this.target) {

      this.position.moveTo(this.aimPosition, this.speed)
    }
    else {

      this.position.moveTo(this.target.position, this.speed)

      if (this.target.isDead) {
        this.aimPosition = this.target.position.copy()
        this.target = null
      }
    }

    if (this.isReaching) {
      this.hit(this.target, 1, monsters)
      this.fulfilled = true
    }
  }

  /**
   * 击中敌人后会引起爆炸
   * 并点燃敌人，造成周期伤害
   */
  hit(monster: MonsterBase, _magnification: number = 1, monsters: MonsterBase[]) {
    if (monster) super.hit(monster, this.ratioCalc(monster))

    const target = this.target ? this.target.position : this.aimPosition

    const positionTL = new Position(target.x - this.explosionRadius, target.y - this.explosionRadius)
    // render explosion
    Game.callAnimation('explo_3', positionTL, this.explosionRadius * 2, this.explosionRadius * 2, .5, 0)
    // make exploding dmg
    monsters.forEach(m => {
      if (Position.distancePow2(m.position, target) < this.explosionRadius * this.explosionRadius) {
        m.health -= this.explosionDmg * (1 - m.armorResistance) * this.ratioCalc(m)
        this.emitter(m)

        Tools.installDot(
          m,
          'beBurned',
          this.burnDotDuration,
          this.burnDotInterval,
          this.burnDotDamage * this.ratioCalc(m),
          false,
          this.emitter.bind(this)
        )
      }
    })
  }
}

class ClusterBomb extends CannonBullet {

  constructor(...args: any) {
    //@ts-ignore
    super(...args)

    this.radius += 4
    this.borderStyle = 'rgba(14,244,11,.9)'
    this.fill = 'rgba(215,212,11,.6)'
    this.speed += 2
  }

  get childExplodeRadius() {
    return this.explosionRadius * .5
  }

  get childBombDistance() {
    return this.explosionRadius * .5
  }

  get childExplodeDamage() {
    return this.explosionDmg * .8
  }

  clusterExplode(monsters: MonsterBase[], radius: number, dist: number, dmg: number, degree: number, waitFrame: number) {
    const childExplodePositions = _.range(0, 360, degree).map(d => {
      const vec = new PolarVector(dist, d)
      const pos = this.position.copy().move(vec)

      const positionTL = new Position(pos.x - radius, pos.y - radius)
      Game.callAnimation('explo_3', positionTL, radius * 2, radius * 2, .5, 0, waitFrame)
      return pos
    })

    monsters.forEach(m => {

      childExplodePositions
        .filter(ep => Position.distancePow2(m.position, ep) < radius * radius)
        .forEach(() => {

          m.health -= dmg * (1 - m.armorResistance) * this.ratioCalc(m)
          this.emitter(m)
          Tools.installDot(
            m,
            'beBurned',
            this.burnDotDuration,
            this.burnDotInterval,
            this.burnDotDamage * this.ratioCalc(m),
            false,
            this.emitter.bind(this)
          )
        })
    })
  }

  /**
   * 集束炸弹命中或到达目的地后会爆炸，分裂出[n]枚小型炸弹
   */
  hit(monster: MonsterBase, _magnification: number = 1, monsters: MonsterBase[]) {
    if (monster) super.hit(monster, _magnification, monsters)

    this.clusterExplode(monsters, this.childExplodeRadius, this.childBombDistance, this.childExplodeDamage, 45, 10)
  }
}

class ClusterBombEx extends ClusterBomb {
  constructor(...args: any) {
    super(...args)

    this.radius += 2
    this.fill = 'rgba(245,242,11,.8)'
  }

  get grandChildExplodeRadius() {
    return super.childExplodeRadius * .5
  }

  get grandChildBombDistance() {
    return super.childBombDistance * 2
  }

  get grandChildExplodeDamage() {
    return super.childExplodeDamage * .8
  }

  hit(monster: MonsterBase, _magnification: number = 1, monsters: MonsterBase[]) {
    super.hit(monster, _magnification, monsters)

    this.clusterExplode(monsters, this.grandChildExplodeRadius, this.grandChildBombDistance, this.grandChildExplodeDamage, 30, 20)
  }
}

class NormalArrow extends BulletBase {

  static bulletVelocity = 18

  private critChance: number
  private critRatio: number
  private willTrap: boolean
  private trapDuration: number
  private isSecKill: boolean

  constructor(position: Position, atk: number, target: MonsterBase, image: string | ImageBitmap, critChance: number, critRatio: number, trapChance: number, trapDuration: number, extraBV: number | null, isSecKill: boolean) {
    super(position, 8, 0, null, image, atk, NormalArrow.bulletVelocity + (extraBV || 0), target)

    this.critChance = critChance
    this.critRatio = critRatio

    this.willTrap = Math.random() > (1 - trapChance / 100)
    this.trapDuration = trapDuration

    this.isSecKill = isSecKill
  }

  hit(monster: MonsterBase) {

    if (this.isSecKill) {
      monster.health -= monster.health + 1
      this.emitter(monster)
      return
    }

    // 摇骰子，确定本次是否暴击
    const critMagnification = Math.random() < this.critChance ? this.critRatio : 1
    // console.log(critMagnification + ' X')

    // 穿甲
    monster.health -= this.Atk * critMagnification * (1 - monster.armorResistance * .7)
    this.emitter(monster)

    /**
     * 束缚
     */
    if (this.willTrap) {
      monster.registerImprison(this.trapDuration / 1000 * 60)
    }
  }
}

class PoisonCan extends BulletBase {

  static bulletVelocity = 6

  private poisonAtk: number
  private poisonItv: number
  private poisonDur: number

  constructor(position: Position, atk: number, target: MonsterBase, _image: null, poisonAtk: number, poisonItv: number, poisonDur: number, extraBV: number | null) {
    super(position, 2, 1, 'rgba(244,22,33,1)', 'rgba(227,14,233,.9)', atk, PoisonCan.bulletVelocity + (extraBV || 0), target)

    this.poisonAtk = poisonAtk
    this.poisonItv = poisonItv
    this.poisonDur = poisonDur
  }

  hit(monster: MonsterBase) {
    super.hit(monster)

    Tools.installDot(
      monster,
      'bePoisoned',
      this.poisonDur,
      this.poisonItv,
      this.poisonAtk,
      true,
      this.emitter.bind(this)
    )
  }
}

class Blade extends BulletBase {

  static bulletVelocity = 12

  private bounceTime: number
  private damageFadePerBounce: number

  constructor(position: Position, atk: number, target: MonsterBase, image: string | ImageBitmap, bounceTime: number, damageFadePerBounce: number) {
    super(position, 4, 0, null, image, atk, Blade.bulletVelocity, target)

    this.bounceTime = bounceTime
    this.damageFadePerBounce = damageFadePerBounce
  }

  run(monsters: MonsterBase[]) {
    this.position.moveTo(this.target.position, this.speed)

    if (this.target.isDead) {
      this.fulfilled = true
      this.target = null
    }
    else if (this.isReaching) {
      this.hit(this.target, 1, monsters)

      if (this.bounceTime > 0 && monsters.length > 1) {
        this.bounceToNext(monsters)
      }
      else {
        this.fulfilled = true
        this.target = null
      }
    }
    else if (this.position.outOfBoundary(Position.O, Game.callBoundaryPosition(), 50)) {
      console.log('a bullet has run out of the bound, and will be swipe by system.')
      console.log(this)
      this.fulfilled = true
      this.target = null
    }
  }

  bounceToNext(monsters: MonsterBase[]) {
    // const newTarget = _.minBy(monsters, mst => {
    //   if (mst === this.target) return Infinity
    //   const dist = Position.distancePow2(mst.position, this.position)
    //   return dist
    // })
    const newTarget = _.shuffle(monsters.filter(m => m !== this.target))[0]
    if (this.speed < 22) this.speed += 1

    this.target = newTarget
    this.Atk *= this.damageFadePerBounce
    this.bounceTime--
  }
}

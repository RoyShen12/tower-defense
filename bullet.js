class BulletManager {

  /** @type {BulletManager} */
  static instance = null

  constructor() {

    if (!BulletManager.instance) {

      /** @type {BulletBase[]} */
      this.bullets = []

      /** @type {Map<string, typeof BulletBase>} */
      this.__bctor_cache = new Map()

      BulletManager.instance = this
    }

    return BulletManager.instance
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
  Factory(emitter, bulletName, position, atk, target, image, ...extraArgs) {

    let ctor = null

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

  run(monsters) {
    this.bullets.forEach(b => b.run(monsters))
  }

  render(ctx) {
    this.bullets.forEach(b => b.render(ctx))
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

  /**
   * @param {(monster: MonsterBase) => number} ratioCalc
   */
  constructor(position, atk, target, bimg, explosionDmg, explosionRadius, burnDotDamage, burnDotInterval, burnDotDuration, extraBV, ratioCalc) {
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
   * @override
   */
  run(monsters) {

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
      this.hit(this.target, monsters)
      this.fulfilled = true
    }
  }

  /**
   * 击中敌人后会引起爆炸
   * 并点燃敌人，造成周期伤害
   * @param {MonsterBase} monster
   * @param {MonsterBase[]} monsters
   */
  
  hit(monster, monsters) {
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
        // if (!m.beBurned && !m.isDead) {
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
    })
  }
}

class ClusterBomb extends CannonBullet {

  constructor(...args) {
    
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

  clusterExplode(monsters, radius, dist, dmg, degree, waitFrame) {
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
          // if (!m.beBurned && !m.isDead) {
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
        })
    })
  }

  /**
   * 集束炸弹命中或到达目的地后会爆炸，分裂出[n]枚小型炸弹
   * @override
   * @param {MonsterBase[]} monsters
   */
  hit(monster, monsters) {
    if (monster) super.hit(monster, monsters)

    this.clusterExplode(monsters, this.childExplodeRadius, this.childBombDistance, this.childExplodeDamage, 45, 10)
  }
}

class ClusterBombEx extends ClusterBomb {
  constructor(...args) {
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

  hit(monster, monsters) {
    super.hit(monster, monsters)

    this.clusterExplode(monsters, this.grandChildExplodeRadius, this.grandChildBombDistance, this.grandChildExplodeDamage, 30, 20)
  }
}

class NormalArrow extends BulletBase {

  static bulletVelocity = 18

  constructor(position, atk, target, image, critChance, critRatio, trapChance, trapDuration, extraBV, isSecKill) {
    super(position, 8, 0, null, image, atk, NormalArrow.bulletVelocity + (extraBV || 0), target)

    this.critChance = critChance
    this.critRatio = critRatio

    this.willTrap = Math.random() > (1 - trapChance / 100)
    this.trapDuration = trapDuration

    this.isSecKill = isSecKill
  }

  /**
   * @param {MonsterBase} monster
   */
  hit(monster) {

    if (this.isSecKill) {
      monster.health -= monster.health + 1
      this.emitter(monster)
      return
    }

    // 摇骰子，确定本次是否暴击
    const lottery = Math.random()
    const isCrit = lottery < this.critChance
    const critMagnification = isCrit ? this.critRatio : 1
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

  /**
   * @param {number} poisonAtk
   * @param {number} poisonItv ms
   * @param {number} poisonDur ms
   */
  constructor(position, atk, target, image, poisonAtk, poisonItv, poisonDur, extraBV) {
    super(position, 2, 1, 'rgba(244,22,33,1)', 'rgba(227,14,233,.9)', atk, PoisonCan.bulletVelocity + (extraBV || 0), target)

    this.poisonAtk = poisonAtk
    this.poisonItv = poisonItv
    this.poisonDur = poisonDur
  }

  /**
   * @param {MonsterBase} monster
   */
  hit(monster) {
    super.hit(monster)

    // 毒罐的dot伤害
    // 无法对已中毒或死亡的目标施毒
    Tools.installDot(
      monster,
      'bePoisoned',
      this.poisonDur,
      this.poisonItv,
      this.poisonAtk,
      true,
      this.emitter.bind(this)
    )
    // if (monster.bePoisoned || monster.isDead) {
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
}

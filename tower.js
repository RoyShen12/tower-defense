const __testMode = localStorage.getItem('debug_mode') === '1'

const TowerManager = new Proxy(
  class _TowerManager {

    static independentCtors = [
      '_Jet'
    ]

    static towerCtors = [
      // {
      //   dn: 'Test_Tower',
      //   c: 'TestTower',
      //   od: 0,
      //   n: 't_test',
      //   p: [1],
      //   r: () => 1000,
      //   a: () => 1e16,
      //   h: () => 15,
      //   s: () => 1,
      //   bctor: 'TestTower.TestBullet'
      // },
      
      {
        dn: '弓箭塔',
        c: 'MaskManTower',
        od: 1,
        n: 'archer0',
        n2: 'archer1',
        n3: 'archer2',
        n4: 'archer3',
        p: new Proxy({}, {
          get(t, p, r) {
            if (p === 'length') return 130
            else return Math.ceil(Math.pow(1.1, +p) * 10)
          }
        }),
        r: lvl => lvl * 4 + 180,
        a: lvl => lvl * 2 + 2,
        h: () => 1,
        s: lvl => Math.floor(lvl / 20) + 2,
        bctor: 'NormalArrow',
        bn: 'normal_arrow',
        bn2: 'flame_arrow'
      },
      {
        dn: '加农炮塔',
        c: 'CannonShooter',
        od: 2,
        n: 'cannon0',
        n2: 'cannon1',
        n3: 'cannon2',
        p: new Proxy({}, {
          get(t, p, r) {
            if (p === 'length') return 150
            else return Math.ceil(Math.pow(1.1, +p) * 15)
          }
        }),
        r: lvl => lvl * 2 + 120,
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
      },
      {
        dn: '冰霜塔',
        c: 'FrostTower',
        od: 3,
        n: 'ice',
        p: new Proxy({}, {
          get(t, p, r) {
            if (p === 'length') return 50
            else return Math.ceil(Math.pow(1.1, +p) * 320)
          }
        }),
        r: lvl => lvl * 3 + 120,
        a: () => 0,
        h: () => Infinity,
        s: () => 0,
        // speed reduction
        sr: lvl => Math.min(Tools.MathFx.naturalLogFx(.1, .14)(lvl), 0.95)
      },
      {
        dn: '毒气塔',
        c: 'PoisonTower',
        od: 4,
        n: 'poison_t',
        p: new Proxy({}, {
          get(t, p, r) {
            if (p === 'length') return 190
            else return Math.ceil(Math.pow(1.1, +p) * 50)
          }
        }),
        r: lvl => lvl * 2 + 100,
        a: lvl => Math.round(lvl / 20 + 2),
        h: lvl => 2.1 + lvl * 0.1,
        s: () => 1,
        patk: lvl => lvl * 4 * Math.max(lvl / 25, 1) + 90,
        pitv: lvl => Math.max(600 - lvl * 20, 100),
        pdur: lvl => 4000 + lvl * 500,
        bctor: 'PoisonCan'
      },
      {
        dn: '电能塔',
        c: 'TeslaTower',
        od: 5,
        n: 'tesla0',
        n2: 'tesla1',
        n3: 'tesla2',
        p: new Proxy({}, {
          get(t, p, r) {
            if (p === 'length') return 180
            else return Math.ceil(Math.pow(1.1, +p) * 105)
          }
        }),
        r: () => 100,
        a: lvl => 18 + Math.round((lvl / 2 + 3) * (lvl / 2 + 3)),
        h: lvl => 0.75 + lvl * 0.01,
        s: () => 0
      },
      {
        dn: '魔法塔',
        c: 'BlackMagicTower',
        od: 6,
        n: 'magic0',
        n2: 'magic1',
        n3: 'magic2',
        n4: 'magic3',
        p: new Proxy({}, {
          get(t, p, r) {
            if (p === 'length') return 150
            else return Math.ceil(Math.pow(1.1, +p) * 200)
          }
        }),
        r: lvl => lvl * 4 + 180,
        a: lvl => 8800 + Math.round((lvl + 4) * (lvl + 4)),
        a2: lvl => 8800 + Math.round((lvl + 5) * (lvl + 5)),
        a3: lvl => 8800 + Math.round((lvl + 6) * (lvl + 6)),
        a4: lvl => 8800 + Math.round((lvl + 7) * (lvl + 7)),
        h: () => 0.125,
        s: () => 1,
        ide: lvl => Math.min(lvl * 0.022 + 0.1, 10),
        idr: lvl => 10000 + 1000 * lvl
      },
      {
        dn: '激光塔',
        c: 'LaserTower',
        od: 7,
        n: 'laser0',
        n2: 'laser1',
        n3: 'laser2',
        n4: 'laser3',
        n5: 'laser4',
        p: new Proxy({}, {
          get(t, p, r) {
            if (p === 'length') return 150
            else return Math.ceil(Math.pow(1.1, +p) * 500)
          }
        }),
        r: lvl => lvl * 1 + 90,
        a: lvl => Math.round(lvl * 3 + 10),
        h: () => 0.8,
        h2: () => 1,
        s: () => 1,
        s2: lvl => Math.floor(lvl / 30) + 1,
        s3: lvl => Math.floor(lvl / 28) + 3,
        lsd: lvl => 90, // laser swipe distance
        fatk: lvl => Math.pow(lvl, 1.05) * 10 + 160,
        fw: lvl => 40 + Math.floor(lvl / 8)
      },
      {
        dn: '航母',
        c: 'CarrierTower',
        od: 8,
        n: 'carrier0',
        n1: 'carrier1',
        n2: 'carrier2',
        cn: 'plane_1',
        p: new Proxy({}, {
          get(t, p, r) {
            if (p === 'length') return 200
            else return Math.ceil(Math.pow(1.1, +p) * 1000)
          }
        }),
        r: () => 150,
        a: lvl => 25 + lvl * 8,
        h: lvl => 1.8 + lvl * 0.01,
        s: () => 2,
        child: lvl => 1 + Math.floor(lvl / 20),
        spd: () => 5,
        bctor: 'CarrierTower.Jet.JetBullet'
      },
    ]

    static rankPostfixL1 = '老兵'
    static rankPostfixL2 = '身经百战'
    static rankPostfixL3 = '大师'

    constructor() {

      /** @type {TowerBase[]} */
      this.towers = []

      this.towerChangeHash = -1

      // TowerManager.Factory = this.Factory.bind(this)
    }

    /**
     * @param {string} towerName
     * @param {Position} position
     * @param {string | ImageBitmap | Promise<ImageBitmap> | AnimationSprite} image
     * @param {number} radius
     *
     * @returns {TowerBase}
     */
    Factory(towerName, position, image, bulletImage, radius, ...extraArgs) {

      const nt = new (eval(towerName))(position, image, bulletImage, radius, ...extraArgs)
      this.towers.push(nt)
      return nt
    }

    /**
     * @param {MonsterBase[]} monsters
     */
    run(monsters) {
      this.towers.forEach(t => {
        if (t.gem) t.gem.tickHook(t, monsters)
        t.run(monsters)
      })
    }

    render(ctx) {
      this.towers.forEach(t => t.render(ctx))
    }

    rapidRender(ctxRapid, monsters) {
      this.towers.forEach(t => t.rapidRender(ctxRapid, monsters))
    }

    makeHash() {
      const c = _.sumBy(this.towers, 'level')
      const l = this.towers.length
      return c + l + c * l
    }

    /**
     * 塔自身很少需要重绘，所以仅在必要时重绘塔图层
     * 此函数检测塔是否存在数量或登记的变化，并通知上层框架重绘
     * @returns {boolean} need to render
     */
    scanSwipe(emitCallback) {
      this.towers = this.towers.filter(t => {
        if (t.isSold) {
          emitCallback(t.sellingPrice)
          t.destory()
        }
        return !t.isSold
      })

      const currentTowerChangeHash = this.makeHash()

      const needRender = currentTowerChangeHash !== this.towerChangeHash
      // console.log('currentTowerChangeHash', currentTowerChangeHash, 'needRender', needRender)

      this.towerChangeHash = currentTowerChangeHash

      return needRender
    }

    get totalDamage() {
      return this.towers.reduce((cv, pv) => cv + pv.__total_damage, 0)
    }

    get totalKill() {
      return this.towers.reduce((cv, pv) => cv + pv.__kill_count, 0)
    }
  },
  {
    get: function (target, property, reciever) {
      if (typeof property === 'string' && /[A-Z]/.test(property[0])) {
        const tryFind = target.towerCtors.find(tc => tc.c === property)
        if (tryFind) {
          return tryFind
        }
      }
      return Reflect.get(target, property, reciever)
    }
  }
)

class TestTower extends TowerBase {
  static TestBullet = class _TestBullet extends BulletBase {
    constructor(position, atk, target) {
      super(position, 3, 0, null, 'rgba(15,44,11,1)', atk, 50, target)
    }
  }
  constructor(position, image, bimage, radius) {
    super(
      position,
      radius,
      0,
      null,
      image,
      
      TowerManager.TestTower.p,
      TowerManager.TestTower.a,
      TowerManager.TestTower.h,
      TowerManager.TestTower.s,
      TowerManager.TestTower.r
    )
    this.canInsertGem = false
    this.bulletCtorName = TowerManager.TestTower.bctor
    this.name = TowerManager.TestTower.dn
    this.description = 'TOWER FOR TEST DAMAGE'
  }
}

class CannonShooter extends TowerBase {

  // static informationDesc = new Map(Array.from(TowerBase.informationDesc).concat([
  //   ['爆炸半径', '炮弹发生爆炸的伤害范围，单位是像素'],
  // ]))

  static rankUpDesc1 = '\n+ 爆炸范围和伤害得到加强'
  static rankUpDesc2 = '\n+ 射程得到大幅加强'
  static rankUpDesc3 = '\n+ 命中后向四周抛出小型炸弹'
  static rankUpDesc4 = '\n+ 小型炸弹将分裂两次'

  constructor(position, image, bimg, radius) {
    super(
      position,
      radius,
      1,
      'rgba(156,43,12,.5)',
      image,
      TowerManager.CannonShooter.p,
      TowerManager.CannonShooter.a,
      TowerManager.CannonShooter.h,
      TowerManager.CannonShooter.s,
      TowerManager.CannonShooter.r
    )

    this.bulletCtorName = TowerManager.CannonShooter.bctor

    this.levelEpdRngFx = TowerManager.CannonShooter.expr
    this.levelEpdAtkFx = TowerManager.CannonShooter.expatk
    this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk
    this.levelBrnItvFx = TowerManager.CannonShooter.bditv
    this.levelBrnDurFx = TowerManager.CannonShooter.bddur

    this.name = TowerManager.CannonShooter.dn

    this.extraExplosionDamage = 0
    this.extraExplosionRange = 0

    /**
     * 爆炸伤害倍率
     */
    this.extraExplosionDamageRatio = 1

    /**
     * 爆炸范围倍率
     */
    this.extraExplosionRangeRatio = 1

    this.extraRange = 0

    this.extraBulletV = 0

    this.inner_desc_init = '发射火炮，在命中后会爆炸\n+ 附加灼烧效果'
    this.description = this.inner_desc_init
  }

  levelUp(currentMoney) {
    const ret = super.levelUp(currentMoney)

    if (ret !== 0) {
      switch(this.level) {
      case 5:
        this.rankUp()
        this.name = '榴弹塔'
        this.image = Game.callImageBitMap(TowerManager.CannonShooter.n2)
        this.description += CannonShooter.rankUpDesc1
        this.borderStyle = 'rgba(206,43,12,.7)'
        this.extraExplosionDamage = 100
        this.extraExplosionRange = 10
        this.extraBulletV = 2
        this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk2
        break
      case 10:
        this.rankUp()
        this.name = '导弹塔'
        this.image = Game.callImageBitMap(TowerManager.CannonShooter.n3)
        this.description += CannonShooter.rankUpDesc2
        this.borderStyle = 'rgba(246,43,12,.9)'
        this.extraExplosionDamage = 150
        this.extraRange = 100
        this.extraBulletV = 14
        this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk3
        break
      case 15:
        this.rankUp()
        this.name = '集束炸弹塔'
        this.description += CannonShooter.rankUpDesc3
        this.extraExplosionDamage = 200
        this.extraRange = 150
        this.extraExplosionRange = 20
        this.bulletCtorName = TowerManager.CannonShooter.bctor2
        this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk4
        break
      case 30:
        this.rankUp()
        this.name = '云爆塔'
        this.description += CannonShooter.rankUpDesc4
        this.extraExplosionDamage = 250
        this.extraRange = 200
        this.extraExplosionRange = 30
        this.bulletCtorName = TowerManager.CannonShooter.bctor3
        this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk5
        break
      case 40:
        this.rankUp()
        Object.defineProperty(this, 'extraExplosionDamage', {
          enumerable: true,
          get() {
            return 250 + Math.floor((this.level - 40) * 30)
          }
        })
        this.name += ` ${TowerManager.rankPostfixL1}I`
        break
      case 50:
        this.rankUp()
        this.name = this.name.replace('I', 'II')
        break
      case 60:
        this.rankUp()
        this.name = this.name.replace('II', 'III')
        break
      case 70:
        this.rankUp()
          this.name = this.name.replace('III', 'IV')
        this.extraExplosionDamageRatio = 1.5
        break
      case 80:
        this.rankUp()
        this.name = this.name.replace('IV', 'V')
        this.extraExplosionDamageRatio = 1.5 * 1.5
        break
      case 90:
        this.rankUp()
        this.name = this.name.replace(TowerManager.rankPostfixL1, TowerManager.rankPostfixL2).replace('V', 'I')
        this.extraExplosionDamageRatio = 1.5 * 1.5 * 1.5
        this.extraExplosionRangeRatio = 1.1
        break
      case 100:
        this.rankUp()
        this.name = this.name.replace('I', 'II')
        this.extraExplosionDamageRatio = 1.5 * 1.5 * 1.5 * 1.5
        this.extraExplosionRangeRatio = 1.2
        break
      }
    }

    return ret
  }

  /**
   * 爆炸范围
   */
  get EpdRng() {
    return (this.levelEpdRngFx(this.level) + this.extraExplosionRange) * this.extraExplosionRangeRatio
  }

  /**
   * 爆炸伤害
   */
  get EpdAtk() {
    return (this.levelEpdAtkFx(this.Atk) + this.extraExplosionDamage) * this.extraExplosionDamageRatio
  }

  /**
   * 灼烧伤害
   */
  get BrnAtk() {
    return this.levelBrnAtkFx(this.Atk)
  }

  /**
   * 灼烧间隔 ms
   */
  get BrnItv() {
    return this.levelBrnItvFx(this.level)
  }

  /**
   * 灼烧持续 ms
   */
  get BrnDur() {
    return this.levelBrnDurFx(this.level)
  }

  get Rng() {
    return super.Rng + this.reviceRange(this.extraRange)
  }

  get informationSeq() {
    return super.informationSeq.concat([
      ['爆炸半径', Tools.roundWithFixed(this.EpdRng, 1)],
      ['爆炸伤害', Tools.chineseFormatter(this.EpdAtk, 3)],
      ['每跳灼烧伤害', Math.round(this.BrnAtk)],
      ['灼烧伤害频率', Tools.roundWithFixed(this.BrnItv / 1000, 1) + ' 秒'],
      ['灼烧持续', Tools.roundWithFixed(this.BrnDur / 1000, 1) + ' 秒']
    ])
  }

  /**
   * @override
   */
  produceBullet() {
    this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk, this.target, this.bulletImage, this.EpdAtk, this.EpdRng, this.BrnAtk, this.BrnItv, this.BrnDur, this.extraBulletV, this.calculateDamageRatio.bind(this))
  }
}

class MaskManTower extends TowerBase {

  static rankUpDesc1 = '\n+ 射程和攻击力得到加强'
  static rankUpDesc2 = '\n+ 暴击能力得到大幅加强'
  static rankUpDesc3 = '\n+ 命中的箭矢将有几率束缚敌人'

  constructor(position, image, bimage, radius) {
    super(
      position,
      radius,
      1,
      'rgba(26,143,12,.3)',
      image,
      TowerManager.MaskManTower.p,
      TowerManager.MaskManTower.a,
      TowerManager.MaskManTower.h,
      TowerManager.MaskManTower.s,
      TowerManager.MaskManTower.r
    )

    this.bulletCtorName = TowerManager.MaskManTower.bctor
    this.bulletImage = bimage

    /** @type {MonsterBase[]} */
    this.multipleTarget = []

    this.name = TowerManager.MaskManTower.dn

    this.extraRange = 0
    this.extraHaste = 0
    this.extraPower = 0
    this.extraArrow = 0

    this.trapChance = 0
    this.trapDuration = 0

    this.extraBulletV = 0

    this.inner_desc_init = '每次向多个敌人射出箭矢\n+ 有几率暴击\n+ 拥有固定30%的护甲穿透'
    this.description = this.inner_desc_init

    this.critChance = 0.1
    this.critDamageRatio = 2
  }

  enhanceCrit(chanceDelta = .05, ratioDelta = 1) {
    if (this.critChance < 0.75) this.critChance += chanceDelta
    this.critDamageRatio += ratioDelta
  }

  levelUp(currentMoney) {
    const ret = super.levelUp(currentMoney)

    if (ret !== 0) {
      switch (this.level) {
      case 5:
        this.rankUp()
        this.name = '弩箭塔'
        this.image = Game.callImageBitMap(TowerManager.MaskManTower.n2)
        this.description += MaskManTower.rankUpDesc1
        this.borderStyle = 'rgba(26,143,12,.5)'
        this.extraRange = 160
        this.extraPower = 10
        this.extraBulletV = 2
        break
      case 10:
        this.rankUp()
        this.name = '火枪塔'
        this.image = Game.callImageBitMap(TowerManager.MaskManTower.n3)
        this.description += MaskManTower.rankUpDesc2
        this.borderStyle = 'rgba(26,203,12,.7)'
        this.enhanceCrit(0.15, 6)
        this.extraPower = 20
        this.extraBulletV = 4
        // this.bulletImage = Game.callImageBitMap(TowerManager.MaskManTower.bn2)
        break
      case 15:
        this.rankUp()
        this.name = '精灵神射手塔'
        this.description += MaskManTower.rankUpDesc3
        this.image = Game.callImageBitMap(TowerManager.MaskManTower.n4)
        this.borderStyle = 'rgba(26,255,12,.9)'
        this.enhanceCrit(0.1, 5)
        this.extraRange = 180
        this.trapChance = 5 // 5%
        this.trapDuration = 3000 // 3 second
        this.extraBulletV = 8
        Object.defineProperty(this, 'extraHaste', {
          enumerable: true,
          get() {
            return 0.5 + (this.level - 15) * 0.004
          }
        })
        // Object.defineProperty(this, 'extraArrow', {
        //   enumerable: true,
        //   get() {
        //     return Math.round(10 + this.level / 4)
        //   }
        // })
        this.extraArrow = 16
        break
      case 20:
        this.rankUp()
        this.name += ` ${TowerManager.rankPostfixL1}I`
        this.enhanceCrit(0.05, 5)
        break
      case 30:
        this.rankUp()
        this.name = this.name.replace('I', 'II')
        this.enhanceCrit()
        this.trapChance = 6
        this.trapDuration = 3500
        break
      case 40:
        this.rankUp()
        this.name = this.name.replace('II', 'III')
        this.enhanceCrit()
        this.trapChance = 7
        this.trapDuration = 4000
        break
      case 50:
        this.rankUp()
        this.name = this.name.replace('III', 'IV')
        this.enhanceCrit()
        this.trapChance = 7.5
        this.trapDuration = 4300
        break
      case 60:
        this.rankUp()
        this.name = this.name.replace('IV', 'V')
        this.enhanceCrit()
        this.trapChance = 8
        this.trapDuration = 4400
        break
      case 70:
        this.rankUp()
        this.name = this.name.replace(TowerManager.rankPostfixL1, TowerManager.rankPostfixL2).replace('V', 'I')
        this.enhanceCrit(0.05, 5)
        this.trapChance = 9
        this.trapDuration = 4500
        break
      case 80:
        this.rankUp()
        this.name = this.name.replace('I', 'II')
        this.enhanceCrit()
        this.trapChance = 10
        break
      case 90:
        this.rankUp()
        this.name = this.name.replace('II', 'III')
        this.enhanceCrit()
        break
      }
    }

    return ret
  }

  get DPS() {
    return super.DPS * (this.critChance * this.critDamageRatio + 1 - this.critChance)
  }

  get informationSeq() {
    return super.informationSeq.concat([
      ['暴击率', Tools.roundWithFixed(this.critChance * 100, 1) + '%'],
      ['暴击伤害', Tools.roundWithFixed(this.critDamageRatio * 100, 0) + '%']
    ])
  }

  get Rng() {
    return super.Rng + this.reviceRange(this.extraRange)
  }

  get HstPS() {
    return super.HstPS + this.extraHaste
  }

  get Atk() {
    return super.Atk + this.extraPower
  }

  get Slc() {
    return super.Slc + this.extraArrow
  }

  /**
   * @param {MonsterBase} target
   */
  isThisTargetAvailable(target) {
    if (!target || target.isDead) return false
    else return this.inRange(target)
  }

  /**
   * @override
   * @param {MonsterBase[]} targetList
   */
  reChooseTarget(targetList, index) {

    for (const t of _.shuffle(targetList)) {

      if (this.inRange(t)) {
        this.multipleTarget[index] = t
        return
      }
    }
    this.multipleTarget[index] = null
  }

  /**
   * @override
   */
  produceBullet(idx) {

    if (this.multipleTarget[idx]) {
      const ratio = this.calculateDamageRatio(this.multipleTarget[idx])
      this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.multipleTarget[idx], this.bulletImage, this.critChance, this.critDamageRatio, this.trapChance, this.trapDuration, this.extraBulletV)
    }
  }

  /**
   * @override
   * 箭塔特有的运行方式
   * 箭塔每次向复数目标分别射出箭矢
   * @param {MonsterBase[]} monsters
   */
  run(monsters) {

    if (this.canShoot) {

      for (let x_i = 0; x_i < this.Slc; x_i++) {

        if (!this.isThisTargetAvailable(this.multipleTarget[x_i])) {
          this.reChooseTarget(monsters, x_i)
        }
      }
      this.shoot(monsters)
    }
  }

  gemHitHook(idx, msts) {
    if (this.gem && this.multipleTarget[idx]) {
      this.gem.hitHook(this, this.multipleTarget[idx], msts)
    }
  }
}

class FrostTower extends TowerBase {

  static rankUpDesc1 = '\n+ 周期性造成范围冻结'
  static rankUpDesc2 = '\n+ 冻结时能制造伤害并削减敌方护甲'
  static rankUpDesc3 = '\n+ 冻结能力加强'

  constructor(position, image,  bimg, radius) {
    super(
      position,
      radius,
      1,
      'rgba(161,198,225,.6)',
      image,
      TowerManager.FrostTower.p,
      TowerManager.FrostTower.a,
      TowerManager.FrostTower.h,
      TowerManager.FrostTower.s,
      TowerManager.FrostTower.r
    )

    this.canInsertGem = false

    /** @type {(lvl: number) => number} */
    this.levelSprFx = TowerManager.FrostTower.sr

    this.name = TowerManager.FrostTower.dn

    this.inner_desc_init = '在自身周围形成一个圆形的减速场\n- 无法攻击\n- 无法镶嵌传奇宝石'
    this.description = this.inner_desc_init

    /**
     * @type {MonsterBase[]}
     */
    this.trackingList = []

    /** @type {(ms: MonsterBase[]) => void} */
    this.extraEffect = () => {}

    this.freezeDamage = 300
    this.lastFreezeTime = performance.now()

    this.armorDecreasingStrength = .88
  }

  get canFreeze() {
    return performance.now() - this.lastFreezeTime > this.freezeInterval
  }

  get freezeDurationTick() {
    return this.freezeDuration / 1000 * 60
  }

  /**
   * 减速强度
   */
  get SPR() {
    return this.levelSprFx(this.level)
  }

  get informationSeq() {
    const removing = ['攻击速度', '伤害', 'DPS', '弹药储备']
    return super.informationSeq.filter(line => !removing.some(rm => rm === line[0])).concat([
      ['减速强度', Tools.roundWithFixed(this.SPR * 100, 2) + '%']
    ])
  }

  levelUp(currentMoney) {
    const ret = super.levelUp(currentMoney)

    if (ret !== 0) {
      switch (this.level) {
      case 5:
        this.rankUp()
        this.name = '暴风雪I'
        this.description += FrostTower.rankUpDesc1
        this.freezeInterval = 1000
        this.freezeDuration = 400
        this.extraEffect = msts => {
          if (this.canFreeze) {
            msts.forEach(mst => {

              Game.callAnimation('icicle', new Position(mst.position.x - mst.radius, mst.position.y), mst.radius * 2, mst.radius * 2)

              mst.registerFreeze(this.freezeDurationTick)
            })
            this.lastFreezeTime = performance.now()
          }
        }
        break
      case 10:
        this.rankUp()
        this.name = '暴风雪II'
        this.description += FrostTower.rankUpDesc2
        this.freezeInterval = 5000
        this.freezeDuration = 600
        this.extraEffect = msts => {

          if (this.canFreeze) {
            msts.forEach(mst => {

              Game.callAnimation('icicle', new Position(mst.position.x - mst.radius, mst.position.y), mst.radius * 2, mst.radius * 2)

              mst.registerFreeze(this.freezeDurationTick)
              mst.inner_armor *= this.armorDecreasingStrength
              mst.health -= this.freezeDamage * (1 - mst.armorResistance)
              this.recordDamage(mst)
            })
            this.lastFreezeTime = performance.now()
          }
        }
        break
      case 15:
        this.rankUp()
        this.name = '暴风雪III'
        this.description += FrostTower.rankUpDesc3
        this.freezeInterval = 4400
        this.freezeDuration = 800
        this.freezeDamage += 100
        this.armorDecreasingStrength = .75
        break
      case 20:
        this.rankUp()
        this.name = '暴风雪IV'
        this.freezeInterval = 4200
        this.freezeDuration = 860
        this.freezeDamage += 100
        this.armorDecreasingStrength = .7
        break
      case 25:
        this.rankUp()
        this.name = '暴风雪V'
        this.freezeInterval = 4000
        this.freezeDuration = 880
        this.freezeDamage += 100
        this.armorDecreasingStrength = .65
        break
      case 30:
        this.rankUp()
        this.name = '暴风雪VI'
        this.freezeInterval = 3800
        this.freezeDuration = 900
        this.freezeDamage += 100
        this.armorDecreasingStrength = .6
        break
      case 35:
        this.rankUp()
        this.name = '暴风雪VII'
        this.freezeInterval = 3600
        this.freezeDuration = 920
        this.freezeDamage += 100
        this.armorDecreasingStrength = .575
        break
      }
    }

    return ret
  }

  /**
   * @override
   * @param {MonsterBase[]} monsters
   */
  run(monsters) {

    const inRanged = monsters.filter(mst => {

      const i = this.inRange(mst)

      if (i) {

        if (mst.speedRatio === 1 || 1 - this.SPR < mst.speedRatio) mst.speedRatio = 1 - this.SPR
      }
      else {
        // console.log('out of forst range')
        mst.speedRatio !== 1 ? mst.speedRatio = 1 : void (0)
      }

      return i
    })

    this.extraEffect(inRanged)
  }

  render(ctx) {
    super.render(ctx)
    super.renderRange(ctx, 'rgba(185,205,246,.1)')
  }

  rapidRender(context) {
    if (this.canFreeze) return
    context.fillStyle = 'rgba(25,25,25,.3)'
    Tools.renderSector(context, this.position.x, this.position.y, this.radius, 0, Math.PI * 2 * (1 - (performance.now() - this.lastFreezeTime) / this.freezeInterval), false).fill()
  }
}

class PoisonTower extends TowerBase {

  constructor(position, image, bimg, radius) {
    super(
      position,
      radius,
      1,
      'rbga(45,244,12,.4)',
      image,
      TowerManager.PoisonTower.p,
      TowerManager.PoisonTower.a,
      TowerManager.PoisonTower.h,
      TowerManager.PoisonTower.s,
      TowerManager.PoisonTower.r
    )

    this.bulletCtorName = TowerManager.PoisonTower.bctor

    this.levelPatkFx = TowerManager.PoisonTower.patk
    this.levelPitvFx = TowerManager.PoisonTower.pitv
    this.levelPdurFx = TowerManager.PoisonTower.pdur

    this.extraBulletV = 0

    this.name = TowerManager.PoisonTower.dn

    this.inner_desc_init = '发射毒气弹持续杀伤，总是积极切换目标\n+ 攻击速度很快\n+ 附加中毒效果\n+ 无视防御的伤害'
    this.description = this.inner_desc_init

  }

  /**
   * 中毒DOT间隔时间
   */
  get Pitv() {
    return this.levelPitvFx(this.level)
  }

  /**
   * 中毒DOT持续时间
   */
  get Pdur() {
    return this.levelPdurFx(this.level)
  }

  /**
   * 中毒DOT伤害
   */
  get Patk() {
    return this.levelPatkFx(this.level)
  }

  get DOTPS() {
    return 1000 / this.Pitv * this.Patk
  }

  get informationSeq() {
    return super.informationSeq.concat([
      ['每跳毒素伤害', Math.round(this.Patk)],
      ['毒素伤害频率', this.Pitv / 1000 + ' 秒'],
      ['毒素持续', Tools.roundWithFixed(this.Pdur / 1000, 1) + ' 秒'],
      // ['DOTPS', Tools.roundWithFixed(this.DOTPS, 2)]
    ])
  }

  /**
   * @override
   * 毒罐塔会积极地切换目标，以尽可能让所有范围内敌人中毒
   */
  get isCurrentTargetAvailable() {
    return false
  }

  /**
   * @override
   * 毒罐塔特有的索敌方式
   * @param {MonsterBase[]} targetList
   */
  reChooseTarget(targetList) {
    const unPoisoned = targetList.filter(m => !m.bePoisoned)

    // 先在未中毒，且为被任何本类型塔弹药锁定的敌人中快速搜索
    const unTargeted = unPoisoned.filter(m => {
      return this.bulletCtl.bullets.every(b => b.constructor.name === this.bulletCtorName && b.target !== m)
    })
    for (const t of unTargeted) {
      if (this.inRange(t)) {
        this.target = t
        return
      }
    }
    // 在未中毒的敌人中搜索
    for (const t of unPoisoned) {
      if (this.inRange(t)) {
        this.target = t
        return
      }
    }
    // 如果未找到在射程内的未中毒的敌人
    // 则回退到全部敌人中随机寻找一个在射程内的敌人
    for (const t of _.shuffle(targetList)) {
      if (this.inRange(t)) {
        this.target = t
        return
      }
    }

    this.target = null
  }

  /**
   * @override
   */
  produceBullet() {
    // console.log(this.target.id)
    const ratio = this.calculateDamageRatio(this.target)
    this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.target, this.bulletImage, this.Patk * ratio, this.Pitv, this.Pdur, this.extraBulletV)
  }
}

class TeslaTower extends TowerBase {

  /**
   * 闪电绘制函数
   * @param {CanvasRenderingContext2D} ctx
   */
  static renderLighteningCop(ctx, x1, y1, x2, y2, displace) {
    if (displace < TeslaTower.curveDetail) {
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
    }
    else {
      const mid_x = (x2 + x1) / 2 + (Math.random() - .5) * displace
      const mid_y = (y2 + y1) / 2 + (Math.random() - .5) * displace
      this.renderLighteningCop(ctx, x1, y1, mid_x, mid_y, displace / 2)
      this.renderLighteningCop(ctx, x2, y2, mid_x, mid_y, displace / 2)

      if (Math.random() > .5) {
        const pos = new Position(x2, y2).dithering(displace / 3)
        this.renderLighteningCop(ctx, mid_x, mid_y, pos.x, pos.y, displace / 2)
      }
    }
  }

  /**
   * 闪电绘制帧数
   */
  static get shockRenderFrames() {
    return 3
  }

  /**
   * 闪电绘制的最小分折长度
   */
  static get curveDetail() {
    return 10
  }

  static rankUpDesc1 = '\n+ 攻击频率得到加强'
  static rankUpDesc2 = '\n+ 射程得到加强'

  constructor(position, image, bimg, radius) {
    super(
      position,
      radius,
      1,
      'rgba(252,251,34,.4)',
      image,
      TowerManager.TeslaTower.p,
      TowerManager.TeslaTower.a,
      TowerManager.TeslaTower.h,
      TowerManager.TeslaTower.s,
      TowerManager.TeslaTower.r
    )

    this.renderPermit = 0

    this.name = TowerManager.TeslaTower.dn

    this.extraRange = 0
    this.extraHaste = 0
    /** @type {(mst: MonsterBase) => void} */
    this.extraEffect = () => {}

    /** 带电效果的持续时间 */
    this.shockDuration = 5000
    /** 塔每次攻击使目标带电的几率 */
    this.shockChargingChance = .2
    /** 漏电伤害对塔攻击的比值 */
    this.shockChargingPowerRatio = .25
    /** 每个tick带电的怪物向周围漏电得几率 */
    this.shockLeakingChance = .02

    /**
     * 带电的怪物向周围漏电的动画队列
     * 由放电的怪物主动注册
     * @type {{time: number, args: number[]}[]}
     */
    this.monsterShockingRenderingQueue = []

    this.inner_desc_init = '向周围小范围释放电击造成中等伤害\n+ 有几率使目标带电'
    this.description = this.inner_desc_init
  }

  get canCharge() {
    return Math.random() > (1 - this.shockChargingChance)
  }

  get shockDurationTick() {
    return this.shockDuration / 1000 * 60
  }

  get Rng() {
    return super.Rng + this.reviceRange(this.extraRange)
  }

  get HstPS() {
    return super.HstPS + this.extraHaste
  }

  get informationSeq() {
    const removing = ['弹药储备']
    return super.informationSeq.filter(line => !removing.some(rm => rm === line[0]))
  }

  get lighteningAmount() {
    return [null, 10, 20][this.rank]
  }

  levelUp(currentMoney) {
    const ret = super.levelUp(currentMoney)

    if (ret !== 0) {
      switch (this.level) {
      case 12:
        this.rankUp()
        this.name = '特斯拉塔'
        this.image = Game.callImageBitMap(TowerManager.TeslaTower.n2)
        this.description += TeslaTower.rankUpDesc1
        this.borderStyle = 'rgba(222,201,34,.6)'
        this.extraHaste = 0.75
        this.shockChargingChance = .3
        this.shockDuration = 8000
        this.shockChargingPowerRatio = .75
        this.shockLeakingChance = .05
        break
      case 24:
        this.rankUp()
        this.name = '闪电风暴塔'
        this.image = Game.callImageBitMap(TowerManager.TeslaTower.n3)
        this.description += TeslaTower.rankUpDesc2
        this.borderStyle = 'rgba(162,161,34,.8)'
        this.extraRange = 80
        // this.extraEffect = mst => mst.position.moveTo(this.position, mst.speedValue * .25 * 60 / this.HstPS)
        this.shockChargingChance = .4
        this.shockDuration = 12000
        this.shockChargingPowerRatio = 1.5
        this.shockLeakingChance = .12
        break
      }
    }

    return ret
  }

  /**
   * 电击
   * @param {MonsterBase} monster
   */
  shock(monster) {
    monster.health -= this.Atk * (1 - monster.armorResistance) * this.calculateDamageRatio(monster)
    this.recordDamage(monster)
    if (this.canCharge) monster.registerShock(this.shockDurationTick, this.Atk * this.shockChargingPowerRatio, this, this.shockLeakingChance)
    // this.extraEffect(monster)
  }

  /**
   * @override
   * @param {MonsterBase[]} monsters
   */
  run(monsters) {
    if (this.canShoot) {

      // 电击塔不调用父类shoot，故主动挂载gem钩子
      this.gemAttackHook(monsters)

      this.renderPermit = TeslaTower.shockRenderFrames

      monsters.forEach(mst => {

        if (this.inRange(mst)) {
          this.shock(mst)

          // 电击塔不调用父类shoot，故主动挂载gem钩子
          if (this.gem) {
            this.gem.hitHook(this, mst, monsters)
          }
        }
      })

      this.recordShootTime()
    }
  }

  /**
   * - circle-formula: (x - a)^2 + (y - b)^2 = r^2
   * - y = (r^2 - (x - a)^2)^0.5 + b || b - (r^2 - (x - a)^2)^0.5
   */
  calculateRandomCirclePoint() {
    const x = _.random(this.position.x - this.Rng, this.position.x + this.Rng, true)
    return {
      x,
      y: Math.random() > .5 ?
        (this.position.y - Math.pow(this.Rng * this.Rng - Math.pow(x - this.position.x, 2), 0.5)) :
        (Math.pow(this.Rng * this.Rng - Math.pow(x - this.position.x, 2), 0.5) + this.position.y)
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  renderLightening(ctx) {
    const { x, y } = this.calculateRandomCirclePoint()
    TeslaTower.renderLighteningCop(ctx, this.position.x, this.position.y, x, y, this.Rng / 2)
  }

  /**
   * @override
   * @param {CanvasRenderingContext2D} ctx
   * @param {MonsterBase[]} monsters
   */
  rapidRender(ctx, monsters) {
    if (monsters.every(m => !this.inRange(m))) {
      return
    }
    if (this.renderPermit > 0) {
      this.renderPermit--

      ctx.strokeStyle = 'rgba(232,33,214,.5)'
      const t = ctx.lineWidth
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        this.renderLightening(ctx)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.lineWidth = t
    }

    ctx.strokeStyle = 'rgba(153,204,255,.5)'
    ctx.beginPath()
    this.monsterShockingRenderingQueue = this.monsterShockingRenderingQueue.filter(msrq => {
      TeslaTower.renderLighteningCop(ctx, ...msrq.args)
      return --msrq.time > 0
    })
    ctx.closePath()
    ctx.stroke()
  }
}

class BlackMagicTower extends TowerBase {

  static rankUpDesc1 = '\n+ 伤害得到加强'
  static rankUpDesc2 = '\n+ 伤害得到大幅加强'
  static rankUpDesc3 = '\n+ 伤害得到大幅加强，附加目标当前生命值 8% 的额外伤害'

  static deniedGems = [
    'GogokOfSwiftness'
  ]

  // static GemsToOptionsInnerHtml = TowerBase.Gems
  //   .map((gemCtor, idx) => {
  //     return `<option value="${gemCtor.name}"${idx === 0 ? ' selected' : ''}${this.deniedGems.includes(gemCtor.name) ? ' disabled' : ''}>${gemCtor.ctor.gemName}${this.deniedGems.includes(gemCtor.name) ? ' - 不能装备到此塔' : ''}</option>`
  //   })
  //   .join('')

  constructor(position, image, bimg, radius) {
    super(
      position,
      radius,
      1,
      'rgba(223,14,245,.2)',
      image,
      TowerManager.BlackMagicTower.p,
      TowerManager.BlackMagicTower.a,
      TowerManager.BlackMagicTower.h,
      TowerManager.BlackMagicTower.s,
      TowerManager.BlackMagicTower.r
    )

    /** @type {(lvl: number) => number} */
    this.levelIdeFx = TowerManager.BlackMagicTower.ide

    /** @type {(lvl: number) => number} */
    this.levelIdrFx = TowerManager.BlackMagicTower.idr

    this.imprecationPower = 0
    this.imprecationHaste = 1

    this.name = TowerManager.BlackMagicTower.dn

    this.extraPower = 0
    this.voidSummonChance = 3

    /**
     * 相当于目标当前生命值的额外伤害比例
     */
    this.POTCHD = 0

    this.inner_desc_init = '释放强力魔法，总会瞄准最强的敌人\n- 准备时间非常长\n+ 附加诅咒效果，使目标受到的伤害提高\n+ 无视防御\n+ 每次击杀将增加 10 攻击力并提高 1% 攻击速度（最多提高 150%）'
    this.description = this.inner_desc_init
  }

  get HstPS() {
    return super.HstPS * this.imprecationHaste
  }

  get Atk() {
    return super.Atk + this.imprecationPower + this.extraPower
  }

  /**
   * 诅咒的易伤效果
   */
  get Ide() {
    return this.levelIdeFx(this.level) + 1
  }

  /**
   * 诅咒持续时间
   */
  get Idr() {
    return this.levelIdrFx(this.level)
  }

  get informationSeq() {
    return super.informationSeq.concat([
      ['诅咒易伤', Tools.roundWithFixed(this.Ide * 100 - 100, 2) + '%'],
      ['诅咒时间', Tools.roundWithFixed(this.Idr / 1000, 2) + ' 秒'],
      ['额外攻击力', Tools.chineseFormatter(this.imprecationPower, 0)],
      ['额外攻击速度', Tools.roundWithFixed(this.imprecationHaste * 100 - 100, 1) + '%'],
    ])
  }

  levelUp(currentMoney) {
    const ret = super.levelUp(currentMoney)

    if (ret !== 0) {
      switch (this.level) {
      case 5:
        this.rankUp()
        this.name = '奥术魔法塔'
        this.image = Game.callImageBitMap(TowerManager.BlackMagicTower.n2)
        this.description = this.inner_desc_init + BlackMagicTower.rankUpDesc1
        this.borderStyle = 'rgba(223,14,245,.4)'
        this.extraPower = 666
        this.levelAtkFx = TowerManager.BlackMagicTower.a2
        break
      case 10:
        this.rankUp()
        this.name = '黑魔法塔'
        this.image = Game.callImageBitMap(TowerManager.BlackMagicTower.n3)
        this.description = this.inner_desc_init + BlackMagicTower.rankUpDesc2
        this.borderStyle = 'rgba(223,14,245,.6)'
        this.extraPower = 2664
        this.levelAtkFx = TowerManager.BlackMagicTower.a3
        break
      case 15:
        this.rankUp()
        this.name = '虚空塔'
        this.image = Game.callImageBitMap(TowerManager.BlackMagicTower.n4)
        this.description = this.inner_desc_init + BlackMagicTower.rankUpDesc3
        this.borderStyle = 'rgba(223,14,245,.8)'
        this.extraPower = 10654
        this.levelAtkFx = TowerManager.BlackMagicTower.a4
        this.POTCHD = .08
        break
      }
    }

    return ret
  }

  /**
   * @override
   * @param {MonsterBase[]} targetList
   */
  reChooseTarget(targetList) {
    this.target = _.maxBy(targetList.filter(t => this.inRange(t)), '__inner_current_health')
  }

  /**
   * @override
   */
  produceBullet() {
    const w = 82
    const h = 50
    const position = new Position(this.target.position.x - w / 2, this.target.position.y - h / 2)
    Game.callAnimation('magic_2', position, w, h, 1, 2)

    // console.log(`基础伤害 ${this.Atk} 额外伤害 ${this.target.__inner_current_health * this.POTCHD}`)
    this.target.health -= (this.Atk * this.calculateDamageRatio(this.target) + this.target.__inner_current_health * this.POTCHD)
    this.recordDamage(this.target)
    // 杀死了目标
    if (this.target.isDead) {
      this.imprecationPower += 10
      if (this.imprecationHaste * 100 - 100 < 150) this.imprecationHaste += 0.01
    }
    // 诅咒目标
    else if (!this.target.beImprecated) {
      this.target.beImprecated = true
      this.target.imprecatedRatio = this.Ide
      setTimeout(() => {
        if (this.target && !this.target.isDead) {
          this.target.beImprecated = false
          this.target.imprecatedRatio = 1
        }
      }, this.Idr)
    }
  }

  rapidRender(ctx) {
    if (this.HstPS < 45) this.renderPreparationBar(ctx)
  }
}

class LaserTower extends TowerBase {

  /**
   * 内部类 激光射线枪
   * 剥离出具体激光的渲染逻辑，外层无需关心
   */
  static Laser = class ColossusLaser {

    static animationW = 36
    static animationH = 36
    static animationName = 'explo_3'
    static animationSpeed = .5

    /**
     * @param {Position} startPos
     * @param {Position} endPos
     * @param {number} lineWidth
     * @param {number} duration
     * @param {PolarVector} swipeVector
     * @param {(x: number) => number} easingFunc
     */
    constructor(startPos, endPos, lineWidth, duration, swipeVector, easingFunc, ls1, ls2) {
      this.sx = startPos.x
      this.sy = startPos.y

      this.ep = endPos.copy()

      this.swipeVector = swipeVector

      this.lineWidth = lineWidth

      this.lineStylesOuter = ls1
      this.lineStylesInner = ls2

      const updateTime = 1000 / 60
      const updateCount = duration / updateTime

      /**
       * 步长
       */
      this.perUpdateDistance = 1 / updateCount

      this.currentStep = 0

      const maxAnimationCount = Math.floor(this.swipeVector.r / (Math.max(ColossusLaser.animationW, ColossusLaser.animationH) + 1))
      this.animationStepInterval = maxAnimationCount >= updateCount ? 1 : Math.ceil(updateTime / maxAnimationCount)

      /**
       * 步进 0-1
       */
      this.stepPosition = 0

      this.easingFx = easingFunc || Tools.EaseFx.linear

      this.fulfilled = false
    }

    get step() {
      if (this.stepPosition > 1) {
        this.fulfilled = true
      }
      this.stepPosition += this.perUpdateDistance
      this.currentStep++
      const step = this.swipeVector.r * this.easingFx(this.stepPosition)
      return this.ep.copy().move(this.swipeVector.normalize().multiply(step))
    }

    get canAnimate() {
      return this.currentStep % this.animationStepInterval === 0
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderStep(ctx) {
      if (this.fulfilled) return

      const stepEndPos = this.step

      if (this.canAnimate) {
        Game.callAnimation(
          ColossusLaser.animationName,
          stepEndPos,
          ColossusLaser.animationW,
          ColossusLaser.animationH,
          ColossusLaser.animationSpeed,
          400
        )
      }

      const pt = new Path2D()
      pt.moveTo(this.sx, this.sy)
      pt.lineTo(stepEndPos.x, stepEndPos.y)
      pt.closePath()
      const t = ctx.lineWidth

      // ctx.strokeStyle = 'rgba(44,88,234,.2)'
      // ctx.lineWidth = this.lineWidth + 2
      // ctx.stroke(pt)

      ctx.strokeStyle = this.lineStylesOuter
      ctx.lineWidth = this.lineWidth + 2
      ctx.stroke(pt)

      ctx.strokeStyle = this.lineStylesInner
      ctx.lineWidth = this.lineWidth - 2
      ctx.stroke(pt)


      ctx.lineWidth = t
    }
  }

  static rankUpDesc1 = '\n+ 伤害得到加强'
  static rankUpDesc2 = '\n+ 造成额外电浆伤害(无视防御)'
  static rankUpDesc3 = '\n+ 发射多束射线'
  static rankUpDesc4 = '\n+ 所有属性得到增强'

  constructor(position, image, bimg, radius) {
    super(
      position,
      radius,
      1,
      'rgba(17,54,245,.2)',
      image,
      TowerManager.LaserTower.p,
      TowerManager.LaserTower.a,
      TowerManager.LaserTower.h,
      TowerManager.LaserTower.s,
      TowerManager.LaserTower.r
    )

    /** @type {LaserTower.Laser[]} */
    this.lasers = []

    this.levelFlameAtkFx = TowerManager.LaserTower.fatk
    this.levelFlameWidthFx = TowerManager.LaserTower.fw
    this.levelLaserSwipeDistanceFx = TowerManager.LaserTower.lsd

    this.name = TowerManager.LaserTower.dn

    this.extraFlameDamage = 0
    this.extraLuminousDamage = 0
    this.extraLaserTransmitter = 0
    this.extraFlameWidth = 0

    this.extraRange = 0

    this.lineStyles = [
      ['rgba(244,188,174,.4)', 'rgba(204,21,12,.7)'], // laser
      ['rgba(244,188,174,.4)', 'rgba(254,21,12,.7)'], // he laser
      ['rgba(204,204,255,.4)', 'rgba(0,51,253,.7)'], // heat inf
      ['rgba(204,204,255,.4)', 'rgba(0,51,253,.7)'], // multi heat inf
      ['rgba(255,153,0,.4)', 'rgba(153,0,51,.7)'] // colossus
    ]

    this.inner_desc_init = '发射激光，横扫大面积的目标，造成范围的火焰伤害'
    this.description = this.inner_desc_init
  }

  get Rng() {
    return super.Rng + this.reviceRange(this.extraRange)
  }

  get Slc() {
    return super.Slc + this.extraLaserTransmitter
  }

  /**
   * Laser Swipe Distance
   */
  get Lsd() {
    return this.levelLaserSwipeDistanceFx(this.level)
  }

  /**
   * Flame Attack Power
   */
  get Fatk() {
    return this.levelFlameAtkFx(this.level) + this.extraFlameDamage
  }

  /**
   * Flame Width
   */
  get Fwd() {
    return this.levelFlameWidthFx(this.level) + this.extraFlameWidth
  }

  /**
   * 激光渲染宽度
   */
  get LlW() {
    return 3 + Math.floor(this.rank / 2)
  }

  get informationSeq() {
    return super.informationSeq.concat([
      ['火焰伤害', Math.round(this.Fatk)],
      ['扫射距离', Tools.roundWithFixed(this.Lsd, 1)],
      ['扫射宽度', Tools.roundWithFixed(this.Fwd, 1)],
      ['额外火焰伤害', Math.round(this.extraFlameDamage)],
      ['额外电浆伤害', Math.round(this.extraLuminousDamage)],
    ])
  }

  get laserLineStyle() {
    return this.lineStyles[this.rank]
  }

  levelUp(currentMoney) {
    const ret = super.levelUp(currentMoney)

    if (ret !== 0) {
      switch (this.level) {
      case 8:
        this.rankUp()
        this.name = '高能激光塔'
        this.image = Game.callImageBitMap(TowerManager.LaserTower.n2)
        this.description += LaserTower.rankUpDesc1
        this.borderStyle = 'rgba(17,54,245,.3)'
        this.extraFlameDamage = 220
        break
      case 16:
        this.rankUp()
        this.name = '热能射线塔'
        this.image = Game.callImageBitMap(TowerManager.LaserTower.n3)
        this.description += LaserTower.rankUpDesc2
        this.borderStyle = 'rgba(17,54,245,.4)'
        this.extraLuminousDamage = 140
        break
      case 32:
        this.rankUp()
        this.name = '多重热能射线塔'
        this.image = Game.callImageBitMap(TowerManager.LaserTower.n4)
        this.description += LaserTower.rankUpDesc3
        this.borderStyle = 'rgba(17,54,245,.5)'
        this.levelSlcFx = TowerManager.LaserTower.s2
        this.extraFlameDamage = 420
        this.extraLuminousDamage = 220
        break
      case 64:
        this.rankUp()
        this.name = '巨像'
        this.image = Game.callImageBitMap(TowerManager.LaserTower.n5)
        this.description += LaserTower.rankUpDesc4
        this.borderStyle = 'rgba(17,54,245,.8)'
        this.extraFlameDamage = 640
        this.extraLuminousDamage = 380
        this.levelSlcFx = TowerManager.LaserTower.s3
        this.levelHstFx = TowerManager.LaserTower.h2
        this.extraRange = 50
        this.extraFlameWidth = 40
        break
      }
    }

    return ret
  }

  /**
   * 发射激光，击中第一个敌人，扫动一定距离，造成燃烧伤害
   * @override
   * @param {MonsterBase[]} monsters
   */
  produceBullet(i, monsters) {
    //console.time('LaserTower make damage')


    const v = new Position(this.target.position.x, this.target.position.y)
    const r = this.Fwd / 2 + Game.callGridSideSize() / 3 - 2
    const mvrc = .7
    const arcTime = Math.ceil((this.Lsd / r - 2) / mvrc + 1) + 1

    // 采样击中点的各个方向，并取每个方向延伸的模糊点，比较何处敌人最密集
    const swipeVector = _.maxBy(
      _.range(0, 360, 30).map(d => new PolarVector(this.Lsd, d)),
      sv => monsters.filter(mst => v.copy().move(sv.normalize().multiply(mvrc * (arcTime - 1) * r)).equal(mst.position, 1.2 * r)).length
    ).dithering(1 / 30 * Math.PI)

    this.lasers.push(new LaserTower.Laser(
      this.position,
      this.target.position,
      this.LlW,
      500,
      swipeVector,
      Tools.EaseFx.linear,
      this.laserLineStyle[0],
      this.laserLineStyle[1]
    ))

    const flameArea = new Path2D()

    for (let i = 0; i < arcTime; i++) {
      const t = v.copy().move(swipeVector.normalize().multiply(mvrc * i * r))
      // console.log(v + ', ' + t)
      flameArea.arc(t.x, t.y, r, 0, Math.PI * 2)
    }

    // Game.callCanvasContext('bg').strokeStyle = 'rgba(33,33,33,.3)'
    // Game.callCanvasContext('bg').stroke(flameArea)

    this.target.health -= this.Atk * (1 - this.target.armorResistance) * this.calculateDamageRatio(this.target)
    this.recordDamage(this.target)

    monsters.forEach(mst => {
      if (Game.callCanvasContext('bg').isPointInPath(flameArea, mst.position.x, mst.position.y)) {
        mst.health -= this.extraLuminousDamage * this.calculateDamageRatio(mst)
        this.recordDamage(this.target)
        mst.health -= this.Fatk * (1 - mst.armorResistance) * this.calculateDamageRatio(mst)
        this.recordDamage(this.target)
      }
    })

    //console.timeEnd('LaserTower make damage')
  }

  /**
   * @override
   * @param {CanvasRenderingContext2D} ctx
   */
  rapidRender(ctx) {
    this.lasers = this.lasers.filter(ls => {
      ls.renderStep(ctx)
      return !ls.fulfilled
    })
  }
}

class CarrierTower extends TowerBase {

  static deniedGems = [
    'ZeisStoneOfVengeance',
    'GemOfAnger'
  ]

  static Jet = class _Jet extends TowerBase {

    static JetBullet = class _JetBullet extends BulletBase {

      constructor(position, atk, target) {
        const bVelocity = 15

        super(position, 1, 0, null, 'rgba(55,14,11,1)', atk, bVelocity, target)
      }
    }
    /**
     * @param {CarrierTower} carrierTower
     */
    constructor(position, image, bimg, radius, carrierTower) {
      super(
        position,
        radius,
        0,
        null,
        image,
        [],
        carrierTower.levelAtkFx,
        carrierTower.levelHstFx,
        carrierTower.levelSlcFx,
        carrierTower.levelRngFx
      )

      this.name = '航母载机'

      this.bulletCtorName = carrierTower.bulletCtorName

      this.carrierTower = carrierTower

      this.canInsertGem = false
    }

    get Atk() {
      return this.carrierTower.Atk
    }

    get Slc() {
      return this.carrierTower.Slc
    }

    get Rng() {
      return this.carrierTower.Rng
    }

    get HstPS() {
      return this.carrierTower.HstPS
    }

    get Spd() {
      return this.carrierTower.Spd
    }

    get level() {
      return this.carrierTower.level
    }

    set level(v) {}

    get exploitsSeq() {
      return []
    }

    get informationSeq() {
      const removing = ['等级', '下一级', '售价']
      return super.informationSeq.filter(line => !removing.some(rm => rm === line[0]))
    }

    get hasCurrentTarget() {
      return this.target && !this.target.isDead
    }

    get sellingPrice() {
      return 0
    }

    gemAttackHook(...args) {
      this.carrierTower.gemAttackHook(...args)
    }

    gemHitHook(...args) {
      this.carrierTower.target = this.target
      this.carrierTower.gemHitHook(...args)
    }

    calculateDamageRatio(...args) {
      const ratio = this.carrierTower.calculateDamageRatio(...args)
      console.log(ratio.toFixed(3).padEnd(12) + ' X')
      return ratio
    }
    
    /**
     * - 在怪物中重选目标
     * - 在怪物中找到威胁最大的(距离终点最近的)
     * @param {MonsterBase[]} targetList
     */
    reChooseTarget(targetList) {
      this.target = _.minBy(targetList, mst => {
        return Position.distancePow2(Game.callDestinationPosition(), mst.position)
      })
    }

    /**
     * @param {MonsterBase[]} monsters
     */
    run(monsters) {
      // 当前目标失效
      if (!this.hasCurrentTarget) {

        this.reChooseTarget(monsters)

        if (this.hasCurrentTarget) this.position.moveTo(this.target.position, this.Spd)
      }
      // 当前目标在范围内
      else if (this.inRange(this.target)) {

        if (this.canShoot && this.target) {
          this.shoot(monsters)
        }

        // this.position.moveTo(this.position.copy().dithering(Game.callGridSideSize()), this.Spd)
      }
      // 当前目标超出范围
      else {
        this.position.moveTo(this.target.position, this.Spd)
      }
    }

    render() {}

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderImage(ctx) {
      if (this.target) {
        BulletBase.prototype.renderImage.call(this, ctx)
      }
      else {
        super.renderImage(ctx)
      }
    }

    rapidRender(ctxRapid) {
      super.render(ctxRapid)
    }

    recordDamage(...args) {
      this.carrierTower.recordDamage(...args)
    }

    recordKill(...args) {
      this.carrierTower.recordKill(...args)
    }
  }

  constructor(position, image, bimg, radius) {
    super(
      position,
      radius,
      1,
      'rgba(56,243,12,.5)',
      image,
      TowerManager.CarrierTower.p,
      TowerManager.CarrierTower.a,
      TowerManager.CarrierTower.h,
      TowerManager.CarrierTower.s,
      TowerManager.CarrierTower.r
    )

    this.jets = 0

    /**
     * @type {(lvl: number) => number}
     */
    this.levelSpdFx = TowerManager.CarrierTower.spd
    /**
     * @type {(lvl: number) => number}
     */
    this.levelKcFx = TowerManager.CarrierTower.child

    this.bulletCtorName = TowerManager.CarrierTower.bctor

    this.name = TowerManager.CarrierTower.dn

    this.inner_desc_init = '自身无法攻击，拥有多架载机\n+ 载机继承自身属性\n+ 可以对任意位置进行机动打击'
    this.description = this.inner_desc_init
  }

  get informationSeq() {
    return super.informationSeq.concat([
      ['载机量', this.KidCount]
    ])
  }

  get KidCount() {
    return this.levelKcFx(this.level)
  }

  get Spd() {
    return this.levelSpdFx(this.level)
  }

  run() {
    if (this.canShoot && this.jets < this.KidCount) {
      Game.callTowerFactory(
        'CarrierTower.Jet',
        this.position.copy().dithering(this.radius * 2, this.radius),
        Game.callImageBitMap(TowerManager.CarrierTower.cn),
        null,
        Game.callGridSideSize() / 4,
        this
      )
      this.jets++
    }
  }

  renderRange() {}

  destory() {
    super.destory()

    Game.callTowerList().filter(tow => tow.carrierTower && tow.carrierTower === this).forEach(tow => tow.isSold = true)
  }
}
class GemBase {

  static get gemName() {
    return '传奇宝石'
  }

  static get priceSpan() {
    const key = `_c_span_gem_${this.name}`
    if (Tools.Dom._cache.has(key)) {
      return Tools.Dom._cache.get(key)
    }
    else {
      const span1 = document.createElement('span')
      span1.textContent = '价格'
      span1.style.marginRight = '1em'
      const span2 = document.createElement('span')
      span2.textContent = Tools.formatterUs.format(this.price)
      Tools.Dom._cache.set(key, [span1, span2])
      return [span1, span2]
    }
  }

  static get maxLevel() {
    return 150
  }

  constructor() {
    this.level = 0
  }

  get gemName() {
    return this.constructor.gemName
  }

  get imgSrc() {
    return this.constructor.imgSrc
  }

  /**
   * 升到下一次级需要的点数
   */
  get levelUpPoint() {
    return 0
  }

  get description() {
    return ''
  }

  levelUp(currentPoint) {
    if (this.level >= GemBase.maxLevel) return 0
    if (this.levelUpPoint > currentPoint) {
      return 0
    }
    else {
      const cost = this.levelUpPoint
      this.level += 1

      return cost
    }
  }

  /**
   * @virtual
   * @param {TowerBase} thisTower
   */
  initEffect(thisTower) { }

  /**
   * @virtual
   * @param {TowerBase} thisTower
   * @param {MonsterBase[]} monsters
   */
  attackHook(thisTower, monsters) { }

  /**
   * @virtual
   * @param {TowerBase} thisTower
   * @param {MonsterBase} monster
   * @param {MonsterBase[]} monsters
   */
  hitHook(thisTower, monster, monsters) { }

  /**
   * @virtual
   * @param {TowerBase} thisTower
   * @param {MonsterBase} monster
   */
  killHook(thisTower, monster) { }

  /**
   * @virtual
   * @param {TowerBase} thisTower
   * @param {MonsterBase[]} monsters
   */
  tickHook(thisTower, monsters) { }
}

class PainEnhancer extends GemBase {

  static get gemName() {
    return '增痛宝石'
  }

  static get price() {
    return 25000
  }

  static get imgSrc() {
    return 'data:image/png;base64,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'
  }

  static get baseBleedDamageRatio() {
    return 25
  }

  static get bleedDamageRatioLevelMx() {
    return 0.5
  }

  static get stasisDescription() {
    return `攻击敌人有 ${this.chance * 100}% 的几率使其流血，在 3 秒内受到 ${Tools.roundWithFixed(this.baseBleedDamageRatio * 100, 1)}% （+${Tools.roundWithFixed(this.bleedDamageRatioLevelMx * 100, 1)}%/等级）攻击力的伤害`
  }

  static get __base_description() {
    return `攻击敌人有 ${this.chance * 100}% 的几率使其流血，在 3 秒内受到 $% 攻击力的伤害`
  }

  static get chance() {
    return .2
  }

  constructor() {
    super()
    this.bleedDuration = 3000
    this.bleedInterval = 500
  }

  get description() {
    return PainEnhancer.__base_description.replace('$', (this.bleedDamageRatio * 100).toFixed(1))
  }

  get levelUpPoint() {
    return (this.level + 1) * 40
  }

  get bleedDotCount() {
    return this.bleedDuration / this.bleedInterval
  }

  get bleedDamageRatio() {
    return PainEnhancer.baseBleedDamageRatio + this.level * PainEnhancer.bleedDamageRatioLevelMx
  }

  /**
   * @override
   * @param {TowerBase} thisTower
   * @param {MonsterBase} monster
   */
  hitHook(thisTower, monster) {
    if (Math.random() < PainEnhancer.chance) {
      Tools.installDot(
        monster,
        'beBloodied',
        this.bleedDuration,
        this.bleedInterval,
        thisTower.Atk * this.bleedDamageRatio / this.bleedDotCount,
        false,
        thisTower.recordDamage.bind(thisTower)
      )

      // console.log('增痛宝石 installed dot')
    }
  }
}

class GogokOfSwiftness extends GemBase {

  static get gemName() {
    return '迅捷勾玉'
  }

  static get price() {
    return 50000
  }

  static get imgSrc() {
    return 'data:image/png;base64,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'
  }

  static get baseHasteAddition() {
    return 0.15
  }

  static get hasteAdditionLevelMx() {
    return 0.035
  }

  static get stasisDescription() {
    return `提高攻击速度 ${Tools.roundWithFixed(this.baseHasteAddition * 100, 1)}%（+${Tools.roundWithFixed(this.hasteAdditionLevelMx * 100, 1)}%/等级）`
  }

  static get __base_description() {
    return '提高攻击速度 $%'
  }

  constructor() {
    super()

    /** @type {TowerBase} */
    this.tower = null
  }

  get description() {
    return GogokOfSwiftness.__base_description.replace('$', (this.hasteAddition * 100).toFixed(1))
  }

  get levelUpPoint() {
    return (this.level + 1) * 32 + 15
  }

  get hasteAddition() {
    return GogokOfSwiftness.baseHasteAddition + this.level * GogokOfSwiftness.hasteAdditionLevelMx
  }

  /**
   * @override
   * @param {TowerBase} thisTower
   */
  initEffect(thisTower) {
    this.tower = thisTower

    this.tower.__hst_ps_ratio = 1 + this.hasteAddition
  }

  levelUp(currentPoint) {
    const ret = super.levelUp(currentPoint)

    this.tower.__hst_ps_ratio = 1 + this.hasteAddition

    return ret
  }
}

class MirinaeTeardropOfTheStarweaver extends GemBase {

  static get gemName() {
    return '银河，织星者之泪'
  }

  static get price() {
    return 120000
  }

  static get imgSrc() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACW9GRnMAAAGAAAAAAABi7amiAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAACXZwQWcAAAgAAAAAQADWRLxrAAARXElEQVR42u2bf1Sb9b3HX0BoH/pDkwIpFJqSQEEobaGkRJAWiVRqHVZbue7OH9PpZnfOunu81cM867xX6456ts6zeV2nV929urm52l4nLZaVQuOAFEpBWmyUUgIhEUzJklIijyWB+8dDQlJoLaGtu/fsc87nPM/z/fV8P+/v5/P9fr6/4B/0D/o6STHOXxuFfU1CX4qc/58BUCCPCwSiOFqVhuNkY7VfcI94TUEIv6bCTzzLElYVHAReAV6JztAdjM7QlV2Q5ppQxLUWPiF//fPrtu8qt7XWKTI23EvY7PnMiU1QDA/YSufEJi4a/rynHhCBqPHn/3kAfMJrImNT/z1t/d1l5/ospN9+L6bK3xO/ej1zYhMBmBObsCw6Om6Ro8d0EskMrjoIVxsABTIBwmUaZeaNz2sf3FbqOnUE074/MDY8gO1YPQvTszjTZiT1G/cwNvIlSvnsZX8b8iiEmMUnhZjFTnHAelVBuJp9gG+I0ygztM/HpmuLa3c8Qudfa0hZo6fkyWcBGDAdJyZ9xYV5y4ByQBNQ1lUh2VUUnnHhy2PTtcVnTM0oM7QM2q1+4X00YDrOgOk4jk/aQAbaIj1AWXNtDcALQNd4mVd8dLgSACgIdmj8rZV6+8PlCblFxQBnTM1TZo5JXxGkBWX3l6Et0vObf9sOUJZ6U6mio77iRwFl+0BwBvDXBoAiTi7/HpLKSoLP81fSWZgwmBO5Oh8AR7tRAuUb94BcDkBclp6e7tMQNZeE66LY8qtfoJaJGCvfw+12k56ro+/DPxYnJcW94gNZdImBAOzud7lenQkIMwYAKMvPTc/Jy00HoMN+DkBRUXmQisqDKJ1KVFl5WFobUGXno3vkYawtrdhaWkhclU3nqW4A0pYvY2f5T1BHedn27FM01Bgw1hhIkmqYs6FED4A6VlAAGJtMNDSZAHZ/nQD4QAAgPzedx9dvBqCispiKymp21zQAoMrOR5WVR+Nrr2NtaZ3IPV9B6opMPj3xsT/IOC48wIYSPbev1+MDoKF6j0/woH+HSjMdBhXzBOGBXtuAwudTO9xfkrY0mbSlyQAcOzMLS2sDZ/t7UWXnE708gzBgsK8fAM3q1XQcbyd6oZIH/3UrpsOH6DX3YDX3kKcv5JFSnV/4yqoaWppbA1vfOSSKbzEDDZixH+CB4pWZN2gWKGLotw8RP3+Mj5oaWTjXy4mW49R/bGWkz4zMI5J02yZS5kRg7+1mwcIYunpOs2iWyPO/+QXh5z7np9/ahL78V5z/wo2j4X1mK5SsSQRTWyumtlY8bhcNDScQImXMFmbRYf38mMfjeYsZ+AlXwg+obvyo3WnrtwcFVtU2c+BwcM/vODmh+lt+sBVtrg5jVRU7H3uMvJIStr34IramGqxNNf50eyobJv3Q0u+g7qMOJ5L9z4hmqgFRMpkMQGPrt2sGh9x8Meyms/szOrs/A8B0ogOA6Ixsej+s5EhnL8889wIAzU1NJCQuxFhVRW9nJ4tTUghbosXWVMM5m5lzNjNLF8diOtXr5yNtHZzotALUA/s8Hk8fM9CAK9EJOoEuXVYm1n47VbXBrS6MT399rb/lB1t55IH70Obq/Gm2vfgiOx97jPz16wFIzJVs3tZUw95KY1B5qsRoVHHRWPod1cCxmVZ+JhqgADSylNWawo3fLLvlmw8t2lffSk5BIXFLM4lbmklPnwMiI/CEhyOTKyFqHgf+62Xi5wtkLc/g+llhRM2ei2LePEwfmWg11HPq4xM8uvlWnvjho9hG59HWehTPLAHPLIGbbivls3Nesm65nZRsHY6hkeohu3VGM8dQAfB5fotkMYuXffvBbz9QWFhIT3cPHnGIxg8N2Hp6AJDJwhGuiwFAHBxAHB5m03ce9Rfk8Y7hcvwNdWoK+m+sp7X9FIbGVr69eQOEhbF/z5/8ad94510SNckkqpaQqFqiaayr2zdkt/aNR4cEwEw6QR8IxYWFhRgMBgpvLvRH6tZK70HCn3VQdMemixZYs7+KQ2//BwDP/PJ1DEdaKLxlnZ8BdGsK0K0p8GX5HjP0BULRAH/rR8gilz39y9+UJSUlRb3532+SlJTEhrs3Y+vppvFDyZGRL1qC58thPF9+wTylity1hUGFebxjEwVHL+Dw0Xbe+Nl2Cm9cBWFhxCyQk6TR0NPVRWHxOpA6XWwWC4SxqLPt6O6x0dGQ1w6mrwGCHAS5AkGu8Mrm5pTcolM0tDYSsSieklt0xCfG0dbVgZAYj5AYz+Z77kYYO8/Dj/+YZ195A3FIJCJCICJCQBwSIXwkiFOWZfB2tZFmaz+qlemk6rScvy6avE338PsPasAj0tllJjohgbT8mxVJy7SBS2nTplBMwD/70xauK/YF7vj+/f4EBWsLeXL7U+z/yyHSc3Rsf/V3pOfoJhU093r5pLDoGDnRMXIcA046PjFjH3CRma4GQL8mm5f/UEmKKt6fPiU7v+yCuk2LpjsMBk59Ndqbi4N++JNdbxF+to8ntz910QKmEtofN19OdIwCx0CwZ2sfcKGMVWAfcJGiiqfT0sfp3n6SF8cxlJWnQFo4CWlInK4GBM77NdrCdf6ImqNt1Bxto27c9oGgdx8pF6txn3VNWbgyQT1J+Aup09JHVX0rnRZf548iOSuvmBDNYDoABLa+Iu/WDTnyGDkmq4vKP75LfPwShE9aQRQwdZoxdZqJXqRCFEXcw26cQy4G3eeIXxyP6BGImH0dEbOvAwQ/y+Pj8XpHJnjMC+GCn+2fu6R9g3GuMhjJKNITo04tFuRxfqfragEQBEb+rRsUxr9U8vqLO1l1Y94lE3tHR6XnmBcA5SKlP06uVE6dacwL4/kCKTNNHfTdVlvFipvXawhxTyEUDfC/5926YZLwK1dnT5k5IiyCiDBp1FXGTxZ6EhARkZPS2D/r4547itjxxHcuBMLXD0ybLhcAxQXvQT/LzssPerYdnZj1ece8fvZRoAZcunbhAXnivyp1ztUEwCe4AkFOan6xBkU8xqOtnJ8l4D0v4j0vIsrj6CEK9ygI50WE8yLnvSNBYAwjMozI4Bd2Br+wgwfkC5So0zLBAyNer8QjIxIPuRgZcmHrMOECRI/EGzcUcZ0QSbQQzsa7StAWlWpEUZh2RzhdAPzvHS3NF02oz07/ysLkMdEAuOx2XHb7V6bfulGPLk3NfQ8/Pimu7oODcA1NAECRukoLQPNxE9oVksDaFenoV03wJQuMjZkAQ3lxk8i9Qc3WjdL0uPFTs/RsbvPHF9y2jroD1VPV8YoCMIl8GuAT3gdGIOlXpaNbnDBlfp8GSGBMDcCWtdnoLuj1AV7a9RaNzW1sDfA+mdxPXRZdjicYfIrD1Y3y+jXMnxVOX3sLZf9USpRnmD8bGohPjOehUj3xUVH+5PE3LGHNDUvY0/oppn4Hc0cD5l8xakSXi7lzZjEy5ALA4YWiDDX6jMmCmz7Yy7BHek/LWonLAy5RJPvmfJoOHADRdbly+ymkPsBiapsU+fPvfwuAgiVT99abs9PYnJ32lT/Zcbd+SuEDSXtTHs31xq8s60oDEASG5ZPjkwLvv7XgkpnS46LZUqJDmyKZhTZZ2hbX3qBGe4OaLXfpp1WJKwFCqAA4ASyfHOf4aQuP73qbttMWViarLiuzNjnRD4Q2Xe3nS1H14bopBX/pXx5Dd1uJv06B9bs6AAhyLN2WLsegG8egm+9uXkfkkB2X8wzC/CiGIYgn0cgEa1WJrFyZiTCCny+Wflj00ucaxgWsvCmPhroGnnthJ0+8/Fte/vHThM+Td/n2HKdDoWpAV3pBEZvKd1BVO9Eyjz313GUX8I6xnZ/srsF81s0b7WZqe+2Yz7ovK29hQT6GeiNPlW/DeLAKAOPBqpCmw6Esi0+5Je0Tfm+dNBRuKpjaD3jH2E67dbLjYz7rxnzWTcffIilJTZwUv6/6cND3offf5ZkXdmLvsvqCughhiyxkDTDV1fo/1het8b/vrT8JwH0v7AnK8Memdrb/T82UwgdSp2OQl40nqeqw0ukYBGBRrp6KQ9LawlPl2yi8KY9b7rgbgPzi9b5G6QpFkOkAMHGOzyM6xbNOZ98pMyuycliRlcOh99+FfjOVr/2UhrlJmD42svnX+6npG6b87YO0dvYxMuxlbkS4nyNHvURGRhIRMeEbzIqMYFZkBJZBN5bwSBakrqJg1UpEl4uCVSv5Zome1g9rEbtPEuHswzzgYFQmA1d/F67+qwbAVKrVZf5oojc2HKrmUJNkhmZjDUk3FtF9pJbObsslCx6dYs5/MXrhWWmprbJyf1C49URLoP1PywwuZ1lcZMIbjCJcBiC6+q2i/qFtBbnL1TzzZDlJmmTe/M9XGI1LoXX3G4SFSRvmsTGxJKtVOF1nAZCFT/zSOzrK/BgF4eHhjI1Jy+Nj49Pm5GQVv971NsnyOVTXGCjWFxIG7Nr1EpWVlQCcOnWKOVHzMdVU/giQbG/8qOnl0uV2ghfTAOczx6sUhkPVGA5Vj6MlAJIWqPP0dHZbSFZfnn8QSKdPS5pTPX5QorrGIL17JlWlixnsEU5nFHACCLKJVSHjWzu7BI+Yc+fGEjbeWSIJbjmN4chJDEYTqa4Waj4ws2xZOrPnzgXAPSpMlDgL3J4I8EBCkhpbtwVOS7vJxSXFVHS0kS5IAuuLdBTdrMMtwr59VVRUVFFaWoLhr7t3IxMn6ui5egAEkgIoTlkSr9FmprLxzhLu3CgB0NIsjQ4GowmD0cTW1/Z8ZWGNtX8FQFe0huIS/1YD1VXVZMsl4Xc8/cPxGsv98RUVVbg8fvMM6ZTIdDrBwB8UAzkla7OnnHYajpykMG/CD9Dl51+0YKu5JwiI6qrqKdPV1DZOCistLUEVpyxDOqUWEk3XBJyMrwkGCv/n96r483tVbLyzBLPltASCUXKIXvr5TprypdGisaEBuqVFDXW2Fv1DW0hULyFRvcSvBQcPHAx6+qj2sATAO+9WBYUXZC1TvH3AnkOIWjBdP8ApekREj+i02R24xRHCw8/7ueL9CgwDck47QRxyUXj/w4guJ4bK/Rgq95O2NInX/vRbPuttof79V9lx1yoS5kVS/sCDbCrVY/u0HdXaEmqOd9LnPs+ygrWYrS4qatsxi3N540A7kZwPYku/DUL0AqerAT4QuoBjze0dOYBiftTE8nV37xn6BqTWTtHmkaLNo9817F8lvv/7D7NhdUZQgS/9/FcA3LfpXnT50v6h9dSn2Do70N1Wykh7AnarjZrde1EmJpBwgdHVfdQxo1Fg+jdGZGiQlqC/B2jUcUoFgHncxRUEQZGizSN5/IRovyt4TvjEdx+g8shxKo3SosqS+ZHkjgve1NDI0KDUkLZOaTTQZ6uxW220GyUTcA25nOpEaQnNbLV3IeMY8KofhGswCvi0oBrIMVvtkxZMk1fna1K0eQqAqud2BkX+YGgy5rp8nV8TfIIHkjIxgcw8He1G6WqN2WoPOi5LiPMACP3OkG9zxMf+cEEQnIBG//TvygBF+6H3/JGq3DUoF8oB2Pt0OQDJaZkApBRIG62N774OgKBUISxUMWIyort1k7PxL3tftZ02HcMjTth6WEQXY3SBl1Ap1DNCgQeTnAHPPplM5gSc5sN7j7nP2BSW9hNRy++6N+qszcLyu+5ladZKBnq6gDAGerpYECOp8+p/fhRnbxeOAQfzNMuRzbsewLno+vn11e+8+vQ558A+4CSjnj6gDzgJY04Ym37tA2gmt8YUUzCCIASlEYU4n7ZIpiIZnSK9cJ0CwLTnLZJvKmYcQKetrQ5hoQrAKX5uOSaK4jEC/ZBADbgCNNNrc5NAuAAARCHomtzkXmcgeAorzBP8YABOURR99h14re7vBoCpQIAQd2kCyNfRBnZ2V4Wu1MXJoG3zGQLg5ArdBrmWAEwFxMXiLhR2qu9rdnP0Wlyd/bu6K3wh/S99/dE8xTxGAQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNy0wOC0xOFQwMjowOTo1MyswODowMMJBipEAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTctMDgtMThUMDI6MDk6NTMrMDg6MDCzHDItAAAALXRFWHRTb2Z0d2FyZQBDcmVhdGVkIGJ5IGZDb2RlciBHcmFwaGljcyBQcm9jZXNzb3J/w+1fAAAAAElFTkSuQmCC'
  }

  static get chance() {
    return .15
  }

  static get baseChitDamageRatio() {
    return 30
  }

  static get chitDamageRatioLevelMx() {
    return 0.6
  }

  static get Hst() {
    return 3000
  }

  static get stasisDescription() {
    return `击中时有 ${this.chance * 100}% 的几率[重击]附近的一名敌人，对其造成 ${Tools.roundWithFixed(this.baseChitDamageRatio * 100, 1)}%（+${Tools.roundWithFixed(this.chitDamageRatioLevelMx * 100, 1)}%/等级）攻击力的伤害，每 ${this.Hst / 1000} 秒[重击]一名随机敌人 (需要25级)`
  }

  static get __base_description() {
    return `击中时有 ${this.chance * 100}% 的几率[重击]附近的一名敌人，对其造成 $% 攻击力的伤害，每 ${this.Hst / 1000} 秒[重击]一名随机敌人 (需要25级)`
  }

  constructor() {
    super()

    this.lastHitTime = performance.now()
  }

  get chance() {
    return MirinaeTeardropOfTheStarweaver.chance
  }

  get chitDamageRatio() {
    return MirinaeTeardropOfTheStarweaver.baseChitDamageRatio + this.level * MirinaeTeardropOfTheStarweaver.chitDamageRatioLevelMx
  }

  get Hst() {
    return MirinaeTeardropOfTheStarweaver.Hst
  }

  get description() {
    return MirinaeTeardropOfTheStarweaver.__base_description.replace('$', (this.chitDamageRatio * 100).toFixed(1))
  }

  get levelUpPoint() {
    return (this.level + 1) * 78
  }

  get canHit() {
    return this.level >= 25 && performance.now() - this.lastHitTime > this.Hst
  }

  /**
   * @param {TowerBase} thisTower
   * @param {MonsterBase} target
   */
  chit(thisTower, target) {
    target.health -= thisTower.Atk * this.chitDamageRatio * (1 - target.armorResistance)
    console.log('MirinaeTeardropOfTheStarweaver make damage ' + target.lastAbsDmg)
    thisTower.recordDamage(target)

    const w = 82
    const h = 50
    const position = new Position(target.position.x - w / 2, target.position.y - h / 2)
    Game.callAnimation('magic_2', position, w, h, 1, 2)
  }

  /**
   * @override
   * @param {TowerBase} thisTower
   * @param {MonsterBase} monster
   */
  hitHook(thisTower, monster) {
    if (Math.random() < MirinaeTeardropOfTheStarweaver.chance) {
      this.chit(thisTower, monster)
    }
  }

  /**
   * @override
   * @param {TowerBase} thisTower
   * @param {MonsterBase[]} monsters
   */
  tickHook(thisTower, monsters) {
    if (this.canHit && monsters.length > 0) {

      console.log('MirinaeTeardropOfTheStarweaver timer hit')

      const t = _.shuffle(monsters)[0]
      this.chit(thisTower, t)

      this.lastHitTime = performance.now()
    }
  }
}

class SimplicitysStrength extends GemBase {

  static get gemName() {
    return '至简之力'
  }

  static get price() {
    return 18000
  }

  static get imgSrc() {
    return 'data:image/png;base64,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'
  }

  static get baseAttackAddition() {
    return 0.25
  }

  static get attackAdditionLevelMx() {
    return 0.01
  }

  static get stasisDescription() {
    return `提高攻击力 ${Tools.roundWithFixed(this.baseAttackAddition * 100, 1)}%（+${Tools.roundWithFixed(this.attackAdditionLevelMx * 100, 1)}%/等级）`
  }

  static get __base_description() {
    return '提高攻击力 $%'
  }

  constructor() {
    super()

    /** @type {TowerBase} */
    this.tower = null
  }

  get description() {
    return SimplicitysStrength.__base_description.replace('$', (this.attackAddition * 100).toFixed(1))
  }

  get levelUpPoint() {
    return (this.level + 1) * 8
  }

  get attackAddition() {
    return SimplicitysStrength.baseAttackAddition + this.level * SimplicitysStrength.attackAdditionLevelMx
  }

  /**
   * @override
   * @param {TowerBase} thisTower
   */
  initEffect(thisTower) {
    this.tower = thisTower

    this.tower.__atk_ratio = 1 + this.attackAddition
  }

  levelUp(currentPoint) {
    const ret = super.levelUp(currentPoint)

    this.tower.__atk_ratio = 1 + this.attackAddition

    return ret
  }
}

class BaneOfTheStricken extends GemBase {

  static get gemName() {
    return '受罚者之灾'
  }

  static get price() {
    return 65000
  }

  static get imgSrc() {
    return 'data:image/png;base64,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'
  }

  static get damageMakingRatioOnBoss() {
    return .25
  }

  static get baseDamageMakingRatio() {
    return 0.008
  }

  static get damageMakingRatioLevelMx() {
    return 0.0001
  }

  static get stasisDescription() {
    return `你对敌人造成的每次攻击都会使敌人从你攻击中受到的伤害提高 ${Tools.roundWithFixed(BaneOfTheStricken.baseDamageMakingRatio * 100, 2)}%（+${Tools.roundWithFixed(BaneOfTheStricken.damageMakingRatioLevelMx * 100, 2)}%/等级），对首领造成的伤害提高 ${Tools.roundWithFixed(BaneOfTheStricken.damageMakingRatioOnBoss * 100, 0)}%`
  }

  static get __base_description() {
    return `你对敌人造成的每次攻击都会使敌人从你攻击中受到的伤害提高 $%，对首领造成的伤害提高 ${Tools.roundWithFixed(BaneOfTheStricken.damageMakingRatioOnBoss * 100, 0)}%`
  }

  constructor() {
    super()

    /** @type {TowerBase} */
    this.tower = null
  }

  get damageMakingRatioPerHit() {
    return BaneOfTheStricken.baseDamageMakingRatio + this.level * BaneOfTheStricken.damageMakingRatioLevelMx
  }

  get damageMakingRatioOnBoss() {
    return BaneOfTheStricken.damageMakingRatioOnBoss
  }

  get description() {
    return BaneOfTheStricken.__base_description.replace('$', (this.damageMakingRatioPerHit * 100).toFixed(2))
  }

  get levelUpPoint() {
    return (this.level + 1) * 16 + 40
  }

  /**
   * @override
   * @param {TowerBase} thisTower
   * @param {MonsterBase} monster
   */
  hitHook(thisTower, monster) {
  }

  /**
   * @override
   * @param {TowerBase} thisTower
   */
  initEffect(thisTower) {
    this.tower = thisTower

    this.tower.__on_boss_atk_ratio = 1 + this.damageMakingRatioOnBoss
  }

  levelUp(currentPoint) {
    const ret = super.levelUp(currentPoint)

    this.tower.__on_boss_atk_ratio = 1 + this.damageMakingRatioOnBoss

    return ret
  }
}

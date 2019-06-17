/**
 * @typedef { (Node | ChildNode) & { style: CSSStyleDeclaration & {} } } NodeLike
 */

class Tools {

  static Dom = class _Dom {
    /**
     * @type {Map<string, Node | Node[]>}
     */
    static _cache = new Map()
    /**
     * @type {Map<string, number>}
     */
    static _instance = new Map()
    /**
     * @param {Node} node
     * @param {HTMLElement | {}} option
     */
    static __installOptionOnNode(node, option) {
      _.forOwn(option, (v, k) => {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'function') {
          node[k] = v
        }
        else if (typeof v === 'object') {
          _.forOwn(v, (subv, subk) => {
            node[k][subk] = [subv]
          })
        }
      })
    }
    /**
     * @param {Node | HTMLBodyElement} node
     * @param {HTMLDivElement | {}} [option]
     */
    static genetateDiv(node, option) {
      option = option || {}
      const div = document.createElement('div')
      this.__installOptionOnNode(div, option)
      node.appendChild(div)
      return div
    }
    /**
     * @param {Node} node
     * @param {string} src
     * @param {HTMLImageElement | {}} option
     */
    static generateImg(node, src, option) {
      option = option || {}
      const img = document.createElement('img')
      img.src = src
      this.__installOptionOnNode(img, option)
      node.appendChild(img)
      return img
    }
    /**
     * @param {Node} node
     * @param {HTMLDivElement | {}} [leftOpt]
     * @param {HTMLDivElement | {}} [rightOpt]
     * @param {Node[]} leftChildren
     * @param {Node[]} rightChildren
     */
    static generateTwoCol(node, leftOpt, rightOpt, leftChildren = [], rightChildren = []) {
      leftOpt = leftOpt || {}
      rightOpt = rightOpt || {}
      // console.log(leftOpt, rightOpt)

      const colL = document.createElement('div')
      colL.className = 'col'
      this.__installOptionOnNode(colL, leftOpt)
      leftChildren.forEach(child => colL.appendChild(child))
      const colR = document.createElement('div')
      colR.className = 'col'
      this.__installOptionOnNode(colR, rightOpt)
      rightChildren.forEach(child => colR.appendChild(child))
      node.appendChild(colL)
      node.appendChild(colR)
      return [colL, colR]
    }
    /**
     * @param {Node} node
     * @param {string | null} [className]
     * @param {HTMLDivElement | { style: CSSStyleDeclaration | {} } | {}} option
     * @param {Node[]} children
     */
    static generateRow(node, className, option = {}, children = []) {
      if (!Array.isArray(children)) {
        console.log(arguments)
        throw new TypeError('Tools.generateRow wrong parameters')
      }
      const row = document.createElement('div')
      row.className = className || 'row'
      option = option || {}
      this.__installOptionOnNode(row, option)
      children.forEach(child => row.appendChild(child))
      node.appendChild(row)
      return row
    }
    /**
     * @param {Node} node
     */
    static removeAllChildren(node) {
      while (node.hasChildNodes()) {
        
        node.removeChild(node.lastChild)
      }
    }
    /**
     * @param {HTMLElement & Node} node
     */
    static removeNodeTextAndStyle(node, className = 'row') {
      if (node.style.color) node.style.color = ''
      if (node.style.marginBottom) node.style.marginBottom = ''
      if (node.textContent) node.textContent = ''
      if (node.className != className) node.className = className
    }
    /**
     * @param {string} uniqueId
     * @param {HTMLButtonElement} node
     * @param {() => boolean} onPressFx - callable
     * @param {number} onPressFxCallDelay - ms
     * @param {number} onPressFxCallInterval - ms
     * @param {number} accDelay - ms
     * @param {number} accInterval - ms
     */
    static bindLongPressEventHelper(uniqueId, node, onPressFx, onPressFxCallDelay, onPressFxCallInterval, accDelay, accInterval) {

      accDelay = accDelay || Infinity

      let timerInst = -1

      if (!this._instance.has(uniqueId)) {
        this._instance.set(uniqueId, -1)
      }

      node.onmousedown = () => {

        timerInst = setTimeout(() => {

          const startLevel1 = performance.now()

          const intervalInst = setInterval(() => {
            // console.log('loop.')
            const cancel = onPressFx()

            if (cancel) {
              clearInterval(this._instance.get(uniqueId))
              this._instance.set(uniqueId, -1)
            }
            else if (performance.now() - startLevel1 > accDelay) {

              clearInterval(this._instance.get(uniqueId))

              this._instance.set(uniqueId, setInterval(() => {

                const cancel = onPressFx()

                if (cancel) {
                  clearInterval(this._instance.get(uniqueId))
                  this._instance.set(uniqueId, -1)
                }
              }, accInterval))
            }
          }, onPressFxCallInterval)

          this._instance.set(uniqueId, intervalInst)
        }, onPressFxCallDelay)
      }

      const cancelTokenFx = () => {
        if (timerInst > 0) {
          clearTimeout(timerInst)
          timerInst = -1
        }
        
        if (this._instance.get(uniqueId) > 0) {
          clearInterval(this._instance.get(uniqueId))
          this._instance.set(uniqueId, -1)
        }
      }

      node.onmouseup = cancelTokenFx
      node.onmouseleave = cancelTokenFx
    }
  }

  static Media = class _Media {

  }

  static formatterUs = new Intl.NumberFormat('en-US')
  static formatterCh = new Intl.NumberFormat('zh-u-nu-hanidec')

  static k_m_b_Formatter(num, precise = 1, useBillion = false) {
    const thisAbs = Math.abs(num)
    if (thisAbs < 1e3) {
      return num
    }
    else if (thisAbs < 1e6) {
      return this.roundWithFixed(num / 1000, precise) + ' k'
    }
    else if (thisAbs < 1e9) {
      return this.roundWithFixed(num / 1000000, precise) + ' m'
    }
    else {
      return useBillion ? (Tools.formatterUs.format(Math.sign(num) * this.roundWithFixed(thisAbs / 1000000000, precise)) + ' b') : (this.roundWithFixed(num / 1000000, precise) + ' m')
    }
  }

  /**
   * @param {number} num
   * @param {number} precise
   * @param {string} block
   * @returns {string}
   */
  static chineseFormatter(num, precise = 3, block = '') {
    const thisAbs = Math.abs(num)
    if (thisAbs < 1e4) {
      return this.roundWithFixed(num, precise) + ''
    }
    else if (thisAbs < 1e8) {
      return this.roundWithFixed(num / 1e4, precise) + block + '万'
    }
    else if (thisAbs < 1e12) {
      return this.roundWithFixed(num / 1e8, precise) + block + '亿'
    }
    else if (thisAbs < 1e16) {
      return this.roundWithFixed(num / 1e12, precise) + block + '兆'
    }
    else if (thisAbs < 1e20) {
      return this.roundWithFixed(num / 1e16, precise) + block + '京'
    }
    else/* if (thisAbs < 1e24)*/ {
      return this.roundWithFixed(num / 1e20, precise) + block + '垓'
    }
  }

  /**
   * @param {number} num
   * @param {number} fractionDigits
   */
  static roundWithFixed(num, fractionDigits) {
    const t = 10 ** fractionDigits
    return Math.round(num * t) / t
  }

  /**
   * 生成指定位数随机字符串
   * @param {number} bits
   */
  static randomStr(bits) {
    return new Array(bits).fill(1).map(() => ((Math.random() * 16 | 0) & 0xf).toString(16)).join('')
  }

  /**
   * 随机正负号
   */
  static randomSig() {
    return Math.random() < 0.5 ? 1 : -1
  }

  /**
   * @param {number|string} numberLike
   */
  static isNumberSafe(numberLike) {
    
    return numberLike !== '' && numberLike !== ' ' && !isNaN(numberLike)
  }

  /**
   * 绘制扇形
   * @param {CanvasRenderingContext2D} ctx
   */
  static renderSector(ctx, x, y, r, angle1, angle2, anticlock) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, r, angle1, angle2, anticlock)
    ctx.closePath()
    ctx.restore()
    return ctx
  }

  /**
   * 绘制带圆角的矩形
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} x the top left x coordinate
   * @param {Number} y the top left y coordinate
   * @param {Number} width the width of the rectangle
   * @param {Number} height the height of the rectangle
   * @param {Number | {tl: number,tr:number,br:number,bl:number}} [radius = 5] the corner radius or an object to specify different radius for corners
   * @param {Boolean} [fill = false] whether to fill the rectangle
   * @param {Boolean} [stroke = true] whether to stroke the rectangle
   */
  static renderRoundRect(ctx, x, y, width, height, radius, fill = false, stroke = true) {
    radius = radius || 5
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius }
    } else {
      const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 }
      for (const side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side]
      }
    }
    ctx.beginPath()
    ctx.moveTo(x + radius.tl, y)
    ctx.lineTo(x + width - radius.tr, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
    ctx.lineTo(x + width, y + height - radius.br)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
    ctx.lineTo(x + radius.bl, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
    ctx.lineTo(x, y + radius.tl)
    ctx.quadraticCurveTo(x, y, x + radius.tl, y)
    ctx.closePath()
    if (fill) {
      ctx.fill()
    }
    if (stroke) {
      ctx.stroke()
    }
  }

  /**
   * @reference https://github.com/gdsmith/jquery.easing/blob/master/jquery.easing.js
   */
  static EaseFx = class _Ease {
    /** @typedef {(x: number) => number} efx */
    static c1 = 1.70158
    static c2 = this.c1 * 1.525
    static c3 = this.c1 + 1
    static c4 = (2 * Math.PI) / 3
    static c5 = (2 * Math.PI) / 4.5

    /** @type {efx} */
    static linear = x => x

    /** @type {efx} */
    static easeInQuad = x => x * x

    /** @type {efx} */
    static easeOutQuad = x => 1 - (1 - x) * (1 - x)

    /** @type {efx} */
    static easeInOutQuad = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2

    /** @type {efx} */
    static easeInCubic = x => x * x * x

    /** @type {efx} */
    static easeOutCubic = x => 1 - Math.pow(1 - x, 3)

    /** @type {efx} */
    static easeInOutCubic = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2

    /** @type {efx} */
    static easeInQuart = x => x * x * x * x

    /** @type {efx} */
    static easeOutQuart = x => 1 - Math.pow(1 - x, 4)

    /** @type {efx} */
    static easeInOutQuart = x => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2

    /** @type {efx} */
    static easeInQuint = x => x * x * x * x * x

    /** @type {efx} */
    static easeOutQuint = x => 1 - Math.pow(1 - x, 5)

    /** @type {efx} */
    static easeInSine = x => 1 - Math.cos(x * Math.PI / 2)

    /** @type {efx} */
    static easeOutSine = x => Math.sin(x * Math.PI / 2)

    /** @type {efx} */
    static easeInOutSine = x => -(Math.cos(Math.PI * x) - 1) / 2

    /** @type {efx} */
    static easeInExpo = x => x === 0 ? 0 : Math.pow(2, 10 * x - 10)

    /** @type {efx} */
    static easeOutExpo = x => x === 1 ? 1 : 1 - Math.pow(2, -10 * x)

    /** @type {efx} */
    static easeInCirc = x => 1 - Math.sqrt(1 - Math.pow(x, 2))

    /** @type {efx} */
    static easeOutCirc = x => Math.sqrt(1 - Math.pow(x - 1, 2))

    /** @type {efx} */
    static easeInOutCirc = x => x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
  }

  /**
   * 返回一个比较某个属性的比较函数，通常用于作为Array.sort()的参数，如对数组A的b属性排序：A.sort(compareProperties('b'))
   * @template T
   * @type {<T>(properties: string, cFx?: (ela: T, elb: T) => number, ascend?: boolean) => (a: T, b: T) => number}
   */
  
  static compareProperties = (properties, cFx = (ela, elb) => ela - elb, ascend = true) => (a, b) => cFx(a[properties], b[properties]) * (ascend ? 1 : -1)

  static MathFx = class _Math {
    /**
     * 双曲函数
     */
    static curveFx = (a, b, phi = 0) => x => a + b / (x + phi)

    /**
     * 自然对数函数
     */
    static naturalLogFx = (a, b, c = 1) => x => a + b * Math.log(x + c)

    /**
     * 指数函数
     */
    static exponentialFx = (a, b, phi = 0) => x => a * Math.pow(Math.E, b * (x + phi))

    /**
     * 幂函数
     */
    static powerFx = (a, b, phi = 0) => x => a * Math.pow(x + phi, b)

    /**
     * S-曲线函数
     */
    static sCurveFx = (a, b, phi = 0) => x => 1 / (a + b * Math.pow(Math.E, -(x + phi)))
  }

  /**
   * @param {MonsterBase} target
   * @param {string} dotDebuffName
   * @param {number} duration
   * @param {number} interval
   * @param {(mst: MonsterBase) => void} damageEmitter
   */
  static installDot(target, dotDebuffName, duration, interval, singleAttack, isIgnoreArmor, damageEmitter) {
    if (typeof target[dotDebuffName] !== 'boolean') {
      console.log(target)
      throw new Error('target has no debuff mark as name ' + dotDebuffName)
    }
    if (target[dotDebuffName] || target.isDead) {
      return
    }
    else {
      let dotCount = 0
      // 目标标记debuff
      target[dotDebuffName] = true
      const itv = setInterval(() => {
        if (++dotCount > duration / interval) {
          // 效果结束、移除状态、结束计时器
          target[dotDebuffName] = false
          clearInterval(itv)
          return
        }
        if (target.health > 0) {
          // 跳DOT
          target.health -= singleAttack * (isIgnoreArmor ? 1 : (1 - target.armorResistance))
          // console.log('dot fired, damage ' + target.lastAbsDmg)
          damageEmitter(target)
        }
        else {
          // 目标死亡，结束计时器
          clearInterval(itv)
        }
      }, interval)
    }
  }
  /**
   * @param {MonsterBase} target
   * @param {string} dotDebuffName
   * @param {number} duration
   * @param {number} interval
   * @param {(mst: MonsterBase) => void} damageEmitter
   */
  static installDotDuplicated(target, dotDebuffName, duration, interval, singleAttack, isIgnoreArmor, damageEmitter) {
    if (!Array.isArray(target[dotDebuffName])) {
      console.log(target)
      throw new Error('target has no debuff mark as name ' + dotDebuffName)
    }
    if (target.isDead) {
      return
    }
    else {
      const thisId = this.randomStr(8)

      let dotCount = 0
      target[dotDebuffName].push(thisId)
      // console.log(singleAttack, Math.ceil(duration / interval))
      const itv = setInterval(() => {
        if (++dotCount > duration / interval) {
          // 效果结束、结束计时器
          target[dotDebuffName] = target[dotDebuffName].filter(d => d !== thisId)
          clearInterval(itv)
          return
        }
        if (target.health > 0) {
          target.health -= singleAttack * (isIgnoreArmor ? 1 : (1 - target.armorResistance))
          damageEmitter(target)
        }
        else {
          clearInterval(itv)
        }
      }, interval)
    }
  }
}

/**
 * 所有[物体]的基类
 */
class Base {

  constructor() {
    this.id = Tools.randomStr(8)
  }
}

/**
 * 所有[可用左上和右下两个点描述物体]的基类
 */
class RectangleBase extends Base {
  constructor(positionTL, positionBR, bw, bs, bf, br) {
    super()
    /**
     * @type {Position}
     */
    this.cornerTL = positionTL

    /**
     * @type {Position}
     */
    this.cornerBR = positionBR

    this.width = this.cornerBR.x - this.cornerTL.x
    this.height = this.cornerBR.y - this.cornerTL.y

    /** @type {number} */
    this.borderWidth = bw

    /** @type {string} */
    this.borderStyle = bs

    /** @type {string} */
    this.fillStyle = bf

    /**
     * @type {number | {tl: number, tr: number, br: number, bl: number }}
     */
    this.borderRadius = br
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  renderBorder(context) {
    context.strokeStyle = this.borderStyle
    Tools.renderRoundRect(context, this.cornerTL.x, this.cornerTL.y, this.width, this.height, this.borderRadius, false, true)
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  renderInside(context) {
    context.fillStyle = this.fillStyle
    Tools.renderRoundRect(context, this.cornerTL.x, this.cornerTL.y, this.width, this.height, this.borderRadius, true, false)
  }
}

/**
 * 所有[可用中心点和半径描述物体]的基类
 */
class CircleBase extends Base {
  constructor(p, r, bw, bs) {
    super()
    /**
     * 物体的位置，不应在任何时候替换实例的 {this.position}
     * 如果需要改变位置，使用mutable方法
     * @type {Position}
     */
    this.position = p

    /** @type {number} */
    this.radius = r

    /** @type {number} */
    this.borderWidth = bw

    /** @type {string} */
    this.borderStyle = bs
  }

  /**
   * Circle的内切正方形边长
   */
  get inscribedSquareSideLength() {
    return 2 * this.radius / Math.SQRT2
  }

  /** @param {CanvasRenderingContext2D} context */
  renderBorder(context) {
    if (this.borderWidth > 0) {
      context.strokeStyle = this.borderStyle
      context.lineWidth = this.borderWidth
      context.beginPath()
      context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true)
      context.closePath()
      context.stroke()
    }
  }
}

/**
 * 所有[物体]的基类
 */
class ItemBase extends CircleBase {

  /**
   * @param {Position} position
   * @param {number} radius
   * @param {number} borderWidth
   * @param {string} borderStyle
   * @param {string | ImageBitmap | Promise<ImageBitmap> | AnimationSprite} image
   */
  constructor(position, radius, borderWidth, borderStyle, image) {

    super(position, radius, borderWidth, borderStyle)

    /**
     * - Item的图形描述符，可以是位图、位图的Promise、动画
     * - 如果为 null, 则必须具备 fill
     * @type {ImageBitmap | Promise<ImageBitmap> | AnimationSprite | null}
     */
    this.image = null

    if (typeof image === 'string') {
      /**
       * Item的填充描述符
       * @type {string}
       */
      this.fill = image
    }
    else if (image instanceof ImageBitmap) {
      this.image = image
    }
    else if (image instanceof AnimationSprite) {
      this.image = image
    }
    else if (image instanceof Promise) {
      image.then(r => this.image = r)
    }
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} x
   * @param {number} y
   */
  renderSpriteFrame(context, x, y) {
    
    this.image.renderOneFrame(context, new Position(x, y), super.inscribedSquareSideLength, super.inscribedSquareSideLength, 0, true, true, false)
  }

  /** @param {CanvasRenderingContext2D} context */
  renderImage(context) {

    const x = this.position.x - super.inscribedSquareSideLength * 0.5
    const y = this.position.y - super.inscribedSquareSideLength * 0.5

    if (this.image instanceof ImageBitmap) {
      context.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        x,
        y,
        super.inscribedSquareSideLength,
        super.inscribedSquareSideLength
      )
    }
    else if (this.image instanceof AnimationSprite) {
      this.renderSpriteFrame(context, x, y)
    }
  }

  /** @param {CanvasRenderingContext2D} context */
  renderFilled(context) {
    context.fillStyle = this.fill
    context.beginPath()
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true)
    context.closePath()
    context.fill()
  }

  /** @param {CanvasRenderingContext2D} context */
  render(context) {
    super.renderBorder(context)
    if (this.image) {
      this.renderImage(context)
    }
    else if (this.fill) {
      this.renderFilled(context)
    }
  }

  /**
   * - 此方法使物体的图形旋转并返回一个恢复句柄
   * - 推导过程
   * - <r, θ> --> <1, 0>.rotate(θ).multipy(r)
   * - <x, y>.r(θ) = <xcos(θ) - ysin(θ), xsin(θ) + ycos(θ)>
   * - <r, θ> --> <rcos(θ), rsin(θ)>
   * - <x, y> --> <rcos(θ), rsin(θ)>
   * - rcos(θ) = x, rsin(θ) = y, tan(θ) = y/x => θ = arctan(y/x), r = x/cos(arctan(y/x))
   * - <x, y> --> <x/cos(arctan(y/x)), arctan(y/x)>
   * @param {CanvasRenderingContext2D} context
   * @param {Position} targetPos
   */
  rotateForward(context, targetPos) {
    context.translate(this.position.x, this.position.y)
    let thelta = Math.atan((this.position.y - targetPos.y) / (this.position.x - targetPos.x))
    if (this.position.x > targetPos.x) thelta += Math.PI
    context.rotate(thelta)

    return {
      restore() {
        context.resetTransform()
      }
    }
  }

  /**
   * - 此方法提供给所有子类选择重载
   * - 在物体被清理前做回收工作
   */
  destory() {
    if (this.image instanceof AnimationSprite) {
      this.image.terminateLoop()
    }
  }
}

class TowerBase extends ItemBase {

  static informationDesc = new Map([
    ['等级', '鼠标单击图标或按[C]键来消耗金币升级，等级影响很多属性，到达某个等级可以晋升'],
    ['下一级', '升级到下一级需要的金币数量'],
    ['售价', '出售此塔可以返还的金币数量'],
    // ['可用点数', '升级传奇宝石等级的点数，杀敌、制造伤害、升级均可获得点数'],
    ['伤害', '此塔的基础攻击力'],
    ['攻击速度', '此塔的每秒攻击次数'],
    ['射程', '此塔的索敌距离，单位是像素'],
    ['弹药储备', '此塔每次攻击时发射的弹药数量'],
    ['DPS', '估计的每秒伤害']
  ])

  /**
   * @type {{ name: string, ctor: typeof GemBase }[]}
   */
  static Gems = [
    {
      ctor: PainEnhancer,
      name: 'PainEnhancer'
    },
    {
      ctor: GogokOfSwiftness,
      name: 'GogokOfSwiftness'
    },
    {
      ctor: MirinaeTeardropOfTheStarweaver,
      name: 'MirinaeTeardropOfTheStarweaver'
    },
    {
      ctor: SimplicitysStrength,
      name: 'SimplicitysStrength'
    },
    {
      ctor: BaneOfTheStricken,
      name: 'BaneOfTheStricken'
    },
    {
      ctor: GemOfEase,
      name: 'GemOfEase'
    },
    {
      ctor: BaneOfTheTrapped,
      name: 'BaneOfTheTrapped'
    },
    {
      ctor: ZeisStoneOfVengeance,
      name: 'ZeisStoneOfVengeance'
    },
    {
      ctor: EchoOfLight,
      name: 'EchoOfLight'
    }
  ]

  /**
   * @param {string} gn
   */
  static GemNameToGemCtor(gn) {
    
    return this.Gems.find(g => g.name === gn).ctor
  }

  static GemsToOptions = TowerBase.Gems.map((gemCtor, idx) => {
    const option = document.createElement('option')
    option.setAttribute('value', gemCtor.name)
    if (idx === 0) {
      option.setAttribute('selected', 'selected')
    }
    option.textContent = `${gemCtor.ctor.gemName} $ ${gemCtor.ctor.price}`
    return option
  })

  static GemsToOptionsInnerHtml = TowerBase.Gems
    .map((gemCtor, idx) => {
      return `<option value="${gemCtor.name}"${idx === 0 ? ' selected' : ''}>${gemCtor.ctor.gemName}</option>`
    })
    .join('')

  /**
   * 升级后获得的点数
   */
  static get levelUpPointEarnings() {
    return 10
  }

  /**
   * 击杀普通怪物获得的点数
   */
  static get killNormalPointEarnings() {
    return 1
  }

  /**
   * 击杀BOSS获得的点数
   */
  static get killBossPointEarnings() {
    return 50
  }

  /**
   * 制造伤害获得的点数
   * @param {number} damage
   */
  static damageToPoint(damage) {
    return Math.round(damage / 1000)
  }

  /**
   * @param {number[]} price 索引: 等级, 值: 此等级的价格
   * @param {(lvl: number) => number} levelAtkFx
   * @param {(lvl: number) => number} levelHstFx
   * @param {(lvl: number) => number} levelSlcFx
   * @param {(lvl: number) => number} levelRngFx
   * */
  constructor(position, radius, borderWidth, borderStyle, image, price, levelAtkFx, levelHstFx, levelSlcFx, levelRngFx) {
    super(position, radius, borderWidth, borderStyle, image)

    this.bornStamp = performance.now()

    // BulletManager 采用单例模式，所有塔共享
    this.bulletCtl = new BulletManager()

    this.level = 0
    this.price = price

    this.rank = 0

    this.levelAtkFx = levelAtkFx
    this.levelHstFx = levelHstFx
    this.levelSlcFx = levelSlcFx
    this.levelRngFx = levelRngFx

    /** @type {MonsterBase | null} */
    this.target = null

    this.lastShootTime = this.bornStamp

    this.__kill_count = 0
    this.__total_damage = 0

    /** @type {GemBase | null} */
    this.gem = null
    this.canInsertGem = true
    this.__hst_ps_ratio = 1
    this.__atk_ratio = 1
    this.__kill_extra_gold = 0

    this.__on_boss_atk_ratio = 1
    this.__on_trapped_atk_ratio = 1
    this.__max_rng_atk_ratio = 1
    this.__min_rng_atk_ratio = 1
    /** @type {Map<string, number>} */
    this.__each_monster_damage_ratio = new Map()

    /**
     * @virtual
     * @type {string | undefined}
     */
    this.description = undefined

    /**
     * @virtual
     * @type {string | undefined}
     */
    this.name = undefined

    /**
     * @virtual
     * @type {string | undefined}
     */
    this.bulletCtorName = undefined

    this.isSold = false
  }

  /** @type {string[]} */
  get descriptionChuned() {
    if (!this.description) return []
    return this.description.split('\n')
  }

  get sellingPrice() {
    let s = 0
    for (let i = 0; i < this.level + 1; i++) {
      s += this.price[i]
    }
    if (this.gem) s += this.gem.constructor.price

    return Math.ceil(s * 0.7)
  }

  /**
   * 攻击力
   */
  get Atk() {
    return this.levelAtkFx(this.level) * this.__atk_ratio
  }

  /**
   * 攻击间隔 (ms)
   */
  get Hst() {
    return 1000 / this.HstPS
  }

  /**
   * 每秒攻击次数
   */
  get HstPS() {
    return this.levelHstFx(this.level) * this.__hst_ps_ratio
  }

  /**
   * 每次攻击的发射量
   */
  get Slc() {
    return this.levelSlcFx(this.level)
  }

  /**
   * 射程
   */
  get Rng() {
    return this.reviceRange(this.levelRngFx(this.level)) + this.radius
  }

  /**
   * 计算的理论每秒输出
   */
  get DPS() {
    return this.Atk * this.Slc * this.HstPS
  }

  /**
   * @type {[string, string][]}
   * 展示信息
   */
  get informationSeq() {
    const base = [
      [this.name, ''],
      ['等级', this.levelHuman],
      ['下一级', this.isMaxLevel ? '最高等级' : '$ ' + Tools.formatterUs.format(Math.round(this.price[this.level + 1]))],
      ['售价', '$ ' + Tools.formatterUs.format(Math.round(this.sellingPrice))],
      // ['可用点数', Tools.formatterUs.format(Game.updateGemPoint)],
      ['伤害', Tools.chineseFormatter(Math.round(this.Atk), 3)],
      ['攻击速度', Tools.roundWithFixed(this.HstPS, 2)],
      ['射程', Tools.formatterUs.format(Math.round(this.Rng))],
      ['弹药储备', Math.round(this.Slc)],
      ['DPS', Tools.chineseFormatter(this.DPS, 3)]
    ]
    
    return base
  }

  /**
   * 实际每秒输出
   */
  get ADPS() {
    return this.__total_damage / (performance.now() - this.bornStamp) * 1000
  }

  /**
   * 已格式化的实际每秒输出
   */
  get ADPSH() {
    return Tools.chineseFormatter(Tools.roundWithFixed(this.ADPS, 3), 3)
  }

  get exploitsSeq() {
    return [
      ['击杀', this.__kill_count],
      ['输出', Tools.chineseFormatter(this.__total_damage, 3)],
      ['每秒输出', this.ADPSH]
    ]
  }

  /**
   * - 判断[this.target]是否仍然非空
   * - 判断当前的敌人是否仍然在范围内
   * - 判断当前的敌人是否仍然存活
   */
  get isCurrentTargetAvailable() {
    if (!this.target || this.target.isDead) return false
    else return this.inRange(this.target)
  }

  /**
   * - 计算上次射击至今的时间，判断是否可以射击
   */
  get canShoot() {
    return performance.now() - this.lastShootTime > this.Hst
  }

  get isMaxLevel() {
    return this.price.length - 1 === this.level
  }

  get levelHuman() {
    return this.level + 1
  }

  /**
   * 对设计稿的距离值进行修正，得到正确的相对距离
   * @param {number} r 基于设计稿的距离值 px
   */
  reviceRange(r) {
    return r * Game.callGridSideSize() / 39
  }

  /**
   * - 插入 Legendary Gem
   * @param {string} gemCtorName
   */
  inlayGem(gemCtorName) {
    this.gem = new (TowerBase.GemNameToGemCtor(gemCtorName))()
    this.gem.initEffect(this)
  }

  /**
   * @final
   * @param {MonsterBase} param0
   */
  recordDamage({ lastAbsDmg, isDead, isBoss }) {

    this.__total_damage += lastAbsDmg

    Game.updateGemPoint += TowerBase.damageToPoint(lastAbsDmg)

    if (isDead) {
      this.recordKill()
      Game.updateGemPoint += isBoss ? TowerBase.killBossPointEarnings : TowerBase.killNormalPointEarnings

      if (this.gem) {
        this.gem.killHook(this, arguments[0])
      }
    }
  }

  /**
   * @private
   * @do_not_call_outside_or_override
   */
  recordKill() {
    this.__kill_count++
    Game.callMoney()[1](this.__kill_extra_gold)
  }

  /**
   * - do not override this mothod for any reason
   * @final
   * @param {MonsterBase} target
   */
  inRange(target) {
    const t = this.Rng + target.radius
    return Position.distancePow2(target.position, this.position) < t * t
  }

  /**
   * - 在怪物中重选目标
   * - 在乱序的怪物中找到首个在攻击范围内的
   * @param {MonsterBase[]} targetList
   */
  reChooseTarget(targetList) {
    for (const t of _.shuffle(targetList)) {
      if (this.inRange(t)) {
        this.target = t
        return
      }
    }
    this.target = null
  }

  /**
   * @final
   * @param {MonsterBase} mst
   */
  calculateDamageRatio(mst) {
    const bossR = mst.isBoss ? this.__on_boss_atk_ratio : 1
    const particularR = this.__each_monster_damage_ratio.has(mst.id) ? this.__each_monster_damage_ratio.get(mst.id) : 1
    const trapR = mst.isTrapped ? this.__on_trapped_atk_ratio : 1
    const R = Position.distance(this.position, mst.position) / this.Rng
    const rangeR = this.__min_rng_atk_ratio * (1 - R) + this.__max_rng_atk_ratio * R

    // console.log(bossR, particularR, trapR, rangeR)
    
    return bossR * particularR * trapR * rangeR
  }

  /**
   * @param {number} i
   * @param {MonsterBase[]} monsters
   */
  produceBullet(i, monsters) {
    // if (!this.bulletCtorName || !this.target) {
    //   throw new TypeError('null bulletCtorName or null target'.)
    // }
    
    const ratio = this.calculateDamageRatio(this.target)
    
    this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.target, this.bulletImage)
  }

  recordShootTime() {
    this.lastShootTime = performance.now()
  }

  /**
   * @param {MonsterBase[]} monsters
   */
  run(monsters) {
    if (this.canShoot) {
      if (!this.isCurrentTargetAvailable) {
        this.reChooseTarget(monsters)
      }
      if (this.target) {
        this.shoot(monsters)
      }
    }
  }

  /**
   * @param {MonsterBase[]} monsters
   */
  shoot(monsters) {
    this.gemAttackHook(monsters)

    for (let i = 0; i < this.Slc; i++) {

      this.produceBullet(i, monsters)

      this.gemHitHook(i, monsters)
    }
    this.recordShootTime()
  }

  /**
   * 每次发射时触发
   * @param {MonsterBase[]} msts
   */
  gemHitHook(idx, msts) {
    if (this.gem) {
      
      this.gem.hitHook(this, this.target, msts)
    }
  }

  /**
   * 每次准备攻击时触发
   * @param {MonsterBase[]} msts
   */
  gemAttackHook(msts) {
    if (this.gem) {
      this.gem.attackHook(this, msts)
    }
  }

  /**
   * - 升级逻辑
   * - 子类重写时必须调用基类的levelUp
   * @param {number} currentMoney
   */
  levelUp(currentMoney) {
    if (this.isMaxLevel) return 0
    if (this.price[this.level + 1] > currentMoney) {
      return 0
    }
    else {
      this.level += 1

      const w = this.inscribedSquareSideLength * 1.5 // 144 / 241
      Game.callAnimation(
        'level_up',
        new Position(
          this.position.x - this.radius,
          this.position.y - this.radius * 2
        ),
        w,
        w / 144 * 241,
        3
      )

      Game.updateGemPoint += TowerBase.levelUpPointEarnings

      return this.price[this.level]
    }
  }

  rankUp() {
    this.rank += 1

    const w = this.inscribedSquareSideLength * 1.5 // 79 / 85
    Game.callAnimation(
      'rank_up',
      new Position(
        this.position.x - this.radius,
        this.position.y - this.radius * 2
      ),
      w,
      w / 79 * 85,
      3,
      0,
      25
    )
  }

  /** @param {CanvasRenderingContext2D} context */
  renderRange(context, style = 'rgba(177,188,45,.05)') {
    context.fillStyle = style
    context.beginPath()
    context.arc(this.position.x, this.position.y, this.Rng, 0, Math.PI * 2, true)
    context.closePath()
    context.fill()
  }

  /** @param {CanvasRenderingContext2D} context */
  renderLevel(context) {
    const ftmp = context.font
    context.font = '6px TimesNewRoman'

    
    context.fillStyle = context.manager.towerLevelTextStyle
    context.fillText('lv ' + this.levelHuman, this.position.x + this.radius * .78, this.position.y - this.radius * .78)

    context.font = ftmp
  }

  /** @param {CanvasRenderingContext2D} context */
  renderRankStars(context) {
    if (this.rank > 0) {
      const l2 = Math.floor(this.rank / 4)
      const l1 = this.rank % 4

      const py = this.position.y - this.radius * 1.25
      const px = this.position.x - this.radius * .68

      for (let i = 0; i < l2; i++) {
        context.drawImage(
          Game.callImageBitMap('p_ruby'),
          px + 7 * i,
          py,
          8,
          8
        )
      }
      for (let i = 0; i < l1; i++) {
        context.drawImage(
          Game.callImageBitMap('star_m'),
          px + 5 * i + 7 * l2,
          py,
          8,
          8
        )
      }
    }
  }

  /** @param {CanvasRenderingContext2D} context */
  renderPreparationBar(context) {
    if (this.canShoot) return
    context.fillStyle = 'rgba(25,25,25,.3)'
    Tools.renderSector(context, this.position.x, this.position.y, this.radius, 0, Math.PI * 2 * (1 - (performance.now() - this.lastShootTime) / this.Hst), false).fill()
  }

  /** @param {CanvasRenderingContext2D} context */
  render(context) {
    super.render(context)
    this.renderLevel(context)
    this.renderRankStars(context)
  }

  /**
   * @virtual
   * @param {CanvasRenderingContext2D} ctxRapid
   * @param {MonsterBase[]} monsters
   */
  rapidRender(ctxRapid, monsters) {}

  /**
   * - position:
   * - 2 | 1
   * - --o--
   * - 3 | 4
   * @param {number} bx1
   * @param {number} [bx2]
   * @param {number} [by1]
   * @param {number} [by2]
   * @param {boolean} [showGemPanel]
   */
  renderStatusBoard(bx1, bx2, by1, by2, showGemPanel, showMoreDetail, specifedWidth) {
    showGemPanel = showGemPanel && this.canInsertGem

    const red = '#F51818'
    const green = '#94C27E'

    // inner help functions
    const renderDataType_1 = (rootNode, dataChunk, offset, showDesc) => {
      // debugger
      let jump = 0
      dataChunk.forEach((data, idx) => {
        const showD = showDesc && this.constructor.informationDesc.has(data[0])

        // if (showD) console.log(data[0], showD, 'index: ' + idx + offset + jump)

        const row = rootNode.childNodes.item(idx + offset + jump)
        Tools.Dom.removeNodeTextAndStyle(row)
        if (!row.hasChildNodes()) {
          Tools.Dom.generateTwoCol(row)
        }
        else {
          Tools.Dom.removeNodeTextAndStyle(row.lastChild)
          Tools.Dom.removeNodeTextAndStyle(row.firstChild)
        }
        row.firstChild.textContent = data[0]
        row.lastChild.textContent = data[1]

        // @todo 售价 green red

        if (showD) {
          const rowD = rootNode.childNodes.item(idx + offset + jump + 1)
          Tools.Dom.removeNodeTextAndStyle(rowD)
          Tools.Dom.removeAllChildren(rowD)
          rowD.textContent = this.constructor.informationDesc.get(data[0])
          rowD.style.color = '#909399'
          rowD.style.marginBottom = '5px'
          jump++
        }

        if (data[0] === '售价' || data[0] === '类型') {
          row.lastChild.style.color = '#606266'
          renderDataType_dv(rootNode, idx + offset + jump + (showD ? 2 : 1))
          jump++
        }
        else if (data[0] === '下一级') {
          if (this.isMaxLevel) row.lastChild.style.color = '#DCDFE6'
          else row.lastChild.style.color = this.price[this.level + 1] < Game.callMoney()[0] ? green : red
        }
      })
    }
    const renderDataType_2 = (rootNode, dataChunk, offset) => {
      dataChunk.forEach((data, idx) => {
        const row = rootNode.childNodes.item(idx + offset)
        Tools.Dom.removeNodeTextAndStyle(row)
        Tools.Dom.removeAllChildren(row)
        if (data.includes('+')) row.style.color = 'rgba(204,51,51,1)'
        else if (data.includes('-')) row.style.color = 'rgba(0,102,204,1)'
        else row.style.color = ''
        row.textContent = data
      })
    }
    const renderDataType_dv = (rootNode, offset) => {
      const div = rootNode.childNodes.item(offset)
      Tools.Dom.removeAllChildren(div)
      Tools.Dom.removeNodeTextAndStyle(div, 'division')
    }

    /// render start
    specifedWidth = specifedWidth || 140

    const blockElement = Game.callElement('status_block')
    blockElement.style.display = 'block'
    blockElement.style.width = specifedWidth + 'px'
    blockElement.style.borderBottomLeftRadius = showGemPanel ? '0' : ''
    blockElement.style.borderBottomRightRadius = showGemPanel ? '0' : ''
    blockElement.style.borderBottom = showGemPanel ? '0' : ''

    const lineCount = this.informationSeq.length + this.descriptionChuned.length + this.exploitsSeq.length
    const moreDescLineCount = showMoreDetail ? this.informationSeq.filter(f => this.constructor.informationDesc.has(f[0])).length : 0
    const extraLineCount = 2 + 1 + moreDescLineCount /* inner_division_key.length */

    if (blockElement.childNodes.length > lineCount + extraLineCount) {
      blockElement.childNodes.forEach((child, index) => {
        if (index > lineCount - 1 + extraLineCount) {
          Tools.Dom.removeAllChildren(child)
          Tools.Dom.removeNodeTextAndStyle(child)
        }
      })
    }

    while (blockElement.childNodes.length < lineCount + extraLineCount) {
      Tools.Dom.generateRow(blockElement)
    }

    const l1 = this.informationSeq.length + 2 + moreDescLineCount
    const l2 = l1 + this.exploitsSeq.length + 1

    renderDataType_1(blockElement, this.informationSeq, 0, showMoreDetail)

    renderDataType_dv(blockElement, l1 - 1)

    renderDataType_1(blockElement, this.exploitsSeq, l1, false)

    renderDataType_dv(blockElement, l2 - 1)

    renderDataType_2(blockElement, this.descriptionChuned, l2)
    /// render end

    // 需要显示Legendary Gem面板
    if (showGemPanel) {
      // 依赖的变量
      // this.gem *
      // this.id *

      const gemElement = Game.callElement('gem_block')

      Tools.Dom.removeAllChildren(gemElement)

      gemElement.style.display = 'block'
      gemElement.style.width = specifedWidth + 'px'
      // gemElement.style.top = positionTLY + bHeight + 'px'
      // gemElement.style.left = positionTLX + 'px'

      // 选择Legendary Gem
      if (!this.gem) {

        let selected = TowerBase.Gems[0].name

        
        Tools.Dom.generateRow(gemElement, null, { textContent: '选购一颗' + GemBase.gemName, style: { margin: '0 0 8px 0' } })

        if (showMoreDetail) {
          Tools.Dom.generateRow(gemElement, null, { textContent: GemBase.gemName + '可以极大得提高塔的能力，每个单位只能选择一枚' + GemBase.gemName + '镶嵌，之后可以使用点数升级继续提高' + GemBase.gemName + '的效用', style: { margin: '0 0 8px 0', color: '#909399' } })
        }

        const select = document.createElement('select')
        select.style.width = '100%'
        select.style.fontSize = '12px'
        select.onchange = () => {
          selected = select.value
          const ctor = TowerBase.GemNameToGemCtor(selected)
          
          rowDesc.textContent = ctor.stasisDescription
          
          rowimg.firstChild.src = ctor.imgSrc
          rowPrice.lastChild.textContent = '$ ' + Tools.formatterUs.format(ctor.price)
          
          rowPrice.lastChild.style.color = ctor.price <= Game.callMoney()[0] ? green : red
          if (ctor.price > Game.callMoney()[0]) {
            btn.setAttribute('disabled', 'disabled')
          }
          else {
            btn.removeAttribute('disabled')
          }
        }
        // TowerBase.GemsToOptions.forEach(opt => select.appendChild(opt))
        select.innerHTML = this.constructor.GemsToOptionsInnerHtml
        Tools.Dom.generateRow(gemElement, 'row_nh', { style: { margin: '0 0 8px 0' } }, [select])

        // const rowimg = Tools.Dom.generateRow(gemElement, null, { innerHTML: `<img src="${(eval(selected)).imgSrc}" class="lg_gem_img"></img>` })
        const rowimg = Tools.Dom.generateRow(gemElement)
        
        Tools.Dom.generateImg(rowimg, TowerBase.GemNameToGemCtor(selected).imgSrc, { className: 'lg_gem_img' })
        const rowPrice = Tools.Dom.generateRow(gemElement, null, { style: { marginBottom: '5px' } }, TowerBase.GemNameToGemCtor(selected).priceSpan)
        
        rowPrice.lastChild.style.color = TowerBase.GemNameToGemCtor(selected).price <= Game.callMoney()[0] ? green : red
        const rowDesc = Tools.Dom.generateRow(gemElement, null, {
          
          textContent: TowerBase.GemNameToGemCtor(selected).stasisDescription,
          style: {
            lineHeight: '1.2',
            margin: '0 0 8px 0'
          }
        })

        const btn = document.createElement('button')
        btn.type = 'button'
        btn.textContent = '确认'
        if (TowerBase.GemNameToGemCtor(selected).price > Game.callMoney()[0]) {
          btn.setAttribute('disabled', 'disabled')
        }
        btn.onclick = () => {
          const ct = TowerBase.GemNameToGemCtor(selected)
          const [money, emitter] = Game.callMoney()

          if (money > ct.price) {
            emitter(-ct.price)
            this.inlayGem(selected)

            
            this.renderStatusBoard(...arguments)
          }
        }
        // if (this.constructor.deniedGems && this.constructor.deniedGems.includes(selected)) {
        //   Tools.Dom.generateRow(gemElement, null, { textContent: this.name + ' 不能装备这个宝石' })
        // }
        Tools.Dom.generateRow(gemElement, null, null, [btn])
      }
      // 展示Legendary Gem
      else {
        const canUpdateNext = !this.gem.isMaxLevel && Game.updateGemPoint >= this.gem.levelUpPoint

        Tools.Dom.generateRow(gemElement, null, { textContent: '升级你的' + GemBase.gemName })

        const btn = document.createElement('button')
        btn.type = 'button'
        btn.textContent = '升级'
        btn.title = '长按快速升级'
        if (!canUpdateNext) {
          btn.setAttribute('disabled', 'disabled')
        }
        else {
          btn.removeAttribute('disabled')
        }
        btn.onclick = () => {
          Game.updateGemPoint -= this.gem.levelUp(Game.updateGemPoint)

          
          this.renderStatusBoard(...arguments)
        }
        Tools.Dom.bindLongPressEventHelper(
          this.id,
          btn,
          () => {
            if (!this.gem.isMaxLevel && Game.updateGemPoint >= this.gem.levelUpPoint) {
              btn.onclick(null)
              return false
            }
            else {
              return true
            }
          },
          200,
          50,
          1500,
          10
        )

        Tools.Dom.generateRow(gemElement, null, { textContent: this.gem.gemName, style: { marginBottom: '10px' } })

        const [imgCol] = Tools.Dom.generateTwoCol(
          Tools.Dom.generateRow(gemElement, null, { style: { marginBottom: '5px' } }),
          null,
          null,
          [],
          [btn]
        ) // img | button line
        Tools.Dom.generateImg(imgCol, this.gem.imgSrc, { className: 'lg_gem_img' })

        Tools.Dom.generateRow(gemElement, null, { textContent: this.gem.level + '  级 / ' + this.gem.maxLevelHuman })

        // Tools.Dom.generateTwoCol(Tools.Dom.generateRow(gemElement), { textContent: this.gem.gemName }, { textContent: this.gem.level + '  级 / ' + this.gem.maxLevelHuman })

        
        Tools.Dom.generateTwoCol(Tools.Dom.generateRow(gemElement), { textContent: '下一级点数' }, { textContent: this.gem.isMaxLevel ? '最高等级' : Tools.formatterUs.format(this.gem.levelUpPoint), style: { color: canUpdateNext ? green : red } })
        Tools.Dom.generateRow(gemElement, null, { textContent: this.gem.description })
      }
    }

    // 计算 高度 => 偏移量
    const gemElement = Game.callElement('gem_block')
    const bHeight = blockElement.offsetHeight
    const gHeight = gemElement.offsetHeight

    let position = 2

    if (this.position.x - bx1 < specifedWidth + this.radius) {
      position = 1
      if (this.position.y - by1 < bHeight) {
        position = 4
      }
    }
    if (this.position.y - by1 < bHeight) {
      position = 3
      if (this.position.x - bx1 < specifedWidth + this.radius) {
        position = 4
      }
    }

    const positionTLX = this.position.x - (position === 1 || position === 4 ? this.radius * -1 : specifedWidth + this.radius)
    let positionTLY = this.position.y + (position === 1 || position === 2 ? -1 : 0) * (bHeight + this.radius)
    const pyBhGh = positionTLY + bHeight + gHeight

    if (position < 3 && positionTLY < 0) {
      positionTLY = 5
    }
    else if (/*position < 3 && */pyBhGh > innerHeight) {
      const overflowH = pyBhGh - innerHeight
      positionTLY -= overflowH + 30
    }
    // else if (position > 2 && pyBhGh > innerHeight) {
    //   const overflowH = pyBhGh - innerHeight
    //   positionTLY -= overflowH + 5
    // }

    blockElement.style.top = positionTLY + 'px'
    blockElement.style.left = positionTLX + 'px'

    if (showGemPanel) {
      gemElement.style.top = positionTLY + bHeight + 'px'
      gemElement.style.left = positionTLX + 'px'
    }
  }
}

class MonsterBase extends ItemBase {

  static informationDesc = new Map()

  /**
   * @param {number} level
   * @param {(lvl: number) => number} levelRwdFx
   * @param {(lvl: number) => number} levelSpdFx
   * @param {(lvl: number) => number} levelHthFx
   * @param {(lvl: number) => number} levelAmrFx
   * @param {(lvl: number) => number} [levelShdFx]
   */
  constructor(position, radius, borderWidth, borderStyle, image, level, levelRwdFx, levelSpdFx, levelHthFx, levelAmrFx, levelShdFx) {
    super(position, radius, borderWidth, borderStyle, image)
    this.__inner_level = level

    this.maxHealth = Math.round(levelHthFx(level))
    this.__inner_current_health = this.maxHealth

    this.maxShield = levelShdFx ? levelShdFx(level) : 0
    this.__inner_current_shield = this.maxShield

    this.inner_armor = levelAmrFx(level)

    this.__base_speed = levelSpdFx(level)
    this.speedRatio = 1

    this.reward = Math.round(levelRwdFx(level))

    this.damage = 1

    this.healthChangeHintQueue = []

    // DOT
    this.bePoisoned = false // 中毒 outside process
    this.beBloodied = false // 流血 outside process
    this.beBurned = false // 灼烧 outside process
    this.beOnLightEcho = [] // 圣光 outside process
    // DEBUFF
    // 负面效果的计算，移除由承受单位进行计算
    // 单位若受到前后两个束缚效果，前一个结束后会移除单位的束缚效果，导致后一个效果提前结束
    this.beShocked = false // 电麻 微小机率向最靠近的单位放电
    this.shockDurationTick = 0
    this.shockChargeAmount = 0
    /** @type {TeslaTower} */
    this.shockSource = null
    this.shockLeakChance = 0

    this.beTransformed = false // 变形
    this.transformDurationTick = 0

    this.beImprisoned = false // 禁锢(速度=0)
    this.imprisonDurationTick = 0

    this.beFrozen = false // 冻结(速度=0)
    this.freezeDurationTick = 0

    this.beConfused = false // 混乱(速度=P<速度*0.5,random(0,360)>)

    this.beImprecated = false // 诅咒
    this.imprecatedRatio = 1 // 诅咒的易伤系数

    this.lastAbsDmg = 0

    this.isBoss = false

    this.isDead = false

    this.name = null

    this.description = null

    this.exploitsSeq = [
      ['赏金', Tools.chineseFormatter(this.reward, 0)]
    ]

    this.type = '普通怪物'
  }

  get armorResistance() {
    return this.inner_armor / (100 + this.inner_armor)
  }

  get speedValue() {
    if (this.beFrozen || this.beImprisoned) return 0
    if (this.beConfused) return this.__base_speed * -0.5
    return this.__base_speed * this.speedRatio
  }

  /** @type {number} */
  get health() {
    return this.__inner_current_health
  }

  /** @type {number} */
  get shield() {
    return this.__inner_current_shield
  }

  set health(newHth) {
    const delta = newHth - this.__inner_current_health

    if (delta === 0) return
    if (delta < 0) {
      const actualDmg = -Math.round(delta * (this.beImprecated ? this.imprecatedRatio : 1))
      this.lastAbsDmg = Math.min(actualDmg, this.__inner_current_health)
      // console.log(`ih ${this.__inner_current_health}, actual ${actualDmg}, absolute ${this.lastAbsDmg}`)
      // this.healthChangeHintQueue.push(this.lastAbsDmg)

      this.__inner_current_health -= this.lastAbsDmg

      // console.log(`ih ${this.__inner_current_health}`)

      if (this.__inner_current_health <= 0) {
        this.isDead = true
      }
    }
    else {
      this.__inner_current_health = Math.min(newHth, this.maxHealth)
    }
  }

  get healthBarHeight() {
    return 2
  }

  get healthBarWidth() {
    return this.radius * 2
  }

  get healthBarBorderStyle() {
    return 'rgba(45,244,34,1)'
  }

  get healthBarFillStyle() {
    return 'rgba(245,44,34,1)'
  }

  /**
   * 是否正在承受控制类限制效果影响
   */
  get isTrapped() {
    return this.beTransformed || this.beImprisoned || this.beFrozen || this.beConfused || this.speedRatio < 1
  }

  /** @type {string[]} */
  get descriptionChuned() {
    if (!this.description) return []
    return this.description.split('\n')
  }

  /**
   * @type {[string, string][]}
   */
  get informationSeq() {
    const base = [
      [this.name, ''],
      ['类型', this.type],
      ['生命值', Tools.chineseFormatter(Math.round(this.__inner_current_health), 3) + '/' + Tools.chineseFormatter(Math.round(this.maxHealth), 3)],
      ['移动速度', Tools.roundWithFixed(this.speedValue * 60, 1)],
      ['护甲', Tools.formatterUs.format(Math.round(this.inner_armor)) + '（减伤 ' + Tools.roundWithFixed(this.armorResistance * 100, 1) + '%）'],
    ]

    return base
  }

  /**
   * - 制造特殊效果。此函数每Tick调用一次
   * - 需要时override
   * @virtual
   * @param {TowerBase[]} towers
   * @param {MonsterBase[]} monsters
   */
  makeEffect(towers, monsters) {}

  runDebuffs() {
    if (this.shockDurationTick > 0) {
      this.beShocked = true
      if (--this.shockDurationTick === 0) this.beShocked = false
    }

    if (this.transformDurationTick > 0) {
      this.beTransformed = true
      if (--this.transformDurationTick === 0) this.beTransformed = false
    }

    if (this.imprisonDurationTick > 0) {
      this.beImprisoned = true
      if (--this.imprisonDurationTick === 0) this.beImprisoned = false
    }

    if (this.freezeDurationTick > 0) {
      this.beFrozen = true
      if (--this.freezeDurationTick === 0) this.beFrozen = false
    }
  }

  registerShock(durationTick, chargeAmount, source, leakChance) {
    if (durationTick > this.shockDurationTick) {
      this.shockDurationTick = Math.round(durationTick)
      this.shockChargeAmount = chargeAmount
      this.shockSource = source
      this.shockLeakChance = leakChance
    }
  }

  registerTransform(durationTick) {
    if (durationTick > this.transformDurationTick) {
      this.transformDurationTick = Math.round(durationTick)
    }
  }

  registerImprison(durationTick) {
    if (durationTick > this.imprisonDurationTick) {
      this.imprisonDurationTick = Math.round(durationTick)
    }
  }

  registerFreeze(durationTick) {
    if (durationTick > this.freezeDurationTick) {
      this.freezeDurationTick = Math.round(durationTick)
    }
  }

  // registerConfuse(durationTick) {

  // }

  /**
   * @param {MonsterBase[]} monsters
   */
  runShock(monsters) {
    if (Math.random() < (1 - this.shockLeakChance)) return
    if (monsters.length < 2) return
    // 距离最近的友方单位
    const aim = _.minBy(monsters, mst => {
      if (mst === this) return Infinity
      const dist = Position.distancePow2(mst.position, this.position)
      // if (dist > this.radius * this.radius * 25) return Infinity
      return dist
    })
    aim.health -= this.shockChargeAmount * (1 - aim.armorResistance)
    this.health -= this.shockChargeAmount * (1 - this.armorResistance)
    this.shockSource.recordDamage(aim)
    this.shockSource.recordDamage(this)

    this.shockSource.monsterShockingRenderingQueue.push({
      time: TeslaTower.shockRenderFrames * 2,
      args: [
        this.position.x,
        this.position.y,
        aim.position.x,
        aim.position.y,
        Position.distance(aim.position, this.position) / 2
      ]
    })
  }

  /**
   * @param {{x:number,y:number}[]} path
   * @param {(changing: number) => void} lifeTokenEmitter
   */
  run(path, lifeTokenEmitter, towers, monsters) {

    this.runDebuffs()
    if (this.beShocked) this.runShock(monsters)

    if (this.beImprisoned || this.beFrozen) return // 被禁锢、跳过
    if (path.length === 0) { // 完成任务，造成伤害，杀死自己
      lifeTokenEmitter(-this.damage)
      this.isDead = true
    }
    else {
      // console.log('move to', path[0].x, path[0].y)
      // console.log('path.length', path.length)
      this.position.moveTo(path[0], this.speedValue)

      this.makeEffect(towers, monsters)
    }
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  renderHealthChange(context) {
    while(this.healthChangeHintQueue.length > 0) {
      context.fillText('- ' + this.healthChangeHintQueue.shift(), this.position.x + this.radius + 2, this.position.y + this.inscribedSquareSideLength / 1.5)
    }
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  renderHealthBar(context) {
    if (this.health <= 0 || this.health / this.maxHealth > 1) return

    const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius

    context.strokeStyle = this.healthBarBorderStyle
    context.strokeRect(
      this.position.x - this.radius - xaxisOffset,
      this.position.y + this.inscribedSquareSideLength / 1.5,
      this.healthBarWidth,
      this.healthBarHeight
    )

    context.fillStyle = this.healthBarFillStyle
    context.fillRect(
      this.position.x - this.radius - xaxisOffset,
      this.position.y + this.inscribedSquareSideLength / 1.5,
      this.healthBarWidth * this.health / this.maxHealth,
      this.healthBarHeight
    )
  }

  /** @param {CanvasRenderingContext2D} context */
  renderLevel(context) {
    
    context.fillStyle = context.manager.towerLevelTextStyle
    context.fillText('lv ' + this.__inner_level, this.position.x + this.radius * 0.78, this.position.y - this.radius * 0.78)

    // --- debug ---
    // context.fillText(this.position + '', this.position.x + this.radius * 0.78, this.position.y - this.radius * 1.18)
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {ImageManger} imgCtl
   */
  renderDebuffs(context, imgCtl) {
    const dSize = 10

    const debuffs = []
    if (this.bePoisoned) {
      debuffs.push(imgCtl.getImage('buff_poison'))
    }
    if (this.beBloodied) {
      debuffs.push(imgCtl.getImage('buff_bloody'))
    }
    if (this.beImprecated) {
      debuffs.push(imgCtl.getImage('buff_imprecate'))
    }
    if (this.beBurned) {
      debuffs.push(imgCtl.getImage('buff_burn'))
    }
    if (this.beOnLightEcho.length > 0) {
      debuffs.push(imgCtl.getImage('buff_light_echo'))
    }
    if (this.beImprisoned) {
      debuffs.push(imgCtl.getImage('buff_imprison'))
    }
    if (this.beFrozen) {
      debuffs.push(imgCtl.getImage('buff_freeze'))
    }
    if (this.beShocked) {
      debuffs.push(imgCtl.getImage('buff_shock'))
    }
    if (this.beTransformed) {
      debuffs.push(imgCtl.getImage('buff_transform'))
    }
    debuffs.forEach((dbf, idx) => {
      // if (dbf instanceof Promise) throw new TypeError('ImageBitMap is still a Pormise while rendering debuffs.')
      const x = this.position.x - this.radius + dSize * idx
      const y = this.position.y - this.radius - dSize
      
      context.drawImage(dbf, x, y, dSize - 1, dSize - 1)
    })
  }

  renderStatusBoard() {
    TowerBase.prototype.renderStatusBoard.call(this, ...arguments, 180)
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {ImageManger} imgCtl
   */
  
  render(context, imgCtl) {
    const ftmp = context.font
    context.font = '6px TimesNewRoman'

    super.render(context)
    this.renderHealthBar(context)
    // this.renderHealthChange(context)
    this.renderLevel(context)
    this.renderDebuffs(context, imgCtl)

    context.font = ftmp
  }
}

class BulletBase extends ItemBase {

  /** @param {MonsterBase} target */
  constructor(position, radius, borderWidth, borderStyle, image, atk, speed, target) {
    super(position, radius, borderWidth, borderStyle, image)

    this.Atk = atk
    this.speed = speed
    this.target = target

    this.fulfilled = false
  }

  setDamageEmitter(emitter) {
    /**
     * @type {(mst: MonsterBase) => void}
     */
    this.emitter = emitter
  }

  get isReaching() {
    return Position.distancePow2(this.position, this.target.position) < Math.pow(this.target.radius + this.radius, 2)
  }

  run(monsters) {
    this.position.moveTo(this.target.position, this.speed)

    if (this.target.isDead) {
      this.fulfilled = true
      this.target = null
    }
    else if (this.isReaching) {
      
      this.hit(this.target, 1, monsters)
      this.fulfilled = true
      this.target = null
    }
    else if (this.position.outOfBoundary(Position.O, Game.callBoundaryPosition(), 50)) {
      console.log('a bullet has run out of the bound, and will be swipe by system.')
      console.log(this)
      this.fulfilled = true
      this.target = null
    }
  }

  /**
   * @param {MonsterBase} monster
   * @param {number} magnification 放大系数
   */
  hit(monster, magnification = 1) {
    // console.log(...arguments)
    monster.health -= this.Atk * magnification * (1 - monster.armorResistance)
    this.emitter(monster)
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  renderImage(context) {
    const transFormed = this.rotateForward(context, this.target.position)

    context.drawImage(
      
      this.image,
      0,
      0,
      
      this.image.width,
      
      this.image.height,
      0 - super.inscribedSquareSideLength * 0.5,
      0 - super.inscribedSquareSideLength * 0.5,
      super.inscribedSquareSideLength,
      super.inscribedSquareSideLength
    )

    transFormed.restore()
  }
}

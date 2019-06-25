/// <reference path="./motion.ts" />
/// <reference path="./legendary-gem.ts" />

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

type efx = (x: number) => number

interface PlainObject {
  [s: string]: number
}

type BorderPosition = 'tr' | 'tl' | 'br' | 'bl'

type BorderRadius = {
  [x in BorderPosition]: number
}

type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends (infer U)[] ? RecursivePartial<U>[] :
  T[P] extends object ? RecursivePartial<T[P]> :
  T[P]
}

class Tools {

  static Dom = class _Dom {

    static _cache = new Map<string, Node | Node[]>()

    static _instance = new Map<string, number>()

    static __installOptionOnNode(node: Node, option: Node | {}) {
      _.forOwn(option, (v, k) => {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'function') {
          // @ts-ignore
          node[k] = v
        }
        else if (typeof v === 'object') {
          _.forOwn(v, (subv, subk) => {
            // @ts-ignore
            node[k][subk] = subv
          })
        }
      })
      return node
    }

    static genetateDiv(node: Node, option?: RecursivePartial<HTMLDivElement> | {}) {
      option = option || {}
      const div = document.createElement('div')
      this.__installOptionOnNode(div, option)
      node.appendChild(div)
      return div
    }

    static generateImg(node: Node, src: string, option?: RecursivePartial<HTMLImageElement> | {}) {
      option = option || {}
      const img = document.createElement('img')
      img.src = src
      this.__installOptionOnNode(img, option)
      node.appendChild(img)
      return img
    }

    static generateTwoCol(node: Node, leftOpt?: RecursivePartial<HTMLDivElement> | {}, rightOpt?: RecursivePartial<HTMLDivElement> | {}, leftChildren?: Node[], rightChildren?: Node[]): [HTMLDivElement, HTMLDivElement] {
      leftOpt = leftOpt || {}
      rightOpt = rightOpt || {}
      leftChildren = leftChildren || []
      rightChildren = rightChildren || []

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

    static generateRow(node: Node, className?: string | null, option?: RecursivePartial<HTMLDivElement> | {}, children?: Node[]) {
      children = children || []
      option = option || {}

      const row = document.createElement('div')
      row.className = className || 'row'
      option = option || {}
      this.__installOptionOnNode(row, option)
      children.forEach(child => row.appendChild(child))

      node.appendChild(row)

      return row
    }

    static removeAllChildren(node: Node) {
      while (node.hasChildNodes()) {
        node.removeChild(node.lastChild)
      }
    }

    static removeNodeTextAndStyle(node: HTMLElement, className = 'row') {
      if (node.style.color) node.style.color = ''
      if (node.style.marginBottom) node.style.marginBottom = ''
      if (node.textContent) node.textContent = ''
      if (node.className != className) node.className = className
    }

    static bindLongPressEventHelper(uniqueId: string, node: HTMLButtonElement, onPressFx: CallableFunction, onPressFxCallDelay: number, onPressFxCallInterval: number, accDelay: number, accInterval: number) {

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

  static Media = class _Media {}

  static ObjectFx = class _ObjectFx {

    /**
     * - 为源对象添加属性
     * - 此属性不可覆写，不可删除
     */
    static addFinalProperty<T, K extends keyof T>(Source: T, Key: K, Value: T[K]): T {
      return Object.defineProperty(Source, Key, {
        configurable: false,
        enumerable: true,
        writable: true,
        value: Value
      })
    }

    /**
     * - 为源对象添加属性
     * - 此属性不可覆写，不可删除，不可修改
     */
    static addFinalReadonlyProperty<T, K extends keyof T>(Source: T, Key: K, Value: T[K]): T {
      return Object.defineProperty(Source, Key, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: Value
      })
    }

    /**
     * - 为源对象添加Getter属性
     * - 此属性不可覆写，不可删除，不可修改
     */
    static addFinalGetterProperty<T, K extends keyof T>(Source: T, Key: K, Getter: () => T[K]): T {
      return Object.defineProperty(Source, Key, {
        configurable: false,
        enumerable: true,
        get: Getter
      })
    }
  }

  static formatterUs = new Intl.NumberFormat('en-US')
  static formatterCh = new Intl.NumberFormat('zh-u-nu-hanidec')

  static britishFormatter(num: number, precise = 1) {
    const thisAbs = Math.abs(num)
    if (thisAbs < 1e3) {
      return this.roundWithFixed(num, precise) + ''
    }
    else if (thisAbs < 1e6) {
      return this.roundWithFixed(num / 1e3, precise) + ' K'
    }
    else if (thisAbs < 1e9) {
      return this.roundWithFixed(num / 1e6, precise) + ' M'
    }
    else if (thisAbs < 1e12) {
      return this.roundWithFixed(num / 1e9, precise) + ' B'
    }
    else {
      return Tools.formatterUs.format(this.roundWithFixed(num / 1e12, precise)) + ' T'
    }
  }

  static chineseFormatter(num: number, precise = 3, block = '') {
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
   * - 将新值推入类型数组的尾部，如已满会抛弃最头部的一个值
   * - 返回此数组的实际长度
   * - 此方法认为所有连续 0 值都来自初始化
   */
  static typedArrayPush(tArr: TypedArray, newValue: number) {
    const zeroIndex = tArr.indexOf(0)
    const actualLength = zeroIndex === -1 ? tArr.length : zeroIndex + 1

    if (zeroIndex === -1) {
      tArr.set(tArr.subarray(1))
      tArr.set([newValue], tArr.length - 1)
    }
    else {
      tArr.set([newValue], zeroIndex)
    }
    return actualLength
  }

  static roundWithFixed(num: number, fractionDigits: number) {
    const t = 10 ** fractionDigits
    return Math.round(num * t) / t
  }

  /**
   * - 生成指定位数随机字符串
   */
  static randomStr(bits: number) {
    return new Array(bits).fill(1).map(() => ((Math.random() * 16 | 0) & 0xf).toString(16)).join('')
  }

  /**
   * - 随机正负号
   */
  static randomSig() {
    return Math.random() < 0.5 ? 1 : -1
  }

  static isNumberSafe(numberLike: number | string) {
    return numberLike !== '' && numberLike !== ' ' && !isNaN(<number>numberLike)
  }

  /**
   * - 绘制扇形
   */
  static renderSector(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle1: number, angle2: number, anticlock: boolean) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, r, angle1, angle2, anticlock)
    ctx.closePath()
    ctx.restore()
    return ctx
  }

  /**
   * - 绘制带圆角的矩形
   */
  static renderRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: BorderRadius, fill: boolean = false, stroke: boolean = true) {

    (['tr', 'tl', 'br', 'bl'] as BorderPosition[]).forEach((key) => {
      radius[key] = radius[key] || 5
    })

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

  static renderStatistic(ctx: CanvasRenderingContext2D, dataArr: TypedArray, positionTL: Position, width: number, height: number, color?: string) {
    color = color || '#67C23A'
    ctx.fillStyle = color

    const maxV = 50
    const horizonSpan = width / dataArr.length
    const drawHeight = height - 2

    if (!Reflect.get(this.renderStatistic, 'onceWork')) {
      console.log('called')

      ctx.save()
      ctx.textBaseline = 'middle'
      ctx.font = '8px SourceCodePro'

      ctx.fillStyle = 'rgb(255,0,0)'
      ctx.fillRect(positionTL.x + width, positionTL.y - 2, 4, 1)
      ctx.fillText(maxV + ' ms', positionTL.x + width + 6, positionTL.y)

      ctx.fillStyle = 'rgb(1,251,124)'
      ctx.fillRect(positionTL.x + width, positionTL.y + drawHeight / 3 * 2 - 2, 4, 1)
      ctx.fillText('16.67 ms', positionTL.x + width + 6, positionTL.y + drawHeight / 3 * 2)

      ctx.fillStyle = 'rgb(0,0,0)'
      ctx.fillRect(positionTL.x + width, positionTL.y + drawHeight - 2, 4, 1)
      ctx.fillText('0 ms', positionTL.x + width + 6, positionTL.y + drawHeight)
      ctx.restore()

      Reflect.set(this.renderStatistic, 'onceWork', true)
    }

    ctx.clearRect(positionTL.x, positionTL.y, width, drawHeight)
    dataArr.forEach((v: number, i: number) => {
      const h = Math.round(drawHeight * v / maxV)
      if (h === 0) return
      const x = Math.round(positionTL.x + i * horizonSpan)
      const y = Math.round(positionTL.y + drawHeight * (1 - v / maxV))
      // console.log(x, y, h)
      ctx.fillRect(x, y, 1, h)
    })
  }

  /**
   * @reference https://github.com/gdsmith/jquery.easing/blob/master/jquery.easing.js
   */
  static EaseFx = class _Ease {
    static linear = (x: number) => x
    static easeInQuad = (x: number) => x * x
    static easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x)
    static easeInOutQuad = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
    static easeInCubic = (x: number) => x * x * x
    static easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
    static easeInOutCubic = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
    static easeInQuart = (x: number) => x * x * x * x
    static easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4)
    static easeInOutQuart = (x: number) => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
    static easeInQuint = (x: number) => x * x * x * x * x
    static easeOutQuint = (x: number) => 1 - Math.pow(1 - x, 5)
    static easeInSine = (x: number) => 1 - Math.cos(x * Math.PI / 2)
    static easeOutSine = (x: number) => Math.sin(x * Math.PI / 2)
    static easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2
    static easeInExpo = (x: number) => x === 0 ? 0 : Math.pow(2, 10 * x - 10)
    static easeOutExpo = (x: number) => x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
    static easeInCirc = (x: number) => 1 - Math.sqrt(1 - Math.pow(x, 2))
    static easeOutCirc = (x: number) => Math.sqrt(1 - Math.pow(x - 1, 2))
    static easeInOutCirc = (x: number) => x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
  }

  /**
   * - 返回一个比较某个属性的比较函数，通常用于作为Array.sort()的参数，如对数组A的b属性排序：A.sort(compareProperties('b'))
   */
  static compareProperties(properties: string, cFx?: (a: number, b: number) => number, ascend?: boolean) {
    cFx = cFx || function (a, b) { return a - b }
    ascend = ascend || true
    return (a: any, b: any) => cFx(a[properties], b[properties]) * (ascend ? 1 : -1)
  }

  static MathFx = class _Math {
    /**
     * 双曲函数
     */
    static curveFx = (a: number, b: number, phi = 0) => (x: number) => a + b / (x + phi)

    /**
     * 自然对数函数
     */
    static naturalLogFx = (a: number, b: number, c = 1) => (x: number) => a + b * Math.log(x + c)

    /**
     * 指数函数
     */
    static exponentialFx = (a: number, b: number, phi = 0) => (x: number) => a * Math.pow(Math.E, b * (x + phi))

    /**
     * 幂函数
     */
    static powerFx = (a: number, b: number, phi = 0) => (x: number) => a * Math.pow(x + phi, b)

    /**
     * S-曲线函数
     */
    static sCurveFx = (a: number, b: number, phi = 0) => (x: number) => 1 / (a + b * Math.pow(Math.E, -(x + phi)))
  }

  static installDot(target: MonsterBase, dotDebuffName: keyof MonsterBase, duration: number, interval: number, singleAttack: number, isIgnoreArmor: boolean, damageEmitter: (mst: MonsterBase) => void) {
    if (typeof target[dotDebuffName] !== 'boolean') {
      console.log(target)
      throw new Error('target has no debuff mark as name ' + dotDebuffName)
    }
    if (target[dotDebuffName] || target.isDead) {
      return
    }
    if (singleAttack === 0 || duration === 0) {
      return
    }
    else {
      let dotCount = 0;
      // 目标标记debuff
      (target[dotDebuffName] as boolean) = true
      const itv = setInterval(() => {
        if (++dotCount > duration / interval) {
          // 效果结束、移除状态、结束计时器
          (target[dotDebuffName] as boolean) = false
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

  static installDotDuplicated(target: MonsterBase, dotDebuffName: keyof MonsterBase, duration: number, interval: number, singleAttack: number, isIgnoreArmor: boolean, damageEmitter: (mst: MonsterBase) => void) {
    if (!Array.isArray(target[dotDebuffName])) {
      console.log(target)
      throw new Error('target has no debuff mark as name ' + dotDebuffName)
    }
    if (target.isDead) {
      return
    }
    if (singleAttack === 0 || duration === 0) {
      return
    }
    else {
      let dotCount = 0;
      const thisId = this.randomStr(8);

      (target[dotDebuffName] as string[]).push(thisId)

      // console.log(singleAttack, Math.ceil(duration / interval))
      const itv = setInterval(() => {
        if (++dotCount > duration / interval) {
          // 效果结束、结束计时器
          (target[dotDebuffName] as string[]) = (target[dotDebuffName] as string[]).filter(d => d !== thisId)
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

class ButtonOnDom {

  public ele: HTMLButtonElement

  constructor(domOptions: RecursivePartial<HTMLButtonElement>, hookOnToDom = true) {

    this.ele = document.createElement('button')

    if (hookOnToDom) document.body.appendChild(this.ele)

    Tools.Dom.__installOptionOnNode(this.ele, domOptions)
  }

  onMouseclick() {
    this.ele.click()
  }
}

type IBase = new (...args: any[]) => Base

/**
 * 所有[物体]的基类
 */
abstract class Base {

  static __id = 0

  public readonly id: number

  constructor() {
    Tools.ObjectFx.addFinalReadonlyProperty(this, 'id', Base.__id++)
  }
}

/**
 * 所有[可用左上和右下两个点描述物体]的基类
 */
abstract class RectangleBase extends Base {

  public cornerTL: Position
  public cornerBR: Position
  public width: number
  public height: number
  public borderWidth: number
  public borderStyle: string
  public fillStyle: string
  public borderRadius: BorderRadius

  constructor(positionTL: Position, positionBR: Position, bw: number, bs: string, bf: string, br: BorderRadius) {
    super()

    this.cornerTL = positionTL

    this.cornerBR = positionBR

    this.width = this.cornerBR.x - this.cornerTL.x
    this.height = this.cornerBR.y - this.cornerTL.y

    this.borderWidth = bw
    this.borderStyle = bs

    this.fillStyle = bf

    this.borderRadius = br
  }

  renderBorder(context: CanvasRenderingContext2D) {
    context.strokeStyle = this.borderStyle
    Tools.renderRoundRect(context, this.cornerTL.x, this.cornerTL.y, this.width, this.height, this.borderRadius, false, true)
  }

  renderInside(context: CanvasRenderingContext2D) {
    context.fillStyle = this.fillStyle
    Tools.renderRoundRect(context, this.cornerTL.x, this.cornerTL.y, this.width, this.height, this.borderRadius, true, false)
  }
}

/**
 * 所有[可用中心点和半径描述物体]的基类
 */
abstract class CircleBase extends Base {

  /**
   * - 物体的位置，不应在任何时候替换实例的 { position }
   * - 如果需要改变位置，使用mutable方法
   */
  public readonly position: Position
  public radius: number
  public borderWidth: number
  public borderStyle: string
  /**
   * @final
   * - Circle的内切正方形边长
   */
  public readonly inscribedSquareSideLength: number

  constructor(p: Position, r: number, bw: number, bs: string) {
    super()

    Tools.ObjectFx.addFinalReadonlyProperty(this, 'position', p)

    this.radius = r

    this.borderWidth = bw
    this.borderStyle = bs

    Tools.ObjectFx.addFinalGetterProperty(this, 'inscribedSquareSideLength', () => 2 * this.radius / Math.SQRT2)
  }

  renderBorder(context: CanvasRenderingContext2D) {
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

type IItemBase = new (...args: any[]) => ItemBase

/**
 * 所有[单位]的基类
 */
abstract class ItemBase extends CircleBase {

  /**
   * - Item的图形描述符，可以是位图、位图的Promise、动画
   * - 如果为 null, 则必须具备 fill
   */
  public image: ImageBitmap | AnimationSprite
  /**
   * Item的填充描述符
   */
  public fill: string
  public readonly intervalTimers: number[] = []
  public readonly timeoutTimers: number[] = []
  public controlable: boolean = false

  constructor(position: Position, radius: number, borderWidth: number, borderStyle: string, image: string | ImageBitmap | AnimationSprite) {
    super(position, radius, borderWidth, borderStyle)

    this.image = null

    if (typeof image === 'string') {
      this.fill = image
    }
    else {
      this.image = image
    }
  }

  renderSpriteFrame(context: CanvasRenderingContext2D, x: number, y: number) {
    if (this.image instanceof AnimationSprite) {
      this.image.renderOneFrame(context, new Position(x, y), this.inscribedSquareSideLength, this.inscribedSquareSideLength, 0, true, true, false)
    }
  }

  renderImage(context: CanvasRenderingContext2D) {

    const x = this.position.x - this.inscribedSquareSideLength * 0.5
    const y = this.position.y - this.inscribedSquareSideLength * 0.5

    if (this.image instanceof ImageBitmap) {
      context.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        x,
        y,
        this.inscribedSquareSideLength,
        this.inscribedSquareSideLength
      )
    }
    else if (this.image instanceof AnimationSprite) {
      this.renderSpriteFrame(context, x, y)
    }
  }

  renderFilled(context: CanvasRenderingContext2D) {

    context.fillStyle = this.fill

    if (this.radius > 1) {
      context.beginPath()
      context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true)
      context.closePath()
      context.fill()
    }
    // 半径<=1, 回退为矩形
    else {
      context.fillRect(Math.floor(this.position.x), Math.floor(this.position.y), 1, 1)
    }
  }

  render(context: CanvasRenderingContext2D, _imgCtrl?: ImageManger) {
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
   */
  rotateForward(context: CanvasRenderingContext2D, targetPos: Position) {

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
    this.intervalTimers.forEach(t => clearInterval(t))
    this.timeoutTimers.forEach(t => clearTimeout(t))
  }
}

type ITowerBase = new (...args: any[]) => TowerBase

abstract class TowerBase extends ItemBase {

  static informationDesc = new Map([
    ['等级', '鼠标单击图标或按 [C] 键来消耗金币升级，等级影响很多属性，到达某个等级可以晋升'],
    ['下一级', '升级到下一级需要的金币数量'],
    ['售价', '出售此塔可以返还的金币数量'],
    ['伤害', '此塔的基础攻击力'],
    ['攻击速度', '此塔的每秒攻击次数'],
    ['射程', '此塔的索敌距离，单位是像素'],
    ['弹药储备', '此塔每次攻击时发射的弹药数量'],
    ['DPS', '估计的每秒伤害']
  ])

  static Gems: { name: string, ctor: IGemBase & typeof GemBase }[] = [
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
      ctor: GemOfMysterious,
      name: 'GemOfMysterious'
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
    },
    {
      ctor: GemOfAnger,
      name: 'GemOfAnger'
    }
  ]

  static deniedGems: string[] = []

  static GemNameToGemCtor(gn: string): IGemBase {
    return this.Gems.find(g => g.name === gn).ctor
  }

  static get GemsToOptionsInnerHtml() {
    return this.Gems
      .map((gemCtor, idx) => {
        return `<option value="${gemCtor.name}"${idx === 0 ? ' selected' : ''}${this.deniedGems.includes(gemCtor.name) ? ' disabled' : ''}>${gemCtor.ctor.gemName}${this.deniedGems.includes(gemCtor.name) ? ' - 不能装备到此塔' : ''}</option>`
      })
      .join('')
  }

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
   */
  static damageToPoint(damage: number) {
    return Math.round(damage / 1000)
  }

  protected readonly bornStamp: number
  public readonly bulletCtl = new BulletManager()
  public bulletImage: ImageBitmap = null
  public bulletCtorName: string = ''
  public level: number = 0
  public readonly price: ArrayLike<number>
  protected rank: number = 0
  public levelAtkFx: (lvl: number) => number
  public levelHstFx: (lvl: number) => number
  public levelSlcFx: (lvl: number) => number
  public levelRngFx: (lvl: number) => number
  public armorPenetratingRate: number = 0
  public target: MonsterBase = null
  public lastShootTime: number
  public __kill_count: number = 0
  public __total_damage: number = 0
  public gem: GemBase = null
  public canInsertGem: boolean = true
  public __hst_ps_ratio: number = 1
  public __atk_ratio: number = 1
  public __kill_extra_gold: number = 0
  public __kill_extra_point: number = 0
  public __on_boss_atk_ratio: number = 1
  public __on_trapped_atk_ratio: number = 1
  public __anger_gem_atk_ratio: number = 1
  public __max_rng_atk_ratio: number = 1
  public __min_rng_atk_ratio: number = 1
  public __each_monster_damage_ratio: Map<number, number> = new Map()
  public description: string = null
  public name: string = null
  public isSold: boolean = false

  public __grid_ix: number
  public __grid_iy: number

  constructor(position: Position, radius: number, borderWidth: number, borderStyle: string, image: string | ImageBitmap | AnimationSprite, price: ArrayLike<number>, levelAtkFx: (lvl: number) => number, levelHstFx: (lvl: number) => number, levelSlcFx: (lvl: number) => number, levelRngFx: (lvl: number) => number) {
    super(position, radius, borderWidth, borderStyle, image)

    // console.log(this)

    this.bornStamp = performance.now()

    this.price = price

    this.levelAtkFx = levelAtkFx
    this.levelHstFx = levelHstFx
    this.levelSlcFx = levelSlcFx
    this.levelRngFx = levelRngFx

    this.lastShootTime = this.bornStamp

    this.intervalTimers.push(setInterval(() => {
      // console.time('clean')
      const msts = Game.callMonsterList()
      Array.from(this.__each_monster_damage_ratio)
        .filter(([k]) => msts.every(mst => mst.id !== k))
        .forEach(([k]) => this.__each_monster_damage_ratio.delete(k))
      // console.timeEnd('clean')
    }, 60000))
  }

  get descriptionChuned() {
    if (!this.description) return []
    return this.description.split('\n')
  }

  get sellingPrice() {
    let s = 0
    for (let i = 0; i < this.level + 1; i++) {
      s += this.price[i]
    }
    if (this.gem) s += (this.gem.constructor as typeof GemBase).price

    return Math.ceil(s * 0.7)
  }

  /**
   * 攻击力
   */
  get Atk() {
    return this.levelAtkFx(this.level) * this.__atk_ratio * this.__anger_gem_atk_ratio
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
      ['攻击速度', '' + Tools.roundWithFixed(this.HstPS, 2)],
      ['射程', Tools.formatterUs.format(Math.round(this.Rng))],
      ['弹药储备', '' + Math.round(this.Slc)],
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
      ['击杀', '' + this.__kill_count],
      ['输出', Tools.chineseFormatter(this.__total_damage, 3)],
      ['每秒输出', this.ADPSH]
    ]
  }

  /**
   * - 判断[this.target]是否仍然非空
   * - 判断当前的敌人是否仍然在范围内
   * - 判断当前的敌人是否仍然存活
   */
  protected get isCurrentTargetAvailable() {
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
    return '' + (this.level + 1)
  }

  /**
   * - 对设计稿的距离值进行修正，得到正确的相对距离
   * @param r 基于设计稿的距离值 px
   */
  reviceRange(r: number) {
    return r * Game.callGridSideSize() / 39
  }

  /**
   * - 插入 Legendary Gem
   * @param gemCtorName
   */
  inlayGem(gemCtorName: string) {
    this.gem = new (TowerBase.GemNameToGemCtor(gemCtorName))()
    this.gem.initEffect(this)
  }

  /**
   * @final
   * @do_not_override
   */
  recordDamage({ lastAbsDmg, isDead, isBoss }: MonsterBase) {

    this.__total_damage += lastAbsDmg

    Game.updateGemPoint += TowerBase.damageToPoint(lastAbsDmg)

    if (isDead) {
      this.recordKill()
      Game.updateGemPoint += ((isBoss ? TowerBase.killBossPointEarnings : TowerBase.killNormalPointEarnings) + this.__kill_extra_point)

      if (this.gem) {
        this.gem.killHook(this, arguments[0])
      }
    }
  }

  /**
   * @final
   * @do_not_override
   * @do_not_call_outside
   */
  protected recordKill() {
    this.__kill_count++
    Game.callMoney()[1](this.__kill_extra_gold)
  }

  get exposedRecordKillFx() {
    return this.recordKill.bind(this)
  }

  /**
   * @final
   * @do_not_override
   */
  inRange(target: MonsterBase) {
    const t = this.Rng + target.radius
    return Position.distancePow2(target.position, this.position) < t * t
  }

  /**
   * - 在怪物中重选目标
   * - 在乱序的怪物中找到首个在攻击范围内的
   */
  reChooseTarget(targetList: MonsterBase[], _index?: number) {
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
   * @do_not_override
   */
  calculateDamageRatio(mst: MonsterBase) {
    const bossR = mst.isBoss ? this.__on_boss_atk_ratio : 1
    const particularR = this.__each_monster_damage_ratio.get(mst.id) || 1
    const trapR = mst.isTrapped ? this.__on_trapped_atk_ratio : 1
    const R = Position.distance(this.position, mst.position) / this.Rng
    const rangeR = this.__min_rng_atk_ratio * (1 - R) + this.__max_rng_atk_ratio * R

    // console.log(bossR, particularR, trapR, rangeR)
    return bossR * particularR * trapR * rangeR
  }

  produceBullet(_i: number, _monsters: MonsterBase[]) {
    const ratio = this.calculateDamageRatio(this.target)
    this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.target, this.bulletImage)
  }

  recordShootTime() {
    this.lastShootTime = performance.now()
  }

  run(monsters: MonsterBase[]) {
    if (this.canShoot) {
      if (!this.isCurrentTargetAvailable) {
        this.reChooseTarget(monsters)
      }
      if (this.target) {
        this.shoot(monsters)
      }
    }
  }

  shoot(monsters: MonsterBase[]) {
    this.gemAttackHook(monsters)

    for (let i = 0; i < this.Slc; i++) {

      this.produceBullet(i, monsters)

      this.gemHitHook(i, monsters)
    }
    this.recordShootTime()
  }

  /**
   * - 每次发射时触发
   */
  gemHitHook(_idx: number, msts: MonsterBase[]) {
    if (this.gem) {
      this.gem.hitHook(this, this.target, msts)
    }
  }

  /**
   * - 每次准备攻击时触发
   */
  gemAttackHook(msts: MonsterBase[]) {
    if (this.gem) {
      this.gem.attackHook(this, msts)
    }
  }

  /**
   * - 升级逻辑
   * - 子类重写时必须调用基类的levelUp
   * @must_call_base_method_in_override_method
   */
  levelUp(currentMoney: number) {
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

  renderRange(context: CanvasRenderingContext2D, style = 'rgba(177,188,45,.05)') {
    context.fillStyle = style
    context.beginPath()
    context.arc(this.position.x, this.position.y, this.Rng, 0, Math.PI * 2, true)
    context.closePath()
    context.fill()
  }

  renderLevel(context: WrappedCanvasRenderingContext2D) {
    const ftmp = context.font
    context.font = '6px TimesNewRoman'

    context.fillStyle = context.manager.towerLevelTextStyle
    context.fillText('lv ' + this.levelHuman, this.position.x + this.radius * .78, this.position.y - this.radius * .78)

    context.font = ftmp
  }

  renderRankStars(context: CanvasRenderingContext2D) {
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

  renderPreparationBar(context: CanvasRenderingContext2D) {
    if (this.canShoot) return
    context.fillStyle = 'rgba(25,25,25,.3)'
    Tools.renderSector(context, this.position.x, this.position.y, this.radius, 0, Math.PI * 2 * (1 - (performance.now() - this.lastShootTime) / this.Hst), false).fill()
  }

  render(context: CanvasRenderingContext2D) {
    super.render(context)
    this.renderLevel(context as WrappedCanvasRenderingContext2D)
    this.renderRankStars(context)
  }

  abstract rapidRender(ctxRapid: CanvasRenderingContext2D, monsters: MonsterBase[]): void

  /**
   * - position:
   * - 2 | 1
   * - --o--
   * - 3 | 4
   */
  renderStatusBoard(bx1: number, _bx2: number, by1: number, _by2: number, showGemPanel: boolean, showMoreDetail: boolean, specifedWidth?: number) {
    showGemPanel = showGemPanel && this.canInsertGem

    const red = '#F51818'
    const green = '#94C27E'

    // inner help functions
    const renderDataType_1 = (rootNode: Node, dataChunk: string[][], offset: number, showDesc: boolean) => {
      // debugger
      let jump = 0
      dataChunk.forEach((data, idx) => {
        const showD = showDesc && (this.constructor as typeof TowerBase).informationDesc.has(data[0])

        // if (showD) console.log(data[0], showD, 'index: ' + idx + offset + jump)

        const row = rootNode.childNodes.item(idx + offset + jump)
        Tools.Dom.removeNodeTextAndStyle(row as HTMLElement)
        if (!row.hasChildNodes()) {
          Tools.Dom.generateTwoCol(row)
        }
        else {
          Tools.Dom.removeNodeTextAndStyle(row.lastChild as HTMLElement)
          Tools.Dom.removeNodeTextAndStyle(row.firstChild as HTMLElement)
        }
        row.firstChild.textContent = data[0]
        row.lastChild.textContent = data[1]

        // @todo 售价 green red

        if (showD) {
          const rowD = rootNode.childNodes.item(idx + offset + jump + 1) as HTMLElement
          Tools.Dom.removeNodeTextAndStyle(rowD as HTMLElement)
          Tools.Dom.removeAllChildren(rowD)
          rowD.textContent = (this.constructor as typeof TowerBase).informationDesc.get(data[0])
          rowD.style.color = '#909399'
          rowD.style.marginBottom = '5px'
          jump++
        }

        if (data[0] === '售价' || data[0] === '类型') {
          (row.lastChild as HTMLElement).style.color = '#606266'
          renderDataType_dv(rootNode, idx + offset + jump + (showD ? 2 : 1))
          jump++
        }
        else if (data[0] === '下一级') {
          if (this.isMaxLevel) (row.lastChild as HTMLElement).style.color = '#DCDFE6'
          else (row.lastChild as HTMLElement).style.color = this.price[this.level + 1] < Game.callMoney()[0] ? green : red
        }
      })
    }
    const renderDataType_2 = (rootNode: Node, dataChunk: string[], offset: number) => {
      dataChunk.forEach((data, idx) => {
        const row = rootNode.childNodes.item(idx + offset) as HTMLElement
        Tools.Dom.removeNodeTextAndStyle(row)
        Tools.Dom.removeAllChildren(row)
        if (data.includes('+')) row.style.color = 'rgba(204,51,51,1)'
        else if (data.includes('-')) row.style.color = 'rgba(0,102,204,1)'
        else row.style.color = ''
        row.textContent = data
      })
    }
    const renderDataType_dv = (rootNode: Node, offset: number) => {
      const div = rootNode.childNodes.item(offset) as HTMLElement
      Tools.Dom.removeAllChildren(div)
      Tools.Dom.removeNodeTextAndStyle(div, 'division')
    }

    /// render start
    specifedWidth = specifedWidth || 150

    const blockElement = Game.callElement('status_block') as HTMLDivElement
    blockElement.style.display = 'block'
    blockElement.style.width = specifedWidth + 'px'
    blockElement.style.borderBottomLeftRadius = showGemPanel ? '0' : ''
    blockElement.style.borderBottomRightRadius = showGemPanel ? '0' : ''
    blockElement.style.borderBottom = showGemPanel ? '0' : ''

    const lineCount = this.informationSeq.length + this.descriptionChuned.length + this.exploitsSeq.length
    const moreDescLineCount = showMoreDetail ? this.informationSeq.filter(f => (this.constructor as typeof TowerBase).informationDesc.has(f[0])).length : 0
    const extraLineCount = 2 + 1 + moreDescLineCount /* inner_division_key.length */

    if (blockElement.childNodes.length > lineCount + extraLineCount) {
      blockElement.childNodes.forEach((child, index) => {
        if (index > lineCount - 1 + extraLineCount) {
          Tools.Dom.removeAllChildren(child)
          Tools.Dom.removeNodeTextAndStyle(child as HTMLElement)
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

      const gemElement = Game.callElement('gem_block') as HTMLDivElement

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
        select.size = TowerBase.Gems.length
        select.style.width = '100%'
        select.style.fontSize = '12px'
        select.onchange = () => {
          selected = select.value
          const ctor = TowerBase.GemNameToGemCtor(selected) as unknown as typeof GemBase
          
          rowDesc.textContent = ctor.stasisDescription;

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
        select.innerHTML = (this.constructor as typeof TowerBase).GemsToOptionsInnerHtml
        Tools.Dom.generateRow(gemElement, 'row_nh', { style: { margin: '0 0 8px 0' } }, [select])

        // const rowimg = Tools.Dom.generateRow(gemElement, null, { innerHTML: `<img src="${(eval(selected)).imgSrc}" class="lg_gem_img"></img>` })
        const rowimg = Tools.Dom.generateRow(gemElement) as HTMLDivElement & { firstChild: HTMLImageElement }

        const ctor = TowerBase.GemNameToGemCtor(selected) as unknown as typeof GemBase

        Tools.Dom.generateImg(rowimg, ctor.imgSrc, { className: 'lg_gem_img' })
        const rowPrice = Tools.Dom.generateRow(gemElement, null, { style: { marginBottom: '5px' } }, ctor.priceSpan) as HTMLDivElement & { lastChild: HTMLSpanElement }
        
        rowPrice.lastChild.style.color = ctor.price <= Game.callMoney()[0] ? green : red
        const rowDesc = Tools.Dom.generateRow(gemElement, null, {
          
          textContent: ctor.stasisDescription,
          style: {
            lineHeight: '1.2',
            margin: '0 0 8px 0'
          }
        })

        const btn = document.createElement('button')
        btn.type = 'button'
        btn.textContent = '确认'
        if (ctor.price > Game.callMoney()[0]) {
          btn.setAttribute('disabled', 'disabled')
        }
        btn.onclick = () => {
          const ct = TowerBase.GemNameToGemCtor(selected) as unknown as typeof GemBase
          const [money, emitter] = Game.callMoney()

          if (money > ct.price) {
            emitter(-ct.price)
            this.inlayGem(selected)
            //@ts-ignore
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
          //@ts-ignore
          this.renderStatusBoard(...arguments)
        }
        Tools.Dom.bindLongPressEventHelper(
          this.id + '',
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
    const gemElement = Game.callElement('gem_block') as HTMLDivElement
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

type IMonsterBase = new (...args: any[]) => MonsterBase

abstract class MonsterBase extends ItemBase {

  static informationDesc = new Map<string, string>()

  protected readonly __inner_level: number
  public readonly maxHealth: number
  protected __inner_current_health: number
  public readonly maxShield: number
  protected __inner_current_shield: number
  public inner_armor: number
  public readonly __base_speed: number
  public speedRatio: number = 1
  public readonly reward: number
  public readonly damage: number = 1
  // DOT
  // 负面效果的计算，移除由承受单位进行计算
  // 单位若受到前后两个束缚效果，前一个结束后会移除单位的束缚效果，导致后一个效果提前结束
  public bePoisoned: boolean = false
  public beBloodied: boolean = false
  public beBurned: boolean = false
  /**
   * - 一个dot id组成的数组
   */
  public beOnLightEcho: string[] = []
  /**
   * 电麻 微小机率向最靠近的单位放电
   */
  public beShocked: boolean = false
  public shockDurationTick: number = 0
  public shockChargeAmount: number = 0
  public shockLeakChance: number = 0
  public shockSource: TeslaTower = null
  public beTransformed: boolean = false
  public transformDurationTick: number = 0
  public beImprisoned: boolean = false
  public imprisonDurationTick: number = 0
  public beFrozen: boolean = false
  public freezeDurationTick: number = 0
  public beConfused: boolean = false
  public imprecatedRatio: { pow: number, durTick: number }[] = []
  public lastAbsDmg: number = 0
  public isBoss: boolean = false
  public isDead: boolean = false
  public name: string = null
  public description: string = null
  public exploitsSeq: string[][]
  public type: string = '普通怪物'

  constructor(position: Position, radius: number, borderWidth: number, borderStyle: string, image: string | ImageBitmap | AnimationSprite, level: number, levelRwdFx: (lvl: number) => number, levelSpdFx: (lvl: number) => number, levelHthFx: (lvl: number) => number, levelAmrFx: (lvl: number) => number, levelShdFx?: (lvl: number) => number) {
    super(position, radius, borderWidth, borderStyle, image)

    // console.log(this)

    this.__inner_level = level

    this.maxHealth = Math.round(levelHthFx(level))
    this.__inner_current_health = this.maxHealth

    this.maxShield = levelShdFx ? levelShdFx(level) : 0
    this.__inner_current_shield = this.maxShield

    this.inner_armor = levelAmrFx(level)

    this.__base_speed = levelSpdFx(level)

    this.reward = Math.round(levelRwdFx(level))

    // this.healthChangeHintQueue = []

    this.exploitsSeq = [
      ['赏金', Tools.chineseFormatter(this.reward, 0)]
    ]
  }

  /**
   * - 受诅咒
   */
  get beImprecated() {
    return this.imprecatedRatio.length > 0
  }

  get armorResistance() {
    return Tools.roundWithFixed(this.inner_armor / (100 + this.inner_armor), 3)
  }

  get speedValue() {
    if (this.beFrozen || this.beImprisoned) return 0
    if (this.beConfused) return this.__base_speed * -0.5
    return this.__base_speed * this.speedRatio
  }

  get health() {
    return this.__inner_current_health
  }

  get shield() {
    return this.__inner_current_shield
  }

  set health(newHth) {
    const delta = newHth - this.__inner_current_health

    if (delta === 0) return
    if (delta < 0) {
      const actualDmg = -Math.round(delta * this.imprecatedRatio.reduce((p, v) => p * v.pow, 1))
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

  get healthBarTextFontStyle() {
    return '8px TimesNewRoman'
  }

  get healthBarTextFillStyle() {
    return 'rgba(0,0,0,1)'
  }

  /**
   * - 是否正在承受控制类限制效果影响
   */
  get isTrapped() {
    return this.beTransformed || this.beImprisoned || this.beFrozen || this.beConfused || this.speedRatio < 1
  }

  get descriptionChuned() {
    if (!this.description) return []
    return this.description.split('\n')
  }

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

  get level() {
    return this.__inner_level
  }

  /**
   * - 制造特殊效果。此函数每Tick调用一次
   * - 需要时override
   */
  abstract makeEffect(towers: TowerBase[], monsters: MonsterBase[]): void

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

    this.imprecatedRatio = this.imprecatedRatio.filter(imp => --imp.durTick !== 0)
  }

  registerShock(durationTick: number, chargeAmount: number, source: TeslaTower, leakChance: number) {
    if (durationTick > this.shockDurationTick) {
      this.shockDurationTick = Math.round(durationTick)
      this.shockChargeAmount = chargeAmount
      this.shockSource = source
      this.shockLeakChance = leakChance
    }
  }

  registerTransform(durationTick: number) {
    if (durationTick > this.transformDurationTick) {
      this.transformDurationTick = Math.round(durationTick)
    }
  }

  registerImprison(durationTick: number) {
    if (durationTick > this.imprisonDurationTick) {
      this.imprisonDurationTick = Math.round(durationTick)
    }
  }

  registerFreeze(durationTick: number) {
    if (durationTick > this.freezeDurationTick) {
      this.freezeDurationTick = Math.round(durationTick)
    }
  }

  registerImprecate(durationTick: number, imprecationRatio: number) {
    this.imprecatedRatio.push({ pow: imprecationRatio, durTick: durationTick })
  }

  // registerConfuse(durationTick) {

  // }

  runShock(monsters: MonsterBase[]) {
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

  run(path: PositionLike[], lifeTokenEmitter: (changing: number) => void, towers: TowerBase[], monsters: MonsterBase[]) {

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

  abstract renderHealthChange(context: CanvasRenderingContext2D): void // {
    // while(this.healthChangeHintQueue.length > 0) {
    //   context.fillText('- ' + this.healthChangeHintQueue.shift(), this.position.x + this.radius + 2, this.position.y + this.inscribedSquareSideLength / 1.5)
    // }
  // }

  renderHealthBar(context: CanvasRenderingContext2D) {
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

  renderLevel(context: WrappedCanvasRenderingContext2D) {
    context.font = '6px TimesNewRoman'
    
    context.fillStyle = context.manager.towerLevelTextStyle
    context.fillText('lv ' + this.__inner_level, this.position.x + this.radius * 0.78, this.position.y - this.radius * 0.78)

    // --- debug ---
    // context.fillText(this.position + '', this.position.x + this.radius * 0.78, this.position.y - this.radius * 1.18)
  }

  renderDebuffs(context: CanvasRenderingContext2D, imgCtl: ImageManger) {
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

  renderStatusBoard(..._args: any[]) {
    //@ts-ignore
    TowerBase.prototype.renderStatusBoard.call(this, ...arguments, 180)
  }

  render(context: CanvasRenderingContext2D, imgCtl: ImageManger) {
    const ftmp = context.font

    super.render(context)
    this.renderHealthBar(context)
    // this.renderHealthChange(context)
    // this.renderLevel(context)
    this.renderDebuffs(context, imgCtl)

    context.font = ftmp
  }
}

type IBulletBase = new (...args: any) => BulletBase

abstract class BulletBase extends ItemBase {

  protected Atk: number
  protected speed: number
  public target: MonsterBase
  public fulfilled: boolean = false
  emitter: (mst: MonsterBase) => void

  constructor(position: Position, radius: number, borderWidth: number, borderStyle: string, image: string | ImageBitmap, atk: number, speed: number, target: MonsterBase) {
    super(position, radius, borderWidth, borderStyle, image)

    // console.log(this)
    this.Atk = atk
    this.speed = speed
    this.target = target
  }

  setDamageEmitter(emitter: (mst: MonsterBase) => void) {
    this.emitter = emitter
  }

  get isReaching() {
    return Position.distancePow2(this.position, this.target.position) < Math.pow(this.target.radius + this.radius, 2)
  }

  run(monsters: MonsterBase[]) {
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

  hit(monster: MonsterBase, magnification: number = 1, _msts?: MonsterBase[]) {
    // console.log(...arguments)
    monster.health -= this.Atk * magnification * (1 - monster.armorResistance)
    this.emitter(monster)
  }

  renderImage(context: CanvasRenderingContext2D) {
    if (this.image instanceof AnimationSprite) {
      return
    }

    const transFormed = this.rotateForward(context, this.target.position)

    context.drawImage(
      this.image,
      0,
      0,
      this.image.width,
      this.image.height,
      this.inscribedSquareSideLength * -0.5,
      this.inscribedSquareSideLength * -0.5,
      this.inscribedSquareSideLength,
      this.inscribedSquareSideLength
    )

    transFormed.restore()
  }
}

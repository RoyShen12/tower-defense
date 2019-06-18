class CanvasManager {
  constructor() {

    /** @type {(HTMLCanvasElement | OffscreenCanvas)[]} */
    this.canvasElements = []

    /** @type {Map<string, CanvasRenderingContext2D | OffscreenRenderingContext |　ImageBitmapRenderingContext>} */
    this.canvasContextMapping = new Map()

    /** @type {Map<string, OffscreenCanvas>} */
    this.offscreenCanvasMapping = new Map()

    return new Proxy(this, {
      get: function (target, key, recv) {
        if (typeof key === 'string' && key.indexOf('_get_') === 0) {
          return target.getContext(key.substring(5))
        } else {
          return Reflect.get(target, key, recv)
        }
      }
    })
  }

  getContext(id) {
    return this.canvasContextMapping.get(id)
  }

  /**
   * @param {string} id
   * @param {CSSStyleDeclaration | {}} style
   * @param {number} [height]
   * @param {number} [width]
   * @param {boolean} [offDocument] 指定创建挂载在dom的标准canvas还是脱离dom的离屏canvas
   * @param {(ele: HTMLCanvasElement) => void | null} [wiredEvent]
   * @param {string | null} [paintingOffScreenRenderingContextId] 仅对标准canvas生效，指定渲染绑定离屏canvas，如果指定则将会开启ImageBitmapRenderingContext而不是CanvasRenderingContext2D
   */
  createCanvasInstance(id, style = {}, height, width, offDocument, wiredEvent = null, paintingOffScreenRenderingContextId = null) {
    style = style || {}
    height = height || innerHeight
    width = width || innerWidth

    // 创建 离屏canvas元素
    // 离屏所以不考虑绑定事件和样式
    if (offDocument) {

      if ('OffscreenCanvas' in window) {
        // 此处使用了非常激进的 OffscreenCanvas + 2d-context 的API，仅支持 chrome >= 69
        const canvasOff = new OffscreenCanvas(width, height)
        const ctx = canvasOff.getContext('2d')

        this.canvasElements.push(canvasOff)
        this.canvasContextMapping.set(id, ctx)
        this.offscreenCanvasMapping.set(id, canvasOff)

        ctx.manager = this
        ctx.dom = canvasOff
        ctx.font = 'lighter 7px Game'

        return ctx
      }
      else {
        const canvasEle = document.createElement('canvas')

        canvasEle.width = width
        canvasEle.height = height
        canvasEle.id = id
        const ctx = canvasEle.getContext('2d')

        this.canvasElements.push(canvasEle)
        this.canvasContextMapping.set(id, ctx)
        this.offscreenCanvasMapping.set(id, canvasEle)

        ctx.manager = this
        ctx.dom = canvasEle
        ctx.font = 'lighter 7px Game'

        return ctx
      }
    }
    // 创建 标准canvas元素
    else {
      const canvasEle = document.createElement('canvas')

      canvasEle.width = width
      canvasEle.height = height
      canvasEle.id = id

      if (Object.prototype.toString.call(wiredEvent) === '[object Function]') {
        wiredEvent(canvasEle)
      }

      Object.assign(canvasEle.style, style)

      let ctx

      if (paintingOffScreenRenderingContextId) {
        if ('OffscreenCanvas' in window) {
          // 此处使用了非常激进的 ImageBitmapRenderingContext + transferToImageBitmap + transferFromImageBitmap 的API，仅支持 chrome >= 66, firefox >= 52
          ctx = canvasEle.getContext('bitmaprenderer')

          const osc = this.offscreenCanvasMapping.get(paintingOffScreenRenderingContextId)

          ctx._off_screen_paint = function () {
            // this.clearRect(0, 0, osc.width, osc.height)
            this.transferFromImageBitmap(osc.transferToImageBitmap())
          }
        }
        else {
          ctx = canvasEle.getContext('2d')
          const osc = this.offscreenCanvasMapping.get(paintingOffScreenRenderingContextId)
          ctx._off_screen_paint = function () {
            this.clearRect(0, 0, osc.width, osc.height)
            this.drawImage(osc, 0, 0)
          }
        }
      }
      else {
        ctx = canvasEle.getContext('2d')
        ctx.font = 'lighter 7px Game'
      }

      ctx.manager = this

      ctx.dom = canvasEle

      this.canvasElements.push(canvasEle)
      this.canvasContextMapping.set(id, ctx)

      document.body.appendChild(canvasEle)

      return ctx
    }
  }

  get towerLevelTextStyle() {
    return 'rgba(13,13,13,1)'
  }

  /**
   * @param {string | number} text
   * @param {CanvasRenderingContext2D} context
   * @param {Position} positionTL 文字的实际绘制位置
   * @param {Position} outerBoxPositionTL 文字的外边框，会被刷新的区域
   * @param {number} width 外边框宽度
   * @param {number} height 外边框高度
   * @param {string} [style]
   * @param {boolean} [fillOrStroke]
   * @param {string} [font]
   */
  refreshText(text, context, positionTL, outerBoxPositionTL, width, height, style, fillOrStroke = true, font) {
    context = context || this.getContext('bg')

    context.clearRect(outerBoxPositionTL.x, outerBoxPositionTL.y, width, height)

    if (window.__debug_show_refresh_rect) {
      context.save()
      context.lineWidth = 1
      context.strokeStyle = 'rgba(255,0,0,.5)'
      context.strokeRect(outerBoxPositionTL.x + 1, outerBoxPositionTL.y + 1, width - 2, height - 2)
      context.restore()
    }

    if (style) fillOrStroke ? context.fillStyle = style : context.strokeStyle = style
    if (font) context.font = font

    fillOrStroke ? context.fillText(text, positionTL.x, positionTL.y, width) : context.strokeText(text, positionTL.x, positionTL.y, width)
  }
}

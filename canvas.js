class CanvasManager {
  constructor() {
    /** @type {HTMLCanvasElement[]} */
    this.canvasElements = []
    /** @type {Map<string, CanvasRenderingContext2D>} */
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
   * @param {CSSStyleDeclaration} style
   * @param {number} height
   * @param {number} width
   * @param {boolean} offDocument 指定创建挂载在dom的标准canvas还是脱离dom的离屏canvas
   * @param {(ele: HTMLCanvasElement) => void | null} wiredEvent
   * @param {string | null} paintingOffScreenRenderingContextId 仅对标准canvas生效，指定渲染绑定离屏canvas
   */
  createCanvasInstance(id, style = {}, height, width, offDocument, wiredEvent = null, paintingOffScreenRenderingContextId = null) {
    style = style || {}
    height = height || innerHeight
    width = width || innerWidth

    // 创建 离屏canvas元素
    if (offDocument) {
      const canvasOff = new OffscreenCanvas(width, height)
      const ctx = canvasOff.getContext('2d')

      this.canvasElements.push(canvasOff)
      this.canvasContextMapping.set(id, ctx)
      this.offscreenCanvasMapping.set(id, canvasOff)

      ctx.manager = this
      ctx.dom = canvasOff

      ctx.font = 'lighter 7px TimesNewRoman'

      return ctx
    }
    // 创建 标准canvas元素
    else {
      const canvasEle = document.createElement('canvas')
      canvasEle.width = width
      canvasEle.height = height
      canvasEle.id = id
      Object.assign(canvasEle.style, style)

      const ctx = canvasEle.getContext('2d')

      this.canvasElements.push(canvasEle)
      this.canvasContextMapping.set(id, ctx)

      document.body.appendChild(canvasEle)

      ctx.manager = this
      ctx.dom = canvasEle

      ctx.font = 'lighter 7px TimesNewRoman'

      if (Object.prototype.toString.call(wiredEvent) === '[object Function]') {
        wiredEvent(canvasEle)
      }

      if (paintingOffScreenRenderingContextId) {
        const osc = this.offscreenCanvasMapping.get(paintingOffScreenRenderingContextId)
        ctx._off_screen_paint = function () {
          this.clearRect(0, 0, osc.width, osc.height)
          this.drawImage(osc, 0, 0)
        }
      }

      return ctx
    }
  }

  get towerLevelTextStyle() {
    return 'rgba(13,13,13,1)'
  }

  /**
   * @param {string | number} text
   * @param {CanvasRenderingContext2D} context
   * @param {Position} positionTL
   * @param {Position} outerBoxPositionTL
   * @param {number} width
   * @param {number} height
   * @param {string} [style]
   * @param {boolean} [fillOrStroke]
   * @param {string} [font]
   */
  refreshText(text, context, positionTL, outerBoxPositionTL, width, height, style, fillOrStroke = true, font) {
    context.clearRect(outerBoxPositionTL.x, outerBoxPositionTL.y, width, height)
    if (style) fillOrStroke ? context.fillStyle = style : context.strokeStyle = style
    if (font) context.font = font
    fillOrStroke ? context.fillText(text, positionTL.x, positionTL.y) : context.strokeText(text, positionTL.x, positionTL.y)
  }
}
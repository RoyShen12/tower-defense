class ButtonOnDom {

  /**
   * @param {HTMLButtonElement} domOptions
   */
  constructor(domOptions, hookOnToDom = true) {
    this.ele = document.createElement('button')

    if (hookOnToDom) document.body.appendChild(this.ele)

    Tools.Dom.__installOptionOnNode(this.ele, domOptions)
  }

  onMouseclick() {
    this.ele.click()
  }
}

class ButtonOnCanvas extends RectangleBase {

  /**
   * @param {string | ImageBitmap | Promise<ImageBitmap>} imageFill
   * @param {string | ImageBitmap | Promise<ImageBitmap>} imageFillHover
   * @param {string | ImageBitmap | Promise<ImageBitmap>} imageFillPress
   */
  constructor(id, positionTL, positionBR, bw, bs, br, text, textsize, fontName, textFs, imageFill, imageFillHover, imageFillPress) {
    super(positionTL, positionBR, bw, bs, null, br)

    this.id = id

    imageFillHover = imageFillHover || imageFill
    imageFillPress = imageFillPress || imageFill

    /**
     * - 0 普通
     * - 1 hover
     * - 2 按下
     * @type {0 | 1 | 2}
     */
    this.status = 0

    const p2d = new Path2D()
    p2d.rect(this.cornerTL.x, this.cornerTL.y, this.width, this.height)

    /**
     * 用于事件的检测区域
     * @type {Path2D}
     */
    this.pathForDetection = p2d

    /** @type {string} */
    this.text = text

    /** @type {number} */
    this.textSize = textsize

    this.fontName = fontName

    this.textFs = textFs

    /**
     * 图形描述符，可以是位图、位图的Promise、动画
     * @type {ImageBitmap | Promise<ImageBitmap> | AnimationSprite}
     */
    this.image = null

    /**
     * @type {ImageBitmap | Promise<ImageBitmap> | AnimationSprite}
     */
    this.imageHov = null

    /**
     * @type {ImageBitmap | Promise<ImageBitmap> | AnimationSprite}
     */
    this.imagePrs = null

    // -------------------------------------------------
    if (typeof imageFill === 'string') {
      /**
       * 填充描述符
       * @type {string}
       */
      this.fillStyle = imageFill
    }
    else if (imageFill instanceof ImageBitmap) {
      this.image = imageFill
    }
    else if (imageFill instanceof Promise) {
      imageFill.then(r => this.image = r)
    }
    // -------------------------------------------------
    if (typeof imageFillHover === 'string') {
      /**
       * @type {string}
       */
      this.fillStyleHov = imageFillHover
    }
    else if (imageFillHover instanceof ImageBitmap) {
      this.imageHov = imageFillHover
    }
    else if (imageFillHover instanceof Promise) {
      imageFillHover.then(r => this.imageHov = r)
    }
    // -------------------------------------------------
    if (typeof imageFillPress === 'string') {
      /**
       * @type {string}
       */
      this.fillStylePrs = imageFillPress
    }
    else if (imageFillPress instanceof ImageBitmap) {
      this.imagePrs = imageFillPress
    }
    else if (imageFillPress instanceof Promise) {
      imageFillPress.then(r => this.imagePrs = r)
    }
  }

  renderText(context) {
    context.save()
    context.font = `${this.textSize}px ${this.fontName}`

    const textMeasuredSize = context.measureText(this.text)

    const textX = this.cornerTL.x + this.width / 2 - textMeasuredSize.width / 2
    const textY = this.cornerTL.y + this.height / 2 + this.textSize / 2.5

    context.fillStyle = this.textFs
    context.fillText(this.text, textX, textY)

    context.restore()
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  render(context) {
    context.clearRect(this.cornerTL.x - 3, this.cornerTL.y - 3, this.width + 5, this.height + 5)

    if (this.fillStyle) {
      const tmp = this.fillStyle
      this.status === 0 ? void (0) : this.status === 1 ? this.fillStyle = this.fillStyleHov : this.fillStyle = this.fillStylePrs

      super.renderInside(context)

      this.fillStyle = tmp

      this.renderText(context)
    }
    else {
      // to do
    }

  }

  onMouseEnter() {
    this.status = 1
  }

  onMouseLeave() {
    this.status = 0
  }

  onMouseDown() {
    this.status = 2
  }

  onMouseUp() {
    this.status = 0
    if (this.onMouseclick) this.onMouseclick()
  }

  onMouseclick = null
}

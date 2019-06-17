function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

let CanvasManager =
/*#__PURE__*/
function () {
  function CanvasManager() {
    _classCallCheck(this, CanvasManager);

    /** @type {(HTMLCanvasElement | OffscreenCanvas)[]} */
    this.canvasElements = [];
    /** @type {Map<string, CanvasRenderingContext2D | OffscreenRenderingContext |　ImageBitmapRenderingContext>} */

    this.canvasContextMapping = new Map();
    /** @type {Map<string, OffscreenCanvas>} */

    this.offscreenCanvasMapping = new Map();
    return new Proxy(this, {
      get: function (target, key, recv) {
        if (typeof key === 'string' && key.indexOf('_get_') === 0) {
          return target.getContext(key.substring(5));
        } else {
          return Reflect.get(target, key, recv);
        }
      }
    });
  }

  _createClass(CanvasManager, [{
    key: "getContext",
    value: function getContext(id) {
      return this.canvasContextMapping.get(id);
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

  }, {
    key: "createCanvasInstance",
    value: function createCanvasInstance(id, style = {}, height, width, offDocument, wiredEvent = null, paintingOffScreenRenderingContextId = null) {
      style = style || {};
      height = height || innerHeight;
      width = width || innerWidth; // 创建 离屏canvas元素
      // 离屏所以不考虑绑定事件和样式

      if (offDocument) {
        if ('OffscreenCanvas' in window) {
          // 此处使用了非常激进的 OffscreenCanvas + 2d-context 的API，仅支持 chrome >= 69
          const canvasOff = new OffscreenCanvas(width, height);
          const ctx = canvasOff.getContext('2d');
          this.canvasElements.push(canvasOff);
          this.canvasContextMapping.set(id, ctx);
          this.offscreenCanvasMapping.set(id, canvasOff);
          ctx.manager = this;
          ctx.dom = canvasOff;
          ctx.font = 'lighter 7px TimesNewRoman';
          return ctx;
        } else {
          const canvasEle = document.createElement('canvas');
          canvasEle.width = width;
          canvasEle.height = height;
          canvasEle.id = id;
          const ctx = canvasEle.getContext('2d');
          this.canvasElements.push(canvasEle);
          this.canvasContextMapping.set(id, ctx);
          this.offscreenCanvasMapping.set(id, canvasEle);
          ctx.manager = this;
          ctx.dom = canvasEle;
          ctx.font = 'lighter 7px TimesNewRoman';
          return ctx;
        }
      } // 创建 标准canvas元素
      else {
          const canvasEle = document.createElement('canvas');
          canvasEle.width = width;
          canvasEle.height = height;
          canvasEle.id = id;

          if (Object.prototype.toString.call(wiredEvent) === '[object Function]') {
            wiredEvent(canvasEle);
          }

          Object.assign(canvasEle.style, style);
          let ctx;

          if (paintingOffScreenRenderingContextId) {
            if ('OffscreenCanvas' in window) {
              // 此处使用了非常激进的 ImageBitmapRenderingContext + transferToImageBitmap + transferFromImageBitmap 的API，仅支持 chrome >= 66, firefox >= 52
              ctx = canvasEle.getContext('bitmaprenderer');
              const osc = this.offscreenCanvasMapping.get(paintingOffScreenRenderingContextId);

              ctx._off_screen_paint = function () {
                // this.clearRect(0, 0, osc.width, osc.height)
                this.transferFromImageBitmap(osc.transferToImageBitmap());
              };
            } else {
              ctx = canvasEle.getContext('2d');
              const osc = this.offscreenCanvasMapping.get(paintingOffScreenRenderingContextId);

              ctx._off_screen_paint = function () {
                this.clearRect(0, 0, osc.width, osc.height);
                this.drawImage(osc, 0, 0);
              };
            }
          } else {
            ctx = canvasEle.getContext('2d');
            ctx.font = 'lighter 7px TimesNewRoman';
          }

          ctx.manager = this;
          ctx.dom = canvasEle;
          this.canvasElements.push(canvasEle);
          this.canvasContextMapping.set(id, ctx);
          document.body.appendChild(canvasEle);
          return ctx;
        }
    }
  }, {
    key: "refreshText",

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
    value: function refreshText(text, context, positionTL, outerBoxPositionTL, width, height, style, fillOrStroke = true, font) {
      context = context || this.getContext('bg');
      context.clearRect(outerBoxPositionTL.x, outerBoxPositionTL.y, width, height);
      if (style) fillOrStroke ? context.fillStyle = style : context.strokeStyle = style;
      if (font) context.font = font;
      fillOrStroke ? context.fillText(text, positionTL.x, positionTL.y) : context.strokeText(text, positionTL.x, positionTL.y);
    }
  }, {
    key: "towerLevelTextStyle",
    get: function () {
      return 'rgba(13,13,13,1)';
    }
  }]);

  return CanvasManager;
}();
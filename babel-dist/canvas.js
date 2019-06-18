function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

let CanvasManager = function () {
  function CanvasManager() {
    _classCallCheck(this, CanvasManager);

    this.canvasElements = [];
    this.canvasContextMapping = new Map();
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
  }, {
    key: "createCanvasInstance",
    value: function createCanvasInstance(id, style = {}, height, width, offDocument, wiredEvent = null, paintingOffScreenRenderingContextId = null) {
      style = style || {};
      height = height || innerHeight;
      width = width || innerWidth;

      if (offDocument) {
        if ('OffscreenCanvas' in window) {
          const canvasOff = new OffscreenCanvas(width, height);
          const ctx = canvasOff.getContext('2d');
          this.canvasElements.push(canvasOff);
          this.canvasContextMapping.set(id, ctx);
          this.offscreenCanvasMapping.set(id, canvasOff);
          ctx.manager = this;
          ctx.dom = canvasOff;
          ctx.font = 'lighter 7px Game';
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
          ctx.font = 'lighter 7px Game';
          return ctx;
        }
      } else {
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
              ctx = canvasEle.getContext('bitmaprenderer');
              const osc = this.offscreenCanvasMapping.get(paintingOffScreenRenderingContextId);

              ctx._off_screen_paint = function () {
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
            ctx.font = 'lighter 7px Game';
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
    value: function refreshText(text, context, positionTL, outerBoxPositionTL, width, height, style, fillOrStroke = true, font) {
      context = context || this.getContext('bg');
      context.clearRect(outerBoxPositionTL.x, outerBoxPositionTL.y, width, height);

      if (window.__debug_show_refresh_rect) {
        context.save();
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(255,0,0,.5)';
        context.strokeRect(outerBoxPositionTL.x + 1, outerBoxPositionTL.y + 1, width - 2, height - 2);
        context.restore();
      }

      if (style) fillOrStroke ? context.fillStyle = style : context.strokeStyle = style;
      if (font) context.font = font;
      fillOrStroke ? context.fillText(text, positionTL.x, positionTL.y, width) : context.strokeText(text, positionTL.x, positionTL.y, width);
    }
  }, {
    key: "towerLevelTextStyle",
    get: function () {
      return 'rgba(13,13,13,1)';
    }
  }]);

  return CanvasManager;
}();
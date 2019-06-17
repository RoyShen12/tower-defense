function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

let ButtonOnDom = function () {
  function ButtonOnDom(domOptions, hookOnToDom = true) {
    _classCallCheck(this, ButtonOnDom);

    this.ele = document.createElement('button');
    if (hookOnToDom) document.body.appendChild(this.ele);

    Tools.Dom.__installOptionOnNode(this.ele, domOptions);
  }

  _createClass(ButtonOnDom, [{
    key: "onMouseclick",
    value: function onMouseclick() {
      this.ele.click();
    }
  }]);

  return ButtonOnDom;
}();

let ButtonOnCanvas = function (_RectangleBase) {
  _inherits(ButtonOnCanvas, _RectangleBase);

  function ButtonOnCanvas(id, positionTL, positionBR, bw, bs, br, text, textsize, fontName, textFs, imageFill, imageFillHover, imageFillPress) {
    var _this;

    _classCallCheck(this, ButtonOnCanvas);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ButtonOnCanvas).call(this, positionTL, positionBR, bw, bs, null, br));

    _defineProperty(_assertThisInitialized(_this), "onMouseclick", null);

    _this.id = id;
    imageFillHover = imageFillHover || imageFill;
    imageFillPress = imageFillPress || imageFill;
    _this.status = 0;
    const p2d = new Path2D();
    p2d.rect(_this.cornerTL.x, _this.cornerTL.y, _this.width, _this.height);
    _this.pathForDetection = p2d;
    _this.text = text;
    _this.textSize = textsize;
    _this.fontName = fontName;
    _this.textFs = textFs;
    _this.image = null;
    _this.imageHov = null;
    _this.imagePrs = null;

    if (typeof imageFill === 'string') {
      _this.fillStyle = imageFill;
    } else if (imageFill instanceof ImageBitmap) {
      _this.image = imageFill;
    } else if (imageFill instanceof Promise) {
      imageFill.then(r => _this.image = r);
    }

    if (typeof imageFillHover === 'string') {
      _this.fillStyleHov = imageFillHover;
    } else if (imageFillHover instanceof ImageBitmap) {
      _this.imageHov = imageFillHover;
    } else if (imageFillHover instanceof Promise) {
      imageFillHover.then(r => _this.imageHov = r);
    }

    if (typeof imageFillPress === 'string') {
      _this.fillStylePrs = imageFillPress;
    } else if (imageFillPress instanceof ImageBitmap) {
      _this.imagePrs = imageFillPress;
    } else if (imageFillPress instanceof Promise) {
      imageFillPress.then(r => _this.imagePrs = r);
    }

    return _this;
  }

  _createClass(ButtonOnCanvas, [{
    key: "renderText",
    value: function renderText(context) {
      context.save();
      context.font = `${this.textSize}px ${this.fontName}`;
      const textMeasuredSize = context.measureText(this.text);
      const textX = this.cornerTL.x + this.width / 2 - textMeasuredSize.width / 2;
      const textY = this.cornerTL.y + this.height / 2 + this.textSize / 2.5;
      context.fillStyle = this.textFs;
      context.fillText(this.text, textX, textY);
      context.restore();
    }
  }, {
    key: "render",
    value: function render(context) {
      context.clearRect(this.cornerTL.x - 3, this.cornerTL.y - 3, this.width + 5, this.height + 5);

      if (this.fillStyle) {
        const tmp = this.fillStyle;
        this.status === 0 ? void 0 : this.status === 1 ? this.fillStyle = this.fillStyleHov : this.fillStyle = this.fillStylePrs;

        _get(_getPrototypeOf(ButtonOnCanvas.prototype), "renderInside", this).call(this, context);

        this.fillStyle = tmp;
        this.renderText(context);
      } else {}
    }
  }, {
    key: "onMouseEnter",
    value: function onMouseEnter() {
      this.status = 1;
    }
  }, {
    key: "onMouseLeave",
    value: function onMouseLeave() {
      this.status = 0;
    }
  }, {
    key: "onMouseDown",
    value: function onMouseDown() {
      this.status = 2;
    }
  }, {
    key: "onMouseUp",
    value: function onMouseUp() {
      this.status = 0;
      if (this.onMouseclick) this.onMouseclick();
    }
  }]);

  return ButtonOnCanvas;
}(RectangleBase);
class Game {

  /**
   * 在[Animation]图层中绘制特效的便捷函数
   * @type {((name: string, pos: Position, w: number, h: number, speed?: number, delay?: number, waitFrame?: number, cb?: () => void) => void) | null}
   */
  static callAnimation = null

  /**
   * 获取位图的便捷函数
   * @type {((name: string) => ImageBitmap) | null}
   */
  static callImageBitMap = null

  /**
   * 获取图层上下文的便捷函数
   * @type {((name: string) => CanvasRenderingContext2D) | null}
   */
  static callCanvasContext = null

  /**
   * 获取游戏区域的右下角坐标的便捷函数
   * @type {(() => Position) | null}
   */
  static callBoundaryPosition = null

  /**
   * 获取单元格边长的便捷函数
   * @type {(() => number) | null}
   */
  static callGridSideSize = null

  /**
   * 获取屏幕左右区域分割线x坐标的便捷函数
   * @type {(() => number) | null}
   */
  static callMidSplitLineX = null

  /**
   * 根据id获取DOM元素的便捷函数
   * @returns { Node & { style: CSSStyleDeclaration & {} } & HTMLDivElement }
   */
  static callElement = id => {
    const key = 'by_id_' + id
    if (Tools.Dom._cache.has(key)) {
      
      return Tools.Dom._cache.get(key)
    }
    else {
      const targetEl = document.getElementById(id)
      
      Tools.Dom._cache.set(key, targetEl)
      
      return targetEl
    }
  }

  /**
   * 隐藏状态组件的便捷函数
   */
  static callHideStatusBlock = () => {
    
    document.getElementById('status_block').style.display = 'none'
    
    document.getElementById('gem_block').style.display = 'none'
  }

  /**
   * 获取金钱，提交变化
   * @type {(() => [number, (change: number) => void]) | null}
   */
  static callMoney = null

  /**
   * @type {((t: TowerBase) => void) | null}
   */
  static callRemoveTower = null

  constructor(GX = 36, GY = 24) {

    this.__testMode = localStorage.getItem('debug_mode') === '1'

    this.tick = 0

    // debug only
    
    window.g = this

    this.gridX = GX
    this.gridY = GY

    this.DestinationGrid = {
      x: GY / 2 + 1,
      y: GX
    }

    /**
     * @type {boolean}
     */
    this.isPausing = true

    this.updateSpeedRatio = 1

    this.__inner_b_arr = [new Array(this.gridX + 2).fill(0)]

    this.money = this.__testMode ? 1e12 : 5e2
    this.life = this.__testMode ? 8e4 : 20

    /** @type {(ItemBase)[]} */
    this.towerForSelect = []

    /** @type {ItemBase} */
    this.selectedTowerTypeToBuild = null

    this.imageCtl = new ImageManger()
    this.contextCtl = new CanvasManager()
    this.evtCtl = new EventManager()
    this.towerCtl = new TowerManager()
    this.monsterCtl = new MonsterManager()
    this.bulletsCtl = new BulletManager()

    
    Game.callCanvasContext = name => this.contextCtl.getContext(name)

    /**
     * @type {ButtonOnDom}
     */
    this.startAndPauseButton = null

    /**
     * @type {ButtonOnDom}
     */
    this.speedControlButton = null

    this.loopSpeeds = this.__testMode ? [2, 3, 5, 10, 1] : [2, 3, 1]

    
    Game.callImageBitMap = name => this.imageCtl.getImage(name)

    this.lastMouseMovePosition = new Position(0, 0)

    /** @type {TowerBase | null} */
    this.onMouseTower = null

    /** @type {number[][]} */
    this.grids = []

    /** @type {Map<string, {x:number,y:number}[]>} */
    this.posPathMapping = new Map()

    this.midSplitLineX = -1

    this.detailFunctionKeyDown = false

    Game.callMidSplitLineX = () => this.midSplitLineX

    Game.callMoney = () => [this.money, this.emitMoney.bind(this)]

    Game.callRemoveTower = t => this.removeTower(t)
  }

  get gridsWithWall() {
    return this.__inner_b_arr.concat(this.grids.map(row => [0, ...row, 0]).concat(this.__inner_b_arr))
  }

  /**
   * 新建一个用以寻路的带围墙的Graph
   */
  makeGraph() {
    return new Astar.Graph(this.gridsWithWall)
  }

  /** @param {Position | {x:number,y:number}} pos */
  coordinateToGridIndex(pos) {
    const rubbed = [Math.round(pos.x), Math.round(pos.y)]
    return [Math.max(Math.floor(rubbed[1] / this.gridSize), 0), Math.max(Math.floor(rubbed[0] / this.gridSize), 0)]
  }

  /**
   * @param {Position} pos
   * @returns {[number, number, number, number]} inner grid index: ret[0], ret[1], pos-grid-center-fixed: ret[2], ret[3]
   */
  whichGrid(pos) {
    if (pos.x > this.midSplitLineX) return [-1, -1, NaN, NaN]
    else {
      const [ix, iy] = this.coordinateToGridIndex(pos)
      // console.log(pos.toString(), '->', `<${ix}, ${iy}>`)
      return [
        ix,
        iy,
        (iy + .5) * this.gridSize,
        (ix + .5) * this.gridSize
      ]
    }
  }

  /**
   * (inner grid index): this.grids[gx][gy]
   */
  removeOutdatedPath(newbdgx, newbdgy) {
    this.posPathMapping.forEach((v, k) => {
      if (v.some(pos => {
        const [posgx, posgy] = this.coordinateToGridIndex(pos)
        return newbdgx === posgx && newbdgy === posgy
      })) {
        console.log(`detect Gpos-path-map ${k} has been contaminated.`)
        this.posPathMapping.delete(k)
      }
    })

    // this.posPathMapping.clear()
  }

  /**
   * @param {Position} pos
   */
  placeTower(pos, ctorName, img, bimg, price) {
    const wg = this.whichGrid(pos)
    // console.log('wg', wg)
    const tow = this.towerCtl.Factory(ctorName, new Position(wg[2], wg[3]), img, bimg, this.gridSize / 2 - 2)
    this.emitMoney(price)
    this.grids[wg[0]][wg[1]] = 0
    
    tow.__grid_ix = wg[0]
    
    tow.__grid_iy = wg[1]

    if (this.__testMode) {
      tow.updateGemPoint += 1e8
      for (let i = 0; i < 139; i++) {
        this.emitMoney(-1 * tow.levelUp(this.money))
      }
    }
    // tow.inlayGem('GogokOfSwiftness')

    this.removeOutdatedPath(wg[0], wg[1])
  }

  /**
   * @param {TowerBase} tower
   */
  removeTower(tower) {
    tower.isSold = true
    
    this.grids[tower.__grid_ix][tower.__grid_iy] = 1
    
    this.removeOutdatedPath(tower.__grid_ix, tower.__grid_iy)
  }

  /**
   * @param {Position} pos
   */
  placeMonster(level, pos, ctorName) {
    const { imgName, sprSpd } = eval(ctorName)
    this.monsterCtl.Factory(
      ctorName,
      pos.dithering(this.gridSize / 3),
      imgName.indexOf('$spr::') !== -1 ? this.imageCtl.getSprite(imgName.substr(6)).getClone(sprSpd || 1) : this.imageCtl.getImage(imgName),
      level
    )
  }

  /**
   * @param {Position} mousePos
   */
  leftClickHandler = mousePos => {
    // 修建状态
    if (this.selectedTowerTypeToBuild) {
      const [mouseGposx, mouseGposy] = this.coordinateToGridIndex(mousePos)
      // 不在左侧区域
      if (mousePos.x > this.midSplitLineX) {
        return
      }
      // 区块内有怪物
      if (this.monsterCtl.monsters.some(mst => {
        const [mstGposx, mstGposy] = this.coordinateToGridIndex(mst.position)
        return mouseGposx === mstGposx && mstGposy === mouseGposy
      })) {
        console.log('区块内有怪物')
        return
      }
      // 区块内已有塔
      if (this.towerCtl.towers.some(tow => {
        const [towGposx, towGposy] = this.coordinateToGridIndex(tow.position)
        return mouseGposx === towGposx && towGposy === mouseGposy
      })) {
        console.log('区块内已有塔')
        return
      }
      // 此位置会阻断怪物的唯一path
      // 投入不渲染的临时怪物
      /** @type {CircleBase[]} */
      const tempMonsters = []
      this.grids.forEach((rowv, rowi) => {
        rowv.forEach((colv, coli) => {
          if (
            !(mouseGposx === rowi && mouseGposy === coli) &&
            colv === 1 &&
            !(rowi === this.DestinationGrid.x - 1 && coli === this.DestinationGrid.y - 1)
          ) {
            const c = new CircleBase(
              new Position((coli + .5) * this.gridSize, (rowi + .5) * this.gridSize),
              5,
              1,
              'rgba(12,12,12,1)'
            )
            // c.grid = `${coli} ${rowi}`
            tempMonsters.push(c)
          }
        })
      })
      const fakeGrids = _.cloneDeep(this.grids)
      fakeGrids[mouseGposx][mouseGposy] = 0
      const tmp = [new Array(this.gridX + 2).fill(0)]
      const gww = tmp.concat(fakeGrids.map(row => [0, ...row, 0]).concat(tmp))
      const bindFx = Game.prototype.makeGraph.bind({ gridsWithWall: gww })
      if (tempMonsters.some(mst => {
        const fakeGraph = bindFx()
        const [wg0, wg1] = this.coordinateToGridIndex(mst.position)
        const path = Astar.astar.search(fakeGraph, fakeGraph.grid[wg0 + 1][wg1 + 1], fakeGraph.grid[this.DestinationGrid.x][this.DestinationGrid.y])
        return path.length === 0
      })) {
        console.log('此位置会阻断怪物的唯一path')
        return
      }
      
      this.selectedTowerTypeToBuild.rerender(0)
      
      if (this.money >= this.selectedTowerTypeToBuild.__init_price[0]) {
        // 完成建造
        this.placeTower(
          mousePos,
          
          this.selectedTowerTypeToBuild.__ctor_name,
          
          this.imageCtl.getImage(this.selectedTowerTypeToBuild.__inner_img_u),
          
          this.imageCtl.getImage(this.selectedTowerTypeToBuild.__inner_b_img_u),
          
          -this.selectedTowerTypeToBuild.__init_price[0]
        )
      }
      else {
        console.log('金币不足')
        // to do
        // alert lacking of money
      }
      this.selectedTowerTypeToBuild = null // remove build status

      return
    }
    // 非修建状态

    if (mousePos.x > this.midSplitLineX) {
      const selectedT = this.towerForSelect.find(tfs => tfs.position.equal(mousePos, tfs.radius))
      // 选择建筑，进入修建状态
      if (selectedT) {
        this.selectedTowerTypeToBuild = selectedT
        
        this.selectedTowerTypeToBuild.rerender(2)
      }
    }
    else {
      /** @type {TowerBase}} */
      const selectedT = this.towerCtl.towers.find(t => t.position.equal(mousePos, t.radius))
      // 升级
      if (selectedT) {
        // console.log(selectedT)
        this.emitMoney(-1 * selectedT.levelUp(this.money))
        
        this.contextCtl._get_mouse.clearRect(0, 0, innerWidth, innerHeight)
        
        selectedT.renderRange(this.contextCtl._get_mouse)
        selectedT.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, true, this.detailFunctionKeyDown)
      }
    }
  }

  /**
   * @param {Position} mousePos
   */
  rightClickHandler = function () {
    let lastRightClick = -1000
    return mousePos => {
      if (performance.now() - lastRightClick < 300) {
        if (!this.selectedTowerTypeToBuild) {
          const selectedT = this.towerCtl.towers.find(t => t.position.equal(mousePos, t.radius * 0.75))
          if (selectedT) {
            this.removeTower(selectedT)
          }
        }
      }
      else {
        // 取消修建状态
        if (this.selectedTowerTypeToBuild) {
          
          this.selectedTowerTypeToBuild.rerender(0)
          this.selectedTowerTypeToBuild = null
        }
      }
      lastRightClick = performance.now()
    }
  }.bind(this)()

  /**
   * @type {((e: MouseEvent) => void) & _.Cancelable}
   */
  mouseMoveHandler = _.throttle(e => {
    
    this.contextCtl._get_mouse.clearRect(0, 0, innerWidth, innerHeight)
    const mousePos = new Position(e.offsetX, e.offsetY)
    this.lastMouseMovePosition = mousePos

    if (this.selectedTowerTypeToBuild) {
      
      TowerBase.prototype.renderRange.call({ position: mousePos, Rng: this.selectedTowerTypeToBuild.__rng_lv0 }, this.contextCtl._get_mouse)
      return
    }

    // 右侧菜单区域
    if (e.offsetX > this.midSplitLineX) {
      const selectedT = this.towerForSelect.find(tfs => tfs.position.equal(mousePos, tfs.radius))
      // 鼠标进入建筑
      if (selectedT) {
        
        this.onMouseTower = selectedT
        TowerBase.prototype.renderStatusBoard.call(
          {
            position: mousePos,
            
            informationSeq: [[selectedT.__dn, '']],
            
            descriptionChuned: (new (eval(selectedT.__ctor_name))).descriptionChuned,
            
            exploitsSeq: [['建造快捷键', `[${selectedT.__od}]`]],
            radius: selectedT.radius
          },
          0, this.midSplitLineX, 0, innerHeight
        )
      }
      else {
        Game.callHideStatusBlock()
        this.onMouseTower = null
      }
    }
    // 左侧方格区域
    else {
      const selectedT = this.towerCtl.towers.find(t => t.position.equal(mousePos, t.radius))
      if (selectedT) {
        this.statusBoardOnTower = selectedT
        
        selectedT.renderRange(this.contextCtl._get_mouse)
        selectedT.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, true, this.detailFunctionKeyDown)
      }
      else {
        Game.callHideStatusBlock()
        this.statusBoardOnTower = null
      }
    }
  }, 34)

  /**
   * @param {KeyboardEvent} e
   */
  keyDownHandler = e => {
    if (Tools.isNumberSafe(e.key)) {
      
      this.selectedTowerTypeToBuild = this.towerForSelect[e.key - 1]
      this.leftClickHandler(this.lastMouseMovePosition)
      this.selectedTowerTypeToBuild = null
      return
    }
    // console.log(e.key)
    switch (e.key) {

    case 'c':
      this.leftClickHandler(this.lastMouseMovePosition)
      break
    case ' ':
      this.startAndPauseButton.onMouseclick()
      break
    // case 'ArrowUp':
    //   break
    // case 'ArrowDown':
    //   break
    // case 'a':
    //   break
    // case 'd':
    //   break
    case 'Control':
      this.detailFunctionKeyDown = !this.detailFunctionKeyDown

      if (this.statusBoardOnTower) {
        this.statusBoardOnTower.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, true, this.detailFunctionKeyDown)
      }
      break
    default:
      break
    }
  }

  /**
   * @deprecated
   * @param {KeyboardEvent} e
   */
  keyUpHandler = e => {
    switch (e.key) {

    case 'Control':
      this.detailFunctionKeyDown = false
      if (this.statusBoardOnTower) {
        this.statusBoardOnTower.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, true, this.detailFunctionKeyDown)
      }
      break
    default:
      break
    }
  }

  initButtons() {
    const buttonTopA = this.gridSize * 7 + 'px'

    // <button id="start_pause_btn" class="sp_btn" type="button"></button>
    // <button id="speed_ctrl_btn" class="sc_btn" type="button"></button>


    this.startAndPauseButton = new ButtonOnDom({
      id: 'start_pause_btn',
      className: 'sp_btn',
      type: 'button',
      textContent: '开始',
      title: '快捷键 [空格]',
      
      style: {
        zIndex: '8',
        top: buttonTopA,
        left: this.leftAreaWidth + 30 + 'px'
      },
      onclick: () => {
        this.isPausing = !this.isPausing
        this.startAndPauseButton.ele.textContent = this.isPausing ? '开始' : '暂停'
      }
    })

    let iterator = this.loopSpeeds[Symbol.iterator]()

    this.speedControlButton = new ButtonOnDom({
      id: 'speed_ctrl_btn',
      className: 'sc_btn',
      type: 'button',
      textContent: '1 倍速',
      
      style: {
        zIndex: '8',
        top: buttonTopA,
        left: this.leftAreaWidth + 130 + 'px'
      },
      onclick: () => {
        let next = iterator.next()
        if (next.done) {
          iterator = this.loopSpeeds[Symbol.iterator]()
          next = iterator.next()
        }
        this.updateSpeedRatio = next.value
        this.speedControlButton.ele.textContent = `${this.updateSpeedRatio} 倍速`
      }
    })

    const testModeButton = new ButtonOnDom({
      className: 'tm_btn',
      type: 'button',
      textContent: '以' + (this.__testMode ? '普通' : '测试') + '模式重启',
      style: {
        zIndex: '8',
        top: buttonTopA,
        right: 30 + 'px'
      },
      onclick: () => {
        localStorage.setItem('debug_mode', this.__testMode ? '0' : '1')
        window.location.reload()
      }
    })
  }

  init() {

    this.gridSize = Math.floor(innerHeight / this.gridY)

    Game.callGridSideSize = () => this.gridSize

    this.leftAreaHeight = this.gridSize * this.gridY
    this.leftAreaWidth = this.leftAreaHeight * this.gridX / this.gridY

    const areaAspectRatio = this.leftAreaWidth / this.leftAreaHeight

    Game.callBoundaryPosition = () => new Position(this.leftAreaWidth, this.leftAreaHeight)

    this.midSplitLineX = this.leftAreaWidth + 2
    this.rightAreaWidth = innerWidth - this.midSplitLineX

    for (const i of new Array(this.gridY)) {
      this.grids.push(new Array(this.gridX).fill(1))
    }


    // 离屏 canvas, 高速预渲染
    this.contextCtl.createCanvasInstance('off_screen_render', null, innerHeight, Math.ceil(innerHeight * areaAspectRatio), true)

    // [60 FPS] 常更新主图层
    this.contextCtl.createCanvasInstance('main', { zIndex: '2' }, null, null, false, null, 'off_screen_render')

    // [stasis] 用来绘制塔的图层，不经常更新
    this.contextCtl.createCanvasInstance('tower', { zIndex: '0' })

    // [on mouse] 用来绘制鼠标事件带来的悬浮信息等的图层，随鼠标移动刷新
    this.contextCtl.createCanvasInstance('mouse', { zIndex: '4' })

    // this.contextCtl.createCanvasInstance('path_dbg', { zIndex: '-3' })

    // [statis | partial: 60 FPS] 骨架图层, 单次渲染, 局部如金币等信息长更新
    this.contextCtl.createCanvasInstance('bg', { zIndex: '-3' })

    this.initButtons()

    this.evtCtl.bindEvent([
      {
        ename: 'onkeydown',
        cb: this.keyDownHandler
      },
      // {
      //   ename: 'onkeyup',
      //   cb: this.keyUpHandler
      // }
    ],
    document)

    
    const reactDivEle = Tools.Dom.genetateDiv(document.body, {
      id: 'react',
      style: {
        margin: '0',
        position: 'fixed',
        top: '0',
        left: '0',
        border: '0',
        zIndex: '5',
        width: '100%',
        height: '100%',
        opacity: '0'
      }
    })

    this.evtCtl.bindEvent(
      [
        {
          ename: 'onmousedown',
          cb: e => {
            const mousePos = new Position(e.offsetX, e.offsetY)
            // console.log(e.button, mousePos.toString())
            switch (e.button) {
              // left click
              case 0:
                this.leftClickHandler(mousePos)
                break
              // right click
              case 2:
                this.rightClickHandler(mousePos)
               break
              default:
                break
            }
          }
        },
        {
          ename: 'onmousemove',
          cb: this.mouseMoveHandler
        }
      ],
      reactDivEle
    )

    this.renderOnce()

    Game.callAnimation = (name, pos, w, h, speed, delay, wait, cb) => {
      this.imageCtl.onPlaySprites.push(new HostedAnimationSprite(this.imageCtl.getSprite(name).getClone(speed), pos, w, h, delay, false, wait))
    }
  }

  renderOnce() {
    /** @type {CanvasRenderingContext2D} */
    
    const ctx = this.contextCtl._get_bg

    ctx.font = '12px TimesNewRoman'

    ctx.strokeStyle = 'rgba(45,45,45,.5)'
    ctx.lineWidth = 1
    ctx.strokeRect(1, 1, this.leftAreaWidth, this.leftAreaHeight)

    ctx.strokeStyle = 'rgba(188,188,188,.1)'
    for (let i = this.gridSize; i < this.gridSize * this.gridY; i += this.gridSize) {
      ctx.moveTo(1, i)
      ctx.lineTo(this.leftAreaWidth, i)
    }
    for (let i = this.gridSize; i < this.gridSize * this.gridX; i += this.gridSize) {
      ctx.moveTo(i, 1)
      ctx.lineTo(i, this.leftAreaHeight)
    }
    ctx.stroke()

    ctx.fillStyle = 'rgba(141,241,123,.6)'
    ctx.fillRect(0, (this.gridY / 2 - 1) * this.gridSize, this.gridSize, this.gridSize)

    ctx.fillStyle = 'rgba(241,141,123,.8)'
    ctx.fillRect((this.gridX - 1) * this.gridSize, (this.gridY / 2) * this.gridSize, this.gridSize, this.gridSize)

    if (this.__testMode) {
      this.contextCtl.refreshText('[ Test Mode ]', this.contextCtl._get_bg, new Position(10, 25), new Position(8, 5), 120, 26, 'rgba(2,2,2,1)', true, '10px TimesNewRoman')
    }

    this.contextCtl.refreshText('鼠标点击选取建造，连点两次鼠标右键出售已建造的塔', this.contextCtl._get_bg, new Position(this.leftAreaWidth + 30, 30), new Position(this.leftAreaWidth + 28, 10), this.rightAreaWidth, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
    this.contextCtl.refreshText('出现详情时按[Ctrl]切换详细信息和说明', this.contextCtl._get_bg, new Position(this.leftAreaWidth + 30, 70), new Position(this.leftAreaWidth + 28, 50), this.rightAreaWidth, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')

    const tsAeraRectTL = new Position(this.leftAreaWidth + 30, 90)
    const tsMargin = this.gridSize / 2 - 2
    const tsItemRadius = this.gridSize / 2 + 5

    const oneTsWidth = tsMargin + 2 * tsItemRadius
    const chunkSize = Math.floor(this.rightAreaWidth / oneTsWidth)
    const chunkedTowerCtors = _.chunk(TowerManager.towerCtors, chunkSize)
    // console.log('chunk size', chunkSize, 'chunk result', chunkedTowerCtors)

    const tsMarginBottom = this.gridSize / 2  + 6

    /**
     * 右侧选择区的依赖注入
     * Game无法获得所有塔的信息，只能从TowerManager对象中获取
     * 并依次构建基类ItemBase，注入信息以在建造时获取正确信息
     * @param {ItemBase} itm
     * @param {CanvasRenderingContext2D} _ctx
     * @param {number} centerX 中心x坐标
     * @param {number} centerY 中心y坐标
     * @param {number} R 半径
     */
    const IOC = (itm, ctor, _ctx, centerX, centerY, R) => {
      itm.render(_ctx) // 绘制基础图标
      _ctx.textAlign = 'center'
      _ctx.fillStyle = '#333'
      _ctx.fillText('$' + ctor.p[0], centerX, centerY + R + 20) // 绘制价格
      _ctx.textAlign = 'start'
      
      itm.__dn = ctor.dn // 注入名称
      
      itm.__des = ctor.d // 注入描述
      
      itm.__od = ctor.od // 注入序号
      
      itm.__inner_img_u = ctor.n // 注入图标
      
      itm.__inner_b_img_u = ctor.bn // 注入子弹图标
      
      itm.__init_price = ctor.p // 注入价格数组
      
      itm.__ctor_name = ctor.c // 注入构造函数名
      
      itm.__rng_lv0 = ctor.r(0) // 注入初始射程
      
      itm.__tlx = centerX - tsItemRadius - 3 // 注入中心点坐标
      
      itm.__tly = centerY - tsItemRadius - 3 // 注入中心点坐标
      
      itm.rerender = width => { // 注入重绘函数
        itm.borderWidth = width
        
        _ctx.clearRect(itm.__tlx, itm.__tly, (tsItemRadius + 2) * 2, (tsItemRadius + 2) * 2)
        itm.render(_ctx)
      }
    }

    chunkedTowerCtors.forEach((ctorRow, rowIdx) => {
      rowIdx > 0 ? tsAeraRectTL.move(new PolarVector(tsMarginBottom + tsItemRadius * 2, 270)) : void(0)

      ctorRow.forEach((_t, idx) => {

        // const realIdx = rowIdx * chunkSize + idx

        const ax = tsAeraRectTL.x + ((tsItemRadius + 2) * 2 + tsMargin) * idx + tsItemRadius
        const ay = tsAeraRectTL.y + tsItemRadius

        if (!_t.n.includes('$spr::')) {
          
          this.imageCtl.getImage(_t.n).then(img => {
            const temp = new ItemBase(new Position(ax, ay), tsItemRadius, 0, 'rgba(255,67,56,1)', img)
            IOC(temp, _t, ctx, ax, ay, tsItemRadius)
            this.towerForSelect.push(temp)
            this.towerForSelect.sort(Tools.compareProperties('__od'))
          })
        }
        else {
          const spr_d = this.imageCtl.getSprite(_t.n.substr(6)).getClone(6)
          const temp = new ItemBase(new Position(ax, ay), tsItemRadius, 0, 'rgba(255,67,56,1)', spr_d)
          IOC(temp, _t, ctx, ax, ay, tsItemRadius)
          this.towerForSelect.push(temp)
          this.towerForSelect.sort(Tools.compareProperties('__od'))
        }
      })
    })

    
    this.imageCtl.getSprite('gold_spin').getClone(2).renderLoop(this.contextCtl._get_bg, new Position(innerWidth - 190, innerHeight - 25), 18, 18)
    
    this.imageCtl.getImage('heart_px').then(img => {
      
      this.contextCtl._get_bg.drawImage(img, innerWidth - 190, innerHeight - 54, 18, 18)
    })

    // this.__inner_buttons.forEach(b => b.render(this.contextCtl._get_bg))
  }

  run() {

    this.tick++

    let flag = false
    for (let i = 0; i < this.updateSpeedRatio; i++) {
      flag = flag || this.update()
    }

    this.render(flag)

    
    if (window.__global_debug) {
      setTimeout(() => {
        this.run()
      }, 300)
      return
    }

    requestAnimationFrame(() => {
      this.run()
    })
  }

  emitMoney(changing, happenedPosition) {
    this.money += changing

    // if (happenedPosition) {
    //   Game.callAnimation('gold_spin_small', happenedPosition.x, 22, 22, 1, 0)
    // }
  }

  emitLife(changing) {
    this.life += changing
    if (this.life <= 0) {

      this.life = 0

      this.isPausing = true
    }
  }

  /**
   * 对输入的起点进行寻路
   * 终点为 grid[12][35]
   * @param {Position} startPos
   */
  getPathToEnd(startPos) {
    const wg = this.whichGrid(startPos)
    const key = `${wg[0]}|${wg[1]}`

    if (this.posPathMapping.has(key)) {
      return this.posPathMapping.get(key)
    }
    else {

      // this.contextCtl._get_path_dbg.clearRect(0, 0, innerWidth, innerHeight)
      // this.contextCtl._get_path_dbg.strokeStyle = 'rgba(45,54,231,.3)'
      // this.contextCtl._get_path_dbg.lineWidth = 4
      // this.contextCtl._get_path_dbg.beginPath()

      const G = this.makeGraph()
      //console.log(G.grid)
      // wg.x和y 各加1（寻路时的围墙）
      //console.log(wg[0] + 1, wg[1] + 1)
      const path = Astar.astar.search(G, G.grid[wg[0] + 1][wg[1] + 1], G.grid[this.DestinationGrid.x][this.DestinationGrid.y]).map((p, idx) => {
        // 每一步的x和y都减去1来拆去围墙
        // 然后加上0.5来调整坐标至单元格的中央
        const y = (p.x - .5) * this.gridSize
        const x = (p.y - .5) * this.gridSize
        // idx === 0 ? this.contextCtl._get_path_dbg.moveTo(x, y, this.gridSize, this.gridSize) :
        // this.contextCtl._get_path_dbg.lineTo(x, y, this.gridSize, this.gridSize)
        return { x, y }
      })

      // this.contextCtl._get_path_dbg.closePath()
      // this.contextCtl._get_path_dbg.stroke()

      this.posPathMapping.set(key, path)
      return path
    }
  }

  count = this.__testMode ? 100 : 0

  stepDivide = this.__testMode ? 2 : 10

  update() {

    // ------------------ debug ---------------------
    
    if (!this.isPausing && !window.__d_stop_ms) {
      const monsterCtors = [
        'Swordman',
        'Axeman',
        'LionMan'
      ]
      // if (this.tick === 101) {
      //   this.placeMonster(
      //     400,
      //     new Position(0, (this.gridY / 2 - .5) * this.gridSize),
      //     'Devil'
      //   )
      // }
      if (this.tick % (this.__testMode ? 10 : 120) === 0) {
        this.placeMonster(
          Math.floor(++this.count / this.stepDivide),
          new Position(0, (this.gridY / 2 - .5) * this.gridSize),
          _.shuffle(monsterCtors)[0]
        )
      }
      if (this.tick % (this.__testMode ? 501 : 1201) === 0) {
        this.placeMonster(
          Math.floor(++this.count / (this.stepDivide * 2) + (this.__testMode ? 100 : 0)),
          new Position(0, (this.gridY / 2 - .5) * this.gridSize),
          'Devil'
        )
      }
    }
    // ------------------ debug ---------------------

    if (!this.isPausing) {
      this.towerCtl.run(this.monsterCtl.monsters)
      this.bulletsCtl.run(this.monsterCtl.monsters)
      this.monsterCtl.run(this.getPathToEnd.bind(this), this.emitLife.bind(this), this.towerCtl.towers, this.monsterCtl.monsters)
    }

    this.bulletsCtl.scanSwipe()
    this.monsterCtl.scanSwipe(this.emitMoney.bind(this))
    return this.towerCtl.scanSwipe(this.emitMoney.bind(this))
  }

  render(towerNeedRender = true) {

    this.renderMoney()
    this.renderLife()

    if (this.tick % 30 === 0) this.renderInformation()

    
    this.contextCtl._get_off_screen_render.clearRect(
      0,
      0,
      
      this.contextCtl._get_off_screen_render.dom.width,
      
      this.contextCtl._get_off_screen_render.dom.height
    )

    
    this.imageCtl.play(this.contextCtl._get_off_screen_render)

    /// this.contextCtl._get_tower_rapid.clearRect(0, 0, innerWidth, innerHeight)
    
    this.towerCtl.rapidRender(this.contextCtl._get_off_screen_render, this.monsterCtl.monsters)

    // this.contextCtl._get_main.clearRect(0, 0, innerWidth, innerHeight)
    /// this.bulletsCtl.render(this.contextCtl._get_main)
    /// this.monsterCtl.render(this.contextCtl._get_main, this.imageCtl)
    
    this.bulletsCtl.render(this.contextCtl._get_off_screen_render)
    
    this.monsterCtl.render(this.contextCtl._get_off_screen_render, this.imageCtl)

    if (towerNeedRender) {
      
      this.contextCtl._get_tower.clearRect(0, 0, innerWidth, innerHeight)
      
      this.towerCtl.render(this.contextCtl._get_tower)
    }

    // this.contextCtl._get_tower_rapid._off_screen_paint()
    
    this.contextCtl._get_main._off_screen_paint()
    // this.contextCtl._get_animation._off_screen_paint()
  }

  get moneyOnDispaly() {
    return Tools.formatterUs.format(this.money)
  }

  renderMoney() {
    const ax = innerWidth - 160
    const ay = innerHeight - 10
    
    this.contextCtl.refreshText(this.moneyOnDispaly, this.contextCtl._get_bg, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
  }

  renderLife() {
    const ax = innerWidth - 160
    const ay = innerHeight - 40
    
    this.contextCtl.refreshText(this.life, this.contextCtl._get_bg, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
  }

  renderInformation() {
    const ax = innerWidth - 190

    const ay1 = innerHeight - 70
    const ay2 = ay1 - 30
    const ay3 = ay2 - 30
    // const ay4 = ay3 - 30

    
    // this.contextCtl.refreshText(`CH: ${Tools.chineseFormatter(this.monsterCtl.totalCurrentHealth, 2, ' ')}`, this.contextCtl._get_bg, new Position(ax, ay1), new Position(ax - 4, ay1 - 20), 190, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
    
    this.contextCtl.refreshText(`总伤害: ${Tools.chineseFormatter(this.towerCtl.totalDamage, 2, ' ')}`, this.contextCtl._get_bg, new Position(ax, ay2), new Position(ax - 4, ay2 - 20), 190, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
    
    this.contextCtl.refreshText(`总击杀: ${Tools.chineseFormatter(this.towerCtl.totalKill, 2, ' ')}`, this.contextCtl._get_bg, new Position(ax, ay3), new Position(ax - 4, ay3 - 20), 190, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
    // this.contextCtl.refreshText(`CH: ${Tools.chineseFormatter(this.monsterCtl.totalCurrentHealth, 2, ' ')}`, this.contextCtl._get_bg, new Position(ax, ay4), new Position(ax - 4, ay4 - 20), 190, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
  }

}

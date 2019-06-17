/**
 * @property {number} updateGemPoint
 */
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


  /**
   * @type {(towerName: string, position: Position, image: string | AnimationSprite | ImageBitmap | Promise<ImageBitmap>, bulletImage: any, radius: number, ...extraArgs: any[]) => TowerBase}
   */
  static callTowerFactory = null

  /**
   * @type {() => TowerBase[]}
   */
  static callTowerList = null

  /**
   * @type {() => MonsterBase[]}
   */
  static callMonsterList = null

  /**
   * @type {() => Position}
   */
  static callOriginPosition = null

  /**
   * @type {() => Position}
   */
  static callDestinationPosition = null

  /**
   * - 右侧选择区的依赖注入
   * - Game无法获得所有塔的信息，只能从TowerManager对象中获取
   * - 并依次构建基类ItemBase，注入信息以在建造时获取正确信息
   * @param {ItemBase} itm
   * @param {CanvasRenderingContext2D} _ctx
   * @param {number} centerX 中心x坐标
   * @param {number} centerY 中心y坐标
   * @param {number} R 半径
   */
  static IOC(itm, ctor, _ctx, centerX, centerY, R) {
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
    itm.__tlx = centerX - R - 3 // 注入中心点坐标
    itm.__tly = centerY - R - 3 // 注入中心点坐标
    itm.rerender = width => { // 注入重绘函数
      itm.borderWidth = width
      _ctx.clearRect(itm.__tlx, itm.__tly, (R + 2) * 2, (R + 2) * 2)
      itm.render(_ctx)
    }
  }

  constructor(GX = 36, GY = 24) {

    this.__testMode = localStorage.getItem('debug_mode') === '1'

    /**
     * 控制怪物升级的参数
     */
    this.count = this.__testMode ? 50 : 0

    /**
     * 控制怪物升级的步长
     */
    this.stepDivide = this.__testMode ? 4 : 8

    this.tick = 0

    // debug only
    window.g = this

    this.gridX = GX
    this.gridY = GY

    /**
     * 不考虑围墙的起点的方格坐标
     */
    this.OriginGrid = {
      x: 0,
      y: GY / 2 - 1
    }

    /**
     * - 考虑围墙后的终点的方格坐标
     * - x,y和canvas的x,y是颠倒的
     */
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

    Game.callTowerFactory = this.towerCtl.Factory.bind(this.towerCtl)
    Game.callTowerList = () => this.towerCtl.towers
    Game.callMonsterList = () => this.monsterCtl.monsters

    // 传奇宝石 升级点数
    this.updateGemPoint = this.__testMode ? 1e14 : 0

    Object.defineProperty(Game, 'updateGemPoint', {
      get: () => this.updateGemPoint,
      set: v => {
        this.updateGemPoint = v
      },
      enumerable: true
    })
    
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

    this.useClassicRenderStyle = 'OffscreenCanvas' in window ? false : true
  }

  get moneyOnDispaly() {
    return Tools.formatterUs.format(this.money)
  }

  get gridsWithWall() {
    return this.__inner_b_arr.concat(this.grids.map(row => [0, ...row, 0]).concat(this.__inner_b_arr))
  }

  /**
   * - 新建一个用以寻路的带围墙的Graph
   */
  makeGraph() {
    return new Astar.Graph(this.gridsWithWall)
  }

  /**
   * - 像素坐标转换到方格坐标
   * @param {Position | {x:number,y:number}} pos
   */
  coordinateToGridIndex(pos) {
    const rubbed = [Math.round(pos.x), Math.round(pos.y)]
    return [Math.max(Math.floor(rubbed[1] / this.gridSize), 0), Math.max(Math.floor(rubbed[0] / this.gridSize), 0)]
  }

  /**
   * - 像素坐标转换到方格坐标
   * - 附带所在方格的中心点像素坐标
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
   * - (inner grid index): this.grids[gx][gy]
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
   * - 对输入的起点进行寻路
   * - 终点为 grid[12][35]
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

      for (let i = 0; i < 99; i++) {
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

    if ('__grid_ix' in tower && '__grid_iy' in tower) {

      this.grids[tower.__grid_ix][tower.__grid_iy] = 1

      this.removeOutdatedPath(tower.__grid_ix, tower.__grid_iy)
    }
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
          if (selectedT && !TowerManager.independentCtors.includes(selectedT.constructor.name)) {
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
        let virtualTow = new (eval(selectedT.__ctor_name))
        const descriptionChuned = _.cloneDeep(virtualTow.descriptionChuned)
        virtualTow.destory()
        virtualTow = null
        TowerBase.prototype.renderStatusBoard.call(
          {
            position: mousePos,
            informationSeq: [[selectedT.__dn, '']],
            descriptionChuned,
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
      const selectedM = this.monsterCtl.monsters.find(m => m.position.equal(mousePos, m.radius))
      if (selectedT) {
        // @todo add delay
        // setTimeout(() => {
          
        // })
        this.statusBoardOnTower = selectedT
        
        selectedT.renderRange(this.contextCtl._get_mouse)
        selectedT.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, true, this.detailFunctionKeyDown)
      }
      else if (selectedM) {
        selectedM.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, false, false)
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
        left: this.leftAreaWidth + 150 + 'px'
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

    new ButtonOnDom({
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

    this.OriginPosition = new Position(
      (this.OriginGrid.x + 0.5) * this.gridSize,
      (this.OriginGrid.y + 0.5) * this.gridSize
    )

    this.DestinationPosition = new Position(
      (this.DestinationGrid.y - 0.5) * this.gridSize,
      (this.DestinationGrid.x - 0.5) * this.gridSize
    )

    Game.callOriginPosition = () => this.OriginPosition.copy()

    Game.callDestinationPosition = () => this.DestinationPosition.copy()

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
    // this.contextCtl.createCanvasInstance('off_screen_render', null, innerHeight, Math.ceil(innerHeight * areaAspectRatio), true)
    this.contextCtl.createCanvasInstance('off_screen_render', null, null, null, true)

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
            console.log('mouse click axis: ' + mousePos)
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
      this.contextCtl.refreshText('[ Test Mode ]', null, new Position(10, 25), new Position(8, 5), 120, 26, 'rgba(2,2,2,1)', true, '10px TimesNewRoman')
    }

    this.contextCtl.refreshText('鼠标点击选取建造，连点两次鼠标右键出售已建造的塔', null, new Position(this.leftAreaWidth + 30, 30), new Position(this.leftAreaWidth + 28, 10), this.rightAreaWidth, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
    this.contextCtl.refreshText('出现详情时按[Ctrl]切换详细信息和说明', null, new Position(this.leftAreaWidth + 30, 70), new Position(this.leftAreaWidth + 28, 50), this.rightAreaWidth, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')

    const tsAeraRectTL = new Position(this.leftAreaWidth + 30, 90)
    const tsMargin = this.gridSize / 2 - 2
    const tsItemRadius = this.gridSize / 2 + 5

    const oneTsWidth = tsMargin + 2 * tsItemRadius
    const chunkSize = Math.floor((this.rightAreaWidth - tsItemRadius - 30) / oneTsWidth)
    const chunkedTowerCtors = _.chunk(TowerManager.towerCtors, chunkSize)
    const tsMarginBottom = this.gridSize / 2  + 6

    // console.log(`tsMargin=${tsMargin}, oneTsWidth=${oneTsWidth}, tsItemRadius=${tsItemRadius}, chunkSize=${chunkSize}, tsMarginBottom=${tsMarginBottom}`)

    chunkedTowerCtors.forEach((ctorRow, rowIdx) => {
      rowIdx > 0 ? tsAeraRectTL.move(new PolarVector(tsMarginBottom + tsItemRadius * 2, 270)) : void(0)

      ctorRow.forEach((_t, idx) => {

        // const realIdx = rowIdx * chunkSize + idx

        const ax = tsAeraRectTL.x + oneTsWidth * idx + tsItemRadius
        const ay = tsAeraRectTL.y + tsItemRadius

        if (!_t.n.includes('$spr::')) {
          
          this.imageCtl.getImage(_t.n).then(img => {
            const temp = new ItemBase(new Position(ax, ay), tsItemRadius, 0, 'rgba(255,67,56,1)', img)
            Game.IOC(temp, _t, ctx, ax, ay, tsItemRadius)
            this.towerForSelect.push(temp)
            this.towerForSelect.sort(Tools.compareProperties('__od'))
          })
        }
        else {
          const spr_d = this.imageCtl.getSprite(_t.n.substr(6)).getClone(6)
          const temp = new ItemBase(new Position(ax, ay), tsItemRadius, 0, 'rgba(255,67,56,1)', spr_d)
          Game.IOC(temp, _t, ctx, ax, ay, tsItemRadius)
          this.towerForSelect.push(temp)
          this.towerForSelect.sort(Tools.compareProperties('__od'))
        }
      })
    })

    const ax0 = innerWidth - 236
    const ay0 = innerHeight - 10
    this.contextCtl.refreshText('金币', null, new Position(ax0, ay0), new Position(ax0 - 4, ay0 - 20), 160, 26, 'rgba(54,54,54,1)', true, '14px TimesNewRoman')
    this.imageCtl.getSprite('gold_spin').getClone(2).renderLoop(this.contextCtl._get_bg, new Position(innerWidth - 190, innerHeight - 25), 18, 18)

    const ax = innerWidth - 293
    const ay = innerHeight - 70
    this.contextCtl.refreshText('传奇宝石点数', null, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgba(54,54,54,1)', true, '14px TimesNewRoman')

    this.imageCtl.getSprite('sparkle').getClone(10).renderLoop(this.contextCtl._get_bg, new Position(innerWidth - 190, innerHeight - 85), 18, 18)
    
    const ax2 = innerWidth - 250
    const ay2 = innerHeight - 40
    this.contextCtl.refreshText('生命值', null, new Position(ax2, ay2), new Position(ax2 - 4, ay2 - 20), 160, 26, 'rgba(54,54,54,1)', true, '14px TimesNewRoman')

    this.imageCtl.getImage('heart_px').then(img => {
      
      this.contextCtl._get_bg.drawImage(img, innerWidth - 190, innerHeight - 54, 18, 18)
    })

    // this.__inner_buttons.forEach(b => b.render(this.contextCtl._get_bg))
  }

  run() {

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

  update() {

    this.tick++

    // ------------------ debug ---------------------
    if (!this.isPausing && !window.__d_stop_ms) {
      // if (this.tick === 101) {
      //   this.placeMonster(
      //     400,
      //     this.OriginPosition.copy(),
      //     'Devil'
      //   )
      // }
      if (this.tick % (this.__testMode ? 10 : 100) === 0) {
        this.placeMonster(
          Math.floor(++this.count / this.stepDivide),
          this.OriginPosition.copy(),
          _.shuffle(['Swordman', 'Axeman', 'LionMan'])[0]
        )
      }
      if (this.tick % (this.__testMode ? 501 : 1201) === 0) {
        this.placeMonster(
          Math.floor(++this.count / this.stepDivide + (this.__testMode ? 100 : 0)),
          this.OriginPosition.copy(),
          _.shuffle(['Devil', 'HighPriest'])[0]
        )
      }
    }
    // ------------------ end debug ---------------------

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

    if (this.tick % 15 === 0) {
      this.renderInformation()
      this.renderMoney()
    }
    else if (this.tick % 31 === 0) {
      this.renderGemPoint()
    }
    else if (this.tick % 61 === 0) {
      this.renderLife()
    }

    if (this.useClassicRenderStyle) {
      this.contextCtl._get_off_screen_render.clearRect(0, 0, this.contextCtl._get_off_screen_render.dom.width, this.contextCtl._get_off_screen_render.dom.height)
    }

    this.monsterCtl.render(this.contextCtl._get_off_screen_render, this.imageCtl)
    this.imageCtl.play(this.contextCtl._get_off_screen_render)

    this.bulletsCtl.render(this.contextCtl._get_off_screen_render)
    this.towerCtl.rapidRender(this.contextCtl._get_off_screen_render, this.monsterCtl.monsters)

    if (towerNeedRender) {
      this.contextCtl._get_tower.clearRect(0, 0, innerWidth, innerHeight)
      this.towerCtl.render(this.contextCtl._get_tower)
    }

    this.contextCtl._get_main._off_screen_paint()
  }

  renderMoney() {
    const ax = innerWidth - 160
    const ay = innerHeight - 10
    this.contextCtl.refreshText(this.moneyOnDispaly, null, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
  }

  renderLife() {
    const ax = innerWidth - 160
    const ay = innerHeight - 40
    this.contextCtl.refreshText(this.life, null, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
  }

  renderGemPoint() {
    const ax = innerWidth - 160
    const ay = innerHeight - 70
    this.contextCtl.refreshText(Tools.formatterUs.format(this.updateGemPoint), null, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
  }

  renderInformation() {
    const ax = innerWidth - 190
    const ay1 = innerHeight - 100
    const ay2 = ay1 - 30
    const ay3 = ay2 - 30
    // const ay4 = ay3 - 30

    // this.contextCtl.refreshText(`CH: ${Tools.chineseFormatter(this.monsterCtl.totalCurrentHealth, 2, ' ')}`, null, new Position(ax, ay1), new Position(ax - 4, ay1 - 20), 190, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')

    this.contextCtl.refreshText(`总伤害: ${Tools.chineseFormatter(this.towerCtl.totalDamage, 2, ' ')}`, null, new Position(ax, ay2), new Position(ax - 4, ay2 - 20), 190, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')

    this.contextCtl.refreshText(`总击杀: ${Tools.chineseFormatter(this.towerCtl.totalKill, 2, ' ')}`, null, new Position(ax, ay3), new Position(ax - 4, ay3 - 20), 190, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
    // this.contextCtl.refreshText(`CH: ${Tools.chineseFormatter(this.monsterCtl.totalCurrentHealth, 2, ' ')}`, null, new Position(ax, ay4), new Position(ax - 4, ay4 - 20), 190, 26, 'rgba(24,24,24,1)', true, '14px TimesNewRoman')
  }

}

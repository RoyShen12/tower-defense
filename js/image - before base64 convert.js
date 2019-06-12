class AnimationSprite {

  /**
   * @param {Promise<ImageBitmap> | ImageBitmap} img
   * @param {number} frameRepetition 表明每一帧序列元素的重复次数，增大这个数值会在视觉上减缓动画速度 默认: 1
   */
  constructor(img, xc, yc, frameRepetition) {

    this.frameRepetition = frameRepetition || 1

    this.img = img
    if (img instanceof Promise) {
      img.then(res => this.img = res)
    }

    this.xcount = xc
    this.ycount = yc

    this.totalFrame = xc * yc
    this.nextFrameIndex = 0

    this.lastRAF = null

    this.isDead = false
  }

  get realNextFrameIndex() {
    return Math.floor(this.nextFrameIndex / this.frameRepetition)
  }

  get isFinish() {
    return this.isDead || this.realNextFrameIndex >= this.totalFrame
  }

  /**
   * 动画循环的单个节点
   * 在需要时递归
   * @param {CanvasRenderingContext2D} context
   * @param {Position} positionTL
   * @param {boolean} endless 是否在帧序列完成后从头开始循环
   * @param {boolean} trusteeshipedClearing 是否由上层框架托管每帧前清理工作
   * @param {boolean} recirculation 是否递归执行自身完成一次或已上次的帧序列播放，设置为[true]则控制步进等逻辑将由上层框架接管
   * @param {() => void} callback 动画完成后执行的回调函数
   */
  renderOneFrame(context, positionTL, width, height, delay, endless, trusteeshipedClearing, recirculation, callback) {
    // 游戏一开始就会调用此函数，此时可能图片可能仍是Promise
    if (this.img instanceof Promise) return this.img.then(() => this.renderOneFrame(...arguments))

    if (this.isFinish) {
      if (endless) {
        this.nextFrameIndex = 0
      }
      else {
        setTimeout(() => {
          if (!trusteeshipedClearing) {
            context.clearRect(positionTL.x, positionTL.y, width, height)
            if (callback instanceof Function) callback()
          }
        }, delay)
        return
      }
    }

    const w = this.img.width / this.xcount
    const h = this.img.height / this.ycount
    const x = (this.realNextFrameIndex % this.xcount) * w
    const y = Math.floor(this.realNextFrameIndex / this.xcount) * h

    if (!trusteeshipedClearing) context.clearRect(positionTL.x, positionTL.y, width, height)
    context.drawImage(this.img, x, y, w, h, positionTL.x, positionTL.y, width, height)

    this.nextFrameIndex++

    if (recirculation) {

      this.lastRAF = requestAnimationFrame(() => {
        this.renderOneFrame(context, positionTL, width, height, delay, endless, trusteeshipedClearing, true)
      })
    }
  }

  /**
   * 循环播放一次动画并结束
   * @param {CanvasRenderingContext2D} context
   * @param {Position} positionTL
   */
  render(context, positionTL, width, height, delay = 0, callback) {

    if (this.realNextFrameIndex !== 0 || this.realNextFrameIndex !== this.totalFrame) {
      cancelAnimationFrame(this.lastRAF)
    }

    this.nextFrameIndex = 0

    this.lastRAF = requestAnimationFrame(() => {
      this.renderOneFrame(context, positionTL, width, height, delay, false, false, true, callback)
    })
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {Position} positionTL
   * @param {boolean} trusteeshipClearing 是否由上层框架托管每帧前清理工作
   */
  renderLoop(context, positionTL, width, height, trusteeshipedClearing = false) {
    // 游戏一开始就会调用此函数，此时可能图片可能仍是Promise
    if (this.img instanceof Promise) return this.img.then(() => this.renderLoop(...arguments))

    if (this.realNextFrameIndex !== 0 || this.realNextFrameIndex !== this.totalFrame) {
      cancelAnimationFrame(this.lastRAF)
    }

    this.nextFrameIndex = 0

    this.lastRAF = requestAnimationFrame(() => {
      this.renderOneFrame(context, positionTL, width, height, 0, true, trusteeshipedClearing, true)
    })
  }

  terminateLoop() {
    cancelAnimationFrame(this.lastRAF)
    this.isDead = true
  }

  getClone(fr) {
    return new AnimationSprite(this.img, this.xcount, this.ycount, fr)
  }
}

class HostedAnimationSprite {

  /**
   * @param {AnimationSprite} sp
   */
  constructor(sp, pos, w, h, delay, endless, waitFrame) {

    this.sp = sp
    this.waitFrame = waitFrame || 0

    this.render = function (ctx) {
      if (this.waitFrame === 0) this.sp.renderOneFrame(ctx, pos, w, h, delay || 0, endless, true, false)
      else this.waitFrame--
    }
  }
}

class ImageManger {

  constructor() {
    /**
     * @type {Map<string, ImageBitmap> | Map<string, Promise<ImageBitmap>>}
     */
    this.bitmapMapping = new Map()

    /** @type {Map<string, AnimationSprite>} */
    this.spriteMapping = new Map()

    this.loadImages()
    this.loadSpriteSheets()

    /**
     * @type {HostedAnimationSprite[]}
     */
    this.onPlaySprites = []
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  play(ctx) {
    this.onPlaySprites = this.onPlaySprites.filter(as => {
      if (!as.sp.isFinish) as.render(ctx)
      return !as.sp.isFinish
    })

    // console.log(`ImageManger.onPlaySprites.length: ${this.onPlaySprites.length}`)
  }

  loadImages() {
    [
      { name: 'm_dirt_0', url: 'img/tile_dirt_0.png' },
      { name: 'm_dirt_1', url: 'img/tile_dirt_1.png' },
      { name: 'm_dirt_2', url: 'img/tile_dirt_2.png' },
      { name: 'm_dirt_3', url: 'img/tile_dirt_3.png' },
      { name: 'm_grass', url: 'img/tile_grass.png' },

      { name: 'cannon0', url: 'img/t_canon_0.png' },
      { name: 'cannon1', url: 'img/t_canon_1.png' },
      { name: 'cannon2', url: 'img/t_canon_2.png' },

      { name: 'laser0', url: 'img/t_laser_0.png' },
      { name: 'laser1', url: 'img/t_laser_1.png' },
      { name: 'laser2', url: 'img/t_laser_2.png' },
      { name: 'laser3', url: 'img/t_laser_3.png' },
      { name: 'laser4', url: 'img/t_laser_4.png' },

      { name: 'archer0', url: 'img/t_archer_0.png' },
      { name: 'archer1', url: 'img/t_archer_1.png' },
      { name: 'archer2', url: 'img/t_archer_2.png' },
      { name: 'archer3', url: 'img/t_archer_3.png' },

      { name: 'poison_t', url: 'img/t_poison_tower_1.png' },

      { name: 'ice', url: 'img/frost.png' },


      { name: 'tesla0', url: 'img/t_tesla_0.png' },
      { name: 'tesla1', url: 'img/t_tesla_1.png' },
      { name: 'tesla2', url: 'img/t_tesla_2.png' },

      { name: 'magic0', url: 'img/t_magic_0.png' },
      { name: 'magic1', url: 'img/t_magic_1.png' },
      { name: 'magic2', url: 'img/t_magic_2.png' },
      { name: 'magic3', url: 'img/t_magic_3.png' },

      { name: 'buff_poison', url: 'img/icon_r_status_poison.png' },
      { name: 'buff_bloody', url: 'img/icon_r_status_bloody.png' },
      { name: 'buff_burn', url: 'img/icon_r_status_burn.png' },
      { name: 'buff_freeze', url: 'img/icon_r_status_freeze.png' },
      { name: 'buff_imprecate', url: 'img/icon_r_status_imprecate.png' },
      { name: 'buff_imprison', url: 'img/icon_r_status_imprison.png' },
      { name: 'buff_transform', url: 'img/icon__r_status_transform.png' },
      { name: 'buff_shock', url: 'img/icon_r_status_shock.png' },

      { name: 'p_atk', url: 'img/icon_p_blade.png' },
      { name: 'p_spd', url: 'img/icon_p_speed.png' },
      { name: 'p_rng', url: 'img/icon_p_range.png' },
      { name: 'p_slc', url: 'img/icon_arrow2.png' },
      { name: 'p_shd', url: 'img/icon_p_armor.png' },
      { name: 'p_ruby', url: 'img/icon_ruby.png' },

      { name: 'star1', url: 'img/star_1.png' },
      { name: 'star2', url: 'img/star_2.png' },
      { name: 'star3', url: 'img/star_3.png' },
      { name: 'star_m', url: 'img/star_small.png' },

      { name: 'heart_px', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOtwAADrcBHI9bQQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAG6SURBVGiB7ZixSgNBEIa/U4lgbRrR1iKYQtDeTh8gRR7ApxCrIIhYWFhHyQukVMFH0KSwsNAymsbKUiFZi+Pi7sjdxiTn7cr+MMV/82ezPzN37E5ENoZAZNEk+AQWx9R+AKUxtQqYS0umJnxBMFA0pIEecc8pQHUhUvqDjGjGPa0/amnrtvRcE0pp6/SBYy1O43dQl/SyDHiHYMAFjPprH5TSo1IZqjTU6wMl9VpUtXWrGTpbdEAda7EjXhvvKxAM5A0luDzXLGT+ulYz9ZFBM80/ZO9rbGwAtxrviLzzFXgUfF1w5w3YWsh5AzZkG2g04r5PogC8Cr4puPMVWBH8XXDnDdjwzw202+bJpFz+o219Y1nwVcGdr8CS4APBnTdgg/cG5Me9h9ZmXX5+d/OGAk403gfOTckLsJYQ7ysQDBQN2wHHmI0OyMfxGfGwFOJ34MBMh9mo0/DewG8P+aML0i5wM+GfXmHemS+A5wn35X0FgoGiMc1F9w7YSsg1sJcifAOaGn8CLk3JPbA9ySa8r0AwUDRmOewxjkpHwLyWODS1Qy09FbyvQDBQNPIceNoGyzOB9xUIBorGFyQVtngCRvTRAAAAAElFTkSuQmCC' },
      { name: 'normal_arrow', url: 'img/b_arrow_1.png' },
      // { name: 'flame_arrow', url: 'img/b_arrow_flame.png' },
    ].forEach(wl => {
      const imgEle = new Image()
      // imgEle.crossOrigin = 'anonymous'
      imgEle.src = wl.url
      this.bitmapMapping.set(wl.name, new Promise(res => {
        imgEle.onload = async () => {
          res(await createImageBitmap(imgEle, 0, 0, imgEle.width, imgEle.height))
        }
      }))
    })
    this.bitmapMapping.forEach((v, k, m) => v.then(r => m.set(k, r)))
  }

  loadSpriteSheets() {
    [
      { name: 'explo_1', url: 'img/explosion 1.png', x: 8, y: 8 },
      { name: 'explo_2', url: 'img/explosion 2.png', x: 8, y: 8 },
      { name: 'explo_3', url: 'img/explosion 3.png', x: 8, y: 8 },
      { name: 'explo_4', url: 'img/explosion 4.png', x: 8, y: 8 },

      { name: 'smoke_1', url: 'img/smoke_11x1.png', x: 11, y: 1 },

      { name: 'level_up', url: 'img/level_up_8x1.png', x: 8, y: 1 },
      { name: 'rank_up', url: 'img/prom_8x1.png', x: 8, y: 1 },

      { name: 'magic_1', url: 'img/magic_1.png', x: 5, y: 1 },
      { name: 'magic_2', url: 'img/magic_2.png', x: 6, y: 5 },
      { name: 'magic_3', url: 'img/magic_3_29x1.png', x: 29, y: 1 },

      { name: 'ciy_phoenix', url: 'img/icy_phoenix_17x1.png', x: 17, y: 1 },
      { name: 'icicle', url: 'img/icicle_1_10x1.png', x: 10, y: 1 },

      { name: 'healing_1', url: 'img/heal_11x1.png', x: 11, y: 1 },

      { name: 'sparkle', url: 'img/sparkle.png', x: 8, y: 4 },

      { name: 'explo_mushroom', url: 'img/explosion_kd.png', x: 11, y: 1 },

      { name: 'gold_spin', url: 'img/coin48.png', x: 61, y: 1 },
      { name: 'gold_spin_small', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASAAAAAgBAMAAABA2rgHAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAFVBMVEUAAAByaD7/+Dr41jToyDHftQAAAAA4ZxT8AAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAJZSURBVFjD7ZbbkeMgEEWtDAYQAdDCAUDbAUhGAWgs8k9lG3vXXHCNt+Zrt2rc9s+REBwu6HE4vOtd7/qZNSj18T/xQTtyDWtSyKpjTRrbD5rIfSC7juX6lyz9odHAmiM2YMMaOXTsk2Ng7VNawFCxTotCNqxe8cSOccYyIWKHLDNoeCaHfJkWiEj8Fvk/DCUgH08OmdzccOkfmCk2EZnQCpnAjELGOg6dkAkVk1/8kh4NtAlFCJnDUSEbDsA6UjTNAE8JkWvOj+5VQk9C94SQyXkUcIFcJ6RhANlCkaa6iQZWHAKy9riJBj9Nvm6ioeiU3+8Dg2O9xLjoyoZH0sBKIgOeiCaHA1AnREoSQtZHuQ86IfpaiDoh0mRRiJQk1AvhAGREiDshZCtCpnIi8nMVSgtJ+fRngJlGOZLGyiJ0HIGLEDCLUKCxDsDm3Ajdlgx5lCVDoeu0z3XJ0po/j3mvQjyu8QxCZck8CpQlQ450DQxCZJiurxIafZvQZUqYUCq3fcKEUjy1CTVCTwmdibuEIvF3EipC/LUQd0J/TYhlySChg90+JbMDcN4C8lgOVB4v02q3evou9Dhg7bbH04yct10hh7wBy4452q12KA/CT5oalgcjsp05AFsRggfjk5AJIrQhc1hR4PZgBMFIR9MMsOV8bdhm1fCccQJ2zZjQsKdV/nVJJaG8b8h5mxsu/QOfc7aVyyaxzA3jlrm/XBuWOLC93RMEVF6eEtp3Xq7MW/NyvW2ahmUGyKpjmy22H2zOzQRLfw3L9S+5Dejff5A9faC9613v+jn1C7xOoJfCZbPNAAAAAElFTkSuQmCC', x: 9, y: 1 },

      { name: 'm_act_white_sword', url: 'img/ACT_white_sworder.png', x: 6, y: 6 },
      { name: 'm_act_green_axe', url: 'img/ACT_green_axeman.png', x: 4, y: 8 },
      { name: 'm_lion', url: 'img/m_lion_mon.png', x: 4, y: 1 },
      { name: 'm_b_worm_dragon', url: 'img/mb_red_worm_dragon_8x31.png', x: 8, y: 31 },
      { name: 'm_spider', url: 'img/m_spider_purple_50x1.png', x: 50, y: 1 },
      { name: 'm_devil', url: 'img/m_devil_6x1.png', x: 6, y: 1 },
    ].forEach(v => {
      const imgEle = new Image()
      imgEle.src = v.url
      this.spriteMapping.set(v.name, new AnimationSprite(new Promise(res => {
        imgEle.onload = async () => {
          res(await createImageBitmap(imgEle, 0, 0, imgEle.width, imgEle.height))
        }
      }), v.x, v.y))
    })
  }

  getImage(name) {
    return this.bitmapMapping.get(name)
  }

  getSprite(name) {
    return this.spriteMapping.get(name)
  }
}
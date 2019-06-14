
function run() {

  // window.__global_debug = 1

  document.oncontextmenu = function (e) { e.preventDefault() }

  const game = new Game(6 * 6, 4 * 6)

  game.init()

  game.run()

  // report
  // window.__enable_live_log = false

  // setInterval(() => {
  //   if (window.__enable_live_log) {
  //     console.clear()
  //     const mc = game.monsterCtl.monsters.length
  //     const mh = _.sumBy(game.monsterCtl.monsters, '__inner_current_health')
  //     const mml = game.monsterCtl.monsters.length > 0 ? `, max level: ${_.maxBy(game.monsterCtl.monsters, '__inner_level').__inner_level}` : ''
  //     const mmh = game.monsterCtl.monsters.length > 0 ? `, max health: ${_.maxBy(game.monsterCtl.monsters, 'maxHealth').maxHealth}` : ''
  //     console.log(`monster count: ${mc}, health: ${mh}${mml}${mmh}`)
  //     game.towerCtl.towers.forEach(t => {
  //       t.__total_damage > 0 ?
  //         console.log(`${t.name.padEnd(16)} dmg: ${Tools.chineseFormatter(t.__total_damage, 2)}`) :
  //         void (0)
  //     })
  //   }
  // }, 1000)

}

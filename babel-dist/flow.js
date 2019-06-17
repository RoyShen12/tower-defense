function run() {
  // window.__global_debug = 1
  document.oncontextmenu = function (e) {
    e.preventDefault();
  };

  const game = new Game(6 * 6, 4 * 6);
  game.init();
  game.run();
}
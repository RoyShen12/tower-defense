function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let SummonPair = function SummonPair(monsterType, amount, level) {
  _classCallCheck(this, SummonPair);

  this.monsterCtor = MonsterManager.monsterCtors[monsterType];
  this.amount = amount;
  this.level = level;
};

let Wave = function () {
  function Wave(seq, interval) {
    _classCallCheck(this, Wave);

    this.sequence = seq;
    this.interval = interval;
    this.lastSummonTime = performance.now();
    this.isFinished = false;
  }

  _createClass(Wave, [{
    key: "run",
    value: function run(placeMonsterFx) {
      if (this.canSummon) {
        const pair = this.sequence.pop();

        for (let i = 0; i < pair.amount; i++) {
          placeMonsterFx(pair.monsterCtor, pair.level);
        }
      }

      if (this.sequence.length === 0) {
        this.isFinished = true;
      }
    }
  }, {
    key: "canSummon",
    get: function () {
      return performance.now() - this.lastSummonTime > this.interval;
    }
  }]);

  return Wave;
}();

let Stage = function () {
  function Stage() {
    _classCallCheck(this, Stage);

    this.waves = [];
  }

  _createClass(Stage, [{
    key: "push",
    value: function push(wave) {
      this.waves.push(wave);
    }
  }, {
    key: "pop",
    value: function pop() {
      return this.waves.pop();
    }
  }, {
    key: "peek",
    value: function peek() {
      return this.waves[this.waves.length - 1];
    }
  }, {
    key: "update",
    value: function update(bindedFx) {
      this.waves = this.waves.filter(wav => {
        wav.run(bindedFx);
        return !wav.isFinished;
      });
    }
  }]);

  return Stage;
}();
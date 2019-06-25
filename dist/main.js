var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static distancePow2(a, b) {
        return Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2);
    }
    static distance(a, b) {
        return Math.sqrt(this.distancePow2(a, b));
    }
    copy() {
        return new Position(this.x, this.y);
    }
    dithering(amp, minimalAmp = 0) {
        this.x += Tools.randomSig() * _.random(minimalAmp, amp, true);
        this.y += Tools.randomSig() * _.random(minimalAmp, amp, true);
        return this;
    }
    move(speedVec) {
        if (speedVec instanceof PolarVector) {
            const baseUint = new Vector(1, 0).rotate(speedVec.theta).multiply(speedVec.r);
            this.x += baseUint.x;
            this.y += baseUint.y;
        }
        else {
            this.x += speedVec.x;
            this.y += speedVec.y;
        }
        return this;
    }
    moveTo(pos, speedValue) {
        if (!speedValue) {
            this.x = pos.x;
            this.y = pos.y;
        }
        else {
            const speedVec = Vector.unit(pos.x - this.x, pos.y - this.y).multiply(speedValue);
            this.x += speedVec.x;
            this.y += speedVec.y;
        }
        return this;
    }
    equal(other, epsilon = 0) {
        return Math.abs(this.x - other.x) <= epsilon && Math.abs(this.y - other.y) <= epsilon;
    }
    outOfBoundary(boundaryTL, boundaryBR, epsilon = 0) {
        return boundaryTL.x - this.x > epsilon || boundaryTL.y - this.y > epsilon || this.x - boundaryBR.x > epsilon || this.y - boundaryBR.y > epsilon;
    }
    toString() {
        return `<${Tools.roundWithFixed(this.x, 1)}, ${Tools.roundWithFixed(this.y, 1)}>`;
    }
}
Position.O = new Position(0, 0);
class PolarVector {
    constructor(length, direction) {
        this.r = length;
        this.theta = Math.PI / -180 * direction;
    }
    dithering(thetaAmp, rAmp) {
        this.theta += Tools.randomSig() * Math.random() * thetaAmp;
        if (rAmp)
            this.r += Tools.randomSig() * Math.random() * rAmp;
        return this;
    }
    multiply(f) {
        const p = this.copy();
        p.r *= f;
        return p;
    }
    normalize() {
        const p = this.copy();
        p.r = 1;
        return p;
    }
    copy() {
        const t = new PolarVector(0, 0);
        t.r = this.r;
        t.theta = this.theta;
        return t;
    }
    toString() {
        return `(${Tools.roundWithFixed(this.r, 1)}, ${Tools.roundWithFixed(this.theta / Math.PI, 3)}π)`;
    }
}
class Vector extends Position {
    constructor(x, y) {
        super(x, y);
    }
    static unit(x, y) {
        const u = new Vector(x, y);
        const dvd = u.length();
        return u.divide(dvd);
    }
    toPolar() {
        return new PolarVector(this.length(), Math.atan(this.y / this.x));
    }
    copy() {
        return new Vector(this.x, this.y);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const inv = 1 / this.length();
        return new Vector(this.x * inv, this.y * inv);
    }
    negate() {
        return new Vector(-1 * this.x, -1 * this.y);
    }
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    multiply(f) {
        return new Vector(this.x * f, this.y * f);
    }
    divide(f) {
        const invf = 1 / f;
        return new Vector(this.x * invf, this.y * invf);
    }
    rotate(angle, center = { x: 0, y: 0 }) {
        return new Vector((this.x - center.x) * Math.cos(angle) - (this.y - center.y) * Math.sin(angle) + center.x, (this.x - center.x) * Math.sin(angle) + (this.y - center.y) * Math.cos(angle) + center.y);
    }
}
Vector.zero = new Vector(0, 0);
class GemBase {
    constructor() {
        this.level = 0;
        this.tower = null;
    }
    static get gemName() {
        return '传奇宝石';
    }
    static get price() {
        return 0;
    }
    static get imgSrc() {
        return '';
    }
    static get priceSpan() {
        const key = `_c_span_gem_${this.name}`;
        if (Tools.Dom._cache.has(key)) {
            return Tools.Dom._cache.get(key);
        }
        else {
            const span1 = document.createElement('span');
            span1.textContent = '价格';
            span1.style.marginRight = '1em';
            const span2 = document.createElement('span');
            span2.textContent = '$ ' + Tools.formatterUs.format(this.price);
            Tools.Dom._cache.set(key, [span1, span2]);
            return [span1, span2];
        }
    }
    static get maxLevel() {
        return 200;
    }
    static get stasisDescription() {
        return '';
    }
    get gemName() {
        return this.constructor.gemName;
    }
    get imgSrc() {
        return this.constructor.imgSrc;
    }
    get maxLevelHuman() {
        return isFinite(this.constructor.maxLevel) ? (this.constructor.maxLevel + '  级') : '∞';
    }
    get levelUpPoint() {
        return 0;
    }
    get isMaxLevel() {
        return this.level >= this.constructor.maxLevel;
    }
    get description() {
        return '';
    }
    levelUp(currentPoint) {
        if (this.isMaxLevel)
            return 0;
        if (this.levelUpPoint > currentPoint) {
            return 0;
        }
        else {
            const cost = this.levelUpPoint;
            this.level += 1;
            return cost;
        }
    }
}
class PainEnhancer extends GemBase {
    constructor() {
        super();
        this.bleedDuration = 3000;
        this.bleedInterval = 500;
    }
    initEffect() { }
    attackHook() { }
    killHook() { }
    tickHook() { }
    damageHook() { }
    static get gemName() {
        return '撕裂';
    }
    static get price() {
        return 25000;
    }
    static get maxLevel() {
        return 1000;
    }
    static get imgSrc() {
        return 'data:image/png;base64,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';
    }
    static get chance() {
        return 0.5;
    }
    static get baseBleedDamageRatio() {
        return 300;
    }
    static get bleedDamageRatioLevelMx() {
        return 25;
    }
    static get stasisDescription() {
        return `攻击敌人有 ${this.chance * 100}% 的几率使其流血，在 3 秒内受到 ${Tools.roundWithFixed(this.baseBleedDamageRatio * 100, 1)}% （+${Tools.roundWithFixed(this.bleedDamageRatioLevelMx * 100, 1)}%/等级）攻击力的伤害`;
    }
    static get __base_description() {
        return `攻击敌人有 ${this.chance * 100}% 的几率使其流血，在 3 秒内受到 $% 攻击力的伤害`;
    }
    get chance() {
        return PainEnhancer.chance;
    }
    get description() {
        return PainEnhancer.__base_description.replace('$', (this.bleedDamageRatio * 100).toFixed(1));
    }
    get levelUpPoint() {
        return (this.level + 1) * 40;
    }
    get bleedDotCount() {
        return this.bleedDuration / this.bleedInterval;
    }
    get bleedDamageRatio() {
        return PainEnhancer.baseBleedDamageRatio + this.level * PainEnhancer.bleedDamageRatioLevelMx;
    }
    hitHook(thisTower, monster) {
        if (Math.random() < this.chance) {
            Tools.installDot(monster, 'beBloodied', this.bleedDuration, this.bleedInterval, Math.round(thisTower.Atk * this.bleedDamageRatio / this.bleedDotCount), false, thisTower.recordDamage.bind(thisTower));
        }
    }
}
class SimplicitysStrength extends GemBase {
    attackHook() { }
    hitHook() { }
    killHook() { }
    tickHook() { }
    damageHook() { }
    static get gemName() {
        return '力量精魄';
    }
    static get price() {
        return 18000;
    }
    static get maxLevel() {
        return Infinity;
    }
    static get imgSrc() {
        return 'data:image/png;base64,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';
    }
    static get baseAttackAddition() {
        return 0.5;
    }
    static get attackAdditionLevelMx() {
        return 0.1;
    }
    static get stasisDescription() {
        return `提高攻击力 ${Tools.roundWithFixed(this.baseAttackAddition * 100, 1)}%（+${Tools.roundWithFixed(this.attackAdditionLevelMx * 100, 1)}%/等级）`;
    }
    static get __base_description() {
        return '提高攻击力 $%';
    }
    constructor() {
        super();
    }
    get description() {
        return SimplicitysStrength.__base_description.replace('$', (this.attackAddition * 100).toFixed(1));
    }
    get levelUpPoint() {
        return (this.level + 1) * 8;
    }
    get attackAddition() {
        return SimplicitysStrength.baseAttackAddition + this.level * SimplicitysStrength.attackAdditionLevelMx;
    }
    initEffect(thisTower) {
        this.tower = thisTower;
        this.tower.__atk_ratio = 1 + this.attackAddition;
    }
    levelUp(currentPoint) {
        const ret = super.levelUp(currentPoint);
        this.tower.__atk_ratio = 1 + this.attackAddition;
        return ret;
    }
}
class GogokOfSwiftness extends GemBase {
    attackHook() { }
    hitHook() { }
    killHook() { }
    tickHook() { }
    damageHook() { }
    static get gemName() {
        return '迅捷精魄';
    }
    static get maxLevel() {
        return 100;
    }
    static get price() {
        return 50000;
    }
    static get imgSrc() {
        return 'data:image/png;base64,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';
    }
    static get baseHasteAddition() {
        return 0.15;
    }
    static get hasteAdditionLevelMx() {
        return 0.035;
    }
    static get stasisDescription() {
        return `提高攻击速度 ${Tools.roundWithFixed(this.baseHasteAddition * 100, 1)}%（+${Tools.roundWithFixed(this.hasteAdditionLevelMx * 100, 1)}%/等级）`;
    }
    static get __base_description() {
        return '提高攻击速度 $%';
    }
    constructor() {
        super();
    }
    get description() {
        return GogokOfSwiftness.__base_description.replace('$', (this.hasteAddition * 100).toFixed(1));
    }
    get levelUpPoint() {
        return (this.level + 1) * 32 + 15;
    }
    get hasteAddition() {
        return GogokOfSwiftness.baseHasteAddition + this.level * GogokOfSwiftness.hasteAdditionLevelMx;
    }
    initEffect(thisTower) {
        this.tower = thisTower;
        this.tower.__hst_ps_ratio = 1 + this.hasteAddition;
    }
    levelUp(currentPoint) {
        const ret = super.levelUp(currentPoint);
        this.tower.__hst_ps_ratio = 1 + this.hasteAddition;
        return ret;
    }
}
class MirinaeTeardropOfTheStarweaver extends GemBase {
    constructor() {
        super();
        this.lastHitTime = performance.now();
    }
    initEffect() { }
    attackHook() { }
    killHook() { }
    damageHook() { }
    static get gemName() {
        return '星辰之泪';
    }
    static get price() {
        return 120000;
    }
    static get maxLevel() {
        return 1000;
    }
    static get imgSrc() {
        return 'data:image/png;base64,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';
    }
    static get chance() {
        return .1;
    }
    static get baseChitDamageRatio() {
        return 50;
    }
    static get chitDamageRatioLevelMx() {
        return 1.2;
    }
    static get Hst() {
        return 2000;
    }
    static get stasisDescription() {
        return `击中时有 ${this.chance * 100}% 的几率 [重击] 附近的一名敌人，每 ${this.Hst / 1000} 秒 [重击] 一名随机敌人 (需要25级) [重击]: 对目标造成 ${Tools.roundWithFixed(this.baseChitDamageRatio * 100, 1)}%（+${Tools.roundWithFixed(this.chitDamageRatioLevelMx * 100, 1)}%/等级）攻击力的伤害`;
    }
    static get __base_description() {
        return `击中时有 ${this.chance * 100}% 的几率 [重击] 附近的一名敌人，每 ${this.Hst / 1000} 秒 [重击] 一名随机敌人 (需要25级) [重击]: 对目标造成 $% 攻击力的伤害`;
    }
    get chance() {
        return MirinaeTeardropOfTheStarweaver.chance;
    }
    get chitDamageRatio() {
        return MirinaeTeardropOfTheStarweaver.baseChitDamageRatio + this.level * MirinaeTeardropOfTheStarweaver.chitDamageRatioLevelMx;
    }
    get Hst() {
        return MirinaeTeardropOfTheStarweaver.Hst;
    }
    get description() {
        return MirinaeTeardropOfTheStarweaver.__base_description.replace('$', (this.chitDamageRatio * 100).toFixed(1));
    }
    get levelUpPoint() {
        return (this.level + 1) * 78;
    }
    get canHit() {
        return this.level >= 25 && performance.now() - this.lastHitTime > this.Hst;
    }
    chit(thisTower, target) {
        target.health -= thisTower.Atk * this.chitDamageRatio * (1 - target.armorResistance);
        thisTower.recordDamage(target);
        const w = 82;
        const h = 50;
        const position = new Position(target.position.x - w / 2, target.position.y - h / 2);
        Game.callAnimation('magic_2', position, w, h, 1, 2);
    }
    hitHook(thisTower, monster) {
        if (Math.random() < this.chance) {
            this.chit(thisTower, monster);
        }
    }
    tickHook(thisTower, monsters) {
        if (this.canHit && monsters.length > 0) {
            const t = _.shuffle(monsters)[0];
            this.chit(thisTower, t);
            this.lastHitTime = performance.now();
        }
    }
}
class BaneOfTheStricken extends GemBase {
    attackHook() { }
    killHook() { }
    tickHook() { }
    damageHook() { }
    static get gemName() {
        return '剧痛';
    }
    static get price() {
        return 65000;
    }
    static get imgSrc() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACW9GRnMAAATAAAAAAAA/jYxpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAACXZwQWcAAAgAAAAAQADWRLxrAAAVWklEQVR42u2ba3Ab13XHf4sFIYAgISxBggJBQQJEkYJJkZZoS2NZdhOGTmJ5HE/cyn1r0slMms70ezJ9ZNJpZ5J8zbfkSz+k+eC6dZM49YwnipLGshTJkmlJpCBSEiFBAPFcLp7kksSjH+7iRVIPx06dTH1m7tzdxb137/nfc84959wFfEKf0Cf0CX1Cn9D/W5I+ZP8AMClLTAJKpYYGXDbK4sfN3G8LAMWoTwZH933Nv3swAHDoqVEAsoUS712cW5y5OHsa+I6u621AWM3WtsH0sv57BUCd+a+8/Mrnvh0c3Uc8mgLAM+gGwB/0Nxr/7al/PK3r+iuA9rsKgPwbMB8Iju773rOfftIGUMyXSNxLM/PrOW5ev8O1awtIgMfr5sQXpwKLC3enU0lVAY4DA2aTOQ40uC5Xyx8rAI8qAUpL/bWXX/ncV4Kj+wjN3SZ8PQI0JUBbKTU6HT4ySia1DMDYxDAAb/7ofxZnzs+eBl4DTt9HAqbt1o6TgFbSN04jbIrGb4E+CAAKEAiO7f334QNDykhwH2/811vsciqNRoeG7azoQsQjEVUAout4vU4GvQper5PgM1MAzM6EePVf//N06EaiDsYigLPLGgB+9tzU0QDAD15/SwO+b5RFPmKBeRQVqHM4AJzqczuPH3vmSQAWbtymy2rD4+qgu1Omq1PG4+knl1/l4NhukMBslYnFssRiWfIFnfn5MCAxdijI1PPPBg4+7p9OJ7VTqeTyJIDVYv7mc1NHJ6enjrAYjqEuZ22Ors7jhdKqDixS/Wgl4VEAsBkgDDidjlOTRw4OHHvmCOfefhc1s0yX1cb+3Ta6OsVQB4J+fD4XudwqO3d2Iu8wAVAo6BQKOktLcebeD5FOpAEJkwnGJoZs7l09oxLSybyWD/z1l1/muamjnD5zEbezCwmIpVQbcJoq8Y8SAPMjrr4CTPr3eidHgvuM1b/VaORxdQAQVzcaz3w+FwAdWQHMoFchGtO4fXcVECowOxNC3tHF6IQYc/bKLU5+4Q94burodnMJAJMIVfnIpOBhAIC5AcK0P+inu6uLC7+6CLowXkqXjsMm9D0tVbFadTxewXw8pjLi8zHi8zF/9SreYQVLpX0BZ29EmTkTFTdl+LNXXsLa5QFgaNDDes1FaDEGZRRg2mq1vtbaX9c/3DZqeoQ2ChDwDnom6w/O/vztbRvu84rhdnl72eXt5cQXjzE8PgHAyPg4AN5+pa0e8Vu3HevCuQscOXak7Vlw2HcSuAR8DSENH5oeJAF1yw8wPbh7lwIQWYxs23jIK0S9Lpt1KagzvnD1CiPj41hCq40+3n4Fi0n0mA+Llbx47iJHjx1tXIcWIoQWIgSHfbz8wnHocgYW5sPfnp+/oy3Mhy9jbKf8hq73/YygYiA8iYnjwCmQbIO7Pbx39kJbw74eG0NemeVCjR6HCd3kMRyhXgA6bLvp7e8HJNRkEru8ggTkS4JhWdJxOc1IxoZcUHO8/urrXDx3kdi9GDdjGTJqjj7XTgFwfoXhET8jI37bsacPBfr6+17M54svFvLFUYSDpdHiaD2MtvgBTqcT4HvASQCPE6X1dy2bBWBsxAeAry/P1BE7AH5vB4cOgmXfIeQeocdUvwSmIXFdeYs3/u0NseJzYQCy+QJ+Q3XOXNzg3KVw23yy2XZenE4Ye8zLWHCQsce8xAkKCZtbYH5unouXFxYNiXiNbRwovdg+3hYJsFqt04fGh775wvSTypf/4vO2z77wPP/yrW/gD+xFAkKheQDcvWJFdtrX8HstQmwcMp5+kHs8mGzdBgDdTQAAKknUdBY1LYDU19bJFmooDgm/V2aPW0eSIKlWBagDZfoUGqW4Cql0gdlQjDO/CpFM5pCQGB4dZmR0hMNPHlZ6+3omQTqlZpZPAnXJWAQor5cfCsDJRHL5xcPjQ3j6e/jsiefFRAJ7mZr+A9S715mdj5BSc7h7d/L4cBXFITcAGAx6MNm6mgDU9kDtdmP83p71huj1uhVi0SQAMzfK+L0ye/t1JoYt9LtkJoYt7OhYbQPArnhx9zlw9zlIpQskkzkW5hY4/8vzqGmVtY0awweGGAkOceyZI4pvz65JSeJUKqkeB94pr5e1hwFwHJhGkpi5dpvZmRmQBAAA6t3rnDl3rSEFe3eVURwyfq/wBfodReQeD7XVogChsgG1ZZAkkHqgkqTXLbTK5VboNS/i98pkCzVmbpRZXys0Vh9g0N0OQHfvY4L5TB53n4OlZNOoqmmVq7O3UTMakgSu3h58e/oZGx/B3d8bmLu28GJ5vfwONJ2pLQDouj6gdFmnd7t22jpqNfKFIs8fe4xMJMyP/uMN/vtnP+ZuwkR/3w6cXWu4e9YZ31ehXNYpl3U6d7twujcwyUVYT4BNArkbTBmQdOiAfDpFrZhFj8fIFXMMuC0cHN5BZhlS6gqra3KjmFllfd2EtlyjWIRCPkY0FsMsFTBLBRy2MjZzGVNV1LJcZjWf4v335lm4cp6lRBFMZkYfH8Pj6VPU1PJkLld4zVCLLQAogFJc0QPFFT0AEo7uTiQgEkvx9sU5zs8kAHB0mXDYJdY2yijdEkq3MGT6qsTgsKM54o56dJgDJPJLawCsFUusFUoUSssUSjUcXSaC+8z09Ujs32ujyy4jIVEtF8TEesyARGmtxspac3iLEDwcXUKtOizQuUPomJqDrJoldC1EX38fwfEgiUhiIHI3dhm4Dtv7ARrwWjyTDcQz2UA4GufsxdktjQbd2/tQ0YU83v3d7SAQAXyAD8cA5JdSW/rFkpW2e0+fMKxrax2UihVKRaEWrp2izEcEgyvFZp98EfJNbxzXTigZYIWuhQiOB/Ht8QJMI3YK7X6OkObpdSq7ehXC0a2xh7dfbtR//txWVyJ2U6yaAOEZ46lve8CSVQb7m2DG0+sN5lvJ3mVqgAAw4hMAGOkGALqLsGtTvxkjZAldDRE6GKo/bmztrQAIz088CfQFBpWxQ6M4569y/qzo6Op14OvNAzDshSeCMOy1cmEOjHwI/oPgPjhEKZUifPo2/k9tcnW7bDj6YCO3Tqm2gSTJxFoEYk1f5/z7TWkYcsvYHTK3IhVAxjsAs4vid5MM9pbhx/fDRrkuURBNAkbCZWJyHPsOmWx77KBsJwEKMD1xaJTxw2NE5682mN9MTxyAWLpFMvpAGR3D3u/G3u8mxSzhdxYAcO52oRgRIoBryELmZlNeZ28IYK1WGY+rwv2ozvxYQEhearm9bZ3xWLK93/jkBBOT48Tu/QKET6DQogKtYa8yfnhscvzwGAALN2LbMv7VL26d3KAbSkDq2ix2txu7202HfZ3sPREtht9ZwLEviGtIiPjI83bylQ7mQoXGGIf2b+BxVYirgsFCzpAEn7jft7uj0XYsIPPmeQHArSi8dR4MR3ULTUyOc+XyVS6cn1lEeIjAVhUAmJw4NKpcfU8YPjWT37L6TwSb10ZSGG+fqEupVKO2u408YUTFuduF/+lh1ASot9YbIIwdcDAXKjB2QLzD49KIqzKJZROH9m/gdpgazANYzdtLx+17xjz625/Hs4J5gKuXrxCLxr9PS+C0WQUUp9U63VGViUViRO9FsVqhVBTi6euHl58Fu0WkA8JLYLXoePqtyDusxHNg39mcrL1Wwd6zwQxWYuEUSs8GrkEDPR3UO3Ew6Tx1eBU1InQz6NcJ+sHS6wIsyNV28K2m5vihW3l0PUYkCdEMDO8B2YhuUpowkFarE+8+D+FoiPm5iMamqNFMu/gHvD5vI86ORdrF3+duXoeXIByHqSNWPP1bY3pHr7NxPTapMHtZI+XRkbNxXHtFoOTa60GNiOBn5GkFl8/KerF9CS2bUxaZLKFbea7fLBC6lcfTKxbmmfGmRNaZTxlOr3/Ey5mfXAARIGmtZbMNmB7cPdhY/Tbm+0UBwXh4CaYmaTDfAKGryXg+k0U3gXvA2tC6TDjRYB7A5bOSuSfcWTWi091jMVa/zrDgQk+prKZVEgUr141tNjjkIJvNE0nCXcPohTZlBfwjXjHn+Vj92K4tFmhVgYDX55n2+rzEIrH7rn54qf0F261+naKhMAndyZiB7+xlDWtZR70Tx7U3IVTAuqux+gDrxSqlG/N09PY2JEBPqQ0QrkeFSoRuCbW8tQSRFovv7hF13T/wjwy2TknbVDdUQAECR58+pOhlnVvhW40jK6tZeFTVGtxJwGoZBnuF0Ussw5m3E21Mx7PN+1gK7sZ05u8KZyqlwtj+bsKxDZRkHr/XibYhoWhWXD4hEZZesPR6Wb95gYoaY9UsXJvZhQ3mbnaTWc4TSclE0mI3CCfFVup2gHsnqJKf6D3Bn90J/n0uKOsouxxaaDaibQahVQUmYave12nesLLGPAG4EII3z4vrYcPR8/Rt7ZtSwW1IdTZfRek20meFCqHbTU8zOOGhoor3yz1i5a6823RcZhc2OHPNis/d3AnqjDekzmA+Fs1y9ClxThmajRCajZxmm2xy2zYYi8SxWre6oWpOSEGvQ6x+NCMKgM0YYcFIFUZS4HXDoAGEu0Wd3S7BtNIt43SYyOaFaxu60gRhX0+77Rkb7mB2YWPLnHx91cbcAFI5SOUhFss22ngHnWL8axEN4fvXV74BhIzItw8AytHjhyd7XD1ISMTuiZUwm5rMg1CBVurYZKTNZiiUDA9Rgs4dAiF7pwBAqu1AK1SQkNAKFcplMWAmWQQkhhwRTJ3Nra+2VsPtkkmpVeZublCh0mAeYHWtxuw9CKdE4FNeb84ldD1BNJojNBv5KVDPA+i05AxbJUCL34vj7nOiJpvOud1mR1+H1WonAJ3lFt8XWK2J2mPsI62eduguuHcayU8TqFrzjXEN4pkKcoeFwT4T0XQVy80MP1518Sd/2LL3d2hcOF8CCZ56HDpuAJiIpQUI80tuUsZ8vQNuvvQ3LzW6zrx7idd/GcLZZa2vPNltcoIDCBtgW13RA1OfOaYggYRET49CLJpiVd9A1VYAiUp1g5IOJd0IRAwJKOrQbaPt7HLHDjAbjkkmJ0q5KlFcqVFcEciZZJmg39zIzt6L6qQyG4w9JhKt0UiBQr5CNCrUYClTazAfzVRY27BTKIicw3OfOsLX//7vOPzkExx+8glOvPQFLKYNzv766qgBwGV9vdwmAa0AKKsrulbIZwNHjh6yDe33gwRypQRIdNosqFqJ+DKksyL5kM5CFZGoLK5CQoP1VSgUmiWZbTKfyUFmuUoiI4qnT8Yky0iA1y1TKNVYW6uSSm+QygiGrR0bFPIV8oa9MGEilhHX+ZVaGwCObjv79uwmsbSExzsAgEXeYM9gfx2Ey/p6uREH1AGwtZZ8Pqu9e3HG1uNyKkNDfnKpGK4eO64eO7sHnNjNWSQglRVSUDZWv14swNp6s5g32VSzDJ5eme5OEzcjZWqSTCxdJb9SI79SY4dZSEYqvQES+AZoA6C4wn0BGBxwY+uQ8QwM8OZPfsLMpUvcrjsJkmSLRJOnNwMgIYygYtT1awUIuPqck8GgX/HtEXtf5G6cDrk9ATLz7qV2Dsvi65A6abl82897dum4nM37sGH07VZRvP0deHqa73j5U822VxYqWEwbhCJw3diWY8t2Fu4IAFzODk58epqJA36u3BAutprOEk+rJFKqFk+rr+jlxm7QkABousK2lt/01RU9HrmbiF+7elPL5Yq2nc4um2wSSn/4iVFOvDSF09FNLpcnlzNC2ioUCyWKhRLdDjv62lrr+yiXy0hAp+FAWgwbUrcriVyVm0tlbi6VKeo1YvEqE8Nimkm1hixV6dsJIQMAyw47q3qFVb3Kql7l6o0oyUy2UUqlEjNzCxRXVr8LvFautp8ayZuZNkr9Wf2YSc/liouRu4l4NrNMYikFkmSTgPL6OvUDpoMTj+Hqc5IwsiTFQgmzpT3gLBTLDdHrtDYBALCYYaO5w1FcrZHTaiSXa80JS9VG/3QekprcAECQuQ2ARDK5iAiCvgvEy9W26SCz/Tlaq6VsPWvTrBazBiwmllL6zKU5Wy63bMvl8vj2CM+tt8/J/qCfLoedRCzNX/3pC5z6o8+TzGgk08uUy2VWjdEkoNMiGAeRztrYNEGrSay8JEn0uyRkqdpQgVBE2AQ1KwzmU487cTl3k8xkNcS+f5pq+TXgpxhZ4M0AtPkBLbWyqTSeZYt6/foysJidjylAQJY6AgDVAQHE+Yu3mXr2OP/0rW8AEF5SkasVzr1v6GYWHD1etLV8A40OG+yS0w3vDsBleJLv3awQVStYOoSTVU/EqIWml+g/NEVoJoTdbjmtqvl66PvADyrqAGzXoBUIHnCtAdrMjTuLgBK6lagbUv75H74qwHjnAseOi7P+OgAA4cUYipFA2eXubDK9s30ibgVmb4tI78IcDyRVzWuqmq/7/XXmHwrAZinYDoh63QqAss1vi8Dk1LNPBB40UX/AS3gxRjwpLHg8WcLTb2evZ/v2dRDuR769XiJ3YtD8TPeRPqO577nAQ0B4kJpoiO0UEKt/7uzFxnUDAP8gU585Sjh0DoCZa2niyRJx1Tj8cLRLgrunmeHZjo5/WnxUEbkVrb+7NfPzgQG4HxCtYIjrcrtq6GVdARbz2exkPBxmLnSLC+8KuT33frjxTU9er6Dp4AocZWJyjKmT8IPvv8r8/C1Ka1BKQyQNit2CuiJOmiW5gJrN43SKWCGbzaOXYWx8GP+QCH0vnJ9XYPuQ/jcBYDsw6qv8INUIAJy9OMtsaIvcLgLa2Z+fhZ8TmJgca5zS/OVX/hitqDc+dliYWyCezBNPCkPp6W8y3kqjB0ca13Pvz23O+z2QPsi3wnVq9RVat8vWz1MWI7GUDUkauPT+DVskliISS2nA9XK5fN0AQQcWk/GUfvXynE1CsgHs7O3B5XYhIbEwt0Cf0kl31w6KpTWKpbUtn3UdGBvG3d+Lu9/Fqz98Q0vF1e+2jP/QT2U+7P8F6qRsc68Ak8anr3XSWj5r225XUaxd1sDw6LACaAtzC5pitwR2uYUKePodhO7k0bLC6/Tv9XLi5Almr4rTp1d/+MZrlKnn/R9JAj4qAB4FjDZG7/Pb1v5mJn2D7gDA8adGcTjaf84bCZCzv7igRe7Evk4z8/uxAXA/MB7kTyj3bW9utvENuifdrTk2wGp3EAlHtcid2HdamK8nxz92AB4GxHaAtNfmtvvApvYaZepnfYu0i/4j+QH/VwB8EDA2A7AdUHXSKG/x+B559T8uAB4ExHbAPBiA+5dHoo8TgPuB8TAQNgOwHRCPTL8rADwIkPsxvx0IrfXvNQAPA2Mz8x+Y8Tr9LyG8N0O199yAAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTA4LTE4VDAyOjA5OjUzKzA4OjAwwkGKkQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wOC0xOFQwMjowOTo1MyswODowMLMcMi0AAAAtdEVYdFNvZnR3YXJlAENyZWF0ZWQgYnkgZkNvZGVyIEdyYXBoaWNzIFByb2Nlc3Nvcn/D7V8AAAAASUVORK5CYII=';
    }
    static get maxLevel() {
        return 1000;
    }
    static get damageMakingRatioOnBoss() {
        return .75;
    }
    static get baseDamageMakingRatio() {
        return 0.01;
    }
    static get damageMakingRatioLevelMx() {
        return 0.0008;
    }
    static get stasisDescription() {
        return `你对敌人造成的每次攻击都会使敌人从你攻击中受到的伤害提高 ${Tools.roundWithFixed(BaneOfTheStricken.baseDamageMakingRatio * 100, 2)}%（+${Tools.roundWithFixed(BaneOfTheStricken.damageMakingRatioLevelMx * 100, 2)}%/等级），对首领造成的伤害提高 ${Tools.roundWithFixed(BaneOfTheStricken.damageMakingRatioOnBoss * 100, 0)}%`;
    }
    static get __base_description() {
        return `你对敌人造成的每次攻击都会使敌人从你攻击中受到的伤害提高 $%，对首领造成的伤害提高 ${Tools.roundWithFixed(BaneOfTheStricken.damageMakingRatioOnBoss * 100, 0)}%`;
    }
    constructor() {
        super();
    }
    get damageMakingRatioPerHit() {
        return BaneOfTheStricken.baseDamageMakingRatio + this.level * BaneOfTheStricken.damageMakingRatioLevelMx;
    }
    get damageMakingRatioOnBoss() {
        return BaneOfTheStricken.damageMakingRatioOnBoss;
    }
    get description() {
        return BaneOfTheStricken.__base_description.replace('$', (this.damageMakingRatioPerHit * 100).toFixed(2));
    }
    get levelUpPoint() {
        return (this.level + 1) * 16 + 40;
    }
    hitHook(thisTower, monster) {
        const oldV = thisTower.__each_monster_damage_ratio.get(monster.id) || 1;
        thisTower.__each_monster_damage_ratio.set(monster.id, oldV + this.damageMakingRatioPerHit);
    }
    initEffect(thisTower) {
        this.tower = thisTower;
        this.tower.__on_boss_atk_ratio = 1 + this.damageMakingRatioOnBoss;
    }
    levelUp(currentPoint) {
        const ret = super.levelUp(currentPoint);
        this.tower.__on_boss_atk_ratio = 1 + this.damageMakingRatioOnBoss;
        return ret;
    }
}
class GemOfEase extends GemBase {
    attackHook() { }
    hitHook() { }
    killHook() { }
    tickHook() { }
    damageHook() { }
    static get gemName() {
        return '屯宝者';
    }
    static get price() {
        return 10000;
    }
    static get maxLevel() {
        return 50;
    }
    static get imgSrc() {
        return 'data:image/png;base64,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';
    }
    static get baseGoldAddition() {
        return 500;
    }
    static get goldAdditionLevelMx() {
        return 50;
    }
    static get stasisDescription() {
        return `消灭敌人获得的金币 +${this.baseGoldAddition}（+${this.goldAdditionLevelMx}/等级）`;
    }
    static get __base_description() {
        return '消灭敌人获得的金币 +$';
    }
    constructor() {
        super();
    }
    get description() {
        return GemOfEase.__base_description.replace('$', this.goldAddition.toFixed(0));
    }
    get levelUpPoint() {
        return (this.level + 1) * 100;
    }
    get goldAddition() {
        return GemOfEase.baseGoldAddition + this.level * GemOfEase.goldAdditionLevelMx;
    }
    initEffect(thisTower) {
        this.tower = thisTower;
        this.tower.__kill_extra_gold = this.goldAddition;
    }
    levelUp(currentPoint) {
        const ret = super.levelUp(currentPoint);
        this.tower.__kill_extra_gold = this.goldAddition;
        return ret;
    }
}
class GemOfMysterious extends GemBase {
    attackHook() { }
    hitHook() { }
    killHook() { }
    tickHook() { }
    damageHook() { }
    static get gemName() {
        return '噬法者';
    }
    static get price() {
        return 500000;
    }
    static get maxLevel() {
        return 50;
    }
    static get imgSrc() {
        return 'data:image/png;base64,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';
    }
    static get basePointAddition() {
        return 4000;
    }
    static get pointAdditionLevelMx() {
        return 500;
    }
    static get stasisDescription() {
        return `消灭敌人获得的传奇点数 +${this.basePointAddition}（+${this.pointAdditionLevelMx}/等级）`;
    }
    static get __base_description() {
        return '消灭敌人获得的传奇点数 +$';
    }
    constructor() {
        super();
    }
    get description() {
        return GemOfMysterious.__base_description.replace('$', this.pointAddition.toFixed(0));
    }
    get levelUpPoint() {
        return (this.level + 1) * 100;
    }
    get pointAddition() {
        return GemOfMysterious.basePointAddition + this.level * GemOfMysterious.pointAdditionLevelMx;
    }
    initEffect(thisTower) {
        this.tower = thisTower;
        this.tower.__kill_extra_point = this.pointAddition;
    }
    levelUp(currentPoint) {
        const ret = super.levelUp(currentPoint);
        this.tower.__kill_extra_point = this.pointAddition;
        return ret;
    }
}
class BaneOfTheTrapped extends GemBase {
    attackHook() { }
    hitHook() { }
    killHook() { }
    tickHook() { }
    damageHook() { }
    static get gemName() {
        return '囚笼';
    }
    static get price() {
        return 20500;
    }
    static get imgSrc() {
        return 'data:image/png;base64,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';
    }
    static get baseDamageMakingRatioOnTrapped() {
        return 0.25;
    }
    static get damageMakingRatioOnTrappedLevelMx() {
        return 0.05;
    }
    static get stasisDescription() {
        return `对受到控制类限制效果影响的敌人造成的伤害提高 ${Tools.roundWithFixed(this.baseDamageMakingRatioOnTrapped * 100, 1)}%（+${Tools.roundWithFixed(this.damageMakingRatioOnTrappedLevelMx * 100, 1)}%/等级）`;
    }
    static get __base_description() {
        return '对受到控制类限制效果影响的敌人造成的伤害提高 $%';
    }
    constructor() {
        super();
    }
    get description() {
        return BaneOfTheTrapped.__base_description.replace('$', (this.damageMakingRatioOnTrapped * 100).toFixed(1));
    }
    get levelUpPoint() {
        return (this.level + 1) * 24 + 90;
    }
    get damageMakingRatioOnTrapped() {
        return BaneOfTheTrapped.baseDamageMakingRatioOnTrapped + this.level * BaneOfTheTrapped.damageMakingRatioOnTrappedLevelMx;
    }
    initEffect(thisTower) {
        this.tower = thisTower;
        this.tower.__on_trapped_atk_ratio = 1 + this.damageMakingRatioOnTrapped;
    }
    levelUp(currentPoint) {
        const ret = super.levelUp(currentPoint);
        this.tower.__on_trapped_atk_ratio = 1 + this.damageMakingRatioOnTrapped;
        return ret;
    }
}
class ZeisStoneOfVengeance extends GemBase {
    attackHook() { }
    killHook() { }
    tickHook() { }
    damageHook() { }
    static get gemName() {
        return '猎手之魂';
    }
    static get price() {
        return 17500;
    }
    static get maxLevel() {
        return 500;
    }
    static get imgSrc() {
        return 'data:image/png;base64,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';
    }
    static get baseDamageMakingRatioMin() {
        return 0.04;
    }
    static get baseDamageMakingRatioMax() {
        return 0.5;
    }
    static get damageMakingRatioLevelMxMin() {
        return 0.002;
    }
    static get damageMakingRatioLevelMxMax() {
        return 0.012;
    }
    static get chance() {
        return 0.2;
    }
    static get stuporDuration() {
        return 1000;
    }
    static get stasisDescription() {
        return `你和命中的敌人间隔越远，造成的伤害就越高，最少提高 ${Tools.roundWithFixed(this.baseDamageMakingRatioMin * 100, 2)}%（+${Tools.roundWithFixed(this.damageMakingRatioLevelMxMin * 100, 2)}%/等级），在最远射程时提高 ${Tools.roundWithFixed(this.baseDamageMakingRatioMax * 100, 2)}%（+${Tools.roundWithFixed(this.damageMakingRatioLevelMxMax * 100, 2)}%/等级），击中时有 ${this.chance * 100}% 的几率使敌人昏迷 ${this.stuporDuration / 1000} 秒`;
    }
    static get __base_description() {
        return `你和命中的敌人间隔越远，造成的伤害就越高，最少提高 $%，在最远射程时提高 $%，击中时有 ${this.chance * 100}% 的几率使敌人昏迷 ${this.stuporDuration / 1000} 秒`;
    }
    constructor() {
        super();
    }
    get chance() {
        return ZeisStoneOfVengeance.chance;
    }
    get damageMakingRatioMin() {
        return ZeisStoneOfVengeance.baseDamageMakingRatioMin + this.level * ZeisStoneOfVengeance.damageMakingRatioLevelMxMin;
    }
    get damageMakingRatioMax() {
        return ZeisStoneOfVengeance.baseDamageMakingRatioMax + this.level * ZeisStoneOfVengeance.damageMakingRatioLevelMxMax;
    }
    get description() {
        return ZeisStoneOfVengeance.__base_description.replace('$', (this.damageMakingRatioMin * 100).toFixed(2)).replace('$', (this.damageMakingRatioMax * 100).toFixed(2));
    }
    get levelUpPoint() {
        return (this.level + 1) * 45;
    }
    hitHook(_thisTower, monster) {
        if (Math.random() < this.chance) {
            monster.registerImprison(ZeisStoneOfVengeance.stuporDuration / 1000 * 60);
        }
    }
    initEffect(thisTower) {
        this.tower = thisTower;
        this.tower.__min_rng_atk_ratio = this.damageMakingRatioMin;
        this.tower.__max_rng_atk_ratio = this.damageMakingRatioMax;
    }
    levelUp(currentPoint) {
        const ret = super.levelUp(currentPoint);
        this.tower.__min_rng_atk_ratio = this.damageMakingRatioMin;
        this.tower.__max_rng_atk_ratio = this.damageMakingRatioMax;
        return ret;
    }
}
class EchoOfLight extends GemBase {
    initEffect() { }
    attackHook() { }
    killHook() { }
    tickHook() { }
    damageHook() { }
    static get gemName() {
        return '圣光回响';
    }
    static get price() {
        return 500000;
    }
    static get maxLevel() {
        return 1000;
    }
    static get imgSrc() {
        return 'data:image/png;base64,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';
    }
    static get baseExtraTotalDamageRatio() {
        return 0.1;
    }
    static get extraTotalDamageRatioLevelMx() {
        return 0.005;
    }
    static get duration() {
        return 3000;
    }
    static get stasisDescription() {
        return `对敌人造成非神圣伤害时会在 ${this.duration / 1000} 秒内造成相当于这次伤害 ${Tools.roundWithFixed(this.baseExtraTotalDamageRatio * 100, 0)}%（+${Tools.roundWithFixed(this.extraTotalDamageRatioLevelMx * 100, 0)}%/等级）的神圣伤害，这个效果可以叠加`;
    }
    static get __base_description() {
        return `对敌人造成非神圣伤害时会在 ${this.duration / 1000} 秒内造成相当于这次伤害 $% 的神圣伤害，这个效果可以叠加`;
    }
    constructor() {
        super();
    }
    get extraTotalDamageRatio() {
        return EchoOfLight.baseExtraTotalDamageRatio + this.level * EchoOfLight.extraTotalDamageRatioLevelMx;
    }
    get Hst() {
        return 250;
    }
    get lightDotCount() {
        return EchoOfLight.duration / this.Hst;
    }
    get description() {
        return EchoOfLight.__base_description.replace('$', (this.extraTotalDamageRatio * 100).toFixed(0));
    }
    get levelUpPoint() {
        return (this.level + 1) * 140;
    }
    hitHook(thisTower, monster) {
        let critR = 1;
        if (thisTower.critChance && Math.random() < thisTower.critChance) {
            critR = thisTower.critDamageRatio;
        }
        Tools.installDotDuplicated(monster, 'beOnLightEcho', EchoOfLight.duration, this.Hst, Math.round(thisTower.Atk * critR * thisTower.calculateDamageRatio(monster) * this.extraTotalDamageRatio / this.lightDotCount), false, thisTower.recordDamage.bind(thisTower));
    }
}
class GemOfAnger extends GemBase {
    initEffect() { }
    attackHook() { }
    hitHook() { }
    killHook() { }
    damageHook() { }
    static get gemName() {
        return '愤怒宝石';
    }
    static get price() {
        return 30000;
    }
    static get maxLevel() {
        return 2000;
    }
    static get imgSrc() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACW9GRnMAAAaAAAAAAACnSpcsAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAACXZwQWcAAAgAAAAAQADWRLxrAAAJpElEQVR42u2abVBU1xnHf8tlN5ciZnesBoqDAtZIwsRomBiQxIlibNWthEjjJM2HNjNVP3UyZiZ16vRLk0kzafolaRod23ywzWS0taZEEiKB+C4pykCZEBmXVQYGIiF7B0VuWc5uP5y792WRRNhdJC3/mZ295+Wee57/ec5znvOcA7OYxSz+n+FKdoPeuLQal+6/3RLHIT3J7UW/oTzphM8UAr5J8BmLpGrARuAMEOrqsjLz88lxmQMfT9Rt14iECbDP8Sy3yv6wDtdHrMzgZ+xRrVov6rrjfS2uB/rY9BKQ6AhEVWCLWwr4dqaXtgeXm4Wrfvd7mGNV/sM9D5D32BpqLl4CoOZiIEZAPfDABAT8EtiXKgKSbQSnioqqrX4AlhflmpnHPmmmo+3S3t5B7TxwPhUfTooGfOXNNjNqNedC16+qLNlQAUDhD9azpOuiWZbz6pto6VC11c8TT2ymaqufCydrAahvbObYJ818eq6doRH9FaQmJB1JsQF12TkAVH43B7X5jLNc11j6vbsAyPco0GMR5AMe9m+g8oePUrWhHK6FUIGGky00nWtlrupGRAVAQSqET5wAF+Pses66tfR93ODIa/jjnyQBJSsI3+G5aVOH/lEHwBc9ARpPXUiVvOOQNm1f+hocOlJ30/yGky0M62FIoRGcmg1wGeMela7v28tWAHIK8OarZrWjD66mX9ccry5cvcp8fu50Ex1A9eMbzDyhD9FwsiWWDGnX9e3AoZlFgE3x96dba/yzH/0N8cUgyrr1AIw8uJKOy04CimzPyqIcFg32Oco1p59QqEOXo0KS/YSECFiDwjPpbjNz7Z5d5N291EyL+no8aYJQVy8AvoJc0HVGT8gRFlf6IF2lVhHUpkUA0FWrvcPXNPT4fiaZgBlhA24nEloFfo2bYFyeqK+fsH7w4yZyRQTPI9JmjByQ6r9RKGwUCgAZhflm/ad7g/SFNBpT6K4l1PQIkDXPi99whdn/VzzVa52VtGHmRqQiZ0Z0SFflL/b1MWvOK/O8BC8FyVxVAsCLl4I8DZTa1P5skglI+hQIfXTK8Swu9yKCPfJ3uRdxpZeRA4cZOXDYFDoGMaiNa2/tqlKQNiclW+6ENGAzOt5hje1Gem+ml/V4Emly2jGVVaACOBZLeOc4g16fjYHvsXIz7b52zXwebWyy1N+AcqfXHPmMh1Zw9Y5Ms2zBL3bACJQ9vdXsb7KnwGQ14GC2l2oAf+UW/FsqYSwEQM37x6k5epyVX2r0DQ1bb2RkWY+qSsgZDkC1qb3weFhwp42gMR2yVHKSLLQdk7EBB4FqIOSv3BLyb6mUJGxaY1aIPdcMDFIzMDi+hZ8+hW/nU2bSU5iHssja/prP9xXLn4Gy1aWUrU6NLbhVDfAB1d6szC5/ZUWBf0ulFPTIe6YGfFtxqwRUAF35ufMLAGreO2IW2DWg5ujx8W8uzpuw0dFAt0MFR0804XEJx+gD7HphFwBnfrSVZONWCTgPhIK9AyiftnHv9xebBU0nmgkGumkwlr8yYN5wWBa6dcc6D8AYqDZDmIGtfCwMw6OgGOVzvDDHZxbrjD930BIkYDKrwM+BF9R0CoqXWt5aT6fTFyyzOS1/v38FwetDePMXys4Ge8iNWsukuNInCbhrgcz44qoU+p39ViM2AjY9spoFC/M50mN+05UoAZNZBfYBIeC37Z3BAuQurcCbYAduNybtB6jpVCONIgYBXcDeWHlZ3G7tV3HrflHcYVkGOlQY7vO/2+UUiNOAU41WhKm8PYjv0J/N/mvTTcAEiAL8DFBQaEYAUIKCG8E25Ba3GAVVjSPA63WkL/T3s/Kff7EyzrY4yvfN1dm++zWz/2ocwXq8zfkGpGSftd8Y5beQxvBd438boIfDdAth1vVoA9ynfgeA5ar0AkOnm8xyX5qHhs87AFi7rIj36x1B16/iPj3pM4SZci5wSyh7+SXOAv51pWyuKAPwDV4fAuD4qTaOn27di1yxbvkMIVkEuAAaIepF8JaRuQM3w6SZGhBDniL3/jFNOKANANCm3uBeIPjK62bd15bl8+LjVZS9/BIAe1/ehX9dqVke/LKf46db7c1X3w4CZGcANR0qhHRvglHwoXADGe4KozBqU/8QggW6IHaSGNVHaTLqAmzDTZWqcuGDWlqA3yzOZ+VDK8gplpHF5qYWaj84Q2egm7mZbqSnMLkzhGRPARfA60pY+usCBqIRnjGMYCsCARQhNaAIhQzbywtRcNvSe9C5fNnpZ/zr3AXHf2egO6EOf6tsQKMWIrup5aZlNVYgZkYYQVMTimx+QSsCFagy0jFNiKEHwTARio0dQjEK+V4fjZrccDVoGk8hVT+Gi4HumBaEgO3Ik+bJdTRVUBWiCMwp0EaE+W43DxvTvFxA0MkBYRGm0CAgQIT5uHldkUa0ySXGfSMiYChKvSF8F5NEqm9oRFVguW2k57utWb47LA9Kam0khIW1YhSSxhCKKfinaRGGDCerKAIdaaC5oGNs6rJMuw04ZRN2k/G8UcDGyNTaSxSpJsAF0Iowoziqw85LxDTgjTDouKkz/IY6wqTdZFyrjJlw2AWZCcaHUq4BetwXqsqz2fH8bjPd9sa77PmwkVrgnc2PsvjDFuYbrvR84OyYFVTNFIIhRQGTRJ3RBPs3HUdjB43/0K6dT7Lj+d2UlJVTUmZFjrfdfy8A7f1Xx71cdRON6XAJOgy7cCPBqZNqDfAhXdOuXTufLCgtkaGu5jOnEmo0mUg1ARVAV2lJcQHA2eZ2cn1yREvKHqb5zEk6+6/S3j/geGnTzmcBOGrcLIlpwUsIiiLJVdpUE3BehVBLczuRGyPcV7SEYECeGQyGInQEumlt+ZyAEGxwu0lrDxDIzQHD8Qnk+si5Yt0fyEOhL05+oTjvKk72nmHKb2qq6TKWCBQsv6eQof9Y63xHoBvGoFBRWJImJZsXDrNqkRVzzLrS4/AjclCpc8k2nlOG7SFV11QImA4/wIwltn4WKDBufPiwwmqm8IWKghYOT+kjU8V0aEAM1YDPGLFYUPUQY4QKFSUaI2JeHAH2CzTP4Mbl8rAhKm1CnStMVlTwk3RTD1wzTgNsHZrwopNuxAgyhSDHNqM7Eei2+MAgCgui1pxPi0IEJaH7xbf9trYduRDNROFuwz1ZikI2cNgWUVpoc1024yED+DHmYeyk5ZlRd4R6kaM+EYpS0N0ZpQE2mB6+F8sP6CDi0IAawuNvkU0SMzsi5AItCroxBRTgSwSxRVKPSfC/YgO+BhPt+RLu/4yyAbOYxSxmMYtpxn8Bx5su6h/9xj8AAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMDgtMThUMDI6MDk6NTMrMDg6MDDCQYqRAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTA4LTE4VDAyOjA5OjUzKzA4OjAwsxwyLQAAAC10RVh0U29mdHdhcmUAQ3JlYXRlZCBieSBmQ29kZXIgR3JhcGhpY3MgUHJvY2Vzc29yf8PtXwAAAABJRU5ErkJggg==';
    }
    static get baseDamageAdditionPerEnemy() {
        return 0.02;
    }
    static get damageAdditionPerEnemyLevelMx() {
        return 0.008;
    }
    static get stasisDescription() {
        return `攻击范围内每有1个敌人就使你的攻击力提高 ${Tools.roundWithFixed(this.baseDamageAdditionPerEnemy * 100, 2)}%（+${Tools.roundWithFixed(this.damageAdditionPerEnemyLevelMx * 100, 2)}%/等级）`;
    }
    static get __base_description() {
        return '攻击范围内每有1个敌人就使你的攻击力提高 $%';
    }
    constructor() {
        super();
    }
    get description() {
        return GemOfAnger.__base_description.replace('$', (this.damageAdditionPerEnemy * 100).toFixed(2));
    }
    get levelUpPoint() {
        return (this.level + 1) * 205;
    }
    get damageAdditionPerEnemy() {
        return GemOfAnger.baseDamageAdditionPerEnemy + this.level * GemOfAnger.damageAdditionPerEnemyLevelMx;
    }
    tickHook(thisTower, monsters) {
        const inRangeCount = monsters.filter(mst => thisTower.inRange(mst)).length;
        thisTower.__anger_gem_atk_ratio = (this.damageAdditionPerEnemy * inRangeCount + 1);
    }
}
var _a, _b, _c;
class Tools {
    static britishFormatter(num, precise = 1) {
        const thisAbs = Math.abs(num);
        if (thisAbs < 1e3) {
            return this.roundWithFixed(num, precise) + '';
        }
        else if (thisAbs < 1e6) {
            return this.roundWithFixed(num / 1e3, precise) + ' K';
        }
        else if (thisAbs < 1e9) {
            return this.roundWithFixed(num / 1e6, precise) + ' M';
        }
        else if (thisAbs < 1e12) {
            return this.roundWithFixed(num / 1e9, precise) + ' B';
        }
        else {
            return Tools.formatterUs.format(this.roundWithFixed(num / 1e12, precise)) + ' T';
        }
    }
    static chineseFormatter(num, precise = 3, block = '') {
        const thisAbs = Math.abs(num);
        if (thisAbs < 1e4) {
            return this.roundWithFixed(num, precise) + '';
        }
        else if (thisAbs < 1e8) {
            return this.roundWithFixed(num / 1e4, precise) + block + '万';
        }
        else if (thisAbs < 1e12) {
            return this.roundWithFixed(num / 1e8, precise) + block + '亿';
        }
        else if (thisAbs < 1e16) {
            return this.roundWithFixed(num / 1e12, precise) + block + '兆';
        }
        else if (thisAbs < 1e20) {
            return this.roundWithFixed(num / 1e16, precise) + block + '京';
        }
        else {
            return this.roundWithFixed(num / 1e20, precise) + block + '垓';
        }
    }
    static typedArrayPush(tArr, newValue) {
        const zeroIndex = tArr.indexOf(0);
        const actualLength = zeroIndex === -1 ? tArr.length : zeroIndex + 1;
        if (zeroIndex === -1) {
            tArr.set(tArr.subarray(1));
            tArr.set([newValue], tArr.length - 1);
        }
        else {
            tArr.set([newValue], zeroIndex);
        }
        return actualLength;
    }
    static roundWithFixed(num, fractionDigits) {
        const t = Math.pow(10, fractionDigits);
        return Math.round(num * t) / t;
    }
    static randomStr(bits) {
        return new Array(bits).fill(1).map(() => ((Math.random() * 16 | 0) & 0xf).toString(16)).join('');
    }
    static randomSig() {
        return Math.random() < 0.5 ? 1 : -1;
    }
    static isNumberSafe(numberLike) {
        return numberLike !== '' && numberLike !== ' ' && !isNaN(numberLike);
    }
    static renderSector(ctx, x, y, r, angle1, angle2, anticlock) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, r, angle1, angle2, anticlock);
        ctx.closePath();
        ctx.restore();
        return ctx;
    }
    static renderRoundRect(ctx, x, y, width, height, radius, fill = false, stroke = true) {
        ['tr', 'tl', 'br', 'bl'].forEach((key) => {
            radius[key] = radius[key] || 5;
        });
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }
    }
    static renderStatistic(ctx, dataArr, positionTL, width, height, color) {
        color = color || '#67C23A';
        ctx.fillStyle = color;
        const maxV = 50;
        const horizonSpan = width / dataArr.length;
        const drawHeight = height - 2;
        if (!Reflect.get(this.renderStatistic, 'onceWork')) {
            console.log('called');
            ctx.save();
            ctx.textBaseline = 'middle';
            ctx.font = '8px SourceCodePro';
            ctx.fillStyle = 'rgb(255,0,0)';
            ctx.fillRect(positionTL.x + width, positionTL.y - 2, 4, 1);
            ctx.fillText(maxV + ' ms', positionTL.x + width + 6, positionTL.y);
            ctx.fillStyle = 'rgb(1,251,124)';
            ctx.fillRect(positionTL.x + width, positionTL.y + drawHeight / 3 * 2 - 2, 4, 1);
            ctx.fillText('16.67 ms', positionTL.x + width + 6, positionTL.y + drawHeight / 3 * 2);
            ctx.fillStyle = 'rgb(0,0,0)';
            ctx.fillRect(positionTL.x + width, positionTL.y + drawHeight - 2, 4, 1);
            ctx.fillText('0 ms', positionTL.x + width + 6, positionTL.y + drawHeight);
            ctx.restore();
            Reflect.set(this.renderStatistic, 'onceWork', true);
        }
        ctx.clearRect(positionTL.x, positionTL.y, width, drawHeight);
        dataArr.forEach((v, i) => {
            const h = Math.round(drawHeight * v / maxV);
            if (h === 0)
                return;
            const x = Math.round(positionTL.x + i * horizonSpan);
            const y = Math.round(positionTL.y + drawHeight * (1 - v / maxV));
            ctx.fillRect(x, y, 1, h);
        });
    }
    static compareProperties(properties, cFx, ascend) {
        cFx = cFx || function (a, b) { return a - b; };
        ascend = ascend || true;
        return (a, b) => cFx(a[properties], b[properties]) * (ascend ? 1 : -1);
    }
    static installDot(target, dotDebuffName, duration, interval, singleAttack, isIgnoreArmor, damageEmitter) {
        if (typeof target[dotDebuffName] !== 'boolean') {
            console.log(target);
            throw new Error('target has no debuff mark as name ' + dotDebuffName);
        }
        if (target[dotDebuffName] || target.isDead) {
            return;
        }
        if (singleAttack === 0 || duration === 0) {
            return;
        }
        else {
            let dotCount = 0;
            target[dotDebuffName] = true;
            const itv = setInterval(() => {
                if (++dotCount > duration / interval) {
                    target[dotDebuffName] = false;
                    clearInterval(itv);
                    return;
                }
                if (target.health > 0) {
                    target.health -= singleAttack * (isIgnoreArmor ? 1 : (1 - target.armorResistance));
                    damageEmitter(target);
                }
                else {
                    clearInterval(itv);
                }
            }, interval);
        }
    }
    static installDotDuplicated(target, dotDebuffName, duration, interval, singleAttack, isIgnoreArmor, damageEmitter) {
        if (!Array.isArray(target[dotDebuffName])) {
            console.log(target);
            throw new Error('target has no debuff mark as name ' + dotDebuffName);
        }
        if (target.isDead) {
            return;
        }
        if (singleAttack === 0 || duration === 0) {
            return;
        }
        else {
            let dotCount = 0;
            const thisId = this.randomStr(8);
            target[dotDebuffName].push(thisId);
            const itv = setInterval(() => {
                if (++dotCount > duration / interval) {
                    target[dotDebuffName] = target[dotDebuffName].filter(d => d !== thisId);
                    clearInterval(itv);
                    return;
                }
                if (target.health > 0) {
                    target.health -= singleAttack * (isIgnoreArmor ? 1 : (1 - target.armorResistance));
                    damageEmitter(target);
                }
                else {
                    clearInterval(itv);
                }
            }, interval);
        }
    }
}
Tools.Dom = (_a = class _Dom {
        static __installOptionOnNode(node, option) {
            _.forOwn(option, (v, k) => {
                if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'function') {
                    node[k] = v;
                }
                else if (typeof v === 'object') {
                    _.forOwn(v, (subv, subk) => {
                        node[k][subk] = subv;
                    });
                }
            });
            return node;
        }
        static genetateDiv(node, option) {
            option = option || {};
            const div = document.createElement('div');
            this.__installOptionOnNode(div, option);
            node.appendChild(div);
            return div;
        }
        static generateImg(node, src, option) {
            option = option || {};
            const img = document.createElement('img');
            img.src = src;
            this.__installOptionOnNode(img, option);
            node.appendChild(img);
            return img;
        }
        static generateTwoCol(node, leftOpt, rightOpt, leftChildren, rightChildren) {
            leftOpt = leftOpt || {};
            rightOpt = rightOpt || {};
            leftChildren = leftChildren || [];
            rightChildren = rightChildren || [];
            const colL = document.createElement('div');
            colL.className = 'col';
            this.__installOptionOnNode(colL, leftOpt);
            leftChildren.forEach(child => colL.appendChild(child));
            const colR = document.createElement('div');
            colR.className = 'col';
            this.__installOptionOnNode(colR, rightOpt);
            rightChildren.forEach(child => colR.appendChild(child));
            node.appendChild(colL);
            node.appendChild(colR);
            return [colL, colR];
        }
        static generateRow(node, className, option, children) {
            children = children || [];
            option = option || {};
            const row = document.createElement('div');
            row.className = className || 'row';
            option = option || {};
            this.__installOptionOnNode(row, option);
            children.forEach(child => row.appendChild(child));
            node.appendChild(row);
            return row;
        }
        static removeAllChildren(node) {
            while (node.hasChildNodes()) {
                node.removeChild(node.lastChild);
            }
        }
        static removeNodeTextAndStyle(node, className = 'row') {
            if (node.style.color)
                node.style.color = '';
            if (node.style.marginBottom)
                node.style.marginBottom = '';
            if (node.textContent)
                node.textContent = '';
            if (node.className != className)
                node.className = className;
        }
        static bindLongPressEventHelper(uniqueId, node, onPressFx, onPressFxCallDelay, onPressFxCallInterval, accDelay, accInterval) {
            accDelay = accDelay || Infinity;
            let timerInst = -1;
            if (!this._instance.has(uniqueId)) {
                this._instance.set(uniqueId, -1);
            }
            node.onmousedown = () => {
                timerInst = setTimeout(() => {
                    const startLevel1 = performance.now();
                    const intervalInst = setInterval(() => {
                        const cancel = onPressFx();
                        if (cancel) {
                            clearInterval(this._instance.get(uniqueId));
                            this._instance.set(uniqueId, -1);
                        }
                        else if (performance.now() - startLevel1 > accDelay) {
                            clearInterval(this._instance.get(uniqueId));
                            this._instance.set(uniqueId, setInterval(() => {
                                const cancel = onPressFx();
                                if (cancel) {
                                    clearInterval(this._instance.get(uniqueId));
                                    this._instance.set(uniqueId, -1);
                                }
                            }, accInterval));
                        }
                    }, onPressFxCallInterval);
                    this._instance.set(uniqueId, intervalInst);
                }, onPressFxCallDelay);
            };
            const cancelTokenFx = () => {
                if (timerInst > 0) {
                    clearTimeout(timerInst);
                    timerInst = -1;
                }
                if (this._instance.get(uniqueId) > 0) {
                    clearInterval(this._instance.get(uniqueId));
                    this._instance.set(uniqueId, -1);
                }
            };
            node.onmouseup = cancelTokenFx;
            node.onmouseleave = cancelTokenFx;
        }
    },
    _a._cache = new Map(),
    _a._instance = new Map(),
    _a);
Tools.Media = class _Media {
};
Tools.ObjectFx = class _ObjectFx {
    static addFinalProperty(Source, Key, Value) {
        return Object.defineProperty(Source, Key, {
            configurable: false,
            enumerable: true,
            writable: true,
            value: Value
        });
    }
    static addFinalReadonlyProperty(Source, Key, Value) {
        return Object.defineProperty(Source, Key, {
            configurable: false,
            enumerable: true,
            writable: false,
            value: Value
        });
    }
    static addFinalGetterProperty(Source, Key, Getter) {
        return Object.defineProperty(Source, Key, {
            configurable: false,
            enumerable: true,
            get: Getter
        });
    }
};
Tools.formatterUs = new Intl.NumberFormat('en-US');
Tools.formatterCh = new Intl.NumberFormat('zh-u-nu-hanidec');
Tools.EaseFx = (_b = class _Ease {
    },
    _b.linear = (x) => x,
    _b.easeInQuad = (x) => x * x,
    _b.easeOutQuad = (x) => 1 - (1 - x) * (1 - x),
    _b.easeInOutQuad = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
    _b.easeInCubic = (x) => x * x * x,
    _b.easeOutCubic = (x) => 1 - Math.pow(1 - x, 3),
    _b.easeInOutCubic = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    _b.easeInQuart = (x) => x * x * x * x,
    _b.easeOutQuart = (x) => 1 - Math.pow(1 - x, 4),
    _b.easeInOutQuart = (x) => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
    _b.easeInQuint = (x) => x * x * x * x * x,
    _b.easeOutQuint = (x) => 1 - Math.pow(1 - x, 5),
    _b.easeInSine = (x) => 1 - Math.cos(x * Math.PI / 2),
    _b.easeOutSine = (x) => Math.sin(x * Math.PI / 2),
    _b.easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2,
    _b.easeInExpo = (x) => x === 0 ? 0 : Math.pow(2, 10 * x - 10),
    _b.easeOutExpo = (x) => x === 1 ? 1 : 1 - Math.pow(2, -10 * x),
    _b.easeInCirc = (x) => 1 - Math.sqrt(1 - Math.pow(x, 2)),
    _b.easeOutCirc = (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
    _b.easeInOutCirc = (x) => x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2,
    _b);
Tools.MathFx = (_c = class _Math {
    },
    _c.curveFx = (a, b, phi = 0) => (x) => a + b / (x + phi),
    _c.naturalLogFx = (a, b, c = 1) => (x) => a + b * Math.log(x + c),
    _c.exponentialFx = (a, b, phi = 0) => (x) => a * Math.pow(Math.E, b * (x + phi)),
    _c.powerFx = (a, b, phi = 0) => (x) => a * Math.pow(x + phi, b),
    _c.sCurveFx = (a, b, phi = 0) => (x) => 1 / (a + b * Math.pow(Math.E, -(x + phi))),
    _c);
class ButtonOnDom {
    constructor(domOptions, hookOnToDom = true) {
        this.ele = document.createElement('button');
        if (hookOnToDom)
            document.body.appendChild(this.ele);
        Tools.Dom.__installOptionOnNode(this.ele, domOptions);
    }
    onMouseclick() {
        this.ele.click();
    }
}
class Base {
    constructor() {
        Tools.ObjectFx.addFinalReadonlyProperty(this, 'id', Base.__id++);
    }
}
Base.__id = 0;
class RectangleBase extends Base {
    constructor(positionTL, positionBR, bw, bs, bf, br) {
        super();
        this.cornerTL = positionTL;
        this.cornerBR = positionBR;
        this.width = this.cornerBR.x - this.cornerTL.x;
        this.height = this.cornerBR.y - this.cornerTL.y;
        this.borderWidth = bw;
        this.borderStyle = bs;
        this.fillStyle = bf;
        this.borderRadius = br;
    }
    renderBorder(context) {
        context.strokeStyle = this.borderStyle;
        Tools.renderRoundRect(context, this.cornerTL.x, this.cornerTL.y, this.width, this.height, this.borderRadius, false, true);
    }
    renderInside(context) {
        context.fillStyle = this.fillStyle;
        Tools.renderRoundRect(context, this.cornerTL.x, this.cornerTL.y, this.width, this.height, this.borderRadius, true, false);
    }
}
class CircleBase extends Base {
    constructor(p, r, bw, bs) {
        super();
        Tools.ObjectFx.addFinalReadonlyProperty(this, 'position', p);
        this.radius = r;
        this.borderWidth = bw;
        this.borderStyle = bs;
        Tools.ObjectFx.addFinalGetterProperty(this, 'inscribedSquareSideLength', () => 2 * this.radius / Math.SQRT2);
    }
    renderBorder(context) {
        if (this.borderWidth > 0) {
            context.strokeStyle = this.borderStyle;
            context.lineWidth = this.borderWidth;
            context.beginPath();
            context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
            context.closePath();
            context.stroke();
        }
    }
}
class ItemBase extends CircleBase {
    constructor(position, radius, borderWidth, borderStyle, image) {
        super(position, radius, borderWidth, borderStyle);
        this.intervalTimers = [];
        this.timeoutTimers = [];
        this.controlable = false;
        this.image = null;
        if (typeof image === 'string') {
            this.fill = image;
        }
        else {
            this.image = image;
        }
    }
    renderSpriteFrame(context, x, y) {
        if (this.image instanceof AnimationSprite) {
            this.image.renderOneFrame(context, new Position(x, y), this.inscribedSquareSideLength, this.inscribedSquareSideLength, 0, true, true, false);
        }
    }
    renderImage(context) {
        const x = this.position.x - this.inscribedSquareSideLength * 0.5;
        const y = this.position.y - this.inscribedSquareSideLength * 0.5;
        if (this.image instanceof ImageBitmap) {
            context.drawImage(this.image, 0, 0, this.image.width, this.image.height, x, y, this.inscribedSquareSideLength, this.inscribedSquareSideLength);
        }
        else if (this.image instanceof AnimationSprite) {
            this.renderSpriteFrame(context, x, y);
        }
    }
    renderFilled(context) {
        context.fillStyle = this.fill;
        if (this.radius > 1) {
            context.beginPath();
            context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
        else {
            context.fillRect(Math.floor(this.position.x), Math.floor(this.position.y), 1, 1);
        }
    }
    render(context, _imgCtrl) {
        super.renderBorder(context);
        if (this.image) {
            this.renderImage(context);
        }
        else if (this.fill) {
            this.renderFilled(context);
        }
    }
    rotateForward(context, targetPos) {
        context.translate(this.position.x, this.position.y);
        let thelta = Math.atan((this.position.y - targetPos.y) / (this.position.x - targetPos.x));
        if (this.position.x > targetPos.x)
            thelta += Math.PI;
        context.rotate(thelta);
        return {
            restore() {
                context.resetTransform();
            }
        };
    }
    destory() {
        if (this.image instanceof AnimationSprite) {
            this.image.terminateLoop();
        }
        this.intervalTimers.forEach(t => clearInterval(t));
        this.timeoutTimers.forEach(t => clearTimeout(t));
    }
}
class TowerBase extends ItemBase {
    constructor(position, radius, borderWidth, borderStyle, image, price, levelAtkFx, levelHstFx, levelSlcFx, levelRngFx) {
        super(position, radius, borderWidth, borderStyle, image);
        this.bulletCtl = new BulletManager();
        this.bulletImage = null;
        this.bulletCtorName = '';
        this.level = 0;
        this.rank = 0;
        this.target = null;
        this.__kill_count = 0;
        this.__total_damage = 0;
        this.gem = null;
        this.canInsertGem = true;
        this.__hst_ps_ratio = 1;
        this.__atk_ratio = 1;
        this.__kill_extra_gold = 0;
        this.__kill_extra_point = 0;
        this.__on_boss_atk_ratio = 1;
        this.__on_trapped_atk_ratio = 1;
        this.__anger_gem_atk_ratio = 1;
        this.__max_rng_atk_ratio = 1;
        this.__min_rng_atk_ratio = 1;
        this.__each_monster_damage_ratio = new Map();
        this.description = null;
        this.name = null;
        this.isSold = false;
        this.bornStamp = performance.now();
        this.price = price;
        this.levelAtkFx = levelAtkFx;
        this.levelHstFx = levelHstFx;
        this.levelSlcFx = levelSlcFx;
        this.levelRngFx = levelRngFx;
        this.lastShootTime = this.bornStamp;
        this.intervalTimers.push(setInterval(() => {
            const msts = Game.callMonsterList();
            Array.from(this.__each_monster_damage_ratio)
                .filter(([k]) => msts.every(mst => mst.id !== k))
                .forEach(([k]) => this.__each_monster_damage_ratio.delete(k));
        }, 60000));
        Tools.ObjectFx.addFinalReadonlyProperty(this, 'recordKill', () => {
            this.__kill_count++;
            Game.callMoney()[1](this.__kill_extra_gold);
        });
        Tools.ObjectFx.addFinalReadonlyProperty(this, 'recordDamage', ({ lastAbsDmg, isDead, isBoss }) => {
            this.__total_damage += lastAbsDmg;
            Game.updateGemPoint += TowerBase.damageToPoint(lastAbsDmg);
            if (isDead) {
                this.recordKill();
                Game.updateGemPoint += ((isBoss ? TowerBase.killBossPointEarnings : TowerBase.killNormalPointEarnings) + this.__kill_extra_point);
                if (this.gem) {
                    this.gem.killHook(this, arguments[0]);
                }
            }
        });
        Tools.ObjectFx.addFinalReadonlyProperty(this, 'inRange', (target) => {
            const t = this.Rng + target.radius;
            return Position.distancePow2(target.position, this.position) < t * t;
        });
        Tools.ObjectFx.addFinalProperty(this, 'calculateDamageRatio', (mst) => {
            const bossR = mst.isBoss ? this.__on_boss_atk_ratio : 1;
            const particularR = this.__each_monster_damage_ratio.get(mst.id) || 1;
            const trapR = mst.isTrapped ? this.__on_trapped_atk_ratio : 1;
            const R = Position.distance(this.position, mst.position) / this.Rng;
            const rangeR = this.__min_rng_atk_ratio * (1 - R) + this.__max_rng_atk_ratio * R;
            return bossR * particularR * trapR * rangeR;
        });
    }
    static GemNameToGemCtor(gn) {
        return this.Gems.find(g => g.name === gn).ctor;
    }
    static get GemsToOptionsInnerHtml() {
        return this.Gems
            .map((gemCtor, idx) => {
            return `<option value="${gemCtor.name}"${idx === 0 ? ' selected' : ''}${this.deniedGems.includes(gemCtor.name) ? ' disabled' : ''}>${gemCtor.ctor.gemName}${this.deniedGems.includes(gemCtor.name) ? ' - 不能装备到此塔' : ''}</option>`;
        })
            .join('');
    }
    static get levelUpPointEarnings() {
        return 10;
    }
    static get killNormalPointEarnings() {
        return 1;
    }
    static get killBossPointEarnings() {
        return 50;
    }
    static damageToPoint(damage) {
        return Math.round(damage / 1000);
    }
    get descriptionChuned() {
        if (!this.description)
            return [];
        return this.description.split('\n');
    }
    get sellingPrice() {
        let s = 0;
        for (let i = 0; i < this.level + 1; i++) {
            s += this.price[i];
        }
        if (this.gem)
            s += this.gem.constructor.price;
        return Math.ceil(s * 0.7);
    }
    get Atk() {
        return this.levelAtkFx(this.level) * this.__atk_ratio * this.__anger_gem_atk_ratio;
    }
    get Hst() {
        return 1000 / this.HstPS;
    }
    get HstPS() {
        return this.levelHstFx(this.level) * this.__hst_ps_ratio;
    }
    get Slc() {
        return this.levelSlcFx(this.level);
    }
    get Rng() {
        return this.reviceRange(this.levelRngFx(this.level)) + this.radius;
    }
    get DPS() {
        return this.Atk * this.Slc * this.HstPS;
    }
    get informationSeq() {
        const base = [
            [this.name, ''],
            ['等级', this.levelHuman],
            ['下一级', this.isMaxLevel ? '最高等级' : '$ ' + Tools.formatterUs.format(Math.round(this.price[this.level + 1]))],
            ['售价', '$ ' + Tools.formatterUs.format(Math.round(this.sellingPrice))],
            ['伤害', Tools.chineseFormatter(Math.round(this.Atk), 3)],
            ['攻击速度', '' + Tools.roundWithFixed(this.HstPS, 2)],
            ['射程', Tools.formatterUs.format(Math.round(this.Rng))],
            ['弹药储备', '' + Math.round(this.Slc)],
            ['DPS', Tools.chineseFormatter(this.DPS, 3)]
        ];
        return base;
    }
    get ADPS() {
        return this.__total_damage / (performance.now() - this.bornStamp) * 1000;
    }
    get ADPSH() {
        return Tools.chineseFormatter(Tools.roundWithFixed(this.ADPS, 3), 3);
    }
    get exploitsSeq() {
        return [
            ['击杀', '' + this.__kill_count],
            ['输出', Tools.chineseFormatter(this.__total_damage, 3)],
            ['每秒输出', this.ADPSH]
        ];
    }
    get isCurrentTargetAvailable() {
        if (!this.target || this.target.isDead)
            return false;
        else
            return this.inRange(this.target);
    }
    get canShoot() {
        return performance.now() - this.lastShootTime > this.Hst;
    }
    get isMaxLevel() {
        return this.price.length - 1 === this.level;
    }
    get levelHuman() {
        return '' + (this.level + 1);
    }
    reviceRange(r) {
        return r * Game.callGridSideSize() / 39;
    }
    inlayGem(gemCtorName) {
        this.gem = new (TowerBase.GemNameToGemCtor(gemCtorName))();
        this.gem.initEffect(this);
    }
    reChooseTarget(targetList, _index) {
        for (const t of _.shuffle(targetList)) {
            if (this.inRange(t)) {
                this.target = t;
                return;
            }
        }
        this.target = null;
    }
    produceBullet(_i, _monsters) {
        const ratio = this.calculateDamageRatio(this.target);
        this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.target, this.bulletImage);
    }
    recordShootTime() {
        this.lastShootTime = performance.now();
    }
    run(monsters) {
        if (this.canShoot) {
            if (!this.isCurrentTargetAvailable) {
                this.reChooseTarget(monsters);
            }
            if (this.target) {
                this.shoot(monsters);
            }
        }
    }
    shoot(monsters) {
        this.gemAttackHook(monsters);
        for (let i = 0; i < this.Slc; i++) {
            this.produceBullet(i, monsters);
            this.gemHitHook(i, monsters);
        }
        this.recordShootTime();
    }
    gemHitHook(_idx, msts) {
        if (this.gem) {
            this.gem.hitHook(this, this.target, msts);
        }
    }
    gemAttackHook(msts) {
        if (this.gem) {
            this.gem.attackHook(this, msts);
        }
    }
    levelUp(currentMoney) {
        if (this.isMaxLevel)
            return 0;
        if (this.price[this.level + 1] > currentMoney) {
            return 0;
        }
        else {
            this.level += 1;
            const w = this.inscribedSquareSideLength * 1.5;
            Game.callAnimation('level_up', new Position(this.position.x - this.radius, this.position.y - this.radius * 2), w, w / 144 * 241, 3);
            Game.updateGemPoint += TowerBase.levelUpPointEarnings;
            return this.price[this.level];
        }
    }
    rankUp() {
        this.rank += 1;
        const w = this.inscribedSquareSideLength * 1.5;
        Game.callAnimation('rank_up', new Position(this.position.x - this.radius, this.position.y - this.radius * 2), w, w / 79 * 85, 3, 0, 25);
    }
    renderRange(context, style = 'rgba(177,188,45,.05)') {
        context.fillStyle = style;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.Rng, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }
    renderLevel(context) {
        const ftmp = context.font;
        context.font = '6px TimesNewRoman';
        context.fillStyle = context.manager.towerLevelTextStyle;
        context.fillText('lv ' + this.levelHuman, this.position.x + this.radius * .78, this.position.y - this.radius * .78);
        context.font = ftmp;
    }
    renderRankStars(context) {
        if (this.rank > 0) {
            const l2 = Math.floor(this.rank / 4);
            const l1 = this.rank % 4;
            const py = this.position.y - this.radius * 1.25;
            const px = this.position.x - this.radius * .68;
            for (let i = 0; i < l2; i++) {
                context.drawImage(Game.callImageBitMap('p_ruby'), px + 7 * i, py, 8, 8);
            }
            for (let i = 0; i < l1; i++) {
                context.drawImage(Game.callImageBitMap('star_m'), px + 5 * i + 7 * l2, py, 8, 8);
            }
        }
    }
    renderPreparationBar(context) {
        if (this.canShoot)
            return;
        context.fillStyle = 'rgba(25,25,25,.3)';
        Tools.renderSector(context, this.position.x, this.position.y, this.radius, 0, Math.PI * 2 * (1 - (performance.now() - this.lastShootTime) / this.Hst), false).fill();
    }
    render(context) {
        super.render(context);
        this.renderLevel(context);
        this.renderRankStars(context);
    }
    renderStatusBoard(bx1, _bx2, by1, _by2, showGemPanel, showMoreDetail, specifedWidth) {
        showGemPanel = showGemPanel && this.canInsertGem;
        const red = '#F51818';
        const green = '#94C27E';
        const renderDataType_1 = (rootNode, dataChunk, offset, showDesc) => {
            let jump = 0;
            dataChunk.forEach((data, idx) => {
                const showD = showDesc && this.constructor.informationDesc.has(data[0]);
                const row = rootNode.childNodes.item(idx + offset + jump);
                Tools.Dom.removeNodeTextAndStyle(row);
                if (!row.hasChildNodes()) {
                    Tools.Dom.generateTwoCol(row);
                }
                else {
                    Tools.Dom.removeNodeTextAndStyle(row.lastChild);
                    Tools.Dom.removeNodeTextAndStyle(row.firstChild);
                }
                row.firstChild.textContent = data[0];
                row.lastChild.textContent = data[1];
                if (showD) {
                    const rowD = rootNode.childNodes.item(idx + offset + jump + 1);
                    Tools.Dom.removeNodeTextAndStyle(rowD);
                    Tools.Dom.removeAllChildren(rowD);
                    rowD.textContent = this.constructor.informationDesc.get(data[0]);
                    rowD.style.color = '#909399';
                    rowD.style.marginBottom = '5px';
                    jump++;
                }
                if (data[0] === '售价' || data[0] === '类型') {
                    row.lastChild.style.color = '#606266';
                    renderDataType_dv(rootNode, idx + offset + jump + (showD ? 2 : 1));
                    jump++;
                }
                else if (data[0] === '下一级') {
                    if (this.isMaxLevel)
                        row.lastChild.style.color = '#DCDFE6';
                    else
                        row.lastChild.style.color = this.price[this.level + 1] < Game.callMoney()[0] ? green : red;
                }
            });
        };
        const renderDataType_2 = (rootNode, dataChunk, offset) => {
            dataChunk.forEach((data, idx) => {
                const row = rootNode.childNodes.item(idx + offset);
                Tools.Dom.removeNodeTextAndStyle(row);
                Tools.Dom.removeAllChildren(row);
                if (data.includes('+'))
                    row.style.color = 'rgba(204,51,51,1)';
                else if (data.includes('-'))
                    row.style.color = 'rgba(0,102,204,1)';
                else
                    row.style.color = '';
                row.textContent = data;
            });
        };
        const renderDataType_dv = (rootNode, offset) => {
            const div = rootNode.childNodes.item(offset);
            Tools.Dom.removeAllChildren(div);
            Tools.Dom.removeNodeTextAndStyle(div, 'division');
        };
        specifedWidth = specifedWidth || 150;
        const blockElement = Game.callElement('status_block');
        blockElement.style.display = 'block';
        blockElement.style.width = specifedWidth + 'px';
        blockElement.style.borderBottomLeftRadius = showGemPanel ? '0' : '';
        blockElement.style.borderBottomRightRadius = showGemPanel ? '0' : '';
        blockElement.style.borderBottom = showGemPanel ? '0' : '';
        const lineCount = this.informationSeq.length + this.descriptionChuned.length + this.exploitsSeq.length;
        const moreDescLineCount = showMoreDetail ? this.informationSeq.filter(f => this.constructor.informationDesc.has(f[0])).length : 0;
        const extraLineCount = 2 + 1 + moreDescLineCount;
        if (blockElement.childNodes.length > lineCount + extraLineCount) {
            blockElement.childNodes.forEach((child, index) => {
                if (index > lineCount - 1 + extraLineCount) {
                    Tools.Dom.removeAllChildren(child);
                    Tools.Dom.removeNodeTextAndStyle(child);
                }
            });
        }
        while (blockElement.childNodes.length < lineCount + extraLineCount) {
            Tools.Dom.generateRow(blockElement);
        }
        const l1 = this.informationSeq.length + 2 + moreDescLineCount;
        const l2 = l1 + this.exploitsSeq.length + 1;
        renderDataType_1(blockElement, this.informationSeq, 0, showMoreDetail);
        renderDataType_dv(blockElement, l1 - 1);
        renderDataType_1(blockElement, this.exploitsSeq, l1, false);
        renderDataType_dv(blockElement, l2 - 1);
        renderDataType_2(blockElement, this.descriptionChuned, l2);
        if (showGemPanel) {
            const gemElement = Game.callElement('gem_block');
            Tools.Dom.removeAllChildren(gemElement);
            gemElement.style.display = 'block';
            gemElement.style.width = specifedWidth + 'px';
            if (!this.gem) {
                let selected = TowerBase.Gems[0].name;
                Tools.Dom.generateRow(gemElement, null, { textContent: '选购一颗' + GemBase.gemName, style: { margin: '0 0 8px 0' } });
                if (showMoreDetail) {
                    Tools.Dom.generateRow(gemElement, null, { textContent: GemBase.gemName + '可以极大得提高塔的能力，每个单位只能选择一枚' + GemBase.gemName + '镶嵌，之后可以使用点数升级继续提高' + GemBase.gemName + '的效用', style: { margin: '0 0 8px 0', color: '#909399' } });
                }
                const select = document.createElement('select');
                select.size = TowerBase.Gems.length;
                select.style.width = '100%';
                select.style.fontSize = '12px';
                select.onchange = () => {
                    selected = select.value;
                    const ctor = TowerBase.GemNameToGemCtor(selected);
                    rowDesc.textContent = ctor.stasisDescription;
                    rowimg.firstChild.src = ctor.imgSrc;
                    rowPrice.lastChild.textContent = '$ ' + Tools.formatterUs.format(ctor.price);
                    rowPrice.lastChild.style.color = ctor.price <= Game.callMoney()[0] ? green : red;
                    if (ctor.price > Game.callMoney()[0]) {
                        btn.setAttribute('disabled', 'disabled');
                    }
                    else {
                        btn.removeAttribute('disabled');
                    }
                };
                select.innerHTML = this.constructor.GemsToOptionsInnerHtml;
                Tools.Dom.generateRow(gemElement, 'row_nh', { style: { margin: '0 0 8px 0' } }, [select]);
                const rowimg = Tools.Dom.generateRow(gemElement);
                const ctor = TowerBase.GemNameToGemCtor(selected);
                Tools.Dom.generateImg(rowimg, ctor.imgSrc, { className: 'lg_gem_img' });
                const rowPrice = Tools.Dom.generateRow(gemElement, null, { style: { marginBottom: '5px' } }, ctor.priceSpan);
                rowPrice.lastChild.style.color = ctor.price <= Game.callMoney()[0] ? green : red;
                const rowDesc = Tools.Dom.generateRow(gemElement, null, {
                    textContent: ctor.stasisDescription,
                    style: {
                        lineHeight: '1.2',
                        margin: '0 0 8px 0'
                    }
                });
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = '确认';
                if (ctor.price > Game.callMoney()[0]) {
                    btn.setAttribute('disabled', 'disabled');
                }
                btn.onclick = () => {
                    const ct = TowerBase.GemNameToGemCtor(selected);
                    const [money, emitter] = Game.callMoney();
                    if (money > ct.price) {
                        emitter(-ct.price);
                        this.inlayGem(selected);
                        this.renderStatusBoard(...arguments);
                    }
                };
                Tools.Dom.generateRow(gemElement, null, null, [btn]);
            }
            else {
                const canUpdateNext = !this.gem.isMaxLevel && Game.updateGemPoint >= this.gem.levelUpPoint;
                Tools.Dom.generateRow(gemElement, null, { textContent: '升级你的' + GemBase.gemName });
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = '升级';
                btn.title = '长按快速升级';
                if (!canUpdateNext) {
                    btn.setAttribute('disabled', 'disabled');
                }
                else {
                    btn.removeAttribute('disabled');
                }
                btn.onclick = () => {
                    Game.updateGemPoint -= this.gem.levelUp(Game.updateGemPoint);
                    this.renderStatusBoard(...arguments);
                };
                Tools.Dom.bindLongPressEventHelper(this.id + '', btn, () => {
                    if (!this.gem.isMaxLevel && Game.updateGemPoint >= this.gem.levelUpPoint) {
                        btn.onclick(null);
                        return false;
                    }
                    else {
                        return true;
                    }
                }, 200, 50, 1500, 10);
                Tools.Dom.generateRow(gemElement, null, { textContent: this.gem.gemName, style: { marginBottom: '10px' } });
                const [imgCol] = Tools.Dom.generateTwoCol(Tools.Dom.generateRow(gemElement, null, { style: { marginBottom: '5px' } }), null, null, [], [btn]);
                Tools.Dom.generateImg(imgCol, this.gem.imgSrc, { className: 'lg_gem_img' });
                Tools.Dom.generateRow(gemElement, null, { textContent: this.gem.level + '  级 / ' + this.gem.maxLevelHuman });
                Tools.Dom.generateTwoCol(Tools.Dom.generateRow(gemElement), { textContent: '下一级点数' }, { textContent: this.gem.isMaxLevel ? '最高等级' : Tools.formatterUs.format(this.gem.levelUpPoint), style: { color: canUpdateNext ? green : red } });
                Tools.Dom.generateRow(gemElement, null, { textContent: this.gem.description });
            }
        }
        const gemElement = Game.callElement('gem_block');
        const bHeight = blockElement.offsetHeight;
        const gHeight = gemElement.offsetHeight;
        let position = 2;
        if (this.position.x - bx1 < specifedWidth + this.radius) {
            position = 1;
            if (this.position.y - by1 < bHeight) {
                position = 4;
            }
        }
        if (this.position.y - by1 < bHeight) {
            position = 3;
            if (this.position.x - bx1 < specifedWidth + this.radius) {
                position = 4;
            }
        }
        const positionTLX = this.position.x - (position === 1 || position === 4 ? this.radius * -1 : specifedWidth + this.radius);
        let positionTLY = this.position.y + (position === 1 || position === 2 ? -1 : 0) * (bHeight + this.radius);
        const pyBhGh = positionTLY + bHeight + gHeight;
        if (position < 3 && positionTLY < 0) {
            positionTLY = 5;
        }
        else if (pyBhGh > innerHeight) {
            const overflowH = pyBhGh - innerHeight;
            positionTLY -= overflowH + 30;
        }
        blockElement.style.top = positionTLY + 'px';
        blockElement.style.left = positionTLX + 'px';
        if (showGemPanel) {
            gemElement.style.top = positionTLY + bHeight + 'px';
            gemElement.style.left = positionTLX + 'px';
        }
    }
}
TowerBase.informationDesc = new Map([
    ['等级', '鼠标单击图标或按 [C] 键来消耗金币升级，等级影响很多属性，到达某个等级可以晋升'],
    ['下一级', '升级到下一级需要的金币数量'],
    ['售价', '出售此塔可以返还的金币数量'],
    ['伤害', '此塔的基础攻击力'],
    ['攻击速度', '此塔的每秒攻击次数'],
    ['射程', '此塔的索敌距离，单位是像素'],
    ['弹药储备', '此塔每次攻击时发射的弹药数量'],
    ['DPS', '估计的每秒伤害']
]);
TowerBase.Gems = [
    {
        ctor: PainEnhancer,
        name: 'PainEnhancer'
    },
    {
        ctor: GogokOfSwiftness,
        name: 'GogokOfSwiftness'
    },
    {
        ctor: MirinaeTeardropOfTheStarweaver,
        name: 'MirinaeTeardropOfTheStarweaver'
    },
    {
        ctor: SimplicitysStrength,
        name: 'SimplicitysStrength'
    },
    {
        ctor: BaneOfTheStricken,
        name: 'BaneOfTheStricken'
    },
    {
        ctor: GemOfEase,
        name: 'GemOfEase'
    },
    {
        ctor: GemOfMysterious,
        name: 'GemOfMysterious'
    },
    {
        ctor: BaneOfTheTrapped,
        name: 'BaneOfTheTrapped'
    },
    {
        ctor: ZeisStoneOfVengeance,
        name: 'ZeisStoneOfVengeance'
    },
    {
        ctor: EchoOfLight,
        name: 'EchoOfLight'
    },
    {
        ctor: GemOfAnger,
        name: 'GemOfAnger'
    }
];
TowerBase.deniedGems = [];
class MonsterBase extends ItemBase {
    constructor(position, radius, borderWidth, borderStyle, image, level, levelRwdFx, levelSpdFx, levelHthFx, levelAmrFx, levelShdFx) {
        super(position, radius, borderWidth, borderStyle, image);
        this.speedRatio = 1;
        this.damage = 1;
        this.bePoisoned = false;
        this.beBloodied = false;
        this.beBurned = false;
        this.beOnLightEcho = [];
        this.beShocked = false;
        this.shockDurationTick = 0;
        this.shockChargeAmount = 0;
        this.shockLeakChance = 0;
        this.shockSource = null;
        this.beTransformed = false;
        this.transformDurationTick = 0;
        this.beImprisoned = false;
        this.imprisonDurationTick = 0;
        this.beFrozen = false;
        this.freezeDurationTick = 0;
        this.beConfused = false;
        this.imprecatedRatio = [];
        this.lastAbsDmg = 0;
        this.isBoss = false;
        this.isDead = false;
        this.name = null;
        this.description = null;
        this.type = '普通怪物';
        this.__inner_level = level;
        this.maxHealth = Math.round(levelHthFx(level));
        this.__inner_current_health = this.maxHealth;
        this.maxShield = levelShdFx ? levelShdFx(level) : 0;
        this.__inner_current_shield = this.maxShield;
        this.inner_armor = levelAmrFx(level);
        this.__base_speed = levelSpdFx(level);
        this.reward = Math.round(levelRwdFx(level));
        this.exploitsSeq = [
            ['赏金', Tools.chineseFormatter(this.reward, 0)]
        ];
    }
    get beImprecated() {
        return this.imprecatedRatio.length > 0;
    }
    get armorResistance() {
        return Tools.roundWithFixed(this.inner_armor / (100 + this.inner_armor), 3);
    }
    get speedValue() {
        if (this.beFrozen || this.beImprisoned)
            return 0;
        if (this.beConfused)
            return this.__base_speed * -0.5;
        return this.__base_speed * this.speedRatio;
    }
    get health() {
        return this.__inner_current_health;
    }
    get shield() {
        return this.__inner_current_shield;
    }
    set health(newHth) {
        const delta = newHth - this.__inner_current_health;
        if (delta === 0)
            return;
        if (delta < 0) {
            const actualDmg = -Math.round(delta * this.imprecatedRatio.reduce((p, v) => p * v.pow, 1));
            this.lastAbsDmg = Math.min(actualDmg, this.__inner_current_health);
            this.__inner_current_health -= this.lastAbsDmg;
            if (this.__inner_current_health <= 0) {
                this.isDead = true;
            }
        }
        else {
            this.__inner_current_health = Math.min(newHth, this.maxHealth);
        }
    }
    get healthBarHeight() {
        return 2;
    }
    get healthBarWidth() {
        return this.radius * 2;
    }
    get healthBarBorderStyle() {
        return 'rgba(45,244,34,1)';
    }
    get healthBarFillStyle() {
        return 'rgba(245,44,34,1)';
    }
    get healthBarTextFontStyle() {
        return '8px TimesNewRoman';
    }
    get healthBarTextFillStyle() {
        return 'rgba(0,0,0,1)';
    }
    get isTrapped() {
        return this.beTransformed || this.beImprisoned || this.beFrozen || this.beConfused || this.speedRatio < 1;
    }
    get descriptionChuned() {
        if (!this.description)
            return [];
        return this.description.split('\n');
    }
    get informationSeq() {
        const base = [
            [this.name, ''],
            ['类型', this.type],
            ['生命值', Tools.chineseFormatter(Math.round(this.__inner_current_health), 3) + '/' + Tools.chineseFormatter(Math.round(this.maxHealth), 3)],
            ['移动速度', Tools.roundWithFixed(this.speedValue * 60, 1)],
            ['护甲', Tools.formatterUs.format(Math.round(this.inner_armor)) + '（减伤 ' + Tools.roundWithFixed(this.armorResistance * 100, 1) + '%）'],
        ];
        return base;
    }
    get level() {
        return this.__inner_level;
    }
    runDebuffs() {
        if (this.shockDurationTick > 0) {
            this.beShocked = true;
            if (--this.shockDurationTick === 0)
                this.beShocked = false;
        }
        if (this.transformDurationTick > 0) {
            this.beTransformed = true;
            if (--this.transformDurationTick === 0)
                this.beTransformed = false;
        }
        if (this.imprisonDurationTick > 0) {
            this.beImprisoned = true;
            if (--this.imprisonDurationTick === 0)
                this.beImprisoned = false;
        }
        if (this.freezeDurationTick > 0) {
            this.beFrozen = true;
            if (--this.freezeDurationTick === 0)
                this.beFrozen = false;
        }
        this.imprecatedRatio = this.imprecatedRatio.filter(imp => --imp.durTick !== 0);
    }
    registerShock(durationTick, chargeAmount, source, leakChance) {
        if (durationTick > this.shockDurationTick) {
            this.shockDurationTick = Math.round(durationTick);
            this.shockChargeAmount = chargeAmount;
            this.shockSource = source;
            this.shockLeakChance = leakChance;
        }
    }
    registerTransform(durationTick) {
        if (durationTick > this.transformDurationTick) {
            this.transformDurationTick = Math.round(durationTick);
        }
    }
    registerImprison(durationTick) {
        if (durationTick > this.imprisonDurationTick) {
            this.imprisonDurationTick = Math.round(durationTick);
        }
    }
    registerFreeze(durationTick) {
        if (durationTick > this.freezeDurationTick) {
            this.freezeDurationTick = Math.round(durationTick);
        }
    }
    registerImprecate(durationTick, imprecationRatio) {
        this.imprecatedRatio.push({ pow: imprecationRatio, durTick: durationTick });
    }
    runShock(monsters) {
        if (Math.random() < (1 - this.shockLeakChance))
            return;
        if (monsters.length < 2)
            return;
        const aim = _.minBy(monsters, mst => {
            if (mst === this)
                return Infinity;
            const dist = Position.distancePow2(mst.position, this.position);
            return dist;
        });
        aim.health -= this.shockChargeAmount * (1 - aim.armorResistance);
        this.health -= this.shockChargeAmount * (1 - this.armorResistance);
        this.shockSource.recordDamage(aim);
        this.shockSource.recordDamage(this);
        this.shockSource.monsterShockingRenderingQueue.push({
            time: TeslaTower.shockRenderFrames * 2,
            args: [
                this.position.x,
                this.position.y,
                aim.position.x,
                aim.position.y,
                Position.distance(aim.position, this.position) / 2
            ]
        });
    }
    run(path, lifeTokenEmitter, towers, monsters) {
        this.runDebuffs();
        if (this.beShocked)
            this.runShock(monsters);
        if (this.beImprisoned || this.beFrozen)
            return;
        if (path.length === 0) {
            lifeTokenEmitter(-this.damage);
            this.isDead = true;
        }
        else {
            this.position.moveTo(path[0], this.speedValue);
            this.makeEffect(towers, monsters);
        }
    }
    renderHealthBar(context) {
        if (this.health <= 0 || this.health / this.maxHealth > 1)
            return;
        const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius;
        context.strokeStyle = this.healthBarBorderStyle;
        context.strokeRect(this.position.x - this.radius - xaxisOffset, this.position.y + this.inscribedSquareSideLength / 1.5, this.healthBarWidth, this.healthBarHeight);
        context.fillStyle = this.healthBarFillStyle;
        context.fillRect(this.position.x - this.radius - xaxisOffset, this.position.y + this.inscribedSquareSideLength / 1.5, this.healthBarWidth * this.health / this.maxHealth, this.healthBarHeight);
    }
    renderLevel(context) {
        context.font = '6px TimesNewRoman';
        context.fillStyle = context.manager.towerLevelTextStyle;
        context.fillText('lv ' + this.__inner_level, this.position.x + this.radius * 0.78, this.position.y - this.radius * 0.78);
    }
    renderDebuffs(context, imgCtl) {
        const dSize = 10;
        const debuffs = [];
        if (this.bePoisoned) {
            debuffs.push(imgCtl.getImage('buff_poison'));
        }
        if (this.beBloodied) {
            debuffs.push(imgCtl.getImage('buff_bloody'));
        }
        if (this.beImprecated) {
            debuffs.push(imgCtl.getImage('buff_imprecate'));
        }
        if (this.beBurned) {
            debuffs.push(imgCtl.getImage('buff_burn'));
        }
        if (this.beOnLightEcho.length > 0) {
            debuffs.push(imgCtl.getImage('buff_light_echo'));
        }
        if (this.beImprisoned) {
            debuffs.push(imgCtl.getImage('buff_imprison'));
        }
        if (this.beFrozen) {
            debuffs.push(imgCtl.getImage('buff_freeze'));
        }
        if (this.beShocked) {
            debuffs.push(imgCtl.getImage('buff_shock'));
        }
        if (this.beTransformed) {
            debuffs.push(imgCtl.getImage('buff_transform'));
        }
        debuffs.forEach((dbf, idx) => {
            const x = this.position.x - this.radius + dSize * idx;
            const y = this.position.y - this.radius - dSize;
            context.drawImage(dbf, x, y, dSize - 1, dSize - 1);
        });
    }
    renderStatusBoard(..._args) {
        TowerBase.prototype.renderStatusBoard.call(this, ...arguments, 180);
    }
    render(context, imgCtl) {
        const ftmp = context.font;
        super.render(context);
        this.renderHealthBar(context);
        this.renderDebuffs(context, imgCtl);
        context.font = ftmp;
    }
}
MonsterBase.informationDesc = new Map();
class BulletBase extends ItemBase {
    constructor(position, radius, borderWidth, borderStyle, image, atk, speed, target) {
        super(position, radius, borderWidth, borderStyle, image);
        this.fulfilled = false;
        this.Atk = atk;
        this.speed = speed;
        this.target = target;
    }
    setDamageEmitter(emitter) {
        this.emitter = emitter;
    }
    get isReaching() {
        return Position.distancePow2(this.position, this.target.position) < Math.pow(this.target.radius + this.radius, 2);
    }
    run(monsters) {
        this.position.moveTo(this.target.position, this.speed);
        if (this.target.isDead) {
            this.fulfilled = true;
            this.target = null;
        }
        else if (this.isReaching) {
            this.hit(this.target, 1, monsters);
            this.fulfilled = true;
            this.target = null;
        }
        else if (this.position.outOfBoundary(Position.O, Game.callBoundaryPosition(), 50)) {
            console.log('a bullet has run out of the bound, and will be swipe by system.');
            console.log(this);
            this.fulfilled = true;
            this.target = null;
        }
    }
    hit(monster, magnification = 1, _msts) {
        monster.health -= this.Atk * magnification * (1 - monster.armorResistance);
        this.emitter(monster);
    }
    renderImage(context) {
        if (this.image instanceof AnimationSprite) {
            return;
        }
        const transFormed = this.rotateForward(context, this.target.position);
        context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.inscribedSquareSideLength * -0.5, this.inscribedSquareSideLength * -0.5, this.inscribedSquareSideLength, this.inscribedSquareSideLength);
        transFormed.restore();
    }
}
class BulletManager {
    constructor() {
        if (!BulletManager.instance) {
            this.bullets = [];
            this.__bctor_cache = new Map();
            BulletManager.instance = this;
        }
        return BulletManager.instance;
    }
    Factory(emitter, bulletName, position, atk, target, image, ...extraArgs) {
        let ctor = null;
        if (this.__bctor_cache.has(bulletName)) {
            ctor = this.__bctor_cache.get(bulletName);
        }
        else {
            ctor = eval(bulletName);
            this.__bctor_cache.set(bulletName, ctor);
        }
        const bb = new ctor(position, atk, target, image, ...extraArgs);
        bb.setDamageEmitter(emitter);
        this.bullets.push(bb);
        return bb;
    }
    run(monsters) {
        this.bullets.forEach(b => b.run(monsters));
    }
    render(ctx) {
        this.bullets.forEach(b => b.render(ctx));
    }
    scanSwipe() {
        this.bullets = this.bullets.filter(b => {
            if (b.fulfilled)
                b.destory();
            return !b.fulfilled;
        });
    }
}
BulletManager.instance = null;
class CannonBullet extends BulletBase {
    constructor(position, atk, target, _bimg, explosionDmg, explosionRadius, burnDotDamage, burnDotInterval, burnDotDuration, extraBV, ratioCalc) {
        super(position, 2, 1, 'rgba(15,244,11,.9)', 'rgba(15,12,11,.6)', atk, CannonBullet.bulletVelocity + (extraBV || 0), target);
        this.aimPosition = null;
        this.explosionDmg = explosionDmg;
        this.explosionRadius = explosionRadius;
        this.burnDotDamage = burnDotDamage;
        this.burnDotInterval = burnDotInterval;
        this.burnDotDuration = burnDotDuration;
        this.ratioCalc = ratioCalc;
    }
    get isReaching() {
        if (this.aimPosition)
            return Position.distancePow2(this.position, this.aimPosition) < Math.pow(20 + this.radius, 2);
        return super.isReaching;
    }
    get burnDotCount() {
        return this.burnDotDuration / this.burnDotInterval;
    }
    run(monsters) {
        if (!this.target) {
            this.position.moveTo(this.aimPosition, this.speed);
        }
        else {
            this.position.moveTo(this.target.position, this.speed);
            if (this.target.isDead) {
                this.aimPosition = this.target.position.copy();
                this.target = null;
            }
        }
        if (this.isReaching) {
            this.hit(this.target, 1, monsters);
            this.fulfilled = true;
        }
    }
    hit(monster, _magnification = 1, monsters) {
        if (monster)
            super.hit(monster, this.ratioCalc(monster));
        const target = this.target ? this.target.position : this.aimPosition;
        const positionTL = new Position(target.x - this.explosionRadius, target.y - this.explosionRadius);
        Game.callAnimation('explo_3', positionTL, this.explosionRadius * 2, this.explosionRadius * 2, .5, 0);
        monsters.forEach(m => {
            if (Position.distancePow2(m.position, target) < this.explosionRadius * this.explosionRadius) {
                m.health -= this.explosionDmg * (1 - m.armorResistance) * this.ratioCalc(m);
                this.emitter(m);
                Tools.installDot(m, 'beBurned', this.burnDotDuration, this.burnDotInterval, this.burnDotDamage * this.ratioCalc(m), false, this.emitter.bind(this));
            }
        });
    }
}
CannonBullet.bulletVelocity = 4;
class ClusterBomb extends CannonBullet {
    constructor(...args) {
        super(...args);
        this.radius += 4;
        this.borderStyle = 'rgba(14,244,11,.9)';
        this.fill = 'rgba(215,212,11,.6)';
        this.speed += 2;
    }
    get childExplodeRadius() {
        return this.explosionRadius * .5;
    }
    get childBombDistance() {
        return this.explosionRadius * .5;
    }
    get childExplodeDamage() {
        return this.explosionDmg * .8;
    }
    clusterExplode(monsters, radius, dist, dmg, degree, waitFrame) {
        const childExplodePositions = _.range(0, 360, degree).map(d => {
            const vec = new PolarVector(dist, d);
            const pos = this.position.copy().move(vec);
            const positionTL = new Position(pos.x - radius, pos.y - radius);
            Game.callAnimation('explo_3', positionTL, radius * 2, radius * 2, .5, 0, waitFrame);
            return pos;
        });
        monsters.forEach(m => {
            childExplodePositions
                .filter(ep => Position.distancePow2(m.position, ep) < radius * radius)
                .forEach(() => {
                m.health -= dmg * (1 - m.armorResistance) * this.ratioCalc(m);
                this.emitter(m);
                Tools.installDot(m, 'beBurned', this.burnDotDuration, this.burnDotInterval, this.burnDotDamage * this.ratioCalc(m), false, this.emitter.bind(this));
            });
        });
    }
    hit(monster, _magnification = 1, monsters) {
        if (monster)
            super.hit(monster, _magnification, monsters);
        this.clusterExplode(monsters, this.childExplodeRadius, this.childBombDistance, this.childExplodeDamage, 45, 10);
    }
}
class ClusterBombEx extends ClusterBomb {
    constructor(...args) {
        super(...args);
        this.radius += 2;
        this.fill = 'rgba(245,242,11,.8)';
    }
    get grandChildExplodeRadius() {
        return super.childExplodeRadius * .5;
    }
    get grandChildBombDistance() {
        return super.childBombDistance * 2;
    }
    get grandChildExplodeDamage() {
        return super.childExplodeDamage * .8;
    }
    hit(monster, _magnification = 1, monsters) {
        super.hit(monster, _magnification, monsters);
        this.clusterExplode(monsters, this.grandChildExplodeRadius, this.grandChildBombDistance, this.grandChildExplodeDamage, 30, 20);
    }
}
class NormalArrow extends BulletBase {
    constructor(position, atk, target, image, critChance, critRatio, trapChance, trapDuration, extraBV, isSecKill) {
        super(position, 8, 0, null, image, atk, NormalArrow.bulletVelocity + (extraBV || 0), target);
        this.critChance = critChance;
        this.critRatio = critRatio;
        this.willTrap = Math.random() > (1 - trapChance / 100);
        this.trapDuration = trapDuration;
        this.isSecKill = isSecKill;
    }
    hit(monster) {
        if (this.isSecKill) {
            monster.health -= monster.health + 1;
            this.emitter(monster);
            return;
        }
        const critMagnification = Math.random() < this.critChance ? this.critRatio : 1;
        monster.health -= this.Atk * critMagnification * (1 - monster.armorResistance * .7);
        this.emitter(monster);
        if (this.willTrap) {
            monster.registerImprison(this.trapDuration / 1000 * 60);
        }
    }
}
NormalArrow.bulletVelocity = 18;
class PoisonCan extends BulletBase {
    constructor(position, atk, target, _image, poisonAtk, poisonItv, poisonDur, extraBV) {
        super(position, 2, 1, 'rgba(244,22,33,1)', 'rgba(227,14,233,.9)', atk, PoisonCan.bulletVelocity + (extraBV || 0), target);
        this.poisonAtk = poisonAtk;
        this.poisonItv = poisonItv;
        this.poisonDur = poisonDur;
    }
    hit(monster) {
        super.hit(monster);
        Tools.installDot(monster, 'bePoisoned', this.poisonDur, this.poisonItv, this.poisonAtk, true, this.emitter.bind(this));
    }
}
PoisonCan.bulletVelocity = 6;
class CanvasManager {
    constructor() {
        this.canvasElements = [];
        this.canvasContextMapping = new Map();
        this.offscreenCanvasMapping = new Map();
    }
    getContext(id) {
        return this.canvasContextMapping.get(id);
    }
    createCanvasInstance(id, style = {}, height, width, offDocument, wiredEvent = null, paintingOffScreenRenderingContextId = null) {
        style = style || {};
        height = height || innerHeight;
        width = width || innerWidth;
        if (offDocument) {
            if ('OffscreenCanvas' in window) {
                const canvasOff = new OffscreenCanvas(width, height);
                const ctx = canvasOff.getContext('2d');
                ctx.manager = this;
                ctx.dom = canvasOff;
                ctx.font = 'lighter 7px Game';
                this.canvasElements.push(canvasOff);
                this.canvasContextMapping.set(id, ctx);
                this.offscreenCanvasMapping.set(id, canvasOff);
                return ctx;
            }
            else {
                const canvasEle = document.createElement('canvas');
                canvasEle.width = width;
                canvasEle.height = height;
                canvasEle.id = id;
                const ctx = canvasEle.getContext('2d');
                ctx.manager = this;
                ctx.dom = canvasEle;
                ctx.font = 'lighter 7px Game';
                this.canvasElements.push(canvasEle);
                this.canvasContextMapping.set(id, ctx);
                this.offscreenCanvasMapping.set(id, canvasEle);
                return ctx;
            }
        }
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
                    ctx = canvasEle.getContext('bitmaprenderer');
                    const osc = this.offscreenCanvasMapping.get(paintingOffScreenRenderingContextId);
                    ctx._off_screen_paint = function () {
                        this.transferFromImageBitmap(osc.transferToImageBitmap());
                    };
                }
                else {
                    ctx = canvasEle.getContext('2d');
                    const osc = this.offscreenCanvasMapping.get(paintingOffScreenRenderingContextId);
                    ctx._off_screen_paint = function () {
                        this.clearRect(0, 0, osc.width, osc.height);
                        this.drawImage(osc, 0, 0);
                    };
                }
            }
            else {
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
    get towerLevelTextStyle() {
        return 'rgba(13,13,13,1)';
    }
    refreshText(text, context, positionTL, outerBoxPositionTL, width, height, style, fillOrStroke = true, font) {
        context = context || this.getContext('bg');
        context.clearRect(outerBoxPositionTL.x, outerBoxPositionTL.y, width, height);
        if (window.__debug_show_refresh_rect) {
            context.save();
            context.lineWidth = 1;
            context.strokeStyle = 'rgba(255,0,0,.5)';
            context.strokeRect(outerBoxPositionTL.x + 1, outerBoxPositionTL.y + 1, width - 2, height - 2);
            context.restore();
        }
        if (style)
            fillOrStroke ? context.fillStyle = style : context.strokeStyle = style;
        if (font)
            context.font = font;
        fillOrStroke ? context.fillText(text, positionTL.x, positionTL.y, width) : context.strokeText(text, positionTL.x, positionTL.y, width);
    }
}
class EventManager {
    bindEvent(eventAndCallback, ele) {
        eventAndCallback.forEach(eac => ele[eac.ename] = eac.cb);
    }
}
class MonsterManager {
    constructor() {
        this.monsters = [];
        this.__mctor_cache = new Map();
    }
    Factory(monsterName, position, image, level, ...extraArgs) {
        let ctor = null;
        if (this.__mctor_cache.has(monsterName)) {
            ctor = this.__mctor_cache.get(monsterName);
        }
        else {
            ctor = eval(monsterName);
            this.__mctor_cache.set(monsterName, ctor);
        }
        const nm = new ctor(position, image, level, ...extraArgs);
        this.monsters.push(nm);
        return nm;
    }
    run(pathGetter, lifeToken, towers, monsters) {
        this.monsters.forEach(m => {
            m.run(pathGetter(m.position), lifeToken, towers, monsters);
        });
    }
    render(ctx, imgCtl) {
        this.monsters.forEach(m => m.render(ctx, imgCtl));
    }
    scanSwipe(emitCallback) {
        this.monsters = this.monsters.filter(m => {
            if (m.isDead) {
                emitCallback(m.reward);
                m.destory();
            }
            return !m.isDead;
        });
    }
    get totalCurrentHealth() {
        return _.sumBy(this.monsters, '__inner_current_health');
    }
    get maxLevel() {
        return this.monsters.length > 0 ? _.maxBy(this.monsters, '__inner_level').level : 0;
    }
}
MonsterManager.monsterCtors = {
    Swordman: 'Swordman',
    Axeman: 'Axeman',
    LionMan: 'LionMan',
    HighPriest: 'HighPriest',
    Devil: 'Devil'
};
class Swordman extends MonsterBase {
    constructor(position, image, level) {
        super(position, Game.callGridSideSize() / 3 - 2, 0, null, image, level, Swordman.rwd, Swordman.spd, Swordman.hth, Swordman.amr);
        this.name = '邪恶的剑士';
        this.description = '曾今是流浪的剑士，如今被大魔神控制';
    }
    makeEffect() { }
    renderHealthChange() { }
}
Swordman.imgName = '$spr::m_act_white_sword';
Swordman.sprSpd = 4;
Swordman.rwd = (lvl) => 20 * lvl + 20;
Swordman.spd = (lvl) => Math.min(.3 + lvl / 60, 1.15);
Swordman.hth = (lvl) => 120 + lvl * 40;
Swordman.amr = (lvl) => 3 + lvl / 8;
class Axeman extends MonsterBase {
    constructor(position, image, level) {
        super(position, Game.callGridSideSize() / 3 - 2, 0, null, image, level, Axeman.rwd, Axeman.spd, Axeman.hth, Axeman.amr);
        this.name = '蛮族斧手';
        this.description = '';
    }
    makeEffect() { }
    renderHealthChange() { }
}
Axeman.imgName = '$spr::m_act_green_axe';
Axeman.sprSpd = 4;
Axeman.rwd = (lvl) => 30 * lvl + 20;
Axeman.spd = (lvl) => Math.min(.25 + lvl / 80, 1);
Axeman.hth = (lvl) => 300 + lvl * 100;
Axeman.amr = (lvl) => 5 + lvl / 6;
class LionMan extends MonsterBase {
    constructor(position, image, level) {
        super(position, Game.callGridSideSize() / 3 - 2, 0, null, image, level, LionMan.rwd, LionMan.spd, LionMan.hth, LionMan.amr);
        this.name = '狮人';
        this.description = '';
    }
    makeEffect() { }
    renderHealthChange() { }
}
LionMan.imgName = '$spr::m_lion';
LionMan.sprSpd = 6;
LionMan.rwd = (lvl) => 40 * lvl + 20;
LionMan.spd = (lvl) => Math.min(.38 + lvl / 70, 1.2);
LionMan.hth = (lvl) => 580 + lvl * 122;
LionMan.amr = (lvl) => 22 + lvl / 5;
class HighPriest extends MonsterBase {
    constructor(position, image, level) {
        super(position, Game.callGridSideSize() / 2 - 1, 0, null, image, level, HighPriest.rwd, HighPriest.spd, HighPriest.hth, HighPriest.amr);
        this.lastHealTime = performance.now();
        this.isBoss = true;
        this.name = '龙人萨满';
        this.type = '首领';
        this.description = '';
    }
    renderHealthChange() { }
    get healthBarWidth() {
        return this.radius * 2.5;
    }
    get healthBarHeight() {
        return 4;
    }
    get canHeal() {
        return performance.now() - this.lastHealTime > this.Hitv;
    }
    get Hitv() {
        const base = HighPriest.healingInterval(this.level);
        return _.random(base - 200, base + 200, false);
    }
    get Hpow() {
        return HighPriest.healingPower(this.level);
    }
    get Hrng() {
        return HighPriest.healingRange(this.level);
    }
    inHealingRange(target) {
        return Position.distancePow2(target.position, this.position) < this.Hrng * this.Hrng;
    }
    healing(target) {
        target.health += this.Hpow;
    }
    makeEffect(_towers, monsters) {
        if (this.canHeal) {
            const position = new Position(this.position.x - this.Hrng / 2, this.position.y - this.Hrng / 2);
            Game.callAnimation('healing_1', position, this.Hrng, this.Hrng, 1, 0);
            monsters.forEach(m => {
                if (this.inHealingRange(m)) {
                    this.healing(m);
                }
            });
            this.lastHealTime = performance.now();
        }
    }
    renderHealthBar(context) {
        super.renderHealthBar(context);
        const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius;
        context.save();
        context.fillStyle = this.healthBarTextFillStyle;
        context.font = this.healthBarTextFontStyle;
        context.fillText(`${Tools.chineseFormatter(this.health, 1)}/${Tools.chineseFormatter(this.maxHealth, 1)}`, this.position.x + this.radius + xaxisOffset + 2, this.position.y + this.inscribedSquareSideLength / 1.5 + 5);
        context.restore();
    }
}
HighPriest.imgName = '$spr::m_b_worm_dragon';
HighPriest.sprSpd = 6;
HighPriest.rwd = (lvl) => 240 * lvl + 1320;
HighPriest.spd = () => .11;
HighPriest.hth = (lvl) => 14400 + lvl * 8000;
HighPriest.amr = () => 14;
HighPriest.healingInterval = (_lvl) => 5000;
HighPriest.healingPower = (lvl) => 40 * (Math.floor(lvl / 25) + 1);
HighPriest.healingRange = (_lvl) => 30;
class Devil extends MonsterBase {
    constructor(position, image, level) {
        super(position, Game.callGridSideSize() / 1.4 + 3, 0, null, image, level, Devil.rwd, Devil.spd, Devil.hth, Devil.amr);
        this.isBoss = true;
        this.name = '地狱之王';
        this.type = '首领';
        this.description = '';
    }
    makeEffect() { }
    renderHealthChange() { }
    get healthBarWidth() {
        return this.radius * 2.5;
    }
    get healthBarHeight() {
        return 4;
    }
    renderHealthBar(context) {
        super.renderHealthBar(context);
        const xaxisOffset = this.healthBarWidth < this.radius * 2 ? 0 : this.healthBarWidth / 2 - this.radius;
        context.save();
        context.fillStyle = this.healthBarTextFillStyle;
        context.font = this.healthBarTextFontStyle;
        context.fillText(`${Tools.chineseFormatter(this.health, 1)}/${Tools.chineseFormatter(this.maxHealth, 1)}`, this.position.x + this.radius + xaxisOffset + 2, this.position.y + this.inscribedSquareSideLength / 1.5 + 5);
        context.restore();
    }
}
Devil.imgName = '$spr::m_devil';
Devil.sprSpd = 6;
Devil.rwd = (lvl) => 340 * lvl + 420;
Devil.spd = (_lvl) => .14;
Devil.hth = (lvl) => 15500 + lvl * 13000;
Devil.amr = (lvl) => 32 + lvl;
Devil.summonInterval = () => 7000;
const __testMode = localStorage.getItem('debug_mode') === '1';
const towerCtors = [
    {
        dn: '弓箭塔',
        c: 'MaskManTower',
        od: 1,
        n: 'archer0',
        n2: 'archer1',
        n3: 'archer2',
        n4: 'archer3',
        p: new Proxy({}, {
            get(_t, p, _r) {
                if (p === 'length')
                    return 180;
                else
                    return Math.ceil(Math.pow(1.1, +p) * 10);
            }
        }),
        r: (lvl) => lvl * 0.8 + 180,
        a: (lvl) => lvl * 2 + 2,
        h: (_lvl) => 1,
        s: (lvl) => Math.floor(lvl / 20) + 2,
        bctor: 'NormalArrow',
        bn: 'normal_arrow',
        bn2: 'flame_arrow'
    },
    {
        dn: '加农炮塔',
        c: 'CannonShooter',
        od: 2,
        n: 'cannon0',
        n2: 'cannon1',
        n3: 'cannon2',
        p: new Proxy({}, {
            get(_t, p, _r) {
                if (p === 'length')
                    return 170;
                else
                    return Math.ceil(Math.pow(1.1, +p) * 15);
            }
        }),
        r: (lvl) => lvl * 0.75 + 120,
        a: (lvl) => lvl * 2 + 2,
        h: (lvl) => 0.7 + lvl * 0.004,
        s: (_lvl) => 1,
        expr: (lvl) => Math.min(20 + lvl * 2, 90),
        expatk: (atk) => atk * 3.8 + 120,
        bdatk: (atk) => atk / 12,
        bdatk2: (atk) => atk / 10,
        bdatk3: (atk) => atk / 8,
        bdatk4: (atk) => atk / 6,
        bdatk5: (atk) => atk / 4,
        bditv: (_lvl) => 500,
        bddur: (_lvl) => 8000,
        bctor: 'CannonBullet',
        bctor2: 'ClusterBomb',
        bctor3: 'ClusterBombEx'
    },
    {
        dn: '冰霜塔',
        c: 'FrostTower',
        od: 3,
        n: 'ice',
        p: new Proxy({}, {
            get(_t, p, _r) {
                if (p === 'length')
                    return 70;
                else
                    return Math.ceil(Math.pow(1.1, +p) * 320);
            }
        }),
        r: (lvl) => lvl * 2.5 + 100,
        a: (_lvl) => 0,
        h: (_lvl) => Infinity,
        s: (_lvl) => 0,
        sr: (lvl) => Tools.MathFx.naturalLogFx(.1, .12)(lvl)
    },
    {
        dn: '毒气塔',
        c: 'PoisonTower',
        od: 4,
        n: 'poison_t',
        p: new Proxy({}, {
            get(_t, p, _r) {
                if (p === 'length')
                    return 190;
                else
                    return Math.ceil(Math.pow(1.1, +p) * 50);
            }
        }),
        r: (lvl) => lvl * 0.8 + 100,
        a: (lvl) => Math.round(lvl / 20 + 2),
        h: (lvl) => 2.1 + lvl * 0.1,
        s: (_lvl) => 1,
        patk: (lvl) => lvl * 4 * Math.max(lvl / 25, 1) + 90,
        pitv: (lvl) => Math.max(600 - lvl * 20, 50),
        pdur: (_lvl) => 5000,
        bctor: 'PoisonCan'
    },
    {
        dn: '电能塔',
        c: 'TeslaTower',
        od: 5,
        n: 'tesla0',
        n2: 'tesla1',
        n3: 'tesla2',
        p: new Proxy({}, {
            get(_t, p, _r) {
                if (p === 'length')
                    return 180;
                else
                    return Math.ceil(Math.pow(1.1, +p) * 105);
            }
        }),
        r: (_lvl) => 70,
        a: (lvl) => 18 + Math.round((lvl / 2 + 3) * (lvl / 2 + 3)),
        h: (lvl) => 0.75 + lvl * 0.01,
        s: (_lvl) => 0
    },
    {
        dn: '魔法塔',
        c: 'BlackMagicTower',
        od: 6,
        n: 'magic0',
        n2: 'magic1',
        n3: 'magic2',
        n4: 'magic3',
        p: new Proxy({}, {
            get(_t, p, _r) {
                if (p === 'length')
                    return 150;
                else
                    return Math.ceil(Math.pow(1.1, +p) * 200);
            }
        }),
        r: (lvl) => lvl * 1 + 140,
        a: (lvl) => 5000 + Math.round((lvl + 4) * (lvl + 4)),
        a2: (lvl) => 9000 + Math.round((lvl + 8) * (lvl + 8)),
        a3: (lvl) => 15000 + Math.round((lvl + 16) * (lvl + 16)),
        a4: (lvl) => 42000 + Math.round((lvl + 32) * (lvl + 32)),
        h: (_lvl) => 0.125,
        s: (_lvl) => 1,
        ide: (lvl) => Math.min(lvl * 0.022 + 0.1, 10),
        idr: (lvl) => 10000 + 100 * lvl
    },
    {
        dn: '激光塔',
        c: 'LaserTower',
        od: 7,
        n: 'laser0',
        n2: 'laser1',
        n3: 'laser2',
        n4: 'laser3',
        n5: 'laser4',
        p: new Proxy({}, {
            get(_t, p, _r) {
                if (p === 'length')
                    return 150;
                else
                    return Math.ceil(Math.pow(1.1, +p) * 500);
            }
        }),
        r: (lvl) => lvl * 0.55 + 90,
        a: (lvl) => Math.round(lvl * 3 + 10),
        h: (_lvl) => 0.8,
        h2: (_lvl) => 1,
        s: (_lvl) => 1,
        s2: (lvl) => Math.floor(lvl / 30) + 1,
        s3: (lvl) => Math.floor(lvl / 28) + 3,
        lsd: (_lvl) => 90,
        fatk: (lvl) => Math.pow(lvl, 1.05) * 10 + 160,
        fw: (lvl) => 40 + Math.floor(lvl / 8)
    },
    {
        dn: '航母',
        c: 'CarrierTower',
        od: 7,
        n: 'carrier0',
        n1: 'carrier1',
        n2: 'carrier2',
        cn: 'plane_1',
        p: new Proxy({}, {
            get(_t, p, _r) {
                if (p === 'length')
                    return 200;
                else
                    return Math.ceil(Math.pow(1.1, +p) * 1000);
            }
        }),
        r: (_lvl) => 150,
        a: (lvl) => 25 + lvl * 8,
        h: (lvl) => 0.8 + lvl * 0.01,
        s: (_lvl) => 1,
        child: (lvl) => 1 + Math.floor(lvl / 20),
        spd: (_lvl) => 5
    },
];
class _TowerManager {
    constructor() {
        this.towers = [];
        this.independentTowers = [];
        this.towerChangeHash = -1;
    }
    Factory(towerName, position, image, bulletImage, radius, ...extraArgs) {
        const nt = new (eval(towerName))(position, image, bulletImage, radius, ...extraArgs);
        this.constructor.independentCtors.includes(nt.constructor.name) ? this.independentTowers.push(nt) : this.towers.push(nt);
        return nt;
    }
    run(monsters) {
        this.towers.forEach(t => {
            if (t.gem)
                t.gem.tickHook(t, monsters);
            t.run(monsters);
        });
        this.independentTowers.forEach(t => {
            t.run(monsters);
        });
    }
    render(ctx) {
        this.towers.forEach(t => t.render(ctx));
    }
    rapidRender(ctxRapid, monsters) {
        this.towers.forEach(t => t.rapidRender(ctxRapid, monsters));
        this.independentTowers.forEach(t => t.rapidRender(ctxRapid, monsters));
    }
    makeHash() {
        const c = _.sumBy(this.towers, 'level');
        const l = this.towers.length;
        return c + l + c * l;
    }
    scanSwipe(emitCallback) {
        this.towers = this.towers.filter(t => {
            if (t.isSold) {
                emitCallback(t.sellingPrice);
                t.destory();
            }
            return !t.isSold;
        });
        this.independentTowers = this.independentTowers.filter(t => {
            if (t.isSold) {
                emitCallback(t.sellingPrice);
                t.destory();
            }
            return !t.isSold;
        });
        const currentTowerChangeHash = this.makeHash();
        const needRender = currentTowerChangeHash !== this.towerChangeHash;
        this.towerChangeHash = currentTowerChangeHash;
        return needRender;
    }
    get totalDamage() {
        return this.towers.concat(this.independentTowers).reduce((cv, pv) => cv + pv.__total_damage, 0);
    }
    get totalKill() {
        return this.towers.concat(this.independentTowers).reduce((cv, pv) => cv + pv.__kill_count, 0);
    }
}
_TowerManager.independentCtors = [
    '_Jet'
];
_TowerManager.towerCtors = towerCtors;
_TowerManager.rankPostfixL1 = '老兵';
_TowerManager.rankPostfixL2 = '身经百战';
_TowerManager.rankPostfixL3 = '大师';
const TowerManager = new Proxy(_TowerManager, {
    get: function (target, property, reciever) {
        if (typeof property === 'string' && /[A-Z]/.test(property[0])) {
            const tryFind = target.towerCtors.find(tc => tc.c === property);
            if (tryFind) {
                return tryFind;
            }
        }
        return Reflect.get(target, property, reciever);
    }
});
class TestTower extends TowerBase {
    constructor(position, image, _bimage, radius) {
        super(position, radius, 0, null, image, TowerManager.TestTower.p, TowerManager.TestTower.a, TowerManager.TestTower.h, TowerManager.TestTower.s, TowerManager.TestTower.r);
        this.canInsertGem = false;
        this.bulletCtorName = TowerManager.TestTower.bctor;
        this.name = TowerManager.TestTower.dn;
        this.description = 'TOWER FOR TEST DAMAGE';
    }
    rapidRender() { }
}
TestTower.TestBullet = class _TestBullet extends BulletBase {
    constructor(position, atk, target) {
        super(position, 3, 0, null, 'rgba(15,44,11,1)', atk, 50, target);
    }
};
class CannonShooter extends TowerBase {
    constructor(position, image, _bimg, radius) {
        super(position, radius, 1, 'rgba(156,43,12,.5)', image, TowerManager.CannonShooter.p, TowerManager.CannonShooter.a, TowerManager.CannonShooter.h, TowerManager.CannonShooter.s, TowerManager.CannonShooter.r);
        this.levelEpdRngFx = TowerManager.CannonShooter.expr;
        this.levelEpdAtkFx = TowerManager.CannonShooter.expatk;
        this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk;
        this.levelBrnItvFx = TowerManager.CannonShooter.bditv;
        this.levelBrnDurFx = TowerManager.CannonShooter.bddur;
        this.extraExplosionDamage = 0;
        this.extraExplosionRange = 0;
        this.extraExplosionDamageRatio = 1;
        this.extraExplosionRangeRatio = 1;
        this.extraRange = 0;
        this.extraBulletV = 0;
        this.inner_desc_init = '发射火炮，在命中后会爆炸\n+ 附加灼烧效果';
        this.bulletCtorName = TowerManager.CannonShooter.bctor;
        this.name = TowerManager.CannonShooter.dn;
        this.description = this.inner_desc_init;
    }
    rapidRender() { }
    levelUp(currentMoney) {
        const ret = super.levelUp(currentMoney);
        if (ret !== 0) {
            switch (this.level) {
                case 5:
                    this.rankUp();
                    this.name = '榴弹塔';
                    this.image = Game.callImageBitMap(TowerManager.CannonShooter.n2);
                    this.description += CannonShooter.rankUpDesc1;
                    this.borderStyle = 'rgba(206,43,12,.7)';
                    this.extraExplosionDamage = 100;
                    this.extraExplosionRange = 10;
                    this.extraBulletV = 2;
                    this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk2;
                    break;
                case 10:
                    this.rankUp();
                    this.name = '导弹塔';
                    this.image = Game.callImageBitMap(TowerManager.CannonShooter.n3);
                    this.description += CannonShooter.rankUpDesc2;
                    this.borderStyle = 'rgba(246,43,12,.9)';
                    this.extraExplosionDamage = 150;
                    this.extraRange = 100;
                    this.extraBulletV = 14;
                    this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk3;
                    break;
                case 15:
                    this.rankUp();
                    this.name = '集束炸弹塔';
                    this.description += CannonShooter.rankUpDesc3;
                    this.extraExplosionDamage = 200;
                    this.extraRange = 150;
                    this.extraExplosionRange = 20;
                    this.bulletCtorName = TowerManager.CannonShooter.bctor2;
                    this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk4;
                    break;
                case 30:
                    this.rankUp();
                    this.name = '云爆塔';
                    this.description += CannonShooter.rankUpDesc4;
                    this.extraExplosionDamage = 250;
                    this.extraRange = 200;
                    this.extraExplosionRange = 30;
                    this.bulletCtorName = TowerManager.CannonShooter.bctor3;
                    this.levelBrnAtkFx = TowerManager.CannonShooter.bdatk5;
                    break;
                case 40:
                    this.rankUp();
                    Object.defineProperty(this, 'extraExplosionDamage', {
                        enumerable: true,
                        get() {
                            return 250 + Math.floor((this.level - 40) * 30);
                        }
                    });
                    this.name += ` ${TowerManager.rankPostfixL1}I`;
                    break;
                case 50:
                    this.rankUp();
                    this.name = this.name.replace('I', 'II');
                    break;
                case 60:
                    this.rankUp();
                    this.name = this.name.replace('II', 'III');
                    break;
                case 70:
                    this.rankUp();
                    this.name = this.name.replace('III', 'IV');
                    this.extraExplosionDamageRatio = 1.5;
                    break;
                case 80:
                    this.rankUp();
                    this.name = this.name.replace('IV', 'V');
                    this.extraExplosionDamageRatio = 1.5 * 1.5;
                    break;
                case 90:
                    this.rankUp();
                    this.name = this.name.replace(TowerManager.rankPostfixL1, TowerManager.rankPostfixL2).replace('V', 'I');
                    this.extraExplosionDamageRatio = 1.5 * 1.5 * 1.5;
                    this.extraExplosionRangeRatio = 1.1;
                    break;
                case 100:
                    this.rankUp();
                    this.name = this.name.replace('I', 'II');
                    this.extraExplosionDamageRatio = 1.5 * 1.5 * 1.5 * 1.5;
                    this.extraExplosionRangeRatio = 1.2;
                    break;
            }
        }
        return ret;
    }
    get EpdRng() {
        return (this.levelEpdRngFx(this.level) + this.extraExplosionRange) * this.extraExplosionRangeRatio;
    }
    get EpdAtk() {
        return (this.levelEpdAtkFx(this.Atk) + this.extraExplosionDamage) * this.extraExplosionDamageRatio;
    }
    get BrnAtk() {
        return this.levelBrnAtkFx(this.Atk);
    }
    get BrnItv() {
        return this.levelBrnItvFx(this.level);
    }
    get BrnDur() {
        return this.levelBrnDurFx(this.level);
    }
    get Rng() {
        return super.Rng + this.reviceRange(this.extraRange);
    }
    get informationSeq() {
        return super.informationSeq.concat([
            ['爆炸半径', Tools.roundWithFixed(this.EpdRng, 1) + ''],
            ['爆炸伤害', Tools.chineseFormatter(this.EpdAtk, 3)],
            ['每跳灼烧伤害', Math.round(this.BrnAtk) + ''],
            ['灼烧伤害频率', Tools.roundWithFixed(this.BrnItv / 1000, 1) + ' 秒'],
            ['灼烧持续', Tools.roundWithFixed(this.BrnDur / 1000, 1) + ' 秒']
        ]);
    }
    produceBullet() {
        this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk, this.target, this.bulletImage, this.EpdAtk, this.EpdRng, this.BrnAtk, this.BrnItv, this.BrnDur, this.extraBulletV, this.calculateDamageRatio.bind(this));
    }
}
CannonShooter.rankUpDesc1 = '\n+ 爆炸范围和伤害得到加强';
CannonShooter.rankUpDesc2 = '\n+ 射程得到大幅加强';
CannonShooter.rankUpDesc3 = '\n+ 命中后向四周抛出小型炸弹';
CannonShooter.rankUpDesc4 = '\n+ 小型炸弹将分裂两次';
class MaskManTower extends TowerBase {
    constructor(position, image, bimage, radius) {
        super(position, radius, 1, 'rgba(26,143,12,.3)', image, TowerManager.MaskManTower.p, TowerManager.MaskManTower.a, TowerManager.MaskManTower.h, TowerManager.MaskManTower.s, TowerManager.MaskManTower.r);
        this.multipleTarget = [];
        this.extraRange = 0;
        this.extraHaste = 0;
        this.extraPower = 0;
        this.extraArrow = 0;
        this.trapChance = 0;
        this.trapDuration = 0;
        this.extraBulletV = 0;
        this.inner_desc_init = '每次向多个敌人射出箭矢\n+ 有几率暴击\n+ 拥有固定 30%的护甲穿透';
        this.critChance = 0.1;
        this.critDamageRatio = 2;
        this.secKillChance = 0;
        this.bulletCtorName = TowerManager.MaskManTower.bctor;
        this.bulletImage = bimage;
        this.name = TowerManager.MaskManTower.dn;
        this.description = this.inner_desc_init;
    }
    rapidRender() { }
    enhanceCrit(chanceDelta = .05, ratioDelta = 1) {
        if (this.critChance < 0.75)
            this.critChance += chanceDelta;
        this.critDamageRatio += ratioDelta;
    }
    levelUp(currentMoney) {
        const ret = super.levelUp(currentMoney);
        if (ret !== 0) {
            switch (this.level) {
                case 5:
                    this.rankUp();
                    this.name = '弩箭塔';
                    this.image = Game.callImageBitMap(TowerManager.MaskManTower.n2);
                    this.description += MaskManTower.rankUpDesc1;
                    this.borderStyle = 'rgba(26,143,12,.5)';
                    this.extraRange = 160;
                    this.extraPower = 10;
                    this.extraBulletV = 2;
                    break;
                case 10:
                    this.rankUp();
                    this.name = '火枪塔';
                    this.image = Game.callImageBitMap(TowerManager.MaskManTower.n3);
                    this.secKillChance = 0.003;
                    this.description += MaskManTower.rankUpDesc2.replace('$', Math.round(this.secKillChance * 1000) + '');
                    this.borderStyle = 'rgba(26,203,12,.7)';
                    this.enhanceCrit(0.15, 6);
                    this.extraPower = 20;
                    this.extraBulletV = 4;
                    break;
                case 15:
                    this.rankUp();
                    this.name = '精灵神射手塔';
                    this.description += MaskManTower.rankUpDesc3;
                    this.image = Game.callImageBitMap(TowerManager.MaskManTower.n4);
                    this.borderStyle = 'rgba(26,255,12,.9)';
                    this.enhanceCrit(0.1);
                    this.extraRange = 180;
                    this.trapChance = 5;
                    this.trapDuration = 3000;
                    this.extraBulletV = 8;
                    Object.defineProperty(this, 'extraHaste', {
                        enumerable: true,
                        get() {
                            return 0.5 + (this.level - 15) * 0.004;
                        }
                    });
                    this.extraArrow = 16;
                    break;
                case 20:
                    this.rankUp();
                    this.name += ` ${TowerManager.rankPostfixL1}I`;
                    this.enhanceCrit(0.05, 2);
                    break;
                case 30:
                    this.rankUp();
                    this.name = this.name.replace('I', 'II');
                    this.enhanceCrit();
                    this.trapChance = 6;
                    this.trapDuration = 3500;
                    break;
                case 40:
                    this.rankUp();
                    this.name = this.name.replace('II', 'III');
                    this.enhanceCrit();
                    this.trapChance = 7;
                    this.trapDuration = 4000;
                    break;
                case 50:
                    this.rankUp();
                    this.name = this.name.replace('III', 'IV');
                    this.enhanceCrit();
                    this.trapChance = 7.5;
                    this.trapDuration = 4300;
                    break;
                case 60:
                    this.rankUp();
                    this.name = this.name.replace('IV', 'V');
                    this.enhanceCrit();
                    this.trapChance = 8;
                    this.trapDuration = 4400;
                    break;
                case 70:
                    this.rankUp();
                    this.name = this.name.replace(TowerManager.rankPostfixL1, TowerManager.rankPostfixL2).replace('V', 'I');
                    this.enhanceCrit(0.05, 2);
                    this.trapChance = 9;
                    this.trapDuration = 4500;
                    break;
                case 80:
                    this.rankUp();
                    this.name = this.name.replace('I', 'II');
                    this.enhanceCrit();
                    this.trapChance = 10;
                    break;
                case 90:
                    this.rankUp();
                    this.name = this.name.replace('II', 'III');
                    this.enhanceCrit();
                    break;
            }
        }
        return ret;
    }
    get DPS() {
        return super.DPS * (this.critChance * this.critDamageRatio + 1 - this.critChance);
    }
    get informationSeq() {
        return super.informationSeq.concat([
            ['暴击率', Tools.roundWithFixed(this.critChance * 100, 1) + '%'],
            ['暴击伤害', Tools.roundWithFixed(this.critDamageRatio * 100, 0) + '%']
        ]);
    }
    get Rng() {
        return super.Rng + this.reviceRange(this.extraRange);
    }
    get HstPS() {
        return super.HstPS + this.extraHaste;
    }
    get Atk() {
        return super.Atk + this.extraPower;
    }
    get Slc() {
        return super.Slc + this.extraArrow;
    }
    isThisTargetAvailable(target) {
        if (!target || target.isDead)
            return false;
        else
            return this.inRange(target);
    }
    reChooseTarget(targetList, index) {
        for (const t of _.shuffle(targetList)) {
            if (this.inRange(t)) {
                this.multipleTarget[index] = t;
                return;
            }
        }
        this.multipleTarget[index] = null;
    }
    produceBullet(idx) {
        if (this.multipleTarget[idx]) {
            const ratio = this.calculateDamageRatio(this.multipleTarget[idx]);
            this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.multipleTarget[idx], this.bulletImage, this.critChance, this.critDamageRatio, this.trapChance, this.trapDuration, this.extraBulletV, Math.random() < this.secKillChance);
        }
    }
    run(monsters) {
        if (this.canShoot) {
            for (let x_i = 0; x_i < this.Slc; x_i++) {
                if (!this.isThisTargetAvailable(this.multipleTarget[x_i])) {
                    this.reChooseTarget(monsters, x_i);
                }
            }
            this.shoot(monsters);
        }
    }
    gemHitHook(idx, msts) {
        if (this.gem && this.multipleTarget[idx]) {
            this.gem.hitHook(this, this.multipleTarget[idx], msts);
        }
    }
}
MaskManTower.rankUpDesc1 = '\n+ 射程和攻击力得到加强';
MaskManTower.rankUpDesc2 = '\n+ 暴击能力得到大幅加强\n+ 有 $‰ 的几率直接杀死目标';
MaskManTower.rankUpDesc3 = '\n+ 命中的箭矢将有几率束缚敌人';
class FrostTower extends TowerBase {
    constructor(position, image, _bimg, radius) {
        super(position, radius, 1, 'rgba(161,198,225,.6)', image, TowerManager.FrostTower.p, TowerManager.FrostTower.a, TowerManager.FrostTower.h, TowerManager.FrostTower.s, TowerManager.FrostTower.r);
        this.canInsertGem = false;
        this.levelSprFx = TowerManager.FrostTower.sr;
        this.inner_desc_init = '在自身周围形成一个圆形的减速场\n- 无法攻击\n- 无法镶嵌传奇宝石';
        this.extraEffect = (_ms) => { };
        this.lastFreezeTime = performance.now();
        this.armorDecreasingStrength = 0.9;
        this.canInsertGem = false;
        this.name = TowerManager.FrostTower.dn;
        this.description = this.inner_desc_init;
        this.armorDecreasingStrength = 0.9;
        Tools.ObjectFx.addFinalReadonlyProperty(this, 'exploitsSeq', []);
    }
    get canFreeze() {
        return performance.now() - this.lastFreezeTime > this.freezeInterval;
    }
    get freezeDurationTick() {
        return this.freezeDuration / 1000 * 60;
    }
    get SPR() {
        return this.levelSprFx(this.level);
    }
    get informationSeq() {
        const removing = ['攻击速度', '伤害', 'DPS', '弹药储备'];
        return super.informationSeq.filter(line => !removing.some(rm => rm === line[0])).concat([
            ['减速强度', Tools.roundWithFixed(this.SPR * 100, 2) + '%']
        ]);
    }
    levelUp(currentMoney) {
        const ret = super.levelUp(currentMoney);
        if (ret !== 0) {
            switch (this.level) {
                case 5:
                    this.rankUp();
                    this.name = '暴风雪I';
                    this.description += FrostTower.rankUpDesc1;
                    this.freezeInterval = 1000;
                    this.freezeDuration = 400;
                    this.extraEffect = msts => {
                        if (this.canFreeze) {
                            msts.forEach(mst => {
                                Game.callAnimation('icicle', new Position(mst.position.x - mst.radius, mst.position.y), mst.radius * 2, mst.radius * 2);
                                mst.registerFreeze(this.freezeDurationTick);
                            });
                            this.lastFreezeTime = performance.now();
                        }
                    };
                    break;
                case 10:
                    this.rankUp();
                    this.name = '暴风雪II';
                    this.description += FrostTower.rankUpDesc2.replace('$', Math.round((1 - this.armorDecreasingStrength) * 100) + '');
                    this.freezeInterval = 5000;
                    this.freezeDuration = 600;
                    this.extraEffect = msts => {
                        if (this.canFreeze) {
                            msts.forEach(mst => {
                                Game.callAnimation('icicle', new Position(mst.position.x - mst.radius, mst.position.y), mst.radius * 2, mst.radius * 2);
                                mst.registerFreeze(this.freezeDurationTick);
                                mst.inner_armor *= this.armorDecreasingStrength;
                            });
                            this.lastFreezeTime = performance.now();
                        }
                    };
                    break;
                case 15:
                    this.rankUp();
                    this.name = '暴风雪III';
                    this.description += FrostTower.rankUpDesc3;
                    this.freezeInterval = 4400;
                    this.freezeDuration = 800;
                    break;
                case 20:
                    this.rankUp();
                    this.name = '暴风雪IV';
                    this.freezeInterval = 4200;
                    this.freezeDuration = 860;
                    break;
                case 25:
                    this.rankUp();
                    this.name = '暴风雪V';
                    this.freezeInterval = 4000;
                    this.freezeDuration = 880;
                    break;
                case 30:
                    this.rankUp();
                    this.name = '暴风雪VI';
                    this.freezeInterval = 3800;
                    this.freezeDuration = 900;
                    break;
                case 35:
                    this.rankUp();
                    this.name = '暴风雪VII';
                    this.freezeInterval = 3600;
                    this.freezeDuration = 920;
                    break;
            }
        }
        return ret;
    }
    run(monsters) {
        const inRanged = monsters.filter((mst) => {
            const i = this.inRange(mst);
            if (i) {
                if (mst.speedRatio === 1 || 1 - this.SPR < mst.speedRatio)
                    mst.speedRatio = 1 - this.SPR;
            }
            else {
                mst.speedRatio !== 1 ? mst.speedRatio = 1 : void (0);
            }
            return i;
        });
        this.extraEffect(inRanged);
    }
    render(ctx) {
        super.render(ctx);
    }
    rapidRender(context) {
        if (this.canFreeze)
            return;
        context.fillStyle = 'rgba(25,25,25,.3)';
        Tools.renderSector(context, this.position.x, this.position.y, this.radius, 0, Math.PI * 2 * (1 - (performance.now() - this.lastFreezeTime) / this.freezeInterval), false).fill();
    }
}
FrostTower.rankUpDesc1 = '\n+ 周期性造成范围冻结';
FrostTower.rankUpDesc2 = '\n+ 每次冻结都能削减敌方 $% 护甲';
FrostTower.rankUpDesc3 = '\n+ 冻结能力加强';
class PoisonTower extends TowerBase {
    constructor(position, image, _bimg, radius) {
        super(position, radius, 1, 'rbga(45,244,12,.4)', image, TowerManager.PoisonTower.p, TowerManager.PoisonTower.a, TowerManager.PoisonTower.h, TowerManager.PoisonTower.s, TowerManager.PoisonTower.r);
        this.levelPatkFx = TowerManager.PoisonTower.patk;
        this.levelPitvFx = TowerManager.PoisonTower.pitv;
        this.levelPdurFx = TowerManager.PoisonTower.pdur;
        this.extraBulletV = 0;
        this.inner_desc_init = '发射毒气弹持续杀伤，总是积极切换目标\n+ 攻击速度很快\n+ 附加中毒效果\n+ 无视防御的伤害';
        this.bulletCtorName = TowerManager.PoisonTower.bctor;
        this.name = TowerManager.PoisonTower.dn;
        this.description = this.inner_desc_init;
    }
    rapidRender() { }
    get isCurrentTargetAvailable() {
        return false;
    }
    get Pitv() {
        return this.levelPitvFx(this.level);
    }
    get Pdur() {
        return this.levelPdurFx(this.level);
    }
    get Patk() {
        return this.levelPatkFx(this.level) * this.__atk_ratio * this.__anger_gem_atk_ratio;
    }
    get DOTPS() {
        return 1000 / this.Pitv * this.Patk;
    }
    get informationSeq() {
        return super.informationSeq.concat([
            ['每跳毒素伤害', Math.round(this.Patk) + ''],
            ['毒素伤害频率', Tools.roundWithFixed(this.Pitv / 1000, 1) + ' 秒'],
            ['毒素持续', Math.round(this.Pdur / 1000) + ' 秒'],
        ]);
    }
    reChooseTarget(targetList) {
        const unPoisoned = targetList.filter(m => !m.bePoisoned);
        const unTargeted = unPoisoned.filter(m => {
            return this.bulletCtl.bullets.every(b => b.constructor.name === this.bulletCtorName && b.target !== m);
        });
        for (const t of unTargeted) {
            if (this.inRange(t)) {
                this.target = t;
                return;
            }
        }
        for (const t of unPoisoned) {
            if (this.inRange(t)) {
                this.target = t;
                return;
            }
        }
        for (const t of _.shuffle(targetList)) {
            if (this.inRange(t)) {
                this.target = t;
                return;
            }
        }
        this.target = null;
    }
    produceBullet() {
        const ratio = this.calculateDamageRatio(this.target);
        this.bulletCtl.Factory(this.recordDamage.bind(this), this.bulletCtorName, this.position.copy().dithering(this.radius), this.Atk * ratio, this.target, this.bulletImage, this.Patk * ratio, this.Pitv, this.Pdur, this.extraBulletV);
    }
}
class TeslaTower extends TowerBase {
    constructor(position, image, _bimg, radius) {
        super(position, radius, 1, 'rgba(252,251,34,.4)', image, TowerManager.TeslaTower.p, TowerManager.TeslaTower.a, TowerManager.TeslaTower.h, TowerManager.TeslaTower.s, TowerManager.TeslaTower.r);
        this.renderPermit = 0;
        this.extraRange = 0;
        this.extraHaste = 0;
        this.shockDuration = 5000;
        this.shockChargingChance = 0.2;
        this.shockChargingPowerRatio = 0.25;
        this.shockLeakingChance = 0.02;
        this.monsterShockingRenderingQueue = [];
        this.inner_desc_init = '向周围小范围释放电击造成中等伤害\n+ 有几率使目标带电';
        this.name = TowerManager.TeslaTower.dn;
        this.description = this.inner_desc_init;
    }
    static renderLighteningCop(ctx, x1, y1, x2, y2, displace) {
        if (displace < TeslaTower.curveDetail) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        else {
            const mid_x = (x2 + x1) / 2 + (Math.random() - .5) * displace;
            const mid_y = (y2 + y1) / 2 + (Math.random() - .5) * displace;
            this.renderLighteningCop(ctx, x1, y1, mid_x, mid_y, displace / 2);
            this.renderLighteningCop(ctx, x2, y2, mid_x, mid_y, displace / 2);
            if (Math.random() > .5) {
                const pos = new Position(x2, y2).dithering(displace / 3);
                this.renderLighteningCop(ctx, mid_x, mid_y, pos.x, pos.y, displace / 2);
            }
        }
    }
    static get shockRenderFrames() {
        return 2;
    }
    static get curveDetail() {
        return 10;
    }
    get canCharge() {
        return Math.random() > (1 - this.shockChargingChance);
    }
    get shockDurationTick() {
        return this.shockDuration / 1000 * 60;
    }
    get Rng() {
        return super.Rng + this.reviceRange(this.extraRange);
    }
    get HstPS() {
        return super.HstPS + this.extraHaste;
    }
    get informationSeq() {
        const removing = ['弹药储备'];
        return super.informationSeq.filter(line => !removing.some(rm => rm === line[0]));
    }
    get lighteningAmount() {
        return [null, 10, 20][this.rank];
    }
    levelUp(currentMoney) {
        const ret = super.levelUp(currentMoney);
        if (ret !== 0) {
            switch (this.level) {
                case 12:
                    this.rankUp();
                    this.name = '特斯拉塔';
                    this.image = Game.callImageBitMap(TowerManager.TeslaTower.n2);
                    this.description += TeslaTower.rankUpDesc1;
                    this.borderStyle = 'rgba(222,201,34,.6)';
                    this.extraHaste = 0.75;
                    this.shockChargingChance = .3;
                    this.shockDuration = 8000;
                    this.shockChargingPowerRatio = .75;
                    this.shockLeakingChance = .05;
                    break;
                case 24:
                    this.rankUp();
                    this.name = '闪电风暴塔';
                    this.image = Game.callImageBitMap(TowerManager.TeslaTower.n3);
                    this.description += TeslaTower.rankUpDesc2;
                    this.borderStyle = 'rgba(162,161,34,.8)';
                    this.extraRange = 80;
                    this.shockChargingChance = .4;
                    this.shockDuration = 12000;
                    this.shockChargingPowerRatio = 1.5;
                    this.shockLeakingChance = .12;
                    break;
            }
        }
        return ret;
    }
    shock(monster) {
        const ratio = this.calculateDamageRatio(monster);
        monster.health -= this.Atk * (1 - monster.armorResistance) * ratio;
        this.recordDamage(monster);
        if (this.canCharge) {
            monster.registerShock(this.shockDurationTick, this.Atk * ratio * this.shockChargingPowerRatio, this, this.shockLeakingChance);
        }
    }
    run(monsters) {
        if (this.canShoot) {
            this.gemAttackHook(monsters);
            this.renderPermit = TeslaTower.shockRenderFrames;
            monsters.forEach(mst => {
                if (this.inRange(mst)) {
                    this.shock(mst);
                    if (this.gem) {
                        this.gem.hitHook(this, mst, monsters);
                    }
                }
            });
            this.recordShootTime();
        }
    }
    calculateRandomCirclePoint() {
        const x = _.random(this.position.x - this.Rng, this.position.x + this.Rng, true);
        return {
            x,
            y: Math.random() > .5 ?
                (this.position.y - Math.pow(this.Rng * this.Rng - Math.pow(x - this.position.x, 2), 0.5)) :
                (Math.pow(this.Rng * this.Rng - Math.pow(x - this.position.x, 2), 0.5) + this.position.y)
        };
    }
    renderLightening(ctx) {
        const { x, y } = this.calculateRandomCirclePoint();
        TeslaTower.renderLighteningCop(ctx, this.position.x, this.position.y, x, y, this.Rng / 2);
    }
    rapidRender(ctx, monsters) {
        if (monsters.every(m => !this.inRange(m))) {
            return;
        }
        if (this.renderPermit > 0) {
            this.renderPermit--;
            ctx.strokeStyle = 'rgba(232,33,214,.5)';
            const t = ctx.lineWidth;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                this.renderLightening(ctx);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.lineWidth = t;
        }
        ctx.strokeStyle = 'rgba(153,204,255,.5)';
        ctx.beginPath();
        this.monsterShockingRenderingQueue = this.monsterShockingRenderingQueue.filter(msrq => {
            TeslaTower.renderLighteningCop(ctx, ...msrq.args);
            return --msrq.time > 0;
        });
        ctx.closePath();
        ctx.stroke();
    }
}
TeslaTower.rankUpDesc1 = '\n+ 攻击频率得到加强';
TeslaTower.rankUpDesc2 = '\n+ 射程得到加强';
class BlackMagicTower extends TowerBase {
    constructor(position, image, _bimg, radius) {
        super(position, radius, 1, 'rgba(223,14,245,.2)', image, TowerManager.BlackMagicTower.p, TowerManager.BlackMagicTower.a, TowerManager.BlackMagicTower.h, TowerManager.BlackMagicTower.s, TowerManager.BlackMagicTower.r);
        this.levelIdeFx = TowerManager.BlackMagicTower.ide;
        this.levelIdrFx = TowerManager.BlackMagicTower.idr;
        this.imprecationPower = 0;
        this.imprecationHaste = 1;
        this.extraPower = 0;
        this.POTCHD = 0;
        this.inner_desc_init = '释放强力魔法\n- 准备时间非常长\n+ 附加诅咒，使目标受到的伤害提高\n+ 每次击杀增加 10 攻击力并提高 5% 攻击速度（最多提高 1600%）';
        this.name = TowerManager.BlackMagicTower.dn;
        this.description = this.inner_desc_init;
    }
    get HstPS() {
        return super.HstPS * this.imprecationHaste;
    }
    get Atk() {
        return super.Atk + this.imprecationPower + this.extraPower;
    }
    get Ide() {
        return this.levelIdeFx(this.level) + 1;
    }
    get Idr() {
        return this.levelIdrFx(this.level);
    }
    get informationSeq() {
        return super.informationSeq.concat([
            ['诅咒易伤', Tools.roundWithFixed(this.Ide * 100 - 100, 2) + '%'],
            ['诅咒时间', Tools.roundWithFixed(this.Idr / 1000, 2) + ' 秒'],
            ['额外攻击力', Tools.chineseFormatter(this.imprecationPower, 0)],
            ['额外攻击速度', Tools.roundWithFixed(this.imprecationHaste * 100 - 100, 1) + '%'],
        ]);
    }
    levelUp(currentMoney) {
        const ret = super.levelUp(currentMoney);
        if (ret !== 0) {
            switch (this.level) {
                case 5:
                    this.rankUp();
                    this.name = '奥术魔法塔';
                    this.image = Game.callImageBitMap(TowerManager.BlackMagicTower.n2);
                    this.description = this.inner_desc_init + BlackMagicTower.rankUpDesc1;
                    this.borderStyle = 'rgba(223,14,245,.4)';
                    this.extraPower = 666;
                    this.levelAtkFx = TowerManager.BlackMagicTower.a2;
                    break;
                case 10:
                    this.rankUp();
                    this.name = '黑魔法塔';
                    this.image = Game.callImageBitMap(TowerManager.BlackMagicTower.n3);
                    this.description = this.inner_desc_init + BlackMagicTower.rankUpDesc2;
                    this.borderStyle = 'rgba(223,14,245,.6)';
                    this.extraPower = 2664;
                    this.levelAtkFx = TowerManager.BlackMagicTower.a3;
                    break;
                case 15:
                    this.rankUp();
                    this.name = '虚空塔';
                    this.image = Game.callImageBitMap(TowerManager.BlackMagicTower.n4);
                    this.description = this.inner_desc_init + BlackMagicTower.rankUpDesc3;
                    this.borderStyle = 'rgba(223,14,245,.8)';
                    this.extraPower = 10654;
                    this.levelAtkFx = TowerManager.BlackMagicTower.a4;
                    this.POTCHD = .08;
                    break;
            }
        }
        return ret;
    }
    reChooseTarget(targetList) {
        this.target = _.maxBy(targetList.filter(t => this.inRange(t)), '__inner_current_health');
    }
    produceBullet() {
        const w = 82;
        const h = 50;
        const position = new Position(this.target.position.x - w / 2, this.target.position.y - h / 2);
        Game.callAnimation('magic_2', position, w, h, 1, 2);
        this.target.health -= (this.Atk * this.calculateDamageRatio(this.target) + this.target.level * this.POTCHD);
        this.recordDamage(this.target);
        if (this.target.isDead) {
            this.imprecationPower += 10;
            if (this.imprecationHaste * 100 - 100 < 1600)
                this.imprecationHaste += 0.05;
        }
        this.target.registerImprecate(this.Idr / 1000 * 60, this.Ide);
    }
    rapidRender(ctx) {
        if (this.HstPS < 45)
            this.renderPreparationBar(ctx);
    }
}
BlackMagicTower.rankUpDesc1 = '\n+ 伤害得到加强';
BlackMagicTower.rankUpDesc2 = '\n+ 伤害得到大幅加强';
BlackMagicTower.rankUpDesc3 = '\n+ 伤害得到大幅加强，附加目标当前生命值 8% 的额外伤害';
BlackMagicTower.deniedGems = [
    'GogokOfSwiftness'
];
class _ColossusLaser {
    constructor(startPos, endPos, lineWidth, duration, swipeVector, easingFunc, ls1, ls2) {
        this.currentStep = 0;
        this.stepPosition = 0;
        this.fulfilled = false;
        this.sx = startPos.x;
        this.sy = startPos.y;
        this.ep = endPos.copy();
        this.swipeVector = swipeVector;
        this.lineWidth = lineWidth;
        this.lineStylesOuter = ls1;
        this.lineStylesInner = ls2;
        const updateTime = 1000 / 60;
        const updateCount = duration / updateTime;
        this.perUpdateDistance = 1 / updateCount;
        const maxAnimationCount = Math.floor(this.swipeVector.r / (Math.max(_ColossusLaser.animationW, _ColossusLaser.animationH) + 1));
        this.animationStepInterval = maxAnimationCount >= updateCount ? 1 : Math.ceil(updateTime / maxAnimationCount);
        this.easingFx = easingFunc || Tools.EaseFx.linear;
    }
    get step() {
        if (this.stepPosition > 1) {
            this.fulfilled = true;
        }
        this.stepPosition += this.perUpdateDistance;
        this.currentStep++;
        const step = this.swipeVector.r * this.easingFx(this.stepPosition);
        return this.ep.copy().move(this.swipeVector.normalize().multiply(step));
    }
    get canAnimate() {
        return this.currentStep % this.animationStepInterval === 0;
    }
    renderStep(ctx) {
        if (this.fulfilled)
            return;
        const stepEndPos = this.step;
        if (this.canAnimate) {
            Game.callAnimation(_ColossusLaser.animationName, stepEndPos, _ColossusLaser.animationW, _ColossusLaser.animationH, _ColossusLaser.animationSpeed, 400);
        }
        const pt = new Path2D();
        pt.moveTo(this.sx, this.sy);
        pt.lineTo(stepEndPos.x, stepEndPos.y);
        pt.closePath();
        const t = ctx.lineWidth;
        ctx.strokeStyle = this.lineStylesOuter;
        ctx.lineWidth = this.lineWidth + 2;
        ctx.stroke(pt);
        ctx.strokeStyle = this.lineStylesInner;
        ctx.lineWidth = this.lineWidth - 2;
        ctx.stroke(pt);
        ctx.lineWidth = t;
    }
}
_ColossusLaser.animationW = 36;
_ColossusLaser.animationH = 36;
_ColossusLaser.animationName = 'explo_3';
_ColossusLaser.animationSpeed = .5;
class LaserTower extends TowerBase {
    constructor(position, image, _bimg, radius) {
        super(position, radius, 1, 'rgba(17,54,245,.2)', image, TowerManager.LaserTower.p, TowerManager.LaserTower.a, TowerManager.LaserTower.h, TowerManager.LaserTower.s, TowerManager.LaserTower.r);
        this.lasers = [];
        this.levelFlameAtkFx = TowerManager.LaserTower.fatk;
        this.levelFlameWidthFx = TowerManager.LaserTower.fw;
        this.levelLaserSwipeDistanceFx = TowerManager.LaserTower.lsd;
        this.extraFlameDamage = 0;
        this.extraLuminousDamage = 0;
        this.extraLaserTransmitter = 0;
        this.extraFlameWidth = 0;
        this.extraRange = 0;
        this.lineStyles = [
            ['rgba(244,188,174,.4)', 'rgba(204,21,12,.7)'],
            ['rgba(244,188,174,.4)', 'rgba(254,21,12,.7)'],
            ['rgba(204,204,255,.4)', 'rgba(0,51,253,.7)'],
            ['rgba(204,204,255,.4)', 'rgba(0,51,253,.7)'],
            ['rgba(255,153,0,.4)', 'rgba(153,0,51,.7)']
        ];
        this.inner_desc_init = '发射激光，横扫大面积的目标，造成范围的火焰伤害';
        this.name = TowerManager.LaserTower.dn;
        this.description = this.inner_desc_init;
    }
    get Rng() {
        return super.Rng + this.reviceRange(this.extraRange);
    }
    get Slc() {
        return super.Slc + this.extraLaserTransmitter;
    }
    get Lsd() {
        return this.levelLaserSwipeDistanceFx(this.level);
    }
    get Fatk() {
        return this.levelFlameAtkFx(this.level) + this.extraFlameDamage;
    }
    get Fwd() {
        return this.levelFlameWidthFx(this.level) + this.extraFlameWidth;
    }
    get LlW() {
        return 3 + Math.floor(this.rank / 2);
    }
    get informationSeq() {
        return super.informationSeq.concat([
            ['火焰伤害', Math.round(this.Fatk) + ''],
            ['扫射距离', Tools.roundWithFixed(this.Lsd, 1) + ''],
            ['扫射宽度', Tools.roundWithFixed(this.Fwd, 1) + ''],
            ['额外火焰伤害', Math.round(this.extraFlameDamage) + ''],
            ['额外电浆伤害', Math.round(this.extraLuminousDamage) + ''],
        ]);
    }
    get laserLineStyle() {
        return this.lineStyles[this.rank];
    }
    levelUp(currentMoney) {
        const ret = super.levelUp(currentMoney);
        if (ret !== 0) {
            switch (this.level) {
                case 8:
                    this.rankUp();
                    this.name = '高能激光塔';
                    this.image = Game.callImageBitMap(TowerManager.LaserTower.n2);
                    this.description += LaserTower.rankUpDesc1;
                    this.borderStyle = 'rgba(17,54,245,.3)';
                    this.extraFlameDamage = 220;
                    break;
                case 16:
                    this.rankUp();
                    this.name = '热能射线塔';
                    this.image = Game.callImageBitMap(TowerManager.LaserTower.n3);
                    this.description += LaserTower.rankUpDesc2;
                    this.borderStyle = 'rgba(17,54,245,.4)';
                    this.extraLuminousDamage = 140;
                    break;
                case 32:
                    this.rankUp();
                    this.name = '多重热能射线塔';
                    this.image = Game.callImageBitMap(TowerManager.LaserTower.n4);
                    this.description += LaserTower.rankUpDesc3;
                    this.borderStyle = 'rgba(17,54,245,.5)';
                    this.levelSlcFx = TowerManager.LaserTower.s2;
                    this.extraFlameDamage = 420;
                    this.extraLuminousDamage = 220;
                    break;
                case 64:
                    this.rankUp();
                    this.name = '巨像';
                    this.image = Game.callImageBitMap(TowerManager.LaserTower.n5);
                    this.description += LaserTower.rankUpDesc4;
                    this.borderStyle = 'rgba(17,54,245,.8)';
                    this.extraFlameDamage = 640;
                    this.extraLuminousDamage = 380;
                    this.levelSlcFx = TowerManager.LaserTower.s3;
                    this.levelHstFx = TowerManager.LaserTower.h2;
                    this.extraRange = 50;
                    this.extraFlameWidth = 40;
                    break;
            }
        }
        return ret;
    }
    produceBullet(_i, monsters) {
        const v = new Position(this.target.position.x, this.target.position.y);
        const r = this.Fwd / 2 + Game.callGridSideSize() / 3 - 2;
        const mvrc = .7;
        const arcTime = Math.ceil((this.Lsd / r - 2) / mvrc + 1) + 1;
        const swipeVector = _.maxBy(_.range(0, 360, 30).map(d => new PolarVector(this.Lsd, d)), sv => monsters.filter(mst => v.copy().move(sv.normalize().multiply(mvrc * (arcTime - 1) * r)).equal(mst.position, 1.2 * r)).length).dithering(1 / 30 * Math.PI);
        this.lasers.push(new LaserTower.Laser(this.position, this.target.position, this.LlW, 500, swipeVector, Tools.EaseFx.linear, this.laserLineStyle[0], this.laserLineStyle[1]));
        const flameArea = new Path2D();
        for (let i = 0; i < arcTime; i++) {
            const t = v.copy().move(swipeVector.normalize().multiply(mvrc * i * r));
            flameArea.arc(t.x, t.y, r, 0, Math.PI * 2);
        }
        this.target.health -= this.Atk * (1 - this.target.armorResistance) * this.calculateDamageRatio(this.target);
        this.recordDamage(this.target);
        monsters.forEach(mst => {
            if (Game.callCanvasContext('bg').isPointInPath(flameArea, mst.position.x, mst.position.y)) {
                mst.health -= this.extraLuminousDamage * this.calculateDamageRatio(mst);
                this.recordDamage(this.target);
                mst.health -= this.Fatk * (1 - mst.armorResistance) * this.calculateDamageRatio(mst);
                this.recordDamage(this.target);
            }
        });
    }
    rapidRender(ctx) {
        this.lasers = this.lasers.filter(ls => {
            ls.renderStep(ctx);
            return !ls.fulfilled;
        });
    }
}
LaserTower.Laser = _ColossusLaser;
LaserTower.rankUpDesc1 = '\n+ 伤害得到加强';
LaserTower.rankUpDesc2 = '\n+ 造成额外电浆伤害(无视防御)';
LaserTower.rankUpDesc3 = '\n+ 发射多束射线';
LaserTower.rankUpDesc4 = '\n+ 所有属性得到增强';
class _Jet extends TowerBase {
    constructor(position, image, _bimg, radius, carrierTower) {
        super(position, radius, 0, null, image, [], carrierTower.levelAtkFx, carrierTower.levelHstFx, carrierTower.levelSlcFx, carrierTower.levelRngFx);
        this.actMode = _Jet.JetActMode.autonomous;
        this.weaponMode = 1;
        this.inner_desc_init = '航母的载机\n+ 机动性极强\n+ 拥有 15mm 速射机枪和 30mm 反装甲机炮两种武器';
        this.controlable = true;
        this.name = '航母载机';
        this.carrierTower = carrierTower;
        this.canInsertGem = false;
        this.destinationPosition = Position.O;
        this.description = this.inner_desc_init;
        Tools.ObjectFx.addFinalGetterProperty(this, 'bulletCtorName', () => CarrierTower.Jet.JetWeapons.getCtorName(this.weaponMode));
        Tools.ObjectFx.addFinalGetterProperty(this, 'level', () => this.carrierTower.level);
        this.calculateDamageRatio = mst => this.carrierTower.calculateDamageRatio(mst);
    }
    get attackSupplement() {
        return this.weaponMode === 1 ? this.carrierTower.Atk * -0.2 : (Math.pow(this.level + 2, 1.566) * 3);
    }
    get hasteSupplementRate() {
        return this.weaponMode === 1 ? (1 + this.level * 0.015) : (1 - this.level * 0.0025);
    }
    get Atk() {
        return this.carrierTower.Atk + this.attackSupplement;
    }
    get Slc() {
        return this.carrierTower.Slc + (this.weaponMode === 1 ? 1 : 0);
    }
    get Rng() {
        return this.carrierTower.Rng;
    }
    get HstPS() {
        return this.carrierTower.HstPS * this.hasteSupplementRate;
    }
    get Spd() {
        return this.carrierTower.Spd;
    }
    get exploitsSeq() {
        return [];
    }
    get informationSeq() {
        const removing = ['等级', '下一级', '售价'];
        return super.informationSeq.filter(line => !removing.some(rm => rm === line[0]));
    }
    get hasCurrentTarget() {
        return this.target && !this.target.isDead;
    }
    get sellingPrice() {
        return 0;
    }
    gemAttackHook() {
        this.carrierTower.gemAttackHook(...arguments);
    }
    gemHitHook() {
        this.carrierTower.target = this.target;
        this.carrierTower.gemHitHook(...arguments);
    }
    reChooseMostThreateningTarget(targetList) {
        this.target = _.minBy(targetList, mst => {
            return Position.distancePow2(Game.callDestinationPosition(), mst.position);
        });
    }
    autonomouslyRun(monsters) {
        if (!this.hasCurrentTarget) {
            this.reChooseMostThreateningTarget(monsters);
        }
        if (this.hasCurrentTarget) {
            if (this.inRange(this.target)) {
                if (this.canShoot) {
                    this.shoot(monsters);
                }
            }
            else {
                this.position.moveTo(this.target.position, this.Spd);
            }
        }
    }
    run(monsters) {
        switch (this.actMode) {
            case _Jet.JetActMode.autonomous:
                this.autonomouslyRun(monsters);
                break;
            case _Jet.JetActMode.f1:
                super.run(monsters);
                if (Position.distance(this.position, this.destinationPosition) > this.radius * 2) {
                    this.position.moveTo(this.destinationPosition, this.Spd);
                }
                break;
        }
    }
    render() { }
    renderLevel() { }
    renderImage(ctx) {
        if (this.target) {
            BulletBase.prototype.renderImage.call(this, ctx);
        }
        else {
            super.renderImage(ctx);
        }
    }
    rapidRender(ctxRapid) {
        super.render(ctxRapid);
    }
}
_Jet.JetActMode = {
    autonomous: 1,
    f1: 2,
    switch(oldMode) {
        return oldMode === this.autonomous ? this.f1 : this.autonomous;
    }
};
_Jet.JetWeapons = {
    getCtorName(mode) {
        return mode === 1 ? 'CarrierTower.Jet.JetWeapons.MachineGun' : 'CarrierTower.Jet.JetWeapons.AutoCannons';
    },
    MachineGun: class _MachineGun extends BulletBase {
        constructor(position, atk, target) {
            const bVelocity = 18;
            super(position, 1, 0, null, 'rgb(55,14,11)', atk, bVelocity, target);
        }
        hit(monster, magnification = 1) {
            monster.health -= this.Atk * magnification * (1 - monster.armorResistance * 0.85);
            this.emitter(monster);
        }
    },
    AutoCannons: class _AutoCannons extends BulletBase {
        constructor(position, atk, target) {
            const bVelocity = 6;
            super(position, 2, 1, '#CC3333', '#99CC99', atk, bVelocity, target);
        }
        hit(monster, magnification = 1) {
            monster.health -= this.Atk * magnification * (1 - monster.armorResistance * .75) + monster.inner_armor * .75;
            this.emitter(monster);
        }
    }
};
class CarrierTower extends TowerBase {
    constructor(position, image, _bimg, radius) {
        super(position, radius, 1, 'rgba(56,243,12,.5)', image, TowerManager.CarrierTower.p, TowerManager.CarrierTower.a, TowerManager.CarrierTower.h, TowerManager.CarrierTower.s, TowerManager.CarrierTower.r);
        this.jetCountMap = new Map();
        this.jets = 0;
        this.levelSpdFx = TowerManager.CarrierTower.spd;
        this.levelKcFx = TowerManager.CarrierTower.child;
        this.inner_desc_init = '自身无法攻击，释放搭载的载机进行战斗\n使用 [F1] 切换载机的自主/受控模式\n使用 [Q] 切换载机的武器\n+ 载机继承自身属性\n+ 可以对任意位置进行机动打击';
        this.name = TowerManager.CarrierTower.dn;
        this.description = this.inner_desc_init;
        Tools.ObjectFx.addFinalGetterProperty(this, '__kill_count', () => _.sumBy(this.shipBoardAircraft, '__kill_count'));
        Tools.ObjectFx.addFinalGetterProperty(this, '__total_damage', () => _.sumBy(this.shipBoardAircraft, '__total_damage'));
    }
    rapidRender() { }
    static set F1Mode(v) {
        Game.callChangeF1Mode(v);
        this.__inner_f1_mode = v;
    }
    static get F1Mode() {
        return this.__inner_f1_mode;
    }
    static set WeaponMode(v) {
        Game.callChangeCarrierWeaponMode(v);
        this.__inner_wp_mode = v;
    }
    static get WeaponMode() {
        return this.__inner_wp_mode;
    }
    get informationSeq() {
        return super.informationSeq.concat([
            ['载机量', this.KidCount + '']
        ]);
    }
    get KidCount() {
        return this.levelKcFx(this.level);
    }
    get Spd() {
        return this.levelSpdFx(this.level);
    }
    get shipBoardAircraft() {
        if (this.jetCountMap.has(this.jets)) {
            return this.jetCountMap.get(this.jets);
        }
        else {
            this.jetCountMap.clear();
            const newJets = Game.callIndependentTowerList().filter(tow => tow.carrierTower && tow.carrierTower === this);
            this.jetCountMap.set(this.jets, newJets);
            return newJets;
        }
    }
    run() {
        if (this.canShoot && this.jets < this.KidCount) {
            Game.callTowerFactory()('CarrierTower.Jet', this.position.copy().dithering(this.radius * 2, this.radius), Game.callImageBitMap(TowerManager.CarrierTower.cn), null, Game.callGridSideSize() / 4, this);
            this.jets++;
        }
    }
    renderRange() { }
    destory() {
        super.destory();
        this.shipBoardAircraft.forEach(tow => tow.isSold = true);
    }
}
CarrierTower.__inner_f1_mode = false;
CarrierTower.__inner_wp_mode = 1;
CarrierTower.deniedGems = [
    'ZeisStoneOfVengeance',
    'GemOfAnger'
];
CarrierTower.Jet = _Jet;
class AnimationSprite extends Base {
    constructor(img, xc, yc, frameRepetition) {
        super();
        this.frameRepetition = frameRepetition || 1;
        this.img = img;
        this.xcount = xc;
        this.ycount = yc;
        this.totalFrame = xc * yc;
        this.nextFrameIndex = 0;
        this.lastRAF = null;
        this.isDead = false;
    }
    get realNextFrameIndex() {
        return Math.floor(this.nextFrameIndex / this.frameRepetition);
    }
    get isFinish() {
        return this.isDead || this.realNextFrameIndex >= this.totalFrame;
    }
    renderOneFrame(context, positionTL, width, height, delay, endless, trusteeshipedClearing, recirculation, callback) {
        if (this.isFinish) {
            if (endless) {
                this.nextFrameIndex = 0;
            }
            else {
                setTimeout(() => {
                    if (!trusteeshipedClearing) {
                        context.clearRect(positionTL.x, positionTL.y, width, height);
                        if (callback instanceof Function) {
                            callback();
                        }
                    }
                }, delay);
                return;
            }
        }
        const w = this.img.width / this.xcount;
        const h = this.img.height / this.ycount;
        const x = (this.realNextFrameIndex % this.xcount) * w;
        const y = Math.floor(this.realNextFrameIndex / this.xcount) * h;
        if (!trusteeshipedClearing) {
            context.clearRect(positionTL.x, positionTL.y, width, height);
        }
        context.drawImage(this.img, x, y, w, h, positionTL.x, positionTL.y, width, height);
        this.nextFrameIndex++;
        if (recirculation) {
            this.lastRAF = requestAnimationFrame(() => {
                this.renderOneFrame(context, positionTL, width, height, delay, endless, trusteeshipedClearing, true);
            });
        }
    }
    render(context, positionTL, width, height, delay = 0, callback) {
        if (this.realNextFrameIndex !== 0 || this.realNextFrameIndex !== this.totalFrame) {
            cancelAnimationFrame(this.lastRAF);
        }
        this.nextFrameIndex = 0;
        this.lastRAF = requestAnimationFrame(() => {
            this.renderOneFrame(context, positionTL, width, height, delay, false, false, true, callback);
        });
    }
    renderLoop(context, positionTL, width, height, trusteeshipedClearing = false) {
        if (this.realNextFrameIndex !== 0 || this.realNextFrameIndex !== this.totalFrame) {
            cancelAnimationFrame(this.lastRAF);
        }
        this.nextFrameIndex = 0;
        this.lastRAF = requestAnimationFrame(() => {
            this.renderOneFrame(context, positionTL, width, height, 0, true, trusteeshipedClearing, true);
        });
    }
    terminateLoop() {
        cancelAnimationFrame(this.lastRAF);
        this.isDead = true;
    }
    getClone(frameRepetition) {
        return new AnimationSprite(this.img, this.xcount, this.ycount, frameRepetition);
    }
}
class HostedAnimationSprite extends Base {
    constructor(sp, pos, w, h, delay, endless, waitFrame) {
        super();
        this.sp = sp;
        this.waitFrame = waitFrame || 0;
        this.render = function (ctx) {
            if (this.waitFrame === 0)
                this.sp.renderOneFrame(ctx, pos, w, h, delay || 0, endless, true, false);
            else
                this.waitFrame--;
        };
    }
}
class ImageManger {
    constructor() {
        this.bitmapMapping = new Map();
        this.spriteMapping = new Map();
        this.onPlaySprites = [];
    }
    play(ctx) {
        this.onPlaySprites = this.onPlaySprites.filter(as => {
            if (!as.sp.isFinish)
                as.render(ctx);
            return !as.sp.isFinish;
        });
    }
    loadImages() {
        return __awaiter(this, void 0, void 0, function* () {
            const loadTasks = [
                { name: 'carrier0', url: 'img/badge_1.png' },
                { name: 'carrier1', url: 'img/badge_2.png' },
                { name: 'carrier2', url: 'img/badge_3.png' },
                { name: 'cannon0', url: 'data:image/png;base64,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' },
                { name: 'cannon1', url: 'data:image/png;base64,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' },
                { name: 'cannon2', url: 'data:image/png;base64,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' },
                { name: 'laser0', url: 'data:image/png;base64,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' },
                { name: 'laser1', url: 'data:image/png;base64,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' },
                { name: 'laser2', url: 'data:image/png;base64,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' },
                { name: 'laser3', url: 'data:image/png;base64,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' },
                { name: 'laser4', url: 'data:image/png;base64,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' },
                { name: 'archer0', url: 'data:image/png;base64,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' },
                { name: 'archer1', url: 'data:image/png;base64,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' },
                { name: 'archer2', url: 'data:image/png;base64,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' },
                { name: 'archer3', url: 'data:image/png;base64,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' },
                { name: 'poison_t', url: 'data:image/png;base64,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' },
                { name: 'ice', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGEAAABhCAMAAADx2D+RAAAAA3NCSVQICAjb4U/gAAABgFBMVEX///8QGBkIDxAaKCkVICEQGBkgMDEaKCksNjM5TE5RX15UcXJncnGBjo+frK21xMPQ1dX////p+vvM///d+/+1+///9WLb8PWp+v/R6/bA5/iG8/6z5ffq2rmb6vf/3Fv11JNt7/vQ1dWC5/f01Fmr1upW6f+E3ezJybqaz+6ZzP9n2vDYwJ3vv1Tvu3VJ3/a1xMOTycGFxe/wsFFpw+gf1vyFu9jDrZFQxt57ueOfrK3unkxltt8rxe/inHNwsOO+ooF5r7ffllFgrttcrr1EruRzpadJrb/th0p4nsE7q+TFj0fWi0SkkHVgnrFKndlmmZlXmNMzmcyXg2UEoednioPFcjuudEHVZj88hrWHdFwhgsC1ZSpncnE0eqOZZjMbfL2ZW4Uidc0tc7M/boxzZFChVS4lb5+6SjgGb9pRX15rV0EAZsw5XIRpUTqORycbXJOXOihlSStXRzQAUM5WQkyANSNUPygUQ4ExPlFpLxwGO5wsNjNKLhogMDE3Hgv0zTLOAAAAgHRSTlMAEREiIiIzM0RVZneImbvM7v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4sbkxsAAAAJcEhZcwAADnQAAA50AWsks9YAAAAfdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIDi1aNJ4AAASo0lEQVRoga2ZCVsa2dKAZZFF2aGFBmzD0iIiUUEREDdURJtNGBFaFjWCCJE12MGI/PVbpxtn8s243e9O5Qkx0NZ7qk6dWg4TEx8Ln8/nCYUSFWaaZ8VgMJlMBoNOIREKefDhJ1R8TJgUCqUagwXpX7ZgiGDCtKp/kcADwvQLwaQ1mCwWgwHTT0/+m4RJmZojzBu0JpMFbMA0cvG/Q2C3QSCUczYsz2vZbTAZtBqlWDj5byDGBIUGs4B+1knoD9jw7xHASQKxUm+EYFpexjCTwYJiCdPIhBzhf0RwsSoQK/Q7ARy2ADkJ1MMPSpFAIOSxiP+FwedMEAnk+p3rpFOn0WgxrcEG3rLK4F0wgkPw/38g7teQCSKBDD++vrxM4hrC5dra8jtwpUQEhN8RE59H/LYqPo81QSSQWneuLy4uA8aT9InfYjNYZWIRhwAGCH9CKPqkGfz/I+iwCZCq6ZWd9uXFxY75JO13+dfMQSl6WwwIBJmc5IuUys95iv8bg8djAWKRQCLfCPq+/bq+2yf9+ZOLy6R1Vy6TsGgBC+FLVWqV8DME/oRENjHB42QS6QcRyZSzX7ZXjy6/f087k+1fv9qBpa9fZhVTYuQpsVgg4AFAreJ9Inbhc7laLuYju9HS0AoFU8rZ2S9fqTJdzOfz3379+pZIZc7DgLAqWFdBHIiVGo1aJfqEm+DzKbVaKeKP1YsFomnFEujfPi/XHlrVFn12kIq7NwvhMLX95cusSg6ukqJY1kIgS/kfHnG0BCGyd4qH3A/mTynQ+r9S51S2Wt2MdQq5cCzrnfOG7XaKAjNmF2RylUJuhVOi0UsnPrSBfUCu1qj1cpEQbJ+SLyD9XqrbcscKXnu4mo1uhqnw3Ix7031+Tm1//fJlaWl2Vq/TYphOJfj43LEPSFiLYRulihWk302VqXC11Tp3z2ULsc1NKhxzz4UL1eyMmwLG9vb2EqbRAUEphlr1GQJfoYHUrLEGl9j1e8/LlNvurrYeH6hYDAhZtzeaPQ+Dr2bmwHvhGEUSJGY0aBTo9H2CwONP6TGbFuy2LpC725vlctjtdsfCbm/5oVVGNmSpDjUzY48CYiZcrsYTDsJhIqAiCT+RzdljJlTqTC6bmTDZbDZH5tyLADG3e85dK7dyXi/Voiik3B51w6s7s3fkcLhsNq1aPskS3gVwuZoHRliW/SYCCK641263g+fdbnts007FNr0xMCDMKmetoEr7NofLZYJ6wfskAVYi1xuW17eWl10mRz0bnvNmESAMr1TU6w1TSDnontnMee2xZjtkciGCfvrzBKFQgUFJ3toCyM1DlSqE5+xudxb2g9r0ur0UaI9tIkQslmsxpf1E3r/m0Kqkk5/cB8jWQqnKYIMysL61le63IFC35+ZiyBBEcFNuMCJnn5sLZ6stZvDtppRPn3qMKsl/QRALFJjNhYzYOrlnHh5bVcpb+Lodnjvf3ISjhtYfi3pjuWqv93RfKuXziWMnrhJ9NpZYwjROuPx+ICTbP5+fHqrVVnm77LWfe73wkpubscdqsWyhXy8O8qlS/ubYt6JW8AT/BUEEbapr7fDw5CTfbg+eh5DzHqodiupEY2Ev1fHGCrVqttobnB0Vz46PI2e+Fb1SgioF7wPEn2VZJFJiDv9hMpn89uvn83PviXl8rFarj9VYLhY9f8wWaq1ht3FVPwikMh5SHrTqFSIx6j0+MOL3sqnAHCFEaIOXBv2nsasK0U1II61stjV4fi5eFUNOuVRlnVJo5C819f0ixP/TSSKxXOfc2U8m8/eD+5+D/uC+ff/02IK0ARm11aw+Du7zA/qqHzHLJ+VygRQqkZiz4F03cR0Jj6v8cp054D/MX98M+/fIhpL/5vnpaYTkafB0478p1a+uKlKljF28UCySyhVy2fSU4D0EfCKSSSFBCoEgU5ttIX/ydDAadSuVwfO3I39p0O/1+nT/6Wbg99/c31xdZWj5FCgXQaFS4hoQNUTU225iEzeUULl8CsqbTEPKZcXD0/qolcvVOv17UFnv9/tXV1f9/P19+6ZUvLo6395QTEGdlqn0Gh2OG3G9GsrQm0YgAtQ3EJUMOjC5VCKWJZKVXCxXq9VafdjawZhwk7+/SRX7zXJs+8tXaDnkJOkkcaOZNBs1yncClq1vOq0Rw4wrMnlQLp2UVOhINJet1aoPFbo3QACW0C/eX1UyVLkQi20DYyN4fHyaWjWaAaFTvFOF2Oqj0DoIjHAGN4LxMxkd344iAzoAqPS6zTHhqt+gz8thu5sCRBiq6PZZ/r4bJ0mfjwDC2wmWq2844bcRNsdehgb9HADy0nm52y2Xm2NCA0o2VQ7PISuysWgumis+twrxVCnhMCreSU7cYVBiLr/DtXZQ7DW2w9EcZIeHc+rhAfJSodZ57PWv6Gq4UNucm6Oy59Scu1CIFaK53MOoTBXK5aLPrBS9PT9y9U2mt0Hn6wdCF34TbQHlDWcfHx8fstCStWqFXC7srsY2qfNWFbK4HTwFhrSGcBjLBTphVknfrkMsYVKkNLjW/H7/0aCLAJ0WZDqoA+UyJKZOthOLRnOxmVitStnt2Rgg5rzIjAIs4ZFpUQmnZuptN3FZb1Kuta35D/xHR/VmtwVbEAsDIAY1DlqNVicajcayVPkxi1qBQtQ9A50T7HcLEbrNVIBUyyfe7Jo4glCqN7gCyIj8TzgCvU4Hig9lhzYSer3WAxCiHSpM5VATAIXVTlXLVCzbBS82KzfHTo1KyueLX2/9XjK3QImvgp8OjvKAGAw6nVahFrZDeS64Z8JVRKjZZ+Y4D0EkncOGh+khxHIxdUyqlCjr8F/f6xeCcAoPOhx+/2E6f3t72+52Og+dzrnbXgDHQNyAFDZnZry1qBt65Czop+O7xUazWUn4VqAVhVafJ1VOvTbTvcxskCVlpGPt8AgQ3761B63Ow0PnoRqrhmfmCjVEqEIVncnWcoVco3GevZJJZcFipZjyWeUiNPFNTus10xP/NIKbqtiZSig12yBgTwBwm/Dd1Af1DpJq2F7LsvuQnbNv5mq5XPm+VKSnBUKRYiUYXLGyiVwklOnUuPQtAje1iaSkyQZeAsCx0+fZO233H5AhrQKcg82oFyIql6t2Cg/30O0Fg1KRWKrS43oZ0g+lS6vWqCT/3Aj2/y81WopDF+dPX5SOnQFfwLkHvuoPIKo6D1lIRN7WQy6XG9zX7/c9AYKwKiQioVytliEXiUVyGA10yn/OjDANy2WQ6XnIBGg0DBbXWvLUtxoAcVp9+W+w5wwQqjWUCAu5Wr+0trYW8HgIQqeSQmvClgmRWKIwaLVaneyfGZw/IdKr1bhyisf6UqmF5BcgVz2BgM+5HyLJRClf+jnoPYJ+OOmtzuB2xxPwOB02gtBqptjFo9IrVRowDNPir4xb3ISoVmvYcIBWBsOOV3AnuIgMnZwcBshj6OwS6SK4BzJpvXTgQcu3QUdM6NTcDqOpnjBgBhOm5Zz0dwI7v2m1GiUaYJWYWTYVxJ1O0hw6OYTG7DCQKPnMxBl0SzDIRaCccfpdLptRLf8TAPotJoNO/sqFDRtJCg0778kEAoVhmjdlxX0+cwABWEbIvLgYROmn1TpeXFwkXJzYCLVC/GKBwQIETC/l/TP3sdVHpNIZCAKDOVQ6hS5jcNiF/cOxnPhJ86KzPwRpeICwODYBCMoXgMmCCFql+JVKyh4GKHCYyWbCcIUERl2ZHveEQju+w7EVhz7cvHhG05VMEAEWHWMjLDqVhANYLPMmkwWcxH8lf49ThkILj1kMmBKCW2bVBUL7+R3nGlIfCgQu9o1GXxAOr9O5+KeblpctmEYKDZPZYJlfthgMBgzVoNcOHFvgpvXoQhJcaZVLZbgRbLi4OHVC7+dxnl5cXCZJ4+KfApkF9C8vzxvUsolJg8k0vzxvwjADRNKrN70vBU6LbgvnLQYiUrEaA6E10Hvhczr3L5DAj78hbMuc2DQKic1k4QBwGsYD42sEKOEyrWF+eR1MtywfWMlQaC1/eXGRdp5eXo4R+7DfY3G8EPRWwgT/rrMADJe+flk9znsiFcy56+vA2FonnKFQIBRyOAI7pxcvcpn2kax+0mmzsE5yEVAUYaRcnzegA40p3xoi+OOrYa0NEUD+cJnX9uHgOlyhZPriLwRsDOg3c6G0DPGKk4fp9Po6+Eg7dtLrjcDYCEh682PCstEYSO5z2n9DACPkRIG0FlpDQjqv7wCAYkoHBCOXk94kICNgBv1j/Q+QQ9IMG8DuwFqa24g8i8i7wIK1HST7HvL6DgjLy5hOp2ed9OYV0NhNENhA+INjeHBnEjH8pv1LtPj0BSJdpllACMkOmby7uwYb4BRpcRWmlU++ecf00sw4MRsi3MHf73enZtwJFthMLqTYlcyn0+CwfdYCluDc+X53jQhwLrRKqVIrf/uebLwRUgJzbZ2AcgS4+3F9rDfb4Jyb0pdJl20/jSS59mJByBO4RgQUfZAuZAKp4r3bRO7QSc3EFktA8uPu7ldCgyHC2qHL4QmA+mR6P4B2GDECHgB8h9WcrM9btCqpQCB4bxblEgf0GVvr/vT3Hz9+cISfKzowwka4oOh4YDpNJkMsYQ02wXP6AxH+SCe35g0w8QoEk+/eziA38abg+GwtH17/YBEA+FnSEEAw2BBhZx8EyrMHGbHj2Wl/R3KXTK5btPiU8KOJnRtRDLatLf8Y8eMHEH6uaG0Wm4kAvU7ItiwAJLATcOZB/eXF9+vT5LxBx30f8dGVAI8vIYhlv38rlOQAiJDXEDabyeBEEoCVOzlCwOxr313mj9LX+dNDG66VfXzpwCHkBpfF6dpCRvz6xRLaRq3NZDMQiIA6DJYQ8JDkXuny4sh3fHp6umbWQ8b7yIQXNxE2Uou7DtPXv8aEnz4wwkQQTjNMtdAdcDaQUI7ycBz34M2AE9fi05+9XhISSqlCq91KX9wiQhsIJb3WZCMMZiQkaUameEg8tBdMQHd+bLXq9Xocx4OfuPYeGyHlSUi98ySN7ulZQpvUE4hg5AQRSNx3tLoH/X8psWLVazS4Xh+UfOa7MxbBg/yHW/fSp/l8+xYRfib0mAl1ITgSRCB1zqODSP4mX0qlggtWtQa3rlTE7178/EXgkviqdSPoQ07gEE6dliAMelagUXPqyaOjRCmRv0lFIvFg0KrRBStPH9/cvyDQdaiMtOIrx7ftNodoHxsh+bPXLxog4OTBUboEJgBgLxLZBUSwJ3gnI/3dT5M88dOK3hqM+PLAaLNW3PpwnW5MMON7AAABQCoRiayuBleCPcnnAFyB4kmGC7MLpK8YSZS+sRCglFgGdOhmfPXgqHTLAs4qPaZ3dhYJRvriV+aetyAT4lFmCSH2mF49lQAGuyHtfNAICL2RTB2lARDZSzUazGiY2qOLkfhA/Mlv/CYlo6fhc29jaWlp1bGaqo9GvZsETHSlfL502877jHoduYdGYWQAPRyOmIRjdiMeCTZHnyRIuvE4zdBAiFeCCyumCDMaMfUbGB+OQO1tKb3v8x3AOJ/KF+uwfgCEZhfimXgw8/xJD412N5Yyjczuxgbdiy8trZhW6+ztYa9eOjqACMqXSgkEaD8NRwAYnq0uzC5lMnE63pv8FEHcXdqIVxrx+G68AZylLwsmx4iTYb1YPysWb+6LidLN0/i90VkkE9+IZ2h6NzNCX5F+7KTKBs0wXVhUplfJxONLq5HBqAf+QNrGWp8Z9F94twfvFQ/QejKVeCbDDJmnp6FY/J6LJKNRs9ED52YymQpTAUtoiMbICuEocisevoCG9VRodSH+xPQixUYF2UDTTTB8Nx7vvoOAII2DZBgmQ2eYLngpU6n06FmIW2A8/YVgbg4cqwtLsxvsYQB3ZmBwadIA2N3dyEjecdFwAxF26WEzU3lsNCvxSqXRa9C7S7OzpGm1wi4e2TBYXZmFDd7YqDTOUsUGSBy2DfTHMxAno7cJo95SnF1Hg2l2mUalScOJYiqVCr0xCytGUcX5qJfKgP54fCNzlqo3K/B4JtOl4xlwKih4J2zFDLgIHJQB5zNMg2aazSbTA0IDlra0C3s+5BzFpOiNDXDhxm69wfTQM5lmt8sg6Taaw3dsGDFj6TLDbqPbbMJvN4FQAUK8maoPx15iUkUwNQN+qTSavSEDj8JrDy0I5J2dnhx10eKZXoMZDpsNtAnMsIEIdJxu9CCRnsGBqNeLZ5EinEk4mPFKhobd7oJlvUaFztDdITN85+TxR/A5iqN4YwQ2VGBpsA3NRqZCN2E3U2cHfnQBeJCInBUh0HaRQ+kKw3quh04E+IoZvXceIFxHwyZEBGQmhmk2mkDoNdiVNprNRoounmWKxUoRBVgTHsowFdiyYbPSbEL00ShCun+34D85mWXf4uGlygAAAABJRU5ErkJggg==' },
                { name: 'tesla0', url: 'data:image/png;base64,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' },
                { name: 'tesla1', url: 'data:image/png;base64,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' },
                { name: 'tesla2', url: 'data:image/png;base64,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' },
                { name: 'magic0', url: 'data:image/png;base64,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' },
                { name: 'magic1', url: 'data:image/png;base64,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' },
                { name: 'magic2', url: 'data:image/png;base64,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' },
                { name: 'magic3', url: 'data:image/png;base64,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' },
                { name: 'buff_poison', url: 'data:image/png;base64,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' },
                { name: 'buff_bloody', url: 'data:image/png;base64,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' },
                { name: 'buff_burn', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAVeklEQVR4nOWaeXRc5ZXgf9/33qsqVakWSyrtkiUZyTbebWGbLWAMYYkxy5B0EkLSdIdpsjXpTienmZPJnNP0hCwEhpOezuRkOp2wpEPCFjBtNuNFNsY23i3Llmztu6qkWl8tb/nmjxKGBLKcmUz3mTP3n6o677z37u/e+93v3vsV/D8u4o/1oBtuuCF6zz33tIwNDm5IzM2FR0dGmtJmxu/YruM1DIQQQoFoamoa7tyw4ejTzz13eGxsbGr37t35fzeAhx56oKmueuGmvXt2Xvv2oSOrBoeHFulSBhQKgcDn9VJVVcVsPE4uX0AKcJTCsiw3Gq3qXb9xQ184GPlZwO8/9uDDD5/5NwP4H9//fueJk8f+5PiRY7ecO3++vaO9neUrVtLQ1Ei0qooyfzmOY+MrK6O6uprYzAymaSKlRNM0ZmfjjI+OMTw8RPepU9TV13YHQ6H/vnbDZa/cf//9/f/XAH7xxC9W/+SffvBZs5D7aCqRrL5xy81cd/0NtLS2EAyGCIdDaIYBgLKLoKBoFTEMD1IKEBKkBoCZyZDPF0gk5njysZ/y0osvEgyXd4VDkT2Njc1PPvqDH/T8MQGMz9z58S90Hz/5l9U1Na1bb72N2+64g/JgCK+hY2bTTE2MMTI0yOTEBMnkHCiwbBvXdedfozAMA6/HQ01dHRd1LCFaU0dlTR2u6zI9OclzzzzNz598ktnE7N77/upvHrnn3nuf/T8GeOGFF6r++Yf/+I+nTp7e/Jm776747L2fIxqtIjY9yfTEKOd7z9Df38/Y2DiTUzNMTE6TzmSRUpJMpbEsCyFKAKFgOQvCYWpqojQ21NFQX8/69RuobWqhpr6BskA5hw8e4Hvf+S4H9r+ZuXHLzT+5fevWhzZv2TL0vwWwc+fO2r/9yl9vHxkaWv3gdx/i03ffzehAP90njhCfmaSv7xy95wYYHB5lZHQCgYuugVAuKAWuAkATIDSJEBIHgW2D0DRqaqtpa2lm5bKlLFuxgqUr19LWsYR0KsXf/5dv8Pjjj9PR3t5/731f3vKJT3ziA0NK+23K79ixY+GD3/jGz8+dO7/+v37r23z6T+/m8Ju72d/1BqMjQ7y5/23e2PMWp8/2kstmMHCQOGjKxUChAR4JHgG6BA2FcB2E62BIF58B6WSa/qFRhscnyKaSuMUcjmPRsqiDazZvJplIsHvnzgVjw8MLvnb//Tu2bdtW+IMAtm3b1va9b3/zJ329vR/6u29+k0/ffTeHunZx+uRRBoeGefWNvRw7eYpiMYchXTTlokuFRwOvJvDpkqqInwWhMsLlXsLlXkLlXoIBL2VeDRwHu+igC4XfK0mnswyMTJJMJfFIl3RijqbWNq66ehOWbfHC879avnTJktSuPXv2/l6Aq666ynfs4MFHTxw/vuU/3vs57vvKV+ja8Qrn+7oZH5/khZd3MDI6ghQ2yrIwEBiAISFYZrDpsiBVFQu4Yq1FU61GNh/A8Br4fB58ZR4Cfh91NWHamjXMnMDMFijzSCSK0ckYQkrKPJJMJk370uWs6+zkbM9psf1fX1r7F5//wqtdXV2TvxPgT++88/Ovvrz97hUrlvv/9uv/mfPdx+k+eYSZmTjPPL+dWHyGa6tN+ubAIwSGAF1AfU2IpvoKQmWSlRelaQjnidYm2faml3TOIZlzSOUcMjkbTbrc9ZE5xqariUT85DJ5XMfCo0l6B8fQdJ1IwIuZMWltX8ziJUt5/plnPJZpRs+eP/8c4H4gwI9+9KOlz/3yFz9MJBO1d3z8k1yydjW7Xt9OKp3l2RdeIRafRuBQqdnMWjp+Q1KmS5obItRVhyjTJbalsXFVHM5JXjzrYWbOj5I6kUgF+aIFgN9vMjkeQUPH0CThiB/HdsjnCxiaxpnzw4TCIbw6FHM51qzfiG3Z8oknHrv4gQf+bvTV114/8o7O8j36ywP79v358NBQw7LlK9m4cQNv7t6Bq1x2d73F1NQEhl7KMKczPoI+nXKfRqTcoK46iE+XeKXCi6K8zKU3Xk6uIEAIbrt5Cz6fj0g4jBIaEZ9FMgk+7d1101AXwWdIvMIm6BG8sedNhkfHGBo4h5lJc/Mtt7Bq1Wqee/rpTwPG+wAefvjhlu4Tx+8MhkKs6+xEOAXSqQS954bo7TuP36fzyF/N0lYHZYbEpws8EiIBD47lkEgXKFgOunTRhaIgPEjg9q1bWbtqFV+457Pc9OHraFnYjBWTaBJ8UuHTFL55iJbmSoRrE9QVlmmy/8BhEnNz9PV009LWxjXXXksymdr40Le+dfWvhdCaZUvViaNH7rMdu1zTNfr6ehkaGqCxoYHXduwmlZzlk9en+MwWk1BAsf+ID49QLDBcfF6NuBsg5+pMzZnMpC0uWZrHyhuEoyaJTB3XXH8lgXIfLS2NVJdJ9h05RWPEIOARyPmtSCDQpERqGslUFq9hMDmbZkEkSHW0ikWLl1LmL2NfV5eMxWZiPb19bwCuBvjqqqNf33T1VVz74RtYt2Ejc3NJ3j50iPKAn8NHT+LzSY50CwwpuPMjOU72eJmblSRcg0BY4CmvR3j8aLqHhnJY2BKnc1mOpe1ZfvXyDMMjB3FVnuG+42x74uf4yrysr1YIwBWSd/ZTpQRen0EqZeIql4KrYRaLLOlYRDAc4eIVK/nVM0+TmJ2b+9yXvvTW66+/PiuBCMC61cvoP3uSTZdt5C8+93nGp2boPTeA49oUi0U8Gvz42QD3/X0FX/xUikjAxVKSyUyAsakZli3u4Ktfvo+WpgW4ElraU7Q0WjzwnUmiTWcYPvtTps8+w3+oS3HNQgMhJEJqGFLhlaq06WkKQ0LlAj/YDj7pEI8nGBgYIDE7jZSS5StXonuMVWYms4n50rCqrjr65Wy+wONP/IwTx09w60c/Rs/Jk4yOjuIxJI5j4dMlHimYjWsc7/byZx/L0DPoQXoirFuzjlu33MCSFQvZve8pmqNztDdbyAiEl7p0Xlrg0sV5Lg3lWTxR5KxbiSslKGjQTEKaRcLxoBAoBI4Ls8ksupRkHY1QuZ/Vq1fR2LKIsdFRjh89GjLN3GB3T89rFxZxTXWU1atXM5dMsqithbXr1zM+HQOh0IVEQyBR6Chm4xqP/UuArVeb1FaZJObGmYqfZ//BF0nMTbOmvYD0Awvfk+OSQEXpa6Nu4hUutusyVdCxEehSoQuFJhQej4YuBAIXxy4Sn0uQy+XImSYLW1tBKaanJqsBj37hBQouv/xSYtNTDPaeYuvWW3jkkf9GoWBRpoMQoAkBUiCFSzEv6T6ocfWVUxzsTvLyzuMg4OotJo0X2dAI6Py6+IBy6EjP8ZNzBjET6ppbcPOCybEh6sIGoTIdXYAmFA4ummOTTGeIz8yQSszS2tqGqxQjQ8ONlAqAkoyNjZFMpqipreXxxx6nsa6GRx99lFQmV8q3QiClQBel3HtJRZErvAXWNBT5/ldn+IfvzPAPP5zmo5/KQAfg/yIwjeC7CEA0Ah7gOph0JXqwip8+/xR/cuefMzSTwvJEOB8r4iqFazsEA4pVSyx0Q8Mu2sRi07i2TXl5OQhB0bZ1QLsA4PV6CYdDFC2HZDLF3j27+OKXvkhDfT2aEBc8IAVoUnBkzsPZgMHEpId00oD0e019CHh4Pj/cB3wKIiCWAx+Gkascli2tJTlXuimbzeIiUEDRUhQLRUxTcrRbL7VCAsysiWVbKFUq0YUUAtAuONm2HaoqKkmnk6hwiCs3beavv/I3jIyOUhvx4wCWAk2DugqHK9YVSJ0TtAzlCV5vQ+7d1qKvdxe9Z4cBqKqsZOXqYfz++YsmkICx+Cj9vRM8+8KL3Hzr7Zw6cRwzPsW6NVm8pDhwQuPAqZJ6Ukps28KyLKSmoZTCLhR0QFwAyOXznDrVjc9n8MlP3cXho8d55OHv0dJQTdG2kQqEC6sX21QEXF582cOaCgvCgtEpnaZq+wLAL596kFDg49TVLuOxbd/mpng3W26evzgENWHFyMAMP3vinxmYiJPKZJjsP4OUBof2G4xMFMnYIKVg3uAlqyOIxWJIIYhUVWXG4rPvlhKpdJrz/f0cfPsI1Q0tPP/cc4TKvAA4rsJ14aJmh75ByZtHDGZcL7tSEX5qr+XrP6zhlzvLwYTRbp3sbD2Xr7+G6sogq5ZfdEEBFQdy0HmxyY2taZKjfUTsWdJDJ6n35LizIUmrO0OZLI1lBGC5Lh7DQzgURinF4EA/UpOqqaFxClAXPBCNRkklE1zS2Ul3dze73thBxYIKdA0Klg0C+oZ1fBo4Ukf6yum8/HJuvX0LSxYbPPi9z/LRlRkaHBuZneBrX/tP5Is6mzZH2HCljQKYBmLAS/AxPUWmpYp4UaegBIVMDi03x/U1RdpW6xwa19lztAzH1giFyglFwpQFApztOY3juIWq2mj81wC8uk7nurVcfcVlDA/0UywWkB4vHs3AVQVcVdpgXAFFqRMwPKxZuRJcsKmlsqwNNRdDZODGlVkyOUkio9PgGWNVx3wnmANzt45ecHm90Izh8eC3CuTmsqRTRf7V8vHLIR+ZtxWpooPwahheL3U1UTzeMsrK/Ozr2ksun++3bfsIYF8AOHz0GABde/cT8AdYv24NA4PD8wtHYCkXQ0kcSv16U3Mz29/YRUtvPe3nWpjqj8FToIBLyXNpUx7nNpACVA/M6pJXXwihTkHW0egtKAL5KcyiTcYWmEVFzoaspchZCiUkRTQCfj+tzU0sqKzk7OkexsdG8fi8Y9tfeaUHsDUgMjkTO77xssvrJkdGGletWM4dt3+EJe3tTE5OMTE1jcfQsIo2QrhogBCC2EyMRGKWgf5++nuOs0mfYdZ06EtpjJg6ozFJ05Uuog/GHJ2H/ucCTK2dot6ME6xmyvJzdCyNH5uC7WLakLMUeQcKDkiPh5TrYcWyJSxqa2L56rXs3N3F/n37Mo2tLc+fOHFyLzCrA3kgXl1Tkxv2+xkaGSGZyrCwqYHm5gaOd5/GK31IrYitXIquoswuoukOWs7CkC7NXofROYeuTBleCX5D4NMFl5Hk0LMG+yMByis7+cuvPoBjO+TMPP/046c42TvEpKUTwKbgulhCYrsKJQR55SEUjrBu7SqCwTBjw8McfustFIzv2rWnq5SMSx6wAbupqUmzLHvtXDzur62pobq6Cp/Xy+DQCCqXQXg8OI6LLFUTaEqh4+BRLgHNZTCro5BIWaoyXSFZtqLI49vLOTXqIWYaLGxezMxEgq6uQ/xq23YcxwXbQiqXgiuxXEHeBQwP8YLGVVesZ/nSJfjKfBw9coxdu/dw8cpV+w4fPfoCMAkU5bwHpp5//vm32lpbs47j0HOml2zWpKYmypVrlyKlwFUaXp8XNAN0HTQNJTW8BjQGHAoO5BzI2JC2FOmiImMKso4kWxRMTiU4d26QF7e/TNpyqa6pwVEKRylyjqDgQMEVSN0gVpQs6Whj3ZpVSCnJZrOcPtNLrlhMD4+MbANmgQK821IWgNnqhoauBZVVjI9PMDwyhuO4LFu7nub2JdiWgxI6SkryDlgu2AhuaypyOGGQU4KcK8jYJeUTBcWp0zqpIniETbFo8ePHn2D/wUOcOnGcTDqNY9m4jiJvQ85R2EIQszTCkQpuvH4zwWA5SinGJ6Y5eOhtLtmw/s0Dhw6doVS4OPDuVMIF9AMHDqQuveyyhWMjw42FfJGL2hbi9XmJVlUyNj5JOm2CpmE7Nrmizbpqi3qPy74ZD64SuK7CcQWuECgkFRUOfQMlG1kuWPOd12w8RjaRwFWKkCjwZ4tMumJeEvjw+AJsvek6FrU2Uyha5PJ5XnltJ+lMppDOF34wMTFxDJj5TQAFCE3T/OXBoLio/aLLzpzu0YLBIC0LGwmHQoRCQQaHRjDNHLpu0NFiEYzYvNSjU7BLY1AlBI4qHW8gJI4STCVKse2TLo7jYlsWrmXhug7SKpDMu0hDI+qXxLRKPnLDZpZfvATbdgDY3bWf/QcOsf7yy197fceO54BBIPNO+n/vXMhxXdcZHR21Oi9ZHzAz6SX9/QMiUB4gWlVFdbSKaFUFM7EY8XiCe+/I8y87QiSLCttVoJiP6ZL1XSGIJeeHuQjytkI5Dtg2yrFxbYu845ITBj0ZH4VQIzffdB1LF3egSY2iZZWUf+sQ4Ujk/PTs7JPT09PH5vdz54MAXMAC5ODgoLn2kvX+ybGxtt6+80JKjerqKmprq2lqrMdVsPNghkTKwuf1IXStlAZdcBS4KCwHio7CchQF2yVvueRsl5zlknfBRCfjSBZURulcs5Kbrr+GhoY6DEMnmzN54429HDj4Ng3NC01/MPjzg4cO7Zq3fnY+Yt4H8A6EXSgUhGmaxVWr15QlYvGF/f2D5HJ5amuiVFYsoH1RK9FoPbouSaczFIo2SB2pG7hSUnDBdCDrKEwHckpiSQ1LGuSFQVm5RlW0kc61q9h89RWs71yD1+dFKUX/wBA7du7l5KluVVFVNTibTD116PDhnUAvpUrKfq/CH3Q+oANVwJLGxsZ1H/rQh24Y6uu9JjYzI1tbW9i86Uoa6mvxejzk8nnGxyeZmo4xNT3D1PQMZi6PEPJ9D1VKEa2qoDpaQWVFJbU1UWpqogghKBYtpqamOXLsJL2955idnaO1o+PMwODgS/2Dg28D3cDAe2P/dwFAqfmrBhZXVFQsv+mmmz6cnJ7efO7cOW8g4KejfRHLli2hakGEYCiI1+OhWLTImiaWZeO6Dq5SSCEvnM4IKfF5Pfi8Xnw+H0XLIpPJYtkWAwMjHDh4mJHRUULhiLqoo2Nf1/79L09OTvYAfcAwpdTp/qaiv+uExgtEgXZd1xd3dnYub6qr2zg0MLAunUygaTq1tdU0NtbTUF9HRcUCvF4Pfl8Z5eUBdEOjWLTmj5gkxUIRy7aw7VLLGpubIzYTZ2p6hrHRMdLpNA1NTQP+cOTA6zt27KMU733AOKW4f5/yvw/gHU9UAm1AWygUarjrrrs2T4+NdaRSyeaxkRHyuRxCSkKhEAsiYcLhENFoFV6vB9PMUygUEEJimiaWZWHZNlNT06Ue17IQAppa28Zr6+u7u/btOzg8PDxAKVz6KWWc/G9T/g8BgNIkOATUUpr0NFPq1j3M7+S3bN16h+a6y+ZmZzFNk9nZWVzXRdM0pJSAmv8EXdeprqnB5/XOeMr8g+WRyNRLL710OB6PT1Oqb4aAUWAOKP4+5f7QY1ZJKaQqgSagBiintODfAfTzO87cfkMUpZRdoBQecWACGKOUaUzek+v/GADviAGUzSv7jgcCQD2lRW/89lt/TRwgB6QolcUzlCxu8gdY/b3yx/izhwcIUgJ5f/78YHnHA0VKMV6Y//3/n/wv9A8QogtgOnYAAAAASUVORK5CYII=' },
                { name: 'buff_freeze', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAWQ0lEQVR4nOWaeXTc1ZXnP79f7XtJqlKV9sWWLC/yKttgY8AYgqFtAwnpQGhIfBoSSA8hk3SSZk463Z1Mk6aTMJOT0yFpzjAhQLqbhJgYgzHeLe+LvEiybMnWXpJq33+1/Lb5Q7bb6cl2ejIzZ87cf+r8TtV5v/t59/vuu/e9gv/HTfhDDbRx40b/U0891RwaHV2dSiY9kxMTDVkpZ1cVTbWYTAiCIOggNDQ0jHetXn3259u2nQmFQuGDBw8W/68BfOc732yoqW5af/jQ/rtPn+pZMjo+Nscoig4dHQEBq8WCz+cjEY9TKJYQBVB1HVmWNb/fN7jqltVDHpf3pw67/dy3Xnrp0v8xgB9+//tdF3rPfeJ8z7kHrly92tbe1saizsXUNdTj9/mw2Z2oqoLVZqO6uppYNIokSYiiiMFgIJGIMzUZYnx8jP6+Pmpqg/0ut/sflq9es+v5558f/t8G8NYbby398X97+UmpVPh4JpWuvm/TZu65dyPNLc24XG48HjcGkwkAXSmDDmW5jMlkRhQFEEQQDQBIuRzFYolUKsmbP3mN9959F5fH2e1xew/V1ze++b2XXx74QwKYPvXYI3/Wf77389WBQMuWBx/ioYcfxulyYzEZkfJZwtMhJsZGmZmeJp1Ogg6yoqBp2rXX6JhMJixmM4GaGua2d+AP1FAVqEHTNCIzM2x7++f885tvkkglDj/3H//8vzz19NO/+F8G2L59u++//+gHP+jrvbjhU1u3Vj759DP4/T5ikRki05NcHbzE8PAwodAUM+Eo0zMRsrk8JquNTCaLLMsIwiyA3WKiwuMhEPBTX1dDXW0tq1atJtjQTKC2DpvDyZmTJ/ju33+bE8eO5u7btPnHH92y5TsbNm0a+3cB7N+/P/gXX/rizomxsaXf+vZ3eGLrViZHhum/0EMsMs3Q1WGGrowwNhFiYnIadBXRIKDrGkaTFU3XMTorMJlMCLqCJpcxiEbUsoKilAhU+2mqD7J4QQcLOzuZv3g5re0dZDMZ/vNffZ3XX3+d9ra24aef+8KmRx999NdKyvCbnN+7d2/Tt77+9X++cuXqqr/9uxd54tNbOXP0IMe69zE5Mcax42c5ce4yo1MRTE4vLl8Ai9ODwWLFZHEi2hy41zzCc899gb7hSVzuCry1zXhqWvDWt2Azi+TzBYYGhxidmCCfSaOVC6iqTPOcdu7asIF0KsXB/fsrQuPjFV95/vm9O3bsKP1eADt27Gj97osv/HhocPD2b7zwAk9s3cqp7gP0X+hhdGyCD/cdpu/yICa7i/n3PExj1wbEigZcDR3Y7U4sviDGmnaEXIRISkJ1VNKx5l42bd5M1NbEmrXrcNjMjA32glwgnc4yPjFNOp3CLGpkU0kaWlq54871yIrM9nd+uWh+R0fmwKFDh38nwB133GE9d/Lk9y6cP7/pM08/w3Nf+hLde3dxdaifqakwO/cdIZbOYgs2YHVXsXT9Fj67eS2KaOPpj23gYiiJu6WTtbfdRikyhFGXcFlEgu1drGkL8Mk1c7i1vZqjPX2MTk6RlxWMggaqwtRMDFEUsJlFcrksbfMXsaKri8sDF4Wd77+3/LOf+7MPu7u7Z34rwKcfe+xzH36wc2tn5yL7X3ztL7naf57+3h6i0Thvv7OTdDZD231PIDR2EWxqIz4zRVXDXGpdBtZ01HFyLIO1soElTRWMzCSxmC0ImoZsdFLt96GrKq9uP0QsmUSraqEYHacsqyCCUZe5OjqJwWjE67Ag5SRa2uYxr2M+77z9tlmWJP/lq1e3AdqvBXjllVfmb/vZWz9KpVPBhx/5JCuXL+XAnp1ksnl+sX0XsUQUk8OJ6A7y5CMPEaypY2omSlnWMHqqCbjNXJwu4PBUs6bFw0jJi8vtRQfMooDB6Wdxg4fj/cOUXfVUOI1o2RC5XB5Z1UAQMekKV66O4Xa7sRihXCiwbNUtKLIivvHGTxZ885vfmPxw956eXwcgBqqqvtpz+tS9Cxct5hOPPsJg3zly+Sz7u08xE4ni9AewuP2YRZ2QJGD3+th82xIm0zKVVVU0eC2EsgaqqvzcPdfC3GAFoqsOyViJqBaZiSc5eGmKvCrSVOPHkhkhGo1gNkI+X0DRwWgQEDSF8clpGupqMBlEWtvmUd/QwMnjx+nrvVAxHpp643oUbgC89NJLLQd2f/hfAeddG+5mTnMdkekQFy9d5eyFAXz1jRhclbgqA7gqqjGoMlJZxumrJ1uQKQt2UmUjtdVV6Ags8IPXJtLhN+D3uggrFYiaglAuYvQGWN1g59DhQ2iqjNlswmgyoag6umjEZjKSy+YoFAq0NNZjtzvoWNTJ5MQEZ06frv3Kl7985MM9e4ZvACxbOF+/cLbnOUVVnAajgaGhQcbGRqivq2P33oNIxSLO9lV8/a+/QWNdHTEJPL4ggsnK/PY53NvZQLRkoL3awV0tIk1eMN8UW79DYFGtlazgRhIcrGrxsPvYedSyhNFkwWyxYWlchrl+EW49TyqbxSAXSSTSVHhm186cefOx2W0c6e4WY7FobGBwaB+gGQBrTbX/a+vvvIO7P7KRFatvIZlMc/rUKZwOO2fO9uLwerDYXbibl/Gpe1cyGNfJ6UbMjgokzUxbjZfldQ4sRpEKGxhFkDUYiZUwGQQsRhGzAYqaibvnuZB1M1PpMqKgY7U5MVa34fTX8/T9qzh2oodiPosipdEUlWK5REf7HFweLws6F/PLt39OKpFMPvPss8f37NmTEAEvwIqlCxm+3Mv6Nbfw2Wc+x1Q4yuCVEVRNQRaNiMCpnrMcuRLluQdW8OyDt/IfNi0jaNO5EFaJFqC1AmQV4hIkCgIqBt69kObIlSwAy4JQYQWjwcjCthaaOpZiqKjDVVHNtz+xkovDIRxuN0aTGcVoQRQhHk8xMjJCKhFBFEUWLV6M0WxaIuVy67lWGvpqqv1fyBdLvP7GT7lw/gIPfvyPGejtJTQ1hc3pAIsNu8eLGZVLcYW8YmQ8nuGdIwMYzU4+0hmg0ibgMEOiAKo+W6FYTQYsgsp3v/9DDh34kPvvXg+Azw6dQTNOq42pDKyeV8eCoJ0cbhR7DVaHG5PZgtNmQxdN2MwGFncupL55DqHJSc6fPeuWpMJo/8DAbvG6TgPVfpYuXUoynWZOazPLV60iJcl4A/UE6uficFVhdbgQEiH279/Lnt27UfIpMNtJF2elMxIrMZmc3e1j2TLHr6Q4OSoxZ9EqDh4/y7b3dgFgEiGSh9PTCt4qPzJWPrxaJlw046puwjFnJc7lf4R55cdQdIFEKk2hUKAgSTS1tICuEwnPVANm442VpsPatbcSi4QZHexjy5YHeOXV1yDQQdemjyOKBgqyxlBPN8V0jLKqU9ZEAu06ZsOsU/GcwvZD51m3IMhU2U0qK3HlUh9XLvVhcgWZmgnfeN2ZGTCb7NzapDGv6uZsbrmm6sUcOX+Z53a+TCYL8WiUTCpBS0srmq4zMTZeD5huAIRCIZwuF4FgkNd/8jrPPPtFXnjhW7yy/QCPrVsAgki2WObFU7spFYuogoisyKgamAw6IOCyisiKxtf+/mWWrlzD+PAQiXh0dn7U8s17JiuC8LOzaQ4WdMbiJu5odVCUVXYcG+DQ0ZOExy+Rnh7DYDCgyCqxWARNUXA63SAIlBXFCBhuAFgsFjweN2VZJZ3OcPjQAZ586jO89csd/PlXv4rJ7sZscaCqMna7CwURk8mCaDSjXNP8vKCNhfM7OHlkP+dOHf0VhxUpQW0wcOO5Z1qlWCxQ47HR4jGwZzDL8EyGdLSE0WpBEA1ouoYggC6AlJeQFRmLrgMgiILwKwCKouKrrCKbTaN73Kxbv4G//OtvIBUVfHPr8da2YXe40QSRQjZFTsphsbvw20BRdWRNwCTCXfPdnF7QRveBfQjX2ke1lGP5ojY23L4WgLwMo1GJbDrOqZTIuf4cVocTrVQgk46RiYVJJyJkEmG0bBqrx4WiyMiyjGgwoOs6SqlkBIQbAIVikb6+fqxWE5/8k8c5c/Y83/vuiyxYuoqUqxmT0UHA66Gxvo58USGnmXHazMwk0lyOelgatANQ6zXz9JaVmHITHD7ZQzadZP1tq/n+3/3NDefLKuRLZTLZBGpRAkcln1nXylSyyM9OmTG1OqnwdWBoGCZ7YhtWu5lZkQrEYjFEQcDr8+VC8QQ3slAmm+Xq8DAnT/dQXdfMO9u24bKa0Qtpnt6wiH/68kfZet9KPrWulds7m/nKxlb8LjPJ8BQ9vZf40ekyyWsnPB1tc3j281/E5puLaLJx17o1N6STLMD2SyqfXO6myu1A01Uw2bCZDNR6LXz7jzvZ0tXIH61o5SNrl4PZjslkxuNyo+s6oyPDiAZRb6irDwP6jQj4/X4y6RQru7ro7+/nwL69VHgrMBhEfvDq6+zqnaaxvZOv3NNMZ42VoqxxamiaspQhUS5RWV1LSQmQLAp4LBDPK+QLs0T1tUFgdncOOCGXz7PtQgGDzYmxoglUhdcOXMJmNJBNxblw5jhlucTnn3qC8+3taMlp3F4PNoeDywMXUVWt5Av6478CYDEa6VqxnDtvW8P4yDDlcgmzxYpoMFIKjyCno3TW2dCBt86nCThF/EaJi5kkJUXDZHHyj7qBx7uqSBdFUpLyr4nRN4e8DA4TbL+skElFGZ8cIZXO8OTm26n3mtl2bIiRwWHkQp5iUSKXSfO3r71PeqCPVZ3tmC02bDY7R7oPUygWhxVF6QGUGwBnzp4DoPvwMRx2B6tWLGNkdJx0NIySiqOf+ICfpqPsr2tAq5rDU3cvpJhLUy5JqKpOwWhjQbWBeL7ImfEC7T7rDYB3e1PMTYo8uMCKx1QmHpkhl4ih5FK89rPtBBtaeHjtPF44vIf01CjZWAitkMI8cASjaKKxtpqKqiouXxxgKjSJ2WoJ7dy1awBQRICz/QNbm+a2nyjkJRbMm8effvpRPrr5floaGyiXZSwC5JIxhi8cYeD8CcLhEMOxLBMTISr8NVRUVmIyCDhNOj/c1cf4UC8j41M3AM4e/YADJ3p48cNxjl+eQfBUM2/BfMwmE2gqV1MlFF1HkPNolQ0sXLYSJRUhk0rRWFOF1QTB2jqOHD9GPB7PVfr9p3O5XBgoi0ARiFcHAgW73c7YxATpTI7KSi+NjXWomopWVshGxolPjZKJTZEf6+XtnYewB5p5fPN6lsyfh5ZL8Oov9zMzcIJKK+Slwg2AoqqRLZWYGB4kls6xabGfRQ1ViCgIAshDR/lPf/U3pMLTuO1WnFoeXQO328OK5UtwuTyExsc5c/w4OkwdOHCoG0hdj0AKuByJRN63uz3xZCJJKDRNqVxmXttcaoMByrKKVdARdQ21XKScSaKZHDx+91JaK010tjfwxY+txiYnyGViLGlvYnQqegOgoBu4c+kc2us8pKMhsrk8VU4z8xd1ohQldF1HNdhQNI3IhQMc2/c+haLKsiULqAlUY7PbOHbkKL29vSzoXHwpmUxOAXlAvR6B8DvvvHO8taUlr6oqA5cGyeclAgE/XcuXIIoCmgZmtYRakDA2L+ULD91KfYWV1949zJmBUV59/wSTo8OU0nFc7kpy2QwAotFMKTzMps4APn+AUj7DL7r7iKSLfH7zKuxOO0XBzNqND9LY1oEcn0LKl5jbUs+yzoWIokg+n+fipUEK5XJ2fGJiB5AASvCvLaUA2O7ZuLExGo4sTiWTBIMBKiq8BKr9xBMJZmaiGAwCZosFa3ULzXU1vPrGv5DM5JgqGhk71025mMXtsLJqzQb27DtALptBkwsY5CzvXwihWCsw6jLJ0T7OXh6hpGiMDPaTyZcIxVI022UunT2F02bjow/cR1WlF13XmQhN8+6Onaxec+uBXbv3bAMmgMLNABpgPHHiRObWNWuaQhPj9aVimbmtTVisFvy+KkJTM2SzEmaLDTk2ytGj3eRSCQrOOuocZfpOHqSQTVMfqKZtyW0c7j5EuVxCLeVQShkMSoHpy2coJ2eQcimk2Dg9J4+RikcpJadJXtjHUO85bBYr999zJ63NDZTKMoVikV2795PN5UrZYunl6enpc0AUUG8G0AHBYDDYnS6XMLdt7ppLFwcMLpeL5qZ6PG43breL0bEJcrkcSiGPlAyTyqYoyDIDhz9AKRfR1DIPP/QQOaGCU8ePzA6sqZSyEZRijrKUIR2foZhNk0tFSSfCpMIhlHSEUl7CYbNy74Z1LJjfjqKoABzsPsaxE6dYtXbt7j17924DRoHc9fV1cyGuapqmTk5Oyl0rVzmkXLZjeHhEcDgd+H0+qv0+/L5KwuEZopHZesSgFslHQujoaJqKrir8yWOfZjJRZuBi7yyArqNKcUpSDrkooRQLFPNpivkscjqKns+glMrUBHxs3riB+e1tGESRsizPOn/8FB6v92okkXgzEomcAyLXZ/+69m82K9Dq8XhW33vvvY9cPNtzDyDcsW4tK7uWYrNZmZqe4cix0/QPXCKbzWMxm9BQKQOaJqCrCmazGXNVA4iz+6RazKLIZVRVRZeLiGoJUVVRFA2/z8fC+e3cunoFlZUVmIxGsvk8+/Yd5tSZHuoamyTBYHhl/8GD24A+IMlvOpm79oVSKpUESZLKS5Yus6Vi8abh4VEKhSLBgJ+qygra5rRQXxvEaBTJZnOUSjKCBiYBDIKOppQpZuIUU1FK6ShqIYeoSIhyARQZQRdoqK2la/kSNtx5G6u6lmGxWtB1neGRMfbuP0xvX79e6fONJtKZfzl15sx+YBCIAcrNDv+6+wEj4AM66uvrV9x+++0bx4YG74pFo2JLSzMb1q+jrjaIxWymUCwyNTVDOBIjHIkSjkSRCkUEQfyVAXVdR9V1qqsqCAZ8VFVWEQz4CQT8CIJAuSwTDkfoOdfL4OAVEokkLe3tl0ZGR98bHh09DfQDIzdr/7cBAJiBamBeZWXlovvvv/8j6Uhkw5UrVywOh532tjksXNiBr8KLy+3CYjZTLsvkJQlZVtA0FU3XEQXxxu2MIIpYLWasFgtWq5WyLM+eiSoyIyMTnDh5honJSdwerz63vf1I97FjH8zMzAwAQ8A4kL1ZOr8LAGa7az/QZjQa53V1dS1qqKm5ZWxkZEU2ncJgMBIMVlNfX0tdbQ2VlRVYLGbsVhtOpwOjyUC5LF+7YhIpl8rIioyizLassWSSWDROOBIlNBkim81S19AwYvd4T+zZu/cIs9lmCLi+6/5Pzv8ugOuRqAJagVa32133+OOPb4iEQu2ZTLoxNDFBsVBAEEXcbjcVXg8ejxu/34fFYkaSipRKJQRBRJIkZFlGVhTC4chsjyvLCAI0tLROBWtr+7uPHDk5Pj4+wqxchpnNOMXf5PzvAwBgAtxAEGgCGpk99zDDbEf3wJYtDxs0bWEykUCSJBKJBJqmYTAYEEUR0K99gtFopDoQwGqxRM02+6jT6w2/9957Z+LxeASYAcaASWazTfnfOvPvAeCaoxZmo9EABAAnswv+OqCd33Ln9m9MB2Rm65k8EAemgRCzmUbiplz/hwC4bibAds3Z6xFwALXMLnrT7zmOymwtk2G2Go4yO+MSv8es32x/iD97mAEXsyDi7/jtdbsegTKzGi9de/7/z/4HxPh5XUQkXfsAAAAASUVORK5CYII=' },
                { name: 'buff_imprecate', url: 'data:image/png;base64,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' },
                { name: 'buff_imprison', url: 'data:image/png;base64,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' },
                { name: 'buff_transform', url: 'data:image/png;base64,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' },
                { name: 'buff_shock', url: 'data:image/png;base64,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' },
                { name: 'buff_light_echo', url: 'data:image/png;base64,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' },
                { name: 'p_ruby', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAADAFBMVEUAAAARAAAiAAAzAABEAABVAABmAAB3AACIAACIEQCZAACZEQCqEQC7EQDMIgCZMyLdIgDuMwDdMyLMMyK7MzPuMxHuMyLdVUT/VUTMd2b/d2b/iHf/iIhV/1X/qqr/u6r/zMz//////+7///+ZmZkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/x8P/gXn7QTbGBAD////GBADcEAXyIBP7QTYAAAD/gXn/koz/pJ7/tbD/x8MAAABAQEBBQUFCQkJDQ0NERERFRUVGRkZHR0dISEhJSUlKSkpLS0tMTExNTU1OTk5PT09QUFBRUVFSUlJTU1NUVFRVVVVWVlZXV1dYWFhZWVlaWlpbW1tcXFxdXV1eXl5fX19gYGBhYWFiYmJjY2NkZGRlZWVmZmZnZ2doaGhpaWlqampra2tsbGxtbW1ubm5vb29wcHBxcXFycnJzc3N0dHR1dXV2dnZ3d3d4eHh5eXl6enp7e3t8fHx9fX1+fn5/f3+AgICBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmKioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7////m5YXMAAAAHnRSTlP//////////////////////////////////////wDsGBxeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAdklEQVQokY3SWQ6AIAwE0LmIX3IAlvvfTWiBTomNNiGBeZFVXFYAD6hbMg5IAaQ7SV4yyf6i5x1MrBPAyAdsAeUCSz5Ac4UpoHyCCihfICKtzaqzsKfyAFqcAW67Bsc5IlChnC5R4eV2IxhCuXvzVnn0A/zv8wAGzkpdgqiZUQAAAABJRU5ErkJggg==' },
                { name: 'plane_1', url: 'data:image/png;base64,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' },
                { name: 'star_m', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAVCAYAAACt4nWrAAACrElEQVR4nO1TXUhTYRh+vnPO3ObUs5bi2jybiDhTcg4xWy5cXYReJN7UhTdJEEHeGAV5lxTdhlRXaWAXXViJXoXhRYWRUmQzSKILXW7NSYJnmu3HnfN2MW2hRxHq0gdevr/nfb73ffg+YB8a4PdK9JagzSkKk5KZWUMxGv1v4k4RZqnY8urGnXYxPDt3zJRaj4VW1Mm9FrYrfA4hMDXeS0QRigSfUcuRg9Rgh/+fhRslvufhTZ7oZw8RRYgoQoN918jn0AWdIsy75W6zxSnCXFWEZodZ6JZE1uVysfNXu03Q0wtgrQ/gClHdcBHR4Kh5Mbh82FHAKm35BIGDHEsi8bcW25y4i1Fq0vMD9hJzU633NHxNechn/fDUUZZtPJsZc7yAoQUfJyawEJpBNBzG6PAYFsKx6dVkum16EUEAEDbz5ARkg8DszWdsuNB5CIgPgpIEZQngCzdI8afZMf4EnmoJnhoJMF4BlBD6778rkhOQNT1yijD7HLrgrXMCKTMgdR6kfM2EOg+iSDbU2eze7U4LNUqCXG9D7Y6ex5JIHDCoI6Eod5IZmLXGSkh/ZlAXGJQQg/JtI8IAy83Evbs8hobWn/9KpVunovii6fnWDiRRF3hwPe0ss2g2mXHHQmi9lIPxYEoPILX1nNsp0WqBs8wCrK1k1qqynWOMAeXlKuptqNLS0BQvKRA6TrlVrMqA0bRB5IHoMpBKAqvyxmUKg9dF0Al8h5aOoLXJGOsq1BPkJYYfS8D3ODAyweHTXKaWdq8CXwXBZiO4HQQOnH/P4nm5cNZVqBgLcHj8hgep6rRKau/bUHrguMR1DIxzXcMfOPcJF8HvUcE4zu0uRunm+/5TpJb4UTv/mjEmptJ4JHDpl+8jCGyh5Igi7JV5usuA6gdjusR69vPsY1f8Bn23ErwCKUfwAAAAAElFTkSuQmCC' },
                { name: 'heart_px', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOtwAADrcBHI9bQQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAG6SURBVGiB7ZixSgNBEIa/U4lgbRrR1iKYQtDeTh8gRR7ApxCrIIhYWFhHyQukVMFH0KSwsNAymsbKUiFZi+Pi7sjdxiTn7cr+MMV/82ezPzN37E5ENoZAZNEk+AQWx9R+AKUxtQqYS0umJnxBMFA0pIEecc8pQHUhUvqDjGjGPa0/amnrtvRcE0pp6/SBYy1O43dQl/SyDHiHYMAFjPprH5TSo1IZqjTU6wMl9VpUtXWrGTpbdEAda7EjXhvvKxAM5A0luDzXLGT+ulYz9ZFBM80/ZO9rbGwAtxrviLzzFXgUfF1w5w3YWsh5AzZkG2g04r5PogC8Cr4puPMVWBH8XXDnDdjwzw202+bJpFz+o219Y1nwVcGdr8CS4APBnTdgg/cG5Me9h9ZmXX5+d/OGAk403gfOTckLsJYQ7ysQDBQN2wHHmI0OyMfxGfGwFOJ34MBMh9mo0/DewG8P+aML0i5wM+GfXmHemS+A5wn35X0FgoGiMc1F9w7YSsg1sJcifAOaGn8CLk3JPbA9ySa8r0AwUDRmOewxjkpHwLyWODS1Qy09FbyvQDBQNPIceNoGyzOB9xUIBorGFyQVtngCRvTRAAAAAElFTkSuQmCC' },
                { name: 'normal_arrow', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABACAYAAADS1n9/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAUoSURBVHhe7ZkFiK1VFEbH7u5uUREsDBQbFWzBRFExsLERuxsTAxPswhaxC0XF7i4Uu7t1LecePPPPHeeOzrvvPd+3YDEz//xz73/P2Wefvc/0hBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQvg/sDy+gW/i43gHXoFn4ZG4F26J6+CyuCBOj+Nj+G/sjKviWH/9NJK4FP9o41f4Y+Na7W/4JZbAuR2vxDPxKNwDt8K1cTmcG0NfZsaP8BncDifBrjMn3oXNCf4GXfWXVdfUwLgRj8GT8Qssv3sFzRoX47eta8VfcEcMfVkff0fHyGA4FmfDrjI27oRfYz1pm6EsggfhPWhg3I8TokyGG+NJ+BSeijOi17dAt5TtcQo8H3fF0JdzsB73n/EaXBmdm64xDzrJ5UGMyF1wHCw48VP1ftszXutrwfs2wRuw3CP196vgbr3fhhYulpexDoLiC7gnToddwYhzglzp5SE+RANhDnSSy8S7wu/EtbCOVItEi0gjeFx09ZvWSiCthr7eSC1+RjGWxJ+wnvxaf3ctumVMjCOc+dD9vn4ICz/3fD0UH8HyuyfQFH8eboST4m34KlosWgM8i9ugH2B+PAQTBH9zANbjPZCfoXXWBug4jxBsT8obGn1W+k7y561rtQbGS/hi66vejBfh69i83+zyNFr83IoGjvvg2XgGnoanoHXFiXg8HocWnnYYh6PBcyDuh3ujXYeZy9ZqB7Sq3hrNUtYorhwz1RroZ1sRbWtdedY4C6FBabcyO86E0+KUaIq2Qp8IJ0CzmhnP4G0GcLn2bwLb17Wrao7XP2mndjc6Fiugzzos7I7lTZwwzwscrOta14ruXQ66A2dH4eCZ7mdBB9GC0An+FOu/GxU1IEtFXn7+FS3KHOjv0e7GYtks6GeyTnof38W30TOV19BxcUE8j7Z5FsguokfxYXwQH8D70LrLTsyC+Qesn2mo+pzPoWc5LhQXweq4OJrVnZdZcdCaYiVsvng9OHH01m15QGZA+3lTuzcbyfbwpmB/vhqNrsPQlHwEun/tg/ujke19rpBz8Sp0JXndNtEC8RM0Wn0to9WvFjl2ELegB0umNlvOh9B64zF0JVlL+EzWF2+hq+8D/BjdH61dXKm+vrWHn6O5sgcL5k7uGd10LN5Ds5CteT/cB50wU135I08KN0XPBEx97sdlf3M/NOXXTI1OllvFNGjb6P7tKaEFi3+7HlojLIyd0sm+2u4ef7b78FktPidH21JToNuTKdGta15cAH2mRXEJXBqtE9z+bF9NpWviumgBZrHr2GyOnnpuiy4UzzqsSaxNrFFcHAeji+ZoPAE9RDsdPTm1/nkS68kaqm4d76CL7BL0QMnn8DmXQj+nNUZbLB483XOVNl/Y/b+sBFeXk2oxZEB48lcf7Dg4XrP6NzA2RPtYV+NcaEFlPeDANM8QxmQMTDNbc+zbaVYzE16Ang845gavrzHYAumHRVp98NOJPkDpVy2AbsJ90XRd7mmmTvcbU//laKUd+nIh1uNV6+JxQTnGy6CZbNhwL2j3psOtW0fzRDH04rlIc7zKoY9bzLC1de24Ho0w39A9pLQ5pv3S6pj2m62Ovb0FmP2+bY49vS2Oe78Fm4WbmcVTQmsITxBDfxbD77BMvGcsFtVm5q5hSrE4cw8pBx3+r9+CwRU7UGE15P0m9MO6y4n3nMFDLwvoMAZhdX4v2nGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCJ3T0/Mntg2xhop3vlwAAAAASUVORK5CYII=' },
            ]
                .map(wl => {
                const prom = new Promise(res => {
                    fetch(wl.url).then(resp => {
                        resp.blob().then(resBlob => {
                            createImageBitmap(resBlob).then(bitmap => {
                                res([wl.name, bitmap]);
                            });
                        });
                    });
                });
                return prom;
            });
            const resArr = yield Promise.all(loadTasks);
            resArr.forEach(res => {
                this.bitmapMapping.set(res[0], res[1]);
            });
        });
    }
    loadSpriteSheets() {
        return __awaiter(this, void 0, void 0, function* () {
            const loadTasks = [
                { name: 'explo_3', url: 'img/explosion 3.png', x: 8, y: 8 },
                { name: 'level_up', url: 'img/level_up_8x1.png', x: 8, y: 1 },
                { name: 'rank_up', url: 'img/prom_8x1.png', x: 8, y: 1 },
                { name: 'magic_2', url: 'img/magic_2.png', x: 6, y: 5 },
                { name: 'icicle', url: 'img/icicle_1_10x1.png', x: 10, y: 1 },
                { name: 'healing_1', url: 'img/heal_11x1.png', x: 11, y: 1 },
                { name: 'sparkle', url: 'data:image/png;base64,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', x: 8, y: 4 },
                { name: 'gold_spin', url: 'img/coin48.png', x: 61, y: 1 },
                { name: 'm_act_white_sword', url: 'img/ACT_white_sworder.png', x: 6, y: 6 },
                { name: 'm_act_green_axe', url: 'data:image/png;base64,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', x: 4, y: 8 },
                { name: 'm_lion', url: 'data:image/png;base64,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', x: 4, y: 1 },
                { name: 'm_b_worm_dragon', url: 'img/mb_red_worm_dragon_8x31.png', x: 8, y: 31 },
                { name: 'm_devil', url: 'data:image/png;base64,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', x: 6, y: 1 },
            ].map(wl => {
                const prom = new Promise(res => {
                    fetch(wl.url).then(resp => {
                        resp.blob().then(resBlob => {
                            createImageBitmap(resBlob).then(bitmap => {
                                const sprite = new AnimationSprite(bitmap, wl.x, wl.y);
                                res([wl.name, sprite]);
                            });
                        });
                    });
                });
                return prom;
            });
            const resArr = yield Promise.all(loadTasks);
            resArr.forEach(res => {
                this.spriteMapping.set(res[0], res[1]);
            });
        });
    }
    getImage(name) {
        return this.bitmapMapping.get(name);
    }
    getSprite(name) {
        return this.spriteMapping.get(name);
    }
}
class Game extends Base {
    constructor(imageManager, GX = 36, GY = 24) {
        super();
        this.updateTick = 0;
        this.renderTick = 0;
        this.__inner_is_pausing = true;
        this.updateSpeedRatio = 1;
        this.towerForSelect = [];
        this.selectedTowerTypeToBuild = null;
        this.statusBoardOnTower = null;
        this.startAndPauseButton = null;
        this.speedControlButton = null;
        this.lastMouseMovePosition = Position.O;
        this.grids = [];
        this.posPathMapping = new Map();
        this.midSplitLineX = -1;
        this.detailFunctionKeyDown = false;
        this.averageFrameInterval = 0;
        this.renderTimeStamps = new Float64Array(512);
        this.frameTimes = new Float64Array(128);
        this.leftClickHandler = (mousePos) => {
            if (this.selectedTowerTypeToBuild) {
                const [mouseGposx, mouseGposy] = this.coordinateToGridIndex(mousePos);
                if (mousePos.x > this.midSplitLineX) {
                    return;
                }
                if (this.monsterCtl.monsters.some(mst => {
                    const [mstGposx, mstGposy] = this.coordinateToGridIndex(mst.position);
                    return mouseGposx === mstGposx && mstGposy === mouseGposy;
                })) {
                    console.log('区块内有怪物');
                    return;
                }
                if (this.towerCtl.towers.some(tow => {
                    const [towGposx, towGposy] = this.coordinateToGridIndex(tow.position);
                    return mouseGposx === towGposx && towGposy === mouseGposy;
                })) {
                    console.log('区块内已有塔');
                    return;
                }
                const tempMonsters = [];
                this.grids.forEach((rowv, rowi) => {
                    rowv.forEach((colv, coli) => {
                        if (!(mouseGposx === rowi && mouseGposy === coli) &&
                            colv === 1 &&
                            !(rowi === this.DestinationGrid.x - 1 && coli === this.DestinationGrid.y - 1)) {
                            const c = new CircleBase(new Position((coli + .5) * this.gridSize, (rowi + .5) * this.gridSize), 5, 1, 'rgba(12,12,12,1)');
                            tempMonsters.push(c);
                        }
                    });
                });
                const fakeGrids = _.cloneDeep(this.grids);
                fakeGrids[mouseGposx][mouseGposy] = 0;
                const tmp = [new Array(this.gridX + 2).fill(0)];
                const gww = tmp.concat(fakeGrids.map(row => [0, ...row, 0]).concat(tmp));
                const bindFx = Game.prototype.makeGraph.bind({ gridsWithWall: gww });
                if (tempMonsters.some(mst => {
                    const fakeGraph = bindFx();
                    const [wg0, wg1] = this.coordinateToGridIndex(mst.position);
                    const path = Astar.astar.search(fakeGraph, fakeGraph.grid[wg0 + 1][wg1 + 1], fakeGraph.grid[this.DestinationGrid.x][this.DestinationGrid.y]);
                    return path.length === 0;
                })) {
                    console.log('此位置会阻断怪物的唯一path');
                    return;
                }
                this.selectedTowerTypeToBuild.rerender(0);
                if (this.money >= this.selectedTowerTypeToBuild.__init_price[0]) {
                    this.placeTower(mousePos, this.selectedTowerTypeToBuild.__ctor_name, this.imageCtl.getImage(this.selectedTowerTypeToBuild.__inner_img_u), this.imageCtl.getImage(this.selectedTowerTypeToBuild.__inner_b_img_u), -this.selectedTowerTypeToBuild.__init_price[0]);
                }
                else {
                    console.log('金币不足');
                }
                this.selectedTowerTypeToBuild = null;
                return;
            }
            if (mousePos.x > this.midSplitLineX) {
                const selectedT = this.towerForSelect.find(tfs => tfs.position.equal(mousePos, tfs.radius));
                if (selectedT) {
                    this.selectedTowerTypeToBuild = selectedT;
                    Game.callHideStatusBlock();
                    this.selectedTowerTypeToBuild.rerender(2);
                }
            }
            else {
                const selectedT = this.towerCtl.towers.find(t => t.position.equal(mousePos, t.radius));
                if (selectedT) {
                    this.emitMoney(-1 * selectedT.levelUp(this.money));
                    this.ctxMouse.clearRect(0, 0, innerWidth, innerHeight);
                    selectedT.renderRange(this.ctxMouse);
                    selectedT.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, true, this.detailFunctionKeyDown);
                }
            }
        };
        this.rightClickHandler = (() => {
            let lastRightClick = -1000;
            return (mousePos) => {
                if (performance.now() - lastRightClick < 300) {
                    if (!this.selectedTowerTypeToBuild) {
                        const selectedT = this.towerCtl.towers.find(t => t.position.equal(mousePos, t.radius * 0.75));
                        if (selectedT) {
                            this.removeTower(selectedT);
                        }
                    }
                }
                else {
                    if (this.selectedTowerTypeToBuild) {
                        this.selectedTowerTypeToBuild.rerender(0);
                        this.selectedTowerTypeToBuild = null;
                    }
                }
                lastRightClick = performance.now();
            };
        })();
        this.mouseMoveHandler = _.throttle((e) => {
            this.ctxMouse.clearRect(0, 0, innerWidth, innerHeight);
            const mousePos = new Position(e.offsetX, e.offsetY);
            this.lastMouseMovePosition = mousePos;
            if (this.selectedTowerTypeToBuild) {
                TowerBase.prototype.renderRange.call({ position: mousePos, Rng: this.selectedTowerTypeToBuild.__rng_lv0 }, this.ctxMouse);
                return;
            }
            if (e.offsetX > this.midSplitLineX) {
                const selectedT = this.towerForSelect.find(tfs => tfs.position.equal(mousePos, tfs.radius));
                if (selectedT) {
                    let virtualTow = new (eval(selectedT.__ctor_name));
                    const descriptionChuned = _.cloneDeep(virtualTow.descriptionChuned);
                    virtualTow.destory();
                    virtualTow = null;
                    TowerBase.prototype.renderStatusBoard.call({
                        position: mousePos,
                        informationSeq: [[selectedT.__dn, '']],
                        descriptionChuned,
                        exploitsSeq: [['建造快捷键', `[${selectedT.__od}]`]],
                        radius: selectedT.radius
                    }, 0, this.midSplitLineX, 0, innerHeight, false, false);
                }
                else {
                    Game.callHideStatusBlock();
                }
            }
            else {
                this.towerCtl.independentTowers.forEach((t, _idx) => {
                    t.destinationPosition = mousePos;
                });
                const selectedT = this.towerCtl.towers.find(t => t.position.equal(mousePos, t.radius)) || this.towerCtl.independentTowers.find(t => t.position.equal(mousePos, t.radius));
                const selectedM = this.monsterCtl.monsters.find(m => m.position.equal(mousePos, m.radius));
                if (selectedT) {
                    this.statusBoardOnTower = selectedT;
                    selectedT.renderRange(this.ctxMouse);
                    selectedT.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, true, this.detailFunctionKeyDown);
                }
                else if (selectedM) {
                    selectedM.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, false, false);
                }
                else {
                    Game.callHideStatusBlock();
                    this.statusBoardOnTower = null;
                }
            }
        }, 34);
        this.keyDownHandler = (e) => {
            if (Tools.isNumberSafe(e.key)) {
                this.selectedTowerTypeToBuild = this.towerForSelect[+e.key - 1];
                this.leftClickHandler(this.lastMouseMovePosition);
                this.selectedTowerTypeToBuild = null;
                return;
            }
            console.log('keyDownHandler: ' + e.key);
            switch (e.key) {
                case 'c':
                    this.leftClickHandler(this.lastMouseMovePosition);
                    break;
                case ' ':
                    this.startAndPauseButton.onMouseclick();
                    break;
                case 'q':
                    CarrierTower.WeaponMode = CarrierTower.WeaponMode === 1 ? 2 : 1;
                    break;
                case 'F1':
                    CarrierTower.F1Mode = !CarrierTower.F1Mode;
                    e.preventDefault();
                    break;
                case 'Control':
                    this.detailFunctionKeyDown = !this.detailFunctionKeyDown;
                    if (this.statusBoardOnTower) {
                        this.statusBoardOnTower.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, true, this.detailFunctionKeyDown);
                    }
                    break;
                default:
                    break;
            }
        };
        this.keyUpHandler = (e) => {
            switch (e.key) {
                case 'Control':
                    this.detailFunctionKeyDown = false;
                    if (this.statusBoardOnTower) {
                        this.statusBoardOnTower.renderStatusBoard(0, this.midSplitLineX, 0, innerHeight, true, this.detailFunctionKeyDown);
                    }
                    break;
                default:
                    break;
            }
        };
        window.g = this;
        window.__debug_show_refresh_rect = false;
        this.__testMode = localStorage.getItem('debug_mode') === '1';
        this.count = this.__testMode ? 50 : 0;
        this.stepDivide = this.__testMode ? 2 : 8;
        this.gridX = GX;
        this.gridY = GY;
        this.__inner_b_arr = [new Array(this.gridX + 2).fill(0)];
        this.OriginGrid = {
            x: 0,
            y: GY / 2 - 1
        };
        this.DestinationGrid = {
            x: GY / 2 + 1,
            y: GX
        };
        this.money = this.__testMode ? 1e15 : 5e2;
        this.life = this.__testMode ? 8e4 : 20;
        this.imageCtl = imageManager;
        this.contextCtl = new CanvasManager();
        this.evtCtl = new EventManager();
        this.towerCtl = new TowerManager();
        this.monsterCtl = new MonsterManager();
        this.bulletsCtl = new BulletManager();
        this.updateGemPoint = this.__testMode ? 1e14 : 0;
        this.loopSpeeds = this.__testMode ? [2, 3, 5, 10, 1] : [2, 3, 1];
        this.useClassicRenderStyle = 'OffscreenCanvas' in window ? false : true;
        Object.defineProperty(Game, 'updateGemPoint', {
            get: () => this.updateGemPoint,
            set: v => {
                this.updateGemPoint = v;
            },
            enumerable: true
        });
        Game.callTowerFactory = () => this.towerCtl.Factory.bind(this.towerCtl);
        Game.callTowerList = () => [...this.towerCtl.towers];
        Game.callIndependentTowerList = () => [...this.towerCtl.independentTowers];
        Game.callMonsterList = () => [...this.monsterCtl.monsters];
        Game.callChangeF1Mode = v => {
            this.towerCtl.independentTowers.forEach(t => {
                t.actMode = v ? CarrierTower.Jet.JetActMode.f1 : CarrierTower.Jet.JetActMode.autonomous;
            });
        };
        Game.callChangeCarrierWeaponMode = v => {
            this.towerCtl.independentTowers.forEach(t => {
                t.weaponMode = v;
            });
        };
        Game.callCanvasContext = name => this.contextCtl.getContext(name);
        Game.callImageBitMap = name => this.imageCtl.getImage(name);
        Game.callMidSplitLineX = () => this.midSplitLineX;
        Game.callMoney = () => [this.money, this.emitMoney.bind(this)];
        Game.callRemoveTower = t => this.removeTower(t);
    }
    static IOC(itm, ctor, _ctx, _txt_Fx, centerX, centerY, R, price) {
        itm.render(_ctx);
        itm.__rerender_text = price => {
            const color = price ? price >= ctor.p[0] ? '#111111' : '#F56C6C' : '#111111';
            _txt_Fx(`$ ${ctor.p[0]}`, centerX - R * 0.55 - 2, centerY + R, R * 2, color, 10);
        };
        itm.__rerender_text(price);
        itm.__dn = ctor.dn;
        itm.__od = ctor.od;
        itm.__inner_img_u = ctor.n;
        itm.__inner_b_img_u = ctor.bn;
        itm.__init_price = ctor.p;
        itm.__ctor_name = ctor.c;
        itm.__rng_lv0 = ctor.r(0);
        itm.__tlx = centerX - R - 3;
        itm.__tly = centerY - R - 3;
        itm.rerender = width => {
            itm.borderWidth = width;
            _ctx.clearRect(itm.__tlx, itm.__tly, (R + 2) * 2, (R + 2) * 2);
            itm.render(_ctx);
        };
    }
    set isPausing(v) {
        this.startAndPauseButton.ele.textContent = v ? '开始' : '暂停';
        this.__inner_is_pausing = v;
    }
    get isPausing() {
        return this.__inner_is_pausing;
    }
    get gridsWithWall() {
        return this.__inner_b_arr.concat(this.grids.map(row => [0, ...row, 0]).concat(this.__inner_b_arr));
    }
    makeGraph() {
        return new Astar.Graph(this.gridsWithWall);
    }
    coordinateToGridIndex(pos) {
        const rubbed = [Math.round(pos.x), Math.round(pos.y)];
        return [Math.max(Math.floor(rubbed[1] / this.gridSize), 0), Math.max(Math.floor(rubbed[0] / this.gridSize), 0)];
    }
    whichGrid(pos) {
        if (pos.x > this.midSplitLineX)
            return [-1, -1, NaN, NaN];
        else {
            const [ix, iy] = this.coordinateToGridIndex(pos);
            return [
                ix,
                iy,
                (iy + .5) * this.gridSize,
                (ix + .5) * this.gridSize
            ];
        }
    }
    removeOutdatedPath(newbdgx, newbdgy) {
        this.posPathMapping.forEach((v, k) => {
            if (v.some(pos => {
                const [posgx, posgy] = this.coordinateToGridIndex(pos);
                return newbdgx === posgx && newbdgy === posgy;
            })) {
                console.log(`detect Gpos-path-map ${k} has been contaminated.`);
                this.posPathMapping.delete(k);
            }
        });
    }
    getPathToEnd(startPos) {
        const wg = this.whichGrid(startPos);
        const key = `${wg[0]}|${wg[1]}`;
        if (this.posPathMapping.has(key)) {
            return this.posPathMapping.get(key);
        }
        else {
            const G = this.makeGraph();
            const path = Astar.astar.search(G, G.grid[wg[0] + 1][wg[1] + 1], G.grid[this.DestinationGrid.x][this.DestinationGrid.y]).map((p, _idx) => {
                const y = (p.x - .5) * this.gridSize;
                const x = (p.y - .5) * this.gridSize;
                return { x, y };
            });
            this.posPathMapping.set(key, path);
            return path;
        }
    }
    placeTower(pos, ctorName, img, bimg, price) {
        const wg = this.whichGrid(pos);
        const tow = this.towerCtl.Factory(ctorName, new Position(wg[2], wg[3]), img, bimg, this.gridSize / 2 - 2);
        this.emitMoney(price);
        this.grids[wg[0]][wg[1]] = 0;
        tow.__grid_ix = wg[0];
        tow.__grid_iy = wg[1];
        if (this.__testMode) {
            while (!tow.isMaxLevel && tow.price[tow.level + 1] <= this.money) {
                this.emitMoney(-1 * tow.levelUp(this.money));
            }
        }
        this.removeOutdatedPath(wg[0], wg[1]);
    }
    removeTower(tower) {
        tower.isSold = true;
        if ('__grid_ix' in tower && '__grid_iy' in tower) {
            this.grids[tower.__grid_ix][tower.__grid_iy] = 1;
            this.removeOutdatedPath(tower.__grid_ix, tower.__grid_iy);
        }
    }
    placeMonster(level, pos, ctorName) {
        const { imgName, sprSpd } = eval(ctorName);
        this.monsterCtl.Factory(ctorName, pos.dithering(this.gridSize / 3), imgName.indexOf('$spr::') !== -1 ? this.imageCtl.getSprite(imgName.substr(6)).getClone(sprSpd || 1) : this.imageCtl.getImage(imgName), level);
    }
    emitMoney(changing, _happenedPosition) {
        this.money += changing;
    }
    emitLife(changing) {
        this.life += changing;
        if (this.life <= 0) {
            this.life = 0;
            this.isPausing = true;
        }
    }
    initButtons() {
        const buttonTopA = this.gridSize * 7 + 'px';
        const buttonTopB = this.gridSize * 9 + 'px';
        const buttonTopC = this.gridSize * 11 + 'px';
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
                this.isPausing = !this.isPausing;
                this.startAndPauseButton.ele.textContent = this.isPausing ? '开始' : '暂停';
            }
        });
        let iterator = this.loopSpeeds[Symbol.iterator]();
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
                let next = iterator.next();
                if (next.done) {
                    iterator = this.loopSpeeds[Symbol.iterator]();
                    next = iterator.next();
                }
                this.updateSpeedRatio = next.value;
                this.speedControlButton.ele.textContent = `${this.updateSpeedRatio} 倍速`;
            }
        });
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
                localStorage.setItem('debug_mode', this.__testMode ? '0' : '1');
                window.location.reload();
            }
        });
        if (this.__testMode) {
            const ipt = Tools.Dom.__installOptionOnNode(document.createElement('input'), {
                type: 'range', min: '1', max: '30', step: '1', value: this.stepDivide, onchange: () => {
                    this.stepDivide = +ipt.value;
                    spn.refresh();
                },
                style: {
                    width: '50px'
                }
            });
            const spn = Tools.Dom.__installOptionOnNode(document.createElement('span'), {
                style: {
                    marginLeft: '10px'
                },
                refresh: () => {
                    spn.textContent = '升级步长 ' + this.stepDivide;
                }
            });
            spn.refresh();
            const spn2 = Tools.Dom.__installOptionOnNode(document.createElement('span'), {
                style: {
                    marginLeft: '30px'
                },
                refresh: () => {
                    spn2.textContent = '步数 ' + Tools.formatterUs.format(this.count);
                }
            });
            spn2.refresh();
            setInterval(() => spn2.refresh(), 50);
            Tools.Dom.generateRow(document.body, null, {
                style: {
                    position: 'fixed',
                    top: buttonTopB,
                    left: this.leftAreaWidth + 30 + 'px',
                    lineHeight: '20px',
                    zIndex: '8'
                }
            }, [
                ipt,
                spn,
                spn2,
                Tools.Dom.__installOptionOnNode(document.createElement('button'), {
                    type: 'button',
                    textContent: '+100',
                    style: {
                        marginLeft: '10px'
                    },
                    onclick: () => {
                        this.count += 100;
                    }
                }),
                Tools.Dom.__installOptionOnNode(document.createElement('button'), {
                    type: 'button',
                    textContent: '+1万',
                    onclick: () => {
                        this.count += 1e4;
                    }
                }),
                Tools.Dom.__installOptionOnNode(document.createElement('button'), {
                    type: 'button',
                    textContent: '+100万',
                    onclick: () => {
                        this.count += 1e6;
                    }
                }),
                Tools.Dom.__installOptionOnNode(document.createElement('button'), {
                    type: 'button',
                    textContent: '+1亿',
                    onclick: () => {
                        this.count += 1e8;
                    }
                })
            ]);
            Tools.Dom.generateRow(document.body, null, {
                style: {
                    position: 'fixed',
                    top: buttonTopC,
                    left: this.leftAreaWidth + 30 + 'px',
                    lineHeight: '20px',
                    zIndex: '8'
                }
            }, [
                Tools.Dom.__installOptionOnNode(document.createElement('span'), {
                    style: {
                        marginRight: '10px'
                    },
                    textContent: '切换显示重绘边框'
                }),
                Tools.Dom.__installOptionOnNode(document.createElement('input'), {
                    type: 'checkbox',
                    value: 'on',
                    onchange: (e) => { window.__debug_show_refresh_rect = e.target.checked; }
                })
            ]);
        }
    }
    init() {
        this.gridSize = Math.floor(innerHeight / this.gridY);
        this.OriginPosition = new Position((this.OriginGrid.x + 0.5) * this.gridSize, (this.OriginGrid.y + 0.5) * this.gridSize);
        this.DestinationPosition = new Position((this.DestinationGrid.y - 0.5) * this.gridSize, (this.DestinationGrid.x - 0.5) * this.gridSize);
        Game.callOriginPosition = () => this.OriginPosition.copy();
        Game.callDestinationPosition = () => this.DestinationPosition.copy();
        Game.callGridSideSize = () => this.gridSize;
        this.leftAreaHeight = this.gridSize * this.gridY;
        this.leftAreaWidth = this.leftAreaHeight * this.gridX / this.gridY;
        Game.callBoundaryPosition = () => new Position(this.leftAreaWidth, this.leftAreaHeight);
        this.midSplitLineX = this.leftAreaWidth + 2;
        this.rightAreaWidth = innerWidth - this.midSplitLineX;
        for (const _i of new Array(this.gridY)) {
            this.grids.push(new Array(this.gridX).fill(1));
        }
        this.contextCtl.createCanvasInstance('off_screen_render', null, null, null, true);
        this.ctxOffScreen = this.contextCtl.getContext('off_screen_render');
        this.contextCtl.createCanvasInstance('main', { zIndex: '2' }, null, null, false, null, 'off_screen_render');
        this.ctxMain = this.contextCtl.getContext('main');
        this.contextCtl.createCanvasInstance('tower', { zIndex: '0' });
        this.ctxTower = this.contextCtl.getContext('tower');
        this.contextCtl.createCanvasInstance('mouse', { zIndex: '4' });
        this.ctxMouse = this.contextCtl.getContext('mouse');
        this.contextCtl.createCanvasInstance('bg', { zIndex: '-3' });
        this.ctxBg = this.contextCtl.getContext('bg');
        this.initButtons();
        this.evtCtl.bindEvent([
            {
                ename: 'onkeydown',
                cb: this.keyDownHandler
            },
        ], document);
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
        });
        this.evtCtl.bindEvent([
            {
                ename: 'onmousedown',
                cb: e => {
                    const mousePos = new Position(e.offsetX, e.offsetY);
                    switch (e.button) {
                        case 0:
                            this.leftClickHandler(mousePos);
                            break;
                        case 2:
                            this.rightClickHandler(mousePos);
                            break;
                        default:
                            break;
                    }
                }
            },
            {
                ename: 'onmousemove',
                cb: this.mouseMoveHandler
            }
        ], reactDivEle);
        this.renderOnce();
        Game.callAnimation = (name, pos, w, h, speed, delay, wait, _cb) => {
            this.imageCtl.onPlaySprites.push(new HostedAnimationSprite(this.imageCtl.getSprite(name).getClone(speed), pos, w, h, delay, false, wait));
        };
        return this;
    }
    renderOnce() {
        this.ctxBg.font = '12px Game';
        this.ctxBg.strokeStyle = 'rgba(45,45,45,.5)';
        this.ctxBg.lineWidth = 1;
        this.ctxBg.strokeRect(1, 1, this.leftAreaWidth, this.leftAreaHeight);
        this.ctxBg.strokeStyle = 'rgba(188,188,188,.1)';
        for (let i = this.gridSize; i < this.gridSize * this.gridY; i += this.gridSize) {
            this.ctxBg.moveTo(1, i);
            this.ctxBg.lineTo(this.leftAreaWidth, i);
        }
        for (let i = this.gridSize; i < this.gridSize * this.gridX; i += this.gridSize) {
            this.ctxBg.moveTo(i, 1);
            this.ctxBg.lineTo(i, this.leftAreaHeight);
        }
        this.ctxBg.stroke();
        this.ctxBg.fillStyle = 'rgba(141,241,123,.6)';
        this.ctxBg.fillRect(0, (this.gridY / 2 - 1) * this.gridSize, this.gridSize, this.gridSize);
        this.ctxBg.fillStyle = 'rgba(241,141,123,.8)';
        this.ctxBg.fillRect((this.gridX - 1) * this.gridSize, (this.gridY / 2) * this.gridSize, this.gridSize, this.gridSize);
        if (this.__testMode) {
            this.contextCtl.refreshText('[ Test Mode ]', null, new Position(10, 15), new Position(8, 15), 120, 26, 'rgba(230,204,55,1)', true, '10px SourceCodePro');
        }
        this.contextCtl.refreshText('鼠标点击选取建造，连点两次鼠标右键出售已建造的塔', null, new Position(this.leftAreaWidth + 30, 30), new Position(this.leftAreaWidth + 28, 10), this.rightAreaWidth, 26, 'rgba(24,24,24,1)', true, '14px Game');
        this.contextCtl.refreshText('出现详情时按[Ctrl]切换详细信息和说明', null, new Position(this.leftAreaWidth + 30, 70), new Position(this.leftAreaWidth + 28, 50), this.rightAreaWidth, 26, 'rgba(24,24,24,1)', true, '14px Game');
        const tsAeraRectTL = new Position(this.leftAreaWidth + 30, 90);
        const tsMargin = this.gridSize / 2 - 2;
        const tsItemRadius = this.gridSize / 2 + 5;
        const oneTsWidth = tsMargin + 2 * tsItemRadius;
        const chunkSize = Math.floor((this.rightAreaWidth - tsItemRadius - 30) / oneTsWidth);
        const chunkedTowerCtors = _.chunk(TowerManager.towerCtors, chunkSize);
        const tsMarginBottom = this.gridSize / 2 + 6;
        chunkedTowerCtors.forEach((ctorRow, rowIdx) => {
            rowIdx > 0 ? tsAeraRectTL.move(new PolarVector(tsMarginBottom + tsItemRadius * 2, 270)) : void (0);
            ctorRow.forEach((_t, idx) => {
                const ax = tsAeraRectTL.x + oneTsWidth * idx + tsItemRadius;
                const ay = tsAeraRectTL.y + tsItemRadius;
                if (!_t.n.includes('$spr::')) {
                    const temp = new ItemBase(new Position(ax, ay), tsItemRadius, 0, 'rgba(255,67,56,1)', this.imageCtl.getImage(_t.n));
                    Game.IOC(temp, _t, this.ctxBg, this.renderStandardText.bind(this), ax, ay, tsItemRadius, this.money);
                    this.towerForSelect.push(temp);
                    this.towerForSelect.sort(Tools.compareProperties('__od'));
                }
                else {
                    const spr_d = this.imageCtl.getSprite(_t.n.substr(6)).getClone(6);
                    const temp = new ItemBase(new Position(ax, ay), tsItemRadius, 0, 'rgba(255,67,56,1)', spr_d);
                    Game.IOC(temp, _t, this.ctxBg, this.renderStandardText.bind(this), ax, ay, tsItemRadius, this.money);
                    this.towerForSelect.push(temp);
                    this.towerForSelect.sort(Tools.compareProperties('__od'));
                }
            });
        });
        const ax0 = innerWidth - 236;
        const ay0 = innerHeight - 10;
        this.contextCtl.refreshText('金币', null, new Position(ax0, ay0), new Position(ax0 - 4, ay0 - 20), 160, 26, 'rgba(54,54,54,1)', true, '14px Game');
        this.imageCtl.getSprite('gold_spin').getClone(2).renderLoop(this.ctxBg, new Position(innerWidth - 190, innerHeight - 25), 18, 18);
        const ax = innerWidth - 293;
        const ay = innerHeight - 70;
        this.contextCtl.refreshText(GemBase.gemName + '点数', null, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgba(54,54,54,1)', true, '14px Game');
        this.imageCtl.getSprite('sparkle').getClone(10).renderLoop(this.ctxBg, new Position(innerWidth - 190, innerHeight - 85), 18, 18);
        const ax2 = innerWidth - 250;
        const ay2 = innerHeight - 40;
        this.contextCtl.refreshText('生命值', null, new Position(ax2, ay2), new Position(ax2 - 4, ay2 - 20), 160, 26, 'rgba(54,54,54,1)', true, '14px Game');
        this.ctxBg.drawImage(this.imageCtl.getImage('heart_px'), innerWidth - 190, innerHeight - 54, 18, 18);
    }
    run() {
        let flag = false;
        for (let i = 0; i < this.updateSpeedRatio; i++) {
            flag = flag || this.update();
        }
        this.render(flag);
        if (this.__testMode) {
            requestAnimationFrame(() => {
                const runStart = performance.now();
                this.run();
                const ft = performance.now() - runStart;
                this.renderStandardText(`[ Ft ${Tools.roundWithFixed(ft, 3)} ms ]`, 6, 80, 120);
                const actualLength = Tools.typedArrayPush(this.frameTimes, ft);
                if (actualLength === this.frameTimes.length) {
                    this.renderStandardText(`[ Ft avg ${Tools.roundWithFixed(this.frameTimes.reduce((c, p) => c + p, 0) / actualLength, 3)} ms ]`, 6, 100, 120);
                }
                else {
                    this.renderStandardText(`[ Ft avg - ms ]`, 6, 100, 120);
                }
                Tools.renderStatistic(this.ctxBg, this.frameTimes, new Position(6, 130), this.frameTimes.length, 52);
            });
        }
        else {
            requestAnimationFrame(() => {
                this.run();
            });
        }
    }
    update() {
        this.updateTick++;
        if (!this.isPausing && !window.__d_stop_ms) {
            if (this.updateTick % (this.__testMode ? 10 : 100) === 0) {
                this.placeMonster(Math.floor(++this.count / this.stepDivide), this.OriginPosition.copy(), _.shuffle(['Swordman', 'Axeman', 'LionMan'])[0]);
            }
            if (this.updateTick % (this.__testMode ? 501 : 1201) === 0) {
                this.placeMonster(Math.floor(++this.count / this.stepDivide + (this.__testMode ? 100 : 0)), this.OriginPosition.copy(), _.shuffle(['Devil', 'HighPriest'])[0]);
            }
        }
        if (!this.isPausing) {
            this.towerCtl.run(this.monsterCtl.monsters);
            this.bulletsCtl.run(this.monsterCtl.monsters);
            this.monsterCtl.run(this.getPathToEnd.bind(this), this.emitLife.bind(this), this.towerCtl.towers, this.monsterCtl.monsters);
        }
        this.bulletsCtl.scanSwipe();
        this.monsterCtl.scanSwipe(this.emitMoney.bind(this));
        return this.towerCtl.scanSwipe(this.emitMoney.bind(this));
    }
    render(towerNeedRender = true) {
        if (this.renderTick === 0) {
            this.renderInformation();
            this.renderMoney();
            this.renderGemPoint();
            this.renderLife();
        }
        this.renderTick++;
        if (this.__testMode) {
            this.renderStandardText(`[ R Tick ${this.renderTick} ]`, 6, 20, 120);
            this.renderStandardText(`[ U Tick ${this.updateTick} ]`, 6, 40, 120);
        }
        if (this.renderTick % 3 === 0) {
            this.renderInformation();
            this.renderMoney();
        }
        else if (this.renderTick % 5 === 0) {
            this.renderGemPoint();
        }
        else if (this.renderTick % 61 === 0) {
            this.renderLife();
            this.towerForSelect.forEach(itm => itm.__rerender_text(this.money));
        }
        const offScreenCtx = this.ctxOffScreen;
        if (this.useClassicRenderStyle) {
            offScreenCtx.clearRect(0, 0, offScreenCtx.dom.width, offScreenCtx.dom.height);
        }
        this.monsterCtl.render(offScreenCtx, this.imageCtl);
        this.bulletsCtl.render(offScreenCtx);
        this.imageCtl.play(offScreenCtx);
        this.towerCtl.rapidRender(offScreenCtx, this.monsterCtl.monsters);
        if (towerNeedRender) {
            this.ctxTower.clearRect(0, 0, innerWidth, innerHeight);
            this.towerCtl.render(this.ctxTower);
        }
        this.ctxMain._off_screen_paint();
        if (this.__testMode) {
            const now = performance.now();
            const actualLength = Tools.typedArrayPush(this.renderTimeStamps, now);
            if (actualLength < 20) {
                this.averageFrameInterval = (now - this.renderTimeStamps[0]) / actualLength;
            }
            else {
                this.averageFrameInterval = (now - this.renderTimeStamps[actualLength - 20]) / 20;
            }
            this.renderStandardText(`[ Fps ${(1000 / this.averageFrameInterval).toFixed(1)} ]`, 6, 60, 120, this.averageFrameInterval > 20 ? '#F56C6C' : 'rgb(2,2,2)');
        }
    }
    renderMoney() {
        const ax = innerWidth - 160;
        const ay = innerHeight - 10;
        this.contextCtl.refreshText(Tools.formatterUs.format(this.money), null, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgb(24,24,24)', true, '14px Game');
    }
    renderLife() {
        const ax = innerWidth - 160;
        const ay = innerHeight - 40;
        this.contextCtl.refreshText(this.life + '', null, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgb(24,24,24)', true, '14px Game');
    }
    renderGemPoint() {
        const ax = innerWidth - 160;
        const ay = innerHeight - 70;
        this.contextCtl.refreshText(Tools.formatterUs.format(this.updateGemPoint), null, new Position(ax, ay), new Position(ax - 4, ay - 20), 160, 26, 'rgb(24,24,24)', true, '14px Game');
    }
    renderInformation() {
        const ax = innerWidth - 220;
        const ay1 = innerHeight - 100;
        const ay2 = ay1 - 30;
        const ay3 = ay2 - 30;
        this.contextCtl.refreshText(`总伤害    ${Tools.chineseFormatter(this.towerCtl.totalDamage, 2, ' ')}`, null, new Position(ax, ay2), new Position(ax - 4, ay2 - 20), 190, 26, 'rgb(24,24,24)', true, '14px Game');
        this.contextCtl.refreshText(`总击杀    ${Tools.chineseFormatter(this.towerCtl.totalKill, 2, ' ')}`, null, new Position(ax, ay3), new Position(ax - 4, ay3 - 20), 190, 26, 'rgb(24,24,24)', true, '14px Game');
    }
    renderStandardText(text, bx, by, maxWidth, color, fsize) {
        color = color || 'rgb(2,2,2)';
        fsize = fsize || 10;
        this.contextCtl.refreshText(text, null, new Position(bx + 4, by + fsize + 5), new Position(bx, by), maxWidth, 12 + fsize, color, true, `${fsize}px SourceCodePro`);
    }
}
Game.callAnimation = null;
Game.callImageBitMap = null;
Game.callCanvasContext = null;
Game.callBoundaryPosition = null;
Game.callGridSideSize = null;
Game.callMidSplitLineX = null;
Game.callElement = (id) => {
    const key = 'by_id_' + id;
    if (Tools.Dom._cache.has(key)) {
        return Tools.Dom._cache.get(key);
    }
    else {
        const targetEl = document.getElementById(id);
        Tools.Dom._cache.set(key, targetEl);
        return targetEl;
    }
};
Game.callHideStatusBlock = () => {
    document.getElementById('status_block').style.display = 'none';
    document.getElementById('gem_block').style.display = 'none';
};
Game.callMoney = null;
Game.callRemoveTower = null;
Game.callTowerFactory = null;
Game.callTowerList = null;
Game.callIndependentTowerList = null;
Game.callMonsterList = null;
Game.callOriginPosition = null;
Game.callDestinationPosition = null;
Game.callChangeF1Mode = null;
Game.callChangeCarrierWeaponMode = null;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const text = document.getElementById('loading_text');
        const mask = document.getElementById('loading_mask');
        try {
            console.time('load font');
            text.textContent = '加载字体中';
            const resp = yield fetch('game_font_1.ttf');
            const fontBuffer = yield resp.arrayBuffer();
            const font = new FontFace('Game', fontBuffer);
            const resultFont = yield font.load();
            document.fonts.add(resultFont);
            console.timeEnd('load font');
        }
        catch (error) {
            console.error(error);
        }
        try {
            console.time('load images');
            const imageCtrl = new ImageManger();
            text.textContent = '加载贴图';
            yield imageCtrl.loadImages();
            text.textContent = '加载动画';
            yield imageCtrl.loadSpriteSheets();
            console.timeEnd('load images');
            document.body.removeChild(mask);
            const g = new Game(imageCtrl, 6 * 6, 4 * 6);
            g.init().run();
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    g.isPausing = true;
                }
            }, false);
        }
        catch (error) {
            console.error(error);
        }
    });
}

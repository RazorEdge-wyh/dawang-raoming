/**
 * 道歉语库测试：语料质量 + 随机取 + 输出格式。
 */

const test = require('node:test');
const assert = require('node:assert');

const { PHRASES, randomPhrase, line } = require('../src/phrases');

test('语料库不少于 5 条，且每条都有主台词与铺陈', () => {
  assert.ok(PHRASES.length >= 5, '语料太少，玩不出花');
  for (const p of PHRASES) {
    assert.ok(p.phrase.length > 0, '缺主台词');
    assert.ok(p.follow.length > 0, '缺铺陈');
  }
});

test('randomPhrase 返回语料库成员，且固定种子可复现', () => {
  const a = randomPhrase(0);
  const b = randomPhrase(0);
  assert.strictEqual(a, b);
  assert.ok(PHRASES.includes(a));
});

test('line() 输出含 skill 名签名', () => {
  const out = line(0);
  assert.match(out, /skill：大王饶命/);
  assert.match(out, /🤲/);
});

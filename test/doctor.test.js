/**
 * 记忆体检测试：空目录 / 屡教不改 / 健康记忆三档。
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { runDoctor } = require('../src/doctor');
const { appendEntry } = require('../src/memory');

function tmpDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `dawang-raoming-${name}-`));
}

test('空目录：没记忆文件，分数低且提示 init', () => {
  const dir = tmpDir('empty');
  try {
    const report = runDoctor(dir);
    assert.strictEqual(report.max, 100);
    assert.ok(report.total < 50, '空目录不应高分');
    assert.strictEqual(report.checks[0].score, 0);
    assert.ok(report.problems.some((p) => p.msg.includes('dawang-raoming init')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('同一错因两次：判「屡教不改」，重复项扣分', () => {
  const dir = tmpDir('repeat');
  try {
    appendEntry(dir, { title: '漏看需求第 2 条', triggerInput: 'a', mistake: 'x', fix: '逐条过', remedy: '已改' });
    appendEntry(dir, { title: '漏看需求第 2 条', triggerInput: 'b', mistake: 'x', fix: '逐条过', remedy: '已改' });
    const report = runDoctor(dir);
    assert.ok(report.problems.some((p) => p.key === 'repeat' && p.msg.includes('屡教不改')));
    const repeatCheck = report.checks.find((c) => c.title.includes('屡教不改'));
    assert.strictEqual(repeatCheck.score, 15); // 30 - 15 惩罚
    assert.strictEqual(report.stats.repeats, 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('健康记忆：不同错因 + 字段齐全 → 满分', () => {
  const dir = tmpDir('good');
  try {
    appendEntry(dir, { title: '漏看需求第 2 条', triggerInput: 'a', mistake: 'x', fix: '逐条过', remedy: '已改' });
    appendEntry(dir, { title: '没验证就报完成', triggerInput: 'b', mistake: 'y', fix: '先跑测试', remedy: '已补' });
    const report = runDoctor(dir);
    assert.strictEqual(report.total, 100);
    assert.strictEqual(report.level, 'excellent');
    assert.deepStrictEqual(report.problems, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

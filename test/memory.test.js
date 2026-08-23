/**
 * 记忆模块测试：文件定位、追加、解析、重复错因统计。
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { memoryPath, TEMPLATE, today, appendEntry, parseEntries, analyze } = require('../src/memory');

const ENTRY_A = { title: '漏看需求第 2 条', triggerInput: '你怎么又搞错了？？？', mistake: '只做了分页', fix: '先逐条过需求', remedy: '已重写' };
const ENTRY_B = { title: '漏看需求第 2 条', triggerInput: '又漏了！', mistake: '还是只做了分页', fix: '逐条抄需求编号', remedy: '已补排序' };
const ENTRY_C = { title: '没验证就报完成', triggerInput: '这个 bug 修好了？', mistake: '没跑测试', fix: '先跑测试再回复', remedy: '已补测试' };

function tmpDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `dawang-raoming-${name}-`));
}

test('memoryPath 定位到 .claude/memory/dawang-raoming.md', () => {
  assert.ok(memoryPath('/p').endsWith(path.join('.claude', 'memory', 'dawang-raoming.md')));
});

test('today() 输出 YYYY-MM-DD', () => {
  assert.match(today(), /^\d{4}-\d{2}-\d{2}$/);
});

test('TEMPLATE 不带示例记录（避免 doctor 误报），但含格式说明', () => {
  const entries = parseEntries(TEMPLATE);
  assert.strictEqual(entries.length, 0);
  assert.ok(TEMPLATE.includes('记录格式'), '模板应给出记录格式供 AI 参照');
});

test('appendEntry 写入并可 round-trip 解析', () => {
  const dir = tmpDir('append');
  try {
    const file = appendEntry(dir, ENTRY_A);
    assert.ok(fs.existsSync(file));
    const entries = parseEntries(fs.readFileSync(file, 'utf8'));
    assert.strictEqual(entries.length, 1);
    assert.strictEqual(entries[0].reason, '漏看需求第 2 条');
    assert.strictEqual(entries[0].fields['下次怎么改'], '先逐条过需求');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('analyze 统计「屡教不改」与缺字段条目', () => {
  const dir = tmpDir('analyze');
  try {
    appendEntry(dir, ENTRY_A);
    appendEntry(dir, ENTRY_B); // 同错因，第 2 次
    appendEntry(dir, ENTRY_C);

    const info = analyze(dir);
    assert.strictEqual(info.total, 3);
    assert.strictEqual(info.repeats.length, 1);
    assert.strictEqual(info.repeats[0].reason, '漏看需求第 2 条');
    assert.strictEqual(info.repeats[0].count, 2);
    assert.deepStrictEqual(info.incomplete, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('analyze 对缺「下次怎么改」的条目判为不完整', () => {
  const dir = tmpDir('incomplete');
  try {
    // 手写一条缺字段的记录
    const file = memoryPath(dir);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `## 2026-08-24 · 错因：缺字段\n- 触发输入：x\n- 我错在哪：y\n`, 'utf8');

    const info = analyze(dir);
    assert.strictEqual(info.incomplete.length, 1);
    assert.strictEqual(info.incomplete[0].reason, '缺字段');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

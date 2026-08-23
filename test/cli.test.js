/**
 * CLI 参数解析测试（输出打印不在此覆盖）。
 */

const test = require('node:test');
const assert = require('node:assert');

const { parseArgs } = require('../src/cli');

test('parseArgs 识别 init --yes', () => {
  const opts = parseArgs(['init', '--yes']);
  assert.deepStrictEqual(opts._, ['init']);
  assert.ok(opts.flags.has('yes'));
});

test('parseArgs 识别 --dir 值', () => {
  const opts = parseArgs(['doctor', '--dir', './my-app']);
  assert.strictEqual(opts.dir, './my-app');
});

test('parseArgs 识别 help / version', () => {
  assert.ok(parseArgs(['--help']).flags.has('help'));
  assert.ok(parseArgs(['-V']).flags.has('version'));
  assert.ok(parseArgs(['help']).flags.has('help'));
});

test('parseArgs 忽略未知 flag，不误当命令', () => {
  const opts = parseArgs(['init', '--foo', 'bar']);
  assert.deepStrictEqual(opts._, ['init', 'bar']);
});

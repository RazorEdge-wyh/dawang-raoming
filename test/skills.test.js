/**
 * skills 模块测试：skill 清单与安装逻辑。
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { listSkills, installSkills } = require('../src/skills');

test('listSkills 返回 dawang-raoming 且带描述', () => {
  const skills = listSkills();
  assert.strictEqual(skills.length, 1);
  assert.strictEqual(skills[0].name, 'dawang-raoming');
  assert.ok(skills[0].description.length > 10, 'description 应足够长以便触发');
  const file = path.join(__dirname, '..', 'skills', 'dawang-raoming', 'SKILL.md');
  assert.ok(fs.existsSync(file), '缺 SKILL.md');
});

test('installSkills 拷贝到临时项目且幂等', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dawang-raoming-test-'));
  try {
    const first = installSkills(tmp);
    assert.strictEqual(first.installed.length, 1);
    assert.deepStrictEqual(first.errors, []);

    const second = installSkills(tmp);
    assert.strictEqual(second.skipped.length, 1);
    assert.strictEqual(second.installed.length, 0);

    const target = path.join(tmp, '.claude', 'skills', 'dawang-raoming', 'SKILL.md');
    assert.ok(fs.existsSync(target));
    assert.match(fs.readFileSync(target, 'utf8'), /^---\n/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('installSkills 指定未知 skill 时报错', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dawang-raoming-test-'));
  try {
    const result = installSkills(tmp, ['not-exist']);
    assert.strictEqual(result.errors.length, 1);
    assert.match(result.errors[0], /未知 skill/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

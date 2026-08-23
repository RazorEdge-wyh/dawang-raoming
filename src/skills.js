/**
 * 技能清单与安装逻辑（复刻 zh-skills 的模式，本项目只有 dawang-raoming 一个技能）。
 *
 * skills/ 目录是产品本体（零依赖的 Markdown），这里只负责：
 * - 列出可用技能
 * - 把技能拷贝到目标项目的 .claude/skills/ 下
 */

const fs = require('node:fs');
const path = require('node:path');

// 包内技能目录（bin/dawang-raoming.js 的上两级是包根）
const SKILLS_ROOT = path.resolve(__dirname, '..', 'skills');

/** 技能说明（与 skills 目录下各 SKILL.md 的 frontmatter 保持一致） */
const SKILL_META = [
  {
    name: 'dawang-raoming',
    icon: '🤲',
    desc: '用户明显生气时：古装剧口吻搞怪道歉 + 附技能名 + 回溯错因 + 写入永久记忆',
    trigger: '用户生气 / 发火 / 抱怨「又错了」时',
  },
];

/** 解析 SKILL.md 的 frontmatter，拿 name 和 description */
function readFrontmatter(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) return { name: path.basename(path.dirname(file)), description: '' };
    const meta = {};
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([a-z-]+):\s*(.*)$/);
      if (kv) meta[kv[1]] = kv[2];
    }
    return meta;
  } catch {
    return { name: path.basename(path.dirname(file)), description: '' };
  }
}

/** 列出所有可用技能（含解析后的描述） */
function listSkills() {
  return fs.readdirSync(SKILLS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const meta = readFrontmatter(path.join(SKILLS_ROOT, d.name, 'SKILL.md'));
      return { name: d.name, description: meta.description || '' };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 安装技能到目标项目。
 * @param {string} targetDir 目标项目根目录
 * @param {string[]} names 要安装的技能名（空 = 全部）
 * @returns {{ installed: string[], skipped: string[], errors: string[] }}
 */
function installSkills(targetDir, names = []) {
  const result = { installed: [], skipped: [], errors: [] };
  const skillsDir = path.join(targetDir, '.claude', 'skills');

  const available = listSkills().map((s) => s.name);
  const toInstall = names.length ? names : available;

  for (const name of toInstall) {
    if (!available.includes(name)) {
      result.errors.push(`未知技能：${name}`);
      continue;
    }
    const from = path.join(SKILLS_ROOT, name, 'SKILL.md');
    const to = path.join(skillsDir, name, 'SKILL.md');
    try {
      if (fs.existsSync(to)) {
        result.skipped.push(name);
        continue;
      }
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      result.installed.push(name);
    } catch (e) {
      result.errors.push(`${name}: ${e.message}`);
    }
  }

  return result;
}

module.exports = { SKILL_META, SKILLS_ROOT, listSkills, installSkills };

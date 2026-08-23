/**
 * `dawang-raoming doctor`：对犯错记忆做健康体检。
 *
 * dawang-raoming 的核心承诺是「下次不再犯」，所以体检重点盯三件事：
 *   1. 有没有记忆文件（没记过 = 承诺落空）
 *   2. 每条记录是否完整（缺「下次怎么改」= 记了不改，白记）
 *   3. 有没有「屡教不改」（同一错因 ≥2 次，说明光记没改）
 *
 * 纯启发式、无副作用、可离线运行。报告对象与打印分离，便于测试。
 */

const fs = require('node:fs');
const path = require('node:path');
const { memoryPath, analyze } = require('./memory');

const LEVELS = [
  { min: 90, key: 'excellent', label: '🟢 优秀', note: 'AI 记性好、改得快' },
  { min: 70, key: 'good', label: '🟡 良好', note: '有零星问题，补一补更好' },
  { min: 50, key: 'fair', label: '🟠 一般', note: '记忆基本没沉淀' },
  { min: 0, key: 'danger', label: '🔴 危险', note: '还没开始长记性' },
];

function levelOf(score) {
  return LEVELS.find((l) => score >= l.min) || LEVELS[LEVELS.length - 1];
}

/**
 * 运行体检，返回报告对象（纯数据，便于测试与复用）。
 * @param {string} targetDir 项目根目录
 */
function runDoctor(targetDir) {
  const info = analyze(targetDir);
  const checks = [];
  const problems = [];

  // 1. 有没有记忆文件（20）
  checks.push({ title: '有犯错记忆文件', score: info.hasFile ? 20 : 0, max: 20 });
  if (!info.hasFile) {
    problems.push({ key: 'file', file: path.relative(targetDir, info.file), msg: '还没有记忆文件，先 `dawang-raoming init` 生成模板' });
  }

  // 2. 有没有犯错记录（20）
  checks.push({ title: `有犯错记录（当前 ${info.total} 条）`, score: info.total >= 1 ? 20 : 0, max: 20 });
  if (info.hasFile && info.total === 0) {
    problems.push({ key: 'file', file: path.relative(targetDir, info.file), msg: '记忆文件是空的，说明技能还没被触发过' });
  }

  // 3. 每条记录是否完整（30）：同时有「下次怎么改」和「触发输入」才算完整
  const complete = info.total > 0
    ? Math.round((info.total - info.incomplete.length) / info.total * 30)
    : 0;
  checks.push({ title: `每条都有「下次怎么改」+「触发输入」（${info.total - info.incomplete.length}/${info.total}）`, score: complete, max: 30 });
  for (const e of info.incomplete.slice(0, 3)) {
    problems.push({ key: 'complete', file: path.relative(targetDir, info.file), msg: `${e.date}「${e.reason}」缺字段——记了不改 = 白记` });
  }
  if (info.incomplete.length > 3) {
    problems.push({ key: 'complete', file: '(更多)', msg: `另有 ${info.incomplete.length - 3} 条不完整记录` });
  }

  // 4. 有没有屡教不改（30）：同一错因出现 ≥2 次
  const repeatPenalty = Math.min(info.repeats.length * 15, 30);
  checks.push({ title: `无「屡教不改」重复错因（当前 ${info.repeats.length} 组）`, score: 30 - repeatPenalty, max: 30 });
  for (const r of info.repeats.slice(0, 3)) {
    problems.push({ key: 'repeat', file: path.relative(targetDir, info.file), msg: `错因「${r.reason}」已出现 ${r.count} 次——屡教不改，该升级戒律了` });
  }

  const total = checks.reduce((sum, c) => sum + c.score, 0);
  const level = levelOf(total);

  return {
    targetDir,
    total,
    max: 100,
    level: level.key,
    levelLabel: level.label,
    levelNote: level.note,
    checks,
    problems,
    stats: { total: info.total, repeats: info.repeats.length, incomplete: info.incomplete.length },
  };
}

/** 打印报告（纯展示，无副作用） */
function printReport(report) {
  const render = require('./render');
  console.log(render.title('🤲 大王饶命 · 犯错记忆体检'));
  console.log(`${render.bold(`总分：${report.total}/100`)}  ${render.bold(report.levelLabel)}  ${render.gray(report.levelNote)}`);
  console.log(render.line());

  for (const c of report.checks) {
    const mark = c.score >= c.max ? render.green('✔') : render.yellow('·');
    const detail = c.score < c.max ? render.red(`-${c.max - c.score}`) : '';
    console.log(`  ${mark} ${c.title}${detail}`);
  }

  if (report.problems.length) {
    console.log(render.line());
    console.log(render.bold('⚠ 待修复（按收益排序）'));
    report.problems.slice(0, 12).forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.key}] ${p.file}: ${p.msg}`);
    });
  } else {
    console.log(render.line());
    console.log(render.ok('记忆健康，AI 正在长记性。'));
  }

  console.log(render.line());
  console.log(render.info('记忆位置：' + report.stats.total + ' 条记录 · 修复建议见 `.claude/memory/dawang-raoming.md`。'));
}

module.exports = { runDoctor, printReport, LEVELS };

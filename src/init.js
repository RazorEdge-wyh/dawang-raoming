/**
 * `dawang-raoming init`：把 skill 装进目标项目，并铺好「长记性」的三件套。
 *
 * 1. 安装 skills —— 让 Claude Code 检测到用户生气时激活 dawang-raoming。
 * 2. 生成记忆文件模板 —— 让 AI 有地方记错因。
 * 3. 注入 CLAUDE.md 行为规则 —— 让 AI 每次回复前自查怒气，触发才可靠。
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const render = require('./render');
const { listSkills, installSkills } = require('./skills');
const { TEMPLATE, memoryPath } = require('./memory');

/** 注入 CLAUDE.md 的行为规则（幂等：带标记，重复 init 不叠加） */
const CLAUDE_RULE = `## 大王饶命：AI 生气自检（勿删）

每次回复用户前，先快速判断：**用户本轮输入是否明显生气？**
（负面情绪词、全大写、重复标点、直接骂 AI、同一件事第 3 次纠正、抱怨「又错了/根本没用」）

- 是 → 先激活 \`dawang-raoming\` skill，按它的三段式输出（搞怪道歉 + 回溯错因 + 写入记忆）再回到正题。
- 否 → 正常回复，不要凭空道歉。
`;

/** 没有任何 CLAUDE.md 时生成的最小模板 */
const CLAUDE_MD_TEMPLATE = `# CLAUDE.md

> 本项目使用 dawang-raoming skill。此文件是给 AI 协作伙伴看的"项目说明书"，请按实际项目补充。

## 项目是什么
<!-- 一句话：这个项目解决什么问题，用什么技术栈 -->

## 常用命令
\`\`\`
# 安装依赖
npm install

# 本地开发
npm run dev

# 测试
npm test
\`\`\`

${CLAUDE_RULE}
`;

/**
 * 交互式提问。
 * @returns {Promise<string|null>} 答案或 null（非 TTY / 用户输入为空）
 */
function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) return resolve(null);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim() || defaultValue || null);
    });
  });
}

/** 生成记忆文件模板（已存在则跳过） */
function writeMemoryTemplate(targetDir) {
  const file = memoryPath(targetDir);
  if (fs.existsSync(file)) return { file, skipped: true };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, TEMPLATE, 'utf8');
  return { file, skipped: false };
}

/** 注入 CLAUDE.md 行为规则（幂等：检测标记「## 大王饶命：AI 生气自检」） */
function injectClaudeMd(targetDir, force = false) {
  const file = path.join(targetDir, 'CLAUDE.md');
  const marker = '## 大王饶命：AI 生气自检';
  if (fs.existsSync(file)) {
    const cur = fs.readFileSync(file, 'utf8');
    if (cur.includes(marker)) return { file, skipped: true };
    if (force) return { file, skipped: false }; // 强插由调用方自行处理
    // 直接追加到末尾
    fs.appendFileSync(file, `\n${CLAUDE_RULE}`, 'utf8');
    return { file, skipped: false };
  }
  fs.writeFileSync(file, CLAUDE_MD_TEMPLATE, 'utf8');
  return { file, skipped: false };
}

/**
 * init 主流程。
 * @param {object} opts
 * @param {string} opts.dir 目标项目目录（默认当前目录）
 * @param {boolean} opts.yes 非交互，全部默认执行
 */
async function runInit(opts) {
  const targetDir = path.resolve(opts.dir || process.cwd());

  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    render.err(`目录不存在：${targetDir}`);
    process.exitCode = 1;
    return;
  }

  render.title('大王饶命 · 安装「饶命」skill');

  // 1. 安装 skills
  const result = installSkills(targetDir);
  result.installed.forEach((n) => console.log(render.ok(`${n} 已安装`)));
  result.skipped.forEach((n) => console.log(render.info(`${n} 已存在，跳过`)));
  result.errors.forEach((n) => console.log(render.warn(n)));

  if (!result.installed.length && !result.skipped.length) {
    render.err('没有安装任何 skill，请检查 skills 目录。');
    return;
  }

  console.log(render.line());
  console.log(render.info(`skill 目录：${path.join(targetDir, '.claude', 'skills')}`));
  console.log(render.info('下次打开 Claude Code 会自动加载，检测到用户生气即激活。'));

  // 2. 生成记忆文件模板
  const mem = writeMemoryTemplate(targetDir);
  if (mem.skipped) console.log(render.info('记忆文件已存在，保留原文件'));
  else console.log(render.ok(`已生成记忆模板：${path.relative(targetDir, mem.file)}`));

  // 3. 注入 CLAUDE.md 行为规则
  const wantRule = opts.yes || (await ask('是否在 CLAUDE.md 注入「AI 生气自检」规则（触发更可靠）？[Y/n] ', 'y'));
  if (wantRule === 'y' || wantRule === 'Y' || wantRule === true) {
    const claude = injectClaudeMd(targetDir);
    if (claude.skipped) console.log(render.info('CLAUDE.md 已有 dawang-raoming 规则，跳过'));
    else console.log(render.ok(`已注入行为规则：${path.relative(targetDir, claude.file)}`));
  }

  console.log(render.line());
  console.log(render.ok('安装完成。现在去把 Claude 惹毛一次试试——它会当场滑跪。'));
}

module.exports = { runInit, CLAUDE_RULE, CLAUDE_MD_TEMPLATE, writeMemoryTemplate, injectClaudeMd };

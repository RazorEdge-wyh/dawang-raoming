/**
 * dawang-raoming CLI 入口：参数解析 + 命令分发。
 *
 * 命令：
 *   dawang-raoming init    [--yes] [--dir <path>]  安装 skill + 生成记忆模板 + 注入 CLAUDE.md 行为规则
 *   dawang-raoming try                               随机打一句搞怪道歉（彩蛋 / 验证安装）
 *   dawang-raoming doctor [--dir <path>]             犯错记忆健康体检
 *   dawang-raoming list                               列出可用 skill
 *   dawang-raoming help / --help / -h
 *   dawang-raoming --version / -V
 */

const path = require('node:path');
const render = require('./render');
const { SKILL_META } = require('./skills');
const { runInit } = require('./init');
const { runDoctor, printReport } = require('./doctor');
const { line } = require('./phrases');
const pkg = require('../package.json');

const HELP = `dawang-raoming v${pkg.version} — 让 Claude 犯错后当场滑跪认错、还把教训刻进记忆

用法：
  dawang-raoming init [--yes] [--dir <path>]   安装 skill 到 .claude/skills/，生成记忆模板，注入 CLAUDE.md 行为规则
  dawang-raoming try                           随机打一句古装剧式搞怪道歉（彩蛋 / 验证安装）
  dawang-raoming doctor [--dir <path>]         对犯错记忆做健康体检（屡教不改检测）
  dawang-raoming list                           列出可用 skill
  dawang-raoming help                           显示帮助
  dawang-raoming --version                      显示版本

选项：
  --yes       非交互模式，全部按默认执行
  --dir <path> 指定目标项目目录，默认当前目录

示例：
  dawang-raoming init --yes              # 在当前项目一键安装
  dawang-raoming try                     # 先看看它道歉是什么画风
  dawang-raoming doctor                  # 给当前项目体检记忆
`;

/** 简单参数解析：拆出 --flag 与 --key value */
function parseArgs(argv) {
  const opts = { _: [], flags: new Set(), dir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--yes' || a === '-y') opts.flags.add('yes');
    else if (a === '--dir' || a === '-d') {
      opts.dir = argv[++i];
      if (opts.dir === undefined) {
        render.err('--dir 需要一个目录参数，如 --dir ./my-app');
        process.exit(1);
      }
    } else if (a === '--help' || a === '-h' || a === 'help') opts.flags.add('help');
    else if (a === '--version' || a === '-V' || a === 'version') opts.flags.add('version');
    else if (a.startsWith('-')) {
      /* 未知 flag：忽略，避免被误当成命令 */
    } else opts._.push(a);
  }
  return opts;
}

/** 随机打一句搞怪道歉（验证安装 + 彩蛋） */
function printTry() {
  console.log(line());
  console.log('');
  console.log(render.gray('↑ 这就是它惹毛你时的开场白。安装：' + render.code('dawang-raoming init')));
}

/** 打印 skill 列表 */
function printList() {
  render.title('大王饶命 · 可用 skill');
  for (const s of SKILL_META) {
    console.log(`${s.icon} ${render.bold(s.name)}`);
    console.log(render.gray(`   ${s.desc}`));
    console.log(render.gray(`   触发：${s.trigger}`));
    console.log('');
  }
  console.log(render.info(`共 ${SKILL_META.length} 个 skill。安装：` + render.code('dawang-raoming init')));
}

async function main(argv) {
  const opts = parseArgs(argv);

  if (opts.flags.has('version')) {
    console.log(pkg.version);
    return;
  }
  if (opts.flags.has('help') || opts._.length === 0) {
    console.log(HELP);
    return;
  }

  const cmd = opts._[0];
  switch (cmd) {
    case 'init':
      await runInit({ dir: opts.dir, yes: opts.flags.has('yes') });
      break;
    case 'try':
      printTry();
      break;
    case 'doctor':
      printReport(runDoctor(path.resolve(opts.dir || process.cwd())));
      break;
    case 'list':
      printList();
      break;
    default:
      render.err(`未知命令：${cmd}`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

module.exports = { main, parseArgs };

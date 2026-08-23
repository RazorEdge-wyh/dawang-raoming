# CLAUDE.md

> dawang-raoming 自己的项目说明。这是一个"自举"项目：我们做「AI 犯错记忆」技能，自己的仓库也遵守这些规范。

## 项目是什么

dawang-raoming（饶命）是一个给 Claude Code 的 Skill：当 AI 检测到用户**明显生气**时，
古装剧口吻搞怪道歉（大王饶命 / 臣罪该万死）**并附技能名**，然后**回溯上一轮找错因**，
把错因**写入永久记忆**，下次不再犯。

- `skills/dawang-raoming/SKILL.md` 是产品本体（纯 Markdown，可被 Claude Code 原生加载）。
- `bin/dawang-raoming.js` + `src/` 是安装器与记忆体检工具。

## 常用命令

```bash
npm test                              # 运行测试（Node 内置 test runner，零依赖）
node bin/dawang-raoming.js try               # 随机打一句搞怪道歉（彩蛋 / 验证安装）
node bin/dawang-raoming.js init --yes --dir <项目>   # 把技能装进任意项目
node bin/dawang-raoming.js doctor --dir <项目>       # 对犯错记忆做健康体检
```

## 目录结构

```text
skills/        # 产品本体：dawang-raoming 的 SKILL.md
src/           # CLI 逻辑：cli / init / skills / memory / doctor / render / phrases
bin/           # 可执行入口（薄壳）
test/          # Node test runner 测试
docs/          # 技能详解文档
```

## 工程约定

- 变量/函数英文命名，注释中文，说明"为什么"而非"是什么"。
- commit message 遵循 Conventional Commits，中文描述（详见 skills/commit-zh，若有）。
- **零依赖是硬约束**：只用 Node 标准库，不允许加任何 npm 依赖。
- 测试覆盖 src 下所有模块；改 src 必须跑 `npm test`。
- 修改 CLI 输出格式时，同步更新 README 里的演示文本。

## 需要注意

- `src/memory.js` 的 `parseEntries` 会**先剔除 HTML 注释**——记忆模板里的格式示例是注释块，
  不要把它改成"活记录"，否则 `doctor` 会误报成有记忆。
- `skills/dawang-raoming/SKILL.md` 的 frontmatter `description` 是技能触发的关键，
  改触发词要同步改 `src/skills.js` 的 `SKILL_META` 和 `src/init.js` 的 `CLAUDE_RULE`。
- README 是传播门面（目标千 star），新增命令/功能时务必同步更新 README 的中英文演示。

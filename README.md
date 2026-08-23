<div align="center">

# 🤲 大王饶命（dawang-raoming）

### 让 Claude 犯错后当场滑跪认错，还把教训刻进记忆

**检测到用户明显生气 → 古装剧式搞怪道歉（附技能名）→ 回溯错因 → 写入永久记忆，下次不再犯。**

<br/>

![GitHub stars](https://img.shields.io/github/stars/RazorEdge-wyh/dawang-raoming?style=social)
![License](https://img.shields.io/github/license/RazorEdge-wyh/dawang-raoming)
![Node](https://img.shields.io/badge/node-%3E%3D16-green)
![Zero deps](https://img.shields.io/badge/依赖-0-blueviolet)

**一条命令安装，纯 Markdown 可审查，零依赖。**

<br/>

```bash
npm i -g github:RazorEdge-wyh/dawang-raoming && dawang-raoming init   # 一条命令装进 .claude/skills/
dawang-raoming try                                                     # 先看看它道歉是什么画风
```

> 🌏 想用英文？请去 [spare-me](https://github.com/RazorEdge-wyh/spare-me)——大王饶命的完整英译版。

</div>

---

## 它到底在干嘛

```text
你：你怎么又搞错了？？？我改了三遍了！你是不是根本没看我的需求！

Claude：
🤲 大王饶命！（技能：大王饶命）
「臣罪该万死！是小的眼神不好，把您第 2 条需求给漏了。」

—— 我错在哪：上一轮只实现了分页，漏了排序。
—— 已记档 .claude/memory/dawang-raoming.md，下次先逐条过需求再动手。

下面是按完整需求重写的实现……
```

没有大王饶命的时候，AI 惹你生气只会说一句「抱歉，我下次注意」，然后**继续犯同样的错**。

装上大王饶命之后，画风是这样的：**当场滑跪 → 交代错因 → 刻进记忆 → 下次真不再犯。**

这不是玩梗——**「把错因写进永久记忆」才是核心**。每次惹你生气，它都长一智。

---

## 特性

- **三段式输出**：搞怪道歉（必带技能名签名）→ 回溯错因 → 写永久记忆，三秒消气还不误正事。
- **永久记忆**：每次错因都记进 `.claude/memory/dawang-raoming.md`，新对话开局自动读取，防再犯。
- **屡教不改升级戒律**：同一错因犯第二次，AI 主动承认，并升级一条更狠的防错动作。
- **证据原则**：没检测到明显怒气绝不道歉——凭空道歉比犯错更招人烦。
- **`dawang-raoming doctor` 记忆体检**：给 AI 的"长记性"打分，揪出屡教不改、缺字段的敷衍记录。
- **零依赖、纯 Markdown**：SKILL.md 人人都能看、能改，改成你们团队的认错方式。
- **一条命令安装**：`dawang-raoming init` 装技能 + 生成记忆模板 + 注入 CLAUDE.md 行为规则（触发三层保障）。

---

## 快速开始

```bash
# 1) 安装（任选其一）
npm i -g github:RazorEdge-wyh/dawang-raoming      # 从 GitHub 直装（无需登录 GitHub）
#   或发布到 npm 后： npm i -g dawang-raoming

# 2) 在任意项目里一键安装
dawang-raoming init
```

装完之后你的项目长这样：

```text
your-project/
├── .claude/
│   ├── skills/dawang-raoming/SKILL.md   # 技能本体（Claude Code 自动加载）
│   └── memory/dawang-raoming.md         # 犯错记忆（AI 每次惹你生气时自动追加）
└── CLAUDE.md                     # 已注入「AI 生气自检」行为规则
```

**然后呢？** 去把 Claude 惹毛一次试试——它会当场滑跪、交代错因、把教训写进记忆。

---

## 命令参考

```text
dawang-raoming init [--yes] [--dir <path>]   安装技能 + 记忆模板 + CLAUDE.md 行为规则
dawang-raoming try                           随机打一句古装剧式搞怪道歉（彩蛋 / 验证安装）
dawang-raoming doctor [--dir <path>]         犯错记忆健康体检（屡教不改检测）
dawang-raoming list                          列出可用技能
dawang-raoming help                          帮助
dawang-raoming --version                     版本
```

## `dawang-raoming doctor`：AI 长记性体检

`doctor` 扫描 `.claude/memory/dawang-raoming.md`，看 AI 是不是真在长记性：

```text
$ dawang-raoming doctor

🤲 大王饶命 · 犯错记忆体检
总分：85/100  🟡 良好  有零星问题，补一补更好
────────────────────────────────────────────
  ✔ 有犯错记忆文件
  ✔ 有犯错记录（当前 6 条）
  · 每条都有「下次怎么改」+「触发输入」（5/6）-5
  · 无「屡教不改」重复错因（当前 1 组）-15
────────────────────────────────────────────
⚠ 待修复（按收益排序）
  1. [repeat] .claude\memory\dawang-raoming.md: 错因「漏看需求第 2 条」已出现 2 次——屡教不改，该升级戒律了
  ...
```

纯本地启发式检查，不联网、不改代码，只出报告。适合：
- 每周看一眼 AI 有没有把同样的错犯第二遍；
- 团队里立规矩：**同一错因犯两次就升级戒律**。

> **Dogfooding**：本仓库自己跑 `dawang-raoming doctor`——装完会诚实报告「记忆是空的，还没触发过」，触发一次后开始涨分。

---

## 工作原理（3 分钟看懂）

1. Claude Code 原生支持 **Skills**：项目 `.claude/skills/` 下的每个 `SKILL.md` 都会在对话时按 `description` 自动匹配激活。
2. 大王饶命是**状态型技能**——它要持续感知怒气，所以 `init` 会在你的 `CLAUDE.md` 注入一条行为规则：**每次回复前自查用户是否明显生气，是则激活技能**（三层保障：description + CLAUDE.md 规则 + AGENTS.md）。
3. 激活后按三段式输出，并把错因追加进 `.claude/memory/dawang-raoming.md`。**新对话开局 AI 先扫记忆文件**，主动避免再犯。

> 想知道 Skills 机制？看 [Superpowers](https://github.com/obra/superpowers)、[mattpocock/skills](https://github.com/mattpocock/skills)。

---

## 借鉴与致敬

大王饶命站在巨人的肩膀上，取百家精华做成自己的味道：

| 借鉴 | 来源 | 取什么 |
|---|---|---|
| 精准触发 + 反误报 | [nav-diagnose](https://www.skill-gallery.jp/en/skills/alekspetrov/nav-diagnose) | 具体愤怒信号清单；「单次纠正不触发」 |
| 结构化道歉 + 反模式 | [apology-letter](https://claudeskills.info/skill/apology-letter/)（~1.3k★） | 承认 → 担责 → 补救 → 防复发；不找借口 |
| 证据原则 | [ex-skill](https://github.com/therealXiaomanChu/ex-skill) | 没有证据不道歉（Layer 0 硬规则） |
| 增量 Markdown 记忆 | [mental-health-companion](https://github.com/zxc7563598/mental-health-companion) | 跨会话记忆的落地格式 |

---

## 路线图

- [ ] 更多搞怪语库：方言版、二次元版、鲁迅版
- [ ] 全局记忆同步：一条命令把记忆同步到 `~/.claude/`
- [ ] `doctor` 增加同类错误率趋势
- [ ] 导出 `.cursor/rules`，Cursor 用户开箱即用

欢迎提 [Issue](https://github.com/RazorEdge-wyh/dawang-raoming/issues) 或 PR。

---

## License

MIT © [王越豪（湖南科技大学 26 届）](https://github.com/RazorEdge-wyh)

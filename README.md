<div align="center">

# 🤲 大王饶命（dawang-raoming）

### Claude Code 技能：让 AI 犯错后当场滑跪认错，把教训刻进记忆

**检测到用户明显生气 → 古装剧式搞怪道歉（附技能名）→ 回溯错因 → 写入永久记忆，下次不再犯。**

<br/>

![GitHub stars](https://img.shields.io/github/stars/RazorEdge-wyh/dawang-raoming?style=social)
![License](https://img.shields.io/github/license/RazorEdge-wyh/dawang-raoming)
![Node](https://img.shields.io/badge/node-%3E%3D16-green)
![Zero deps](https://img.shields.io/badge/依赖-0-blueviolet)

零依赖，纯 Markdown，一行命令安装。

```bash
npm i -g github:RazorEdge-wyh/dawang-raoming && dawang-raoming init
```

> 英文版：[spare-me](https://github.com/RazorEdge-wyh/spare-me)

</div>

---

## 这是什么

一个 Claude Code 技能。AI 一旦检测到你明显生气，不再只会回一句「抱歉，下次注意」，而是三步走：

1. **先滑跪**：古装剧口吻来一句「大王饶命！臣罪该万死」，末尾附技能名，让你知道是它在认错
2. **再认错**：翻上一轮，说清楚自己错在哪——漏了需求、写了 bug，还是答非所问
3. **最后记档**：把错因写进 `.claude/memory/dawang-raoming.md`，重点记「下次怎么改」

```text
你：你怎么又搞错了？？？我改了三遍了！你是不是根本没看我的需求！

Claude：
🤲 大王饶命！（技能：大王饶命）
「臣罪该万死！是小的眼神不好，把您第 2 条需求给漏了。」

—— 我错在哪：上一轮只实现了分页，漏了排序。
—— 已记档 .claude/memory/dawang-raoming.md，下次先逐条过需求再动手。

下面是按完整需求重写的实现……
```

道歉只是开场，**把错因写进永久记忆**才是核心——每次惹你生气，它都长一智。

## 使用场景

你是不是经常被傻逼 AI 整烦？……

- 需求说了三遍，翻来覆去就是漏第 2 条
- 同一个 bug 修了又犯、犯了又修，跟失忆一样
- 让它改一行，它洋洋洒洒讲半天道理，一行没改
- 你说「这里别动」，它转头就把这里动了

气到想摔键盘的时候，最烦听到的就是那句「抱歉，我会注意的」——你需要它当场滑跪认错，而且**真的长记性**。这正是大王饶命干的。

## 特点

- **搞怪但不敷衍**：道歉只出现一次，一次到位，然后立刻回去干活，不打断你
- **真的长记性**：错因进 `.claude/memory/dawang-raoming.md`，新对话开局自动读取
- **屡教不改会升级**：同一个错犯第二次，它会主动承认，并立一条更狠的规矩
- **不乱道歉**：没检测到明显怒气绝不触发——凭空道歉比犯错更烦人
- **`doctor` 体检**：一条命令给 AI 的长记性打分，揪出重复犯的错
- **零依赖**：只用 Node 标准库，SKILL.md 是纯 Markdown，装完随便改

## 快速开始

```bash
npm i -g github:RazorEdge-wyh/dawang-raoming
dawang-raoming init
```

装完长这样：

```text
your-project/
├── .claude/
│   ├── skills/dawang-raoming/SKILL.md   # 技能本体
│   └── memory/dawang-raoming.md         # 犯错记忆
└── CLAUDE.md                            # 注入了一条「AI 生气自检」规则
```

然后，去把 Claude 惹毛一次试试。

## 命令

```text
dawang-raoming init    安装技能 + 记忆模板 + 行为规则
dawang-raoming try     随机打一句道歉，看看画风
dawang-raoming doctor  体检记忆，揪出屡教不改
```

## `doctor`：AI 长记性体检

`doctor` 打开 `.claude/memory/dawang-raoming.md`，看 AI 是不是真在长记性：

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
  1. [repeat] 错因「漏看需求第 2 条」已出现 2 次——屡教不改，该升级戒律了
  ...
```

纯本地检查，不联网、不改代码，只看一份报告。适合每周看一眼 AI 有没有把同一个错犯第二遍，或者给团队立规矩：**同一个错犯两次，就升级戒律**。

本仓库自己就在跑 doctor——装完它会老实报告「记忆是空的，还没触发过」，触发一次后开始涨分。

## 工作原理

1. Claude Code 原生支持 Skills：`.claude/skills/` 下的 `SKILL.md` 按 `description` 自动匹配，你一发火它就被唤起。
2. 大王饶命是状态型技能，得持续感知怒气，所以 `init` 会在 `CLAUDE.md` 注入一条行为规则：每次回复前自查用户有没有明显生气，有就激活（三层保障：`description` + `CLAUDE.md` 规则 + `AGENTS.md`）。
3. 触发后按三步执行，把错因追加进记忆。新对话开局，AI 先扫一遍记忆文件，主动避开那些坑。

## 借鉴

玩法不是凭空发明的，参考了几位高手的做法：

- 精准触发、不误报 → [nav-diagnose](https://www.skill-gallery.jp/en/skills/alekspetrov/nav-diagnose)：具体愤怒信号清单
- 结构化道歉、不找借口 → [apology-letter](https://claudeskills.info/skill/apology-letter/)（~1.3k★）
- 没证据不道歉 → [ex-skill](https://github.com/therealXiaomanChu/ex-skill)
- 跨会话 Markdown 记忆 → [mental-health-companion](https://github.com/zxc7563598/mental-health-companion)

## 路线图

- [ ] 更多语料：方言版、二次元版、鲁迅版
- [ ] 记忆全局同步：一条命令同步到 `~/.claude/`
- [ ] `doctor` 加同类错误率趋势
- [ ] 导出 `.cursor/rules`，给 Cursor 用户

欢迎提 [Issue](https://github.com/RazorEdge-wyh/dawang-raoming/issues) 或 PR。

## License

MIT © [王越豪（湖南科技大学 26 届）](https://github.com/RazorEdge-wyh)

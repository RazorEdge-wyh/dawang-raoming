<div align="center">

# 🤲 大王饶命（dawang-raoming）

### 让 Claude 犯错后当场滑跪，还把教训刻进脑子

**你越生气，它跪得越快。跪完认错，认完记档，下次真不犯。**

<br/>

![GitHub stars](https://img.shields.io/github/stars/RazorEdge-wyh/dawang-raoming?style=social)
![License](https://img.shields.io/github/license/RazorEdge-wyh/dawang-raoming)
![Node](https://img.shields.io/badge/node-%3E%3D16-green)
![Zero deps](https://img.shields.io/badge/依赖-0-blueviolet)

零依赖，纯 Markdown，装完随便改。

```bash
npm i -g github:RazorEdge-wyh/dawang-raoming && dawang-raoming init
```

> 想要英文版？去 [spare-me](https://github.com/RazorEdge-wyh/spare-me)。

</div>

---

## 它是干这个的

```text
你：你怎么又搞错了？？？我改了三遍了！你是不是根本没看我的需求！

Claude：
🤲 大王饶命！（技能：大王饶命）
「臣罪该万死！是小的眼神不好，把您第 2 条需求给漏了。」

—— 我错在哪：上一轮只实现了分页，漏了排序。
—— 已记档 .claude/memory/dawang-raoming.md，下次先逐条过需求再动手。

下面是按完整需求重写的实现……
```

没有它，AI 惹你生气只会挤出一句「抱歉，我下次注意」，然后继续犯。

有它，画风变成：**跪 → 认 → 记 → 下次真不犯。**

别把它当玩梗——最后那一步才是真货。每次惹你生气，它都长一智。

---

## 它每次要办的三件事

1. **跪**。古装剧口吻来一句滑跪，末尾必带 `（技能：大王饶命）`，让你知道认错的是它。
2. **认**。回头翻上一轮，说清楚错在哪——漏了需求？代码有 bug？答非所问？只讲事实，不找借口。
3. **记**。把错因写进 `.claude/memory/dawang-raoming.md`，重点记「下次怎么改」。

同一个错犯第二次，它不会跪下装乖——会自己招认「此错已犯第二次」，然后立一条更狠的规矩。

没检测到明显怒气，它绝不跪——凭空道歉比犯错更招人烦。

---

## 装

```bash
npm i -g github:RazorEdge-wyh/dawang-raoming   # 从 GitHub 直接装
# 或发布到 npm 后： npm i -g dawang-raoming

dawang-raoming init                            # 在项目里装技能
```

装完长这样：

```text
your-project/
├── .claude/
│   ├── skills/dawang-raoming/SKILL.md   # 技能本体
│   └── memory/dawang-raoming.md         # 犯错记忆
└── CLAUDE.md                   # 注入了一条「AI 生气自检」规则
```

然后，去把 Claude 惹毛一次试试。

---

## 命令

```text
dawang-raoming init    装技能 + 记忆模板 + 行为规则
dawang-raoming try     随机打一句道歉，先看看画风
dawang-raoming doctor  体检记忆，揪出屡教不改
```

---

## doctor：验验它长没长记性

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

纯本地检查，不联网、不改代码，只看一份报告。适合：每周扫一眼 AI 有没有把同一个错犯第二遍；或者给团队立规矩——**同一个错犯两次，就升级戒律**。

本仓库自己就在跑 doctor——装完它会老实报告「记忆是空的，还没触发过」，触发一次后开始涨分。

---

## 为什么「下次真不再犯」不是吹的

1. Claude Code 原生认 **Skills**：`.claude/skills/` 下的 `SKILL.md` 按 `description` 自动匹配，你一发火它就被唤起。
2. 大王饶命是**状态型技能**，得持续感知怒气，所以 `init` 会在 `CLAUDE.md` 注入一条行为规则：每次回复前自查用户有没有明显生气，有就激活（三层保障：`description` + `CLAUDE.md` 规则 + `AGENTS.md`）。
3. 激活后按那三件事执行，把错因追加进记忆。**新对话一开局，AI 先扫一遍记忆文件**，主动避开那些坑。

---

## 师承

玩法不是凭空发明的，借鉴了几位高手的做法：

- 精准触发、不误报 → [nav-diagnose](https://www.skill-gallery.jp/en/skills/alekspetrov/nav-diagnose)：具体愤怒信号清单，「单次纠正不触发」
- 结构化道歉、不找借口 → [apology-letter](https://claudeskills.info/skill/apology-letter/)（~1.3k★）
- 没证据不道歉 → [ex-skill](https://github.com/therealXiaomanChu/ex-skill) 的硬规则
- 跨会话 Markdown 记忆 → [mental-health-companion](https://github.com/zxc7563598/mental-health-companion)

---

## 还打算认哪些新错

- [ ] 更多语料：方言版、二次元版、鲁迅版
- [ ] 记忆全局同步：一条命令把记忆同步到 `~/.claude/`
- [ ] `doctor` 加同类错误率趋势
- [ ] 导出 `.cursor/rules`，给 Cursor 用户

欢迎提 [Issue](https://github.com/RazorEdge-wyh/dawang-raoming/issues) 或 PR。

---

## License

MIT © [王越豪（湖南科技大学 26 届）](https://github.com/RazorEdge-wyh)

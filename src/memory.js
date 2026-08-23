/**
 * 犯错记忆文件读写。
 *
 * dawang-raoming 的核心价值：把「用户为什么生气」沉淀成可复用的记忆，
 * 下次不再犯。本模块负责记忆文件的定位、追加、解析与重复错因统计。
 *
 * 文件：<项目>/.claude/memory/dawang-raoming.md
 * 条目格式（每触发一次追加一块）：
 *   ## 2026-08-24 · 错因：漏看需求第 2 条
 *   - 触发输入：你怎么又搞错了？？？我改了三遍了！
 *   - 我错在哪：只做了分页，没做排序
 *   - 下次怎么改：做需求先逐条过一遍再动手
 *   - 补救：本轮已给出修正实现
 */

const fs = require('node:fs');
const path = require('node:path');

/** 记忆文件相对项目根的位置 */
const MEMORY_REL = path.join('.claude', 'memory', 'dawang-raoming.md');

/** 记忆文件的绝对路径 */
function memoryPath(targetDir) {
  return path.join(targetDir, MEMORY_REL);
}

/** 生成日期（YYYY-MM-DD，本地时区） */
function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** init 生成的记忆文件模板（不带示例记录，让 doctor 能诚实反映「还没触发过」） */
const TEMPLATE = `# 大王饶命 犯错记忆

> 此文件由 dawang-raoming skill 维护。每次用户明显生气，AI 记下错因与改正，避免再犯。
> 同一错因出现 ≥2 次即「屡教不改」，AI 会主动升级戒律。

<!-- 记录格式（AI 触发 dawang-raoming 时按此追加）：
## 2026-08-24 · 错因：漏看需求第 2 条
- 触发输入：你怎么又搞错了？？？我改了三遍了！
- 我错在哪：只做了分页，没做排序
- 下次怎么改：做需求先逐条过一遍再动手
- 补救：本轮已给出修正实现
-->
`;

/** 追加一条犯错记录（自动建目录）。返回文件路径。 */
function appendEntry(targetDir, entry) {
  const file = memoryPath(targetDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const date = entry.date || today();
  const block = `\n## ${date} · 错因：${entry.title}\n` +
    `- 触发输入：${entry.triggerInput}\n` +
    `- 我错在哪：${entry.mistake}\n` +
    `- 下次怎么改：${entry.fix}\n` +
    `- 补救：${entry.remedy}\n`;
  fs.appendFileSync(file, block, 'utf8');
  return file;
}

/**
 * 解析记忆文件为结构化条目。
 * @returns {Array<{date, reason, title, fields}>} fields 是字段名 -> 内容 的映射
 */
function parseEntries(raw) {
  // 先剔除 HTML 注释块（模板里的格式示例是注释，不应被当成记录）
  const body = raw.replace(/<!--[\s\S]*?-->/g, '');
  const blocks = body.split(/\n(?=## )/).filter((b) => /^## /.test(b));
  return blocks.map((block) => {
    const lines = block.trim().split('\n');
    const head = lines[0].replace(/^##\s+/, '');
    const date = head.split(' · ')[0] || '';
    const reasonMatch = head.match(/错因：(.+)$/);
    const reason = reasonMatch ? reasonMatch[1].trim() : head.trim();
    const fields = {};
    for (const l of lines.slice(1)) {
      const m = l.match(/^- (.+?)[：:]\s*(.*)$/);
      if (m) fields[m[1]] = m[2];
    }
    return { date, reason, title: head, fields };
  });
}

/**
 * 分析记忆健康度：条目数、重复错因（屡教不改）、缺关键字段的条目。
 */
function analyze(targetDir) {
  const file = memoryPath(targetDir);
  const hasFile = fs.existsSync(file);
  const raw = hasFile ? fs.readFileSync(file, 'utf8') : '';
  const entries = parseEntries(raw);

  const reasonCount = {};
  for (const e of entries) reasonCount[e.reason] = (reasonCount[e.reason] || 0) + 1;
  const repeats = Object.entries(reasonCount)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({ reason, count }));

  const incomplete = entries
    .filter((e) => !e.fields['下次怎么改'] || !e.fields['触发输入'])
    .map((e) => ({ date: e.date, reason: e.reason }));

  return { hasFile, file, total: entries.length, repeats, incomplete };
}

module.exports = { MEMORY_REL, memoryPath, TEMPLATE, today, appendEntry, parseEntries, analyze };

/**
 * 搞怪道歉语库。
 *
 * AI 触发 dawang-raoming 时，从这里选一句主台词 + 一句铺陈，再贴合具体错因改写；
 * `dawang-raoming try` 命令也从这里随机取，方便安装后先看效果。
 */

const PHRASES = [
  { phrase: '大王饶命！', follow: '臣罪该万死！' },
  { phrase: '臣罪该万死！', follow: '是小的眼神不好，没看全您的意思。' },
  { phrase: '圣上息怒！', follow: '这错犯得，小的这就跪着改。' },
  { phrase: '臣有罪，认罚。', follow: '负荆而来，这就把错因刨出来。' },
  { phrase: '饶命啊！', follow: '小的这就滚回去重做。' },
  { phrase: '您这一喝，臣脑门都见汗了。', follow: '别动气，错因马上就给您揪出来。' },
  { phrase: '臣办事不力，死罪！', follow: '这就给您补上。' },
  { phrase: '您骂得对，臣反省得彻底。', follow: '上一轮的糊涂账，我这就一页一页翻给您看。' },
  { phrase: '微臣告罪！', follow: '这错出在臣身上，不冤。' },
];

/** 取一条随机短语（用固定种子可复现，便于测试） */
function randomPhrase(seed = null) {
  const idx = seed === null ? Math.floor(Math.random() * PHRASES.length) : seed % PHRASES.length;
  return PHRASES[idx];
}

/** 拼出一行完整道歉（CLI 演示用；AI 应贴合错因改写，不直接用这行） */
function line(seed = null) {
  const p = randomPhrase(seed);
  return `🤲 ${p.phrase}（skill：大王饶命）\n「${p.follow}」`;
}

module.exports = { PHRASES, randomPhrase, line };

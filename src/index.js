/**
 * dawang-raoming 公共 API（供 require('dawang-raoming') 使用，CLI 仍走 bin/dawang-raoming.js）。
 */
const phrases = require('./phrases');
const memory = require('./memory');
const { runDoctor } = require('./doctor');
const { runInit } = require('./init');
const { listSkills, installSkills } = require('./skills');

module.exports = { phrases, memory, runDoctor, runInit, listSkills, installSkills };

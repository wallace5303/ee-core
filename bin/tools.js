#!/usr/bin/env node

const replaceDist = require('../tools/replaceDist');
const encrypt = require('../tools/encrypt');

// argv
const args = process.argv;
// console.log('[ee-core] args:', args);
const cmd = args[2];
console.log('[ee-core] cmd:', cmd);

if (cmd == 'rd') {
  replaceDist.run();
}

if (cmd == 'encrypt') {
  encrypt.run();
}

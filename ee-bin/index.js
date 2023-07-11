#!/usr/bin/env node

const program = require('commander');



/**
 * rd - Moves front-end resources to a specified directory
 */
program
.command('rd')
.description('Move frontend resources to public/dist')
.option('--dist-dir <folder>', 'title to use before name', './frontend/dist')
.action((options) => {
  const replaceDist = require('./tools/replaceDist');
  replaceDist.run(options);
});

/**
 * encrypt - Code encryption
 */
program
.command('encrypt')
.description('Code encryption')
.action(() => {
  const encrypt = require('./tools/encrypt');
  encrypt.run();
});

/**
 * clean - Clear the encrypted code
 */
program
.command('clean')
.description('Clear the encrypted code')
.action(() => {
  const encrypt = require('./tools/encrypt');
  encrypt.clean();
});

/**
 * icon
 */
program
.command('icon')
.description('Generate logo')
.action(() => {
  const iconGen = require('./tools/iconGen');
  iconGen.run();
});

program.parse();

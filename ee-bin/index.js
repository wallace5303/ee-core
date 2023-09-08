#!/usr/bin/env node

const { program } = require('commander');

/**
 * rd - Moves front-end resources to a specified directory
 */
program
  .command('rd')
  .description('Move frontend resources to public/dist')
  .option('--config <folder>', 'config file', './electron/config/bin.js')
  .option('--dist <folder>', 'title to use before name')
  .option('--target <folder>', 'title to use before name')
  .action(function() {
    const replaceDist = require('./tools/replaceDist');
    replaceDist.run(this.opts());
  });

/**
 * encrypt - Code encryption
 */
program
  .command('encrypt')
  .description('Code encryption')
  .option('--config <folder>', 'config file')
  .option('--out <folder>', 'output directory', './public')
  .action(function() {
    const encrypt = require('./tools/encrypt');
    encrypt.run(this.opts());
  });

/**
 * clean - Clear the encrypted code
 */
program
  .command('clean')
  .description('Clear the encrypted code')
  .option('-d, --dir <folder>', 'clean directory')
  .action(function() {
    const encrypt = require('./tools/encrypt');
    encrypt.clean(this.opts());
  });

/**
 * icon
 */
program
  .command('icon')
  .description('Generate logo')
  .action(function() {
    const iconGen = require('./tools/iconGen');
    iconGen.run();
  });

/**
 * dev
 */
program
  .command('dev')
  .description('create frontend-serve and electron-serve')
  .option('--config <folder>', 'config file', './electron/config/bin.js')
  .option('--serve <mode>', 'serve mode')
  .action(function() {
    const serve = require('./tools/serve');
    serve.dev(this.opts());
  });

/**
 * build
 */
program
  .command('build')
  .description('build frontend dist')
  .option('--config <folder>', 'config file', './electron/config/bin.js')
  .action(function() {
    const serve = require('./tools/serve');
    serve.build(this.opts());
  });

/**
 * start
 */
program
  .command('start')
  .description('preview effect')
  .option('--config <folder>', 'config file', './electron/config/bin.js')
  .action(function() {
    const serve = require('./tools/serve');
    serve.start(this.opts());
  });

/**
 * exec
 */
program
  .command('exec')
  .description('create frontend-serve and electron-serve')
  .option('--config <folder>', 'config file', './electron/config/bin.js')
  .option('--command <command>', 'Custom command')
  .action(function() {
    const serve = require('./tools/serve');
    serve.exec(this.opts());
  });

program.parse();
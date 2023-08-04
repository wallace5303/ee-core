#!/usr/bin/env node

const program = require('commander');

/**
 * rd - Moves front-end resources to a specified directory
 */
program
  .command('rd')
  .description('Move frontend resources to public/dist')
  .option('--dist-dir <folder>', 'title to use before name', './frontend/dist')
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
  .description('create frontend-server and electron-server')
  .option('--config <folder>', 'config file', './electron/config/bin.js')
  .action(function() {
    const frontend = require('./tools/frontend');
    frontend.serve(this.opts());
  });

/**
 * build
 */
program
  .command('build')
  .description('build frontend dist')
  .option('--config <folder>', 'config file', './electron/config/bin.js')
  .action(function() {
    const frontend = require('./tools/frontend');
    frontend.build(this.opts());
  });

program.parse();

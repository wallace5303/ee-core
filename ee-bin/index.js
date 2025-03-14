#!/usr/bin/env node

const { program } = require('commander');
const { move } = require('./tools/move');
const { encrypt, cleanEncrypt } = require('./tools/encrypt');
const { serveProcess } = require('./tools/serve');
const { incrUpdater } = require('./tools/incrUpdater');
const chalk = require("chalk");
const process = require("process");
const kill = require("tree-kill");

/**
 * resource process
 */
const resource = {
  processList: [],
  addProcess(execProcess) {
    const keys = Object.keys(execProcess);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const key = keys[i];
      const p = execProcess[key];
      this.processList.push({
        name: key,
        pid: p.pid,
      });
    }
  },
  close() {
    this.processList.forEach((p) => {
      kill(p.pid);
      console.log(chalk.red("[ee-bin] ") + `Kill [${chalk.blue(p.name)}] server. pid: ${chalk.green(p.pid)}`);
    });
    this.processList = [];
    process.exit(0);
  },
};
/**
 * dev
 */
program
  .command('dev')
  .description('create frontend-serve and electron-serve')
  .option('--config <folder>', 'config file')
  .option('--serve <mode>', 'serve mode')
  .action(function() {
    serveProcess.dev(this.opts());
    resource.addProcess(serveProcess.execProcess);
  });

/**
 * build
 */
program
  .command('build')
  .description('building multiple resources')
  .option('--config <folder>', 'config file')
  .option('--cmds <flag>', 'custom commands')
  .option('--env <env>', 'environment')
  .action(function() {
    serveProcess.build(this.opts());
    resource.addProcess(serveProcess.execProcess);
  });

/**
 * start
 */
program
  .command('start')
  .description('preview effect')
  .option('--config <folder>', 'config file')
  .action(function() {
    serveProcess.start(this.opts());
    resource.addProcess(serveProcess.execProcess);
  });

/**
 * exec
 */
program
  .command('exec')
  .description('create frontend-serve and electron-serve')
  .option('--config <folder>', 'config file')
  .option('--cmds <flag>', 'custom commands')
  .action(function() {
    serveProcess.exec(this.opts());
    resource.addProcess(serveProcess.execProcess);
  });

/**
 * move - Moves resources
 */
program
  .command('move')
  .description('Move multip resources')
  .option('--config <folder>', 'config file')
  .option('--flag <flag>', 'Custom flag')
  .action(function() {
    move(this.opts());
  });

/**
 * encrypt - Code encryption
 */
program
  .command('encrypt')
  .description('Code encryption')
  .option('--config <folder>', 'config file')
  .option('--out <folder>', 'output directory')
  .action(function() {
    encrypt(this.opts());
  });

/**
 * clean - Clear the encrypted code
 */
program
  .command('clean')
  .description('Clear the encrypted code')
  .option('-d, --dir <folder>', 'clean directory')
  .action(function() {
    cleanEncrypt(this.opts());
  });

/**
 * icon
 */
program
  .command('icon')
  .description('Generate logo')
  .option('-i, --input <file>', 'image file default /public/images/logo.png')
  .option('-o, --output <folder>', 'output directory default /build/icons/')
  .action(function() {
    const iconGen = require('./tools/iconGen');
    iconGen.run();
  });

/**
 * updater
 */
program
  .command('updater')
  .description('updater commands')
  .option('--config <folder>', 'config file')
  .option('--asar-file <file>', 'asar file path')
  .option('--platform <flag>', 'platform')
  .action(function() {
    incrUpdater.run(this.opts());
  });

// 监听 SIGINT 信号（Ctrl + C）
process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing resources...');
    resource.close();
});

// 监听 SIGTERM 信号
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Closing resources...');
    resource.close();
});

program.parse();
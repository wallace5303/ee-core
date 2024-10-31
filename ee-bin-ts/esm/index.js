#!/usr/bin/env node
import { program } from "commander";
import moveScript from "./tools/move.js";
import replaceDist from "./tools/replaceDist.js";
import encrypt from "./tools/encrypt.js";
import iconGen from "./tools/iconGen.js";
import serve from "./tools/serve.js";
import updater from "./tools/incrUpdater.js";
/**
 * move - Moves resources
 */
program
    .command('move')
    .description('Move multip resources')
    .option('--config <folder>', 'config file', './electron/config/bin.js')
    .option('--flag <flag>', 'Custom flag')
    .action(function () {
    moveScript.run(this.opts());
});
/**
 * (deprecated) rd - Moves front-end resources to a specified directory
 */
program
    .command('rd')
    .description('Move frontend resources to public/dist')
    .option('--config <folder>', 'config file', './electron/config/bin.js')
    .option('--dist <folder>', 'title to use before name')
    .option('--target <folder>', 'title to use before name')
    .action(function () {
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
    .action(function () {
    encrypt.run(this.opts());
});
/**
 * clean - Clear the encrypted code
 */
program
    .command('clean')
    .description('Clear the encrypted code')
    .option('-d, --dir <folder>', 'clean directory')
    .action(function () {
    const encrypt = encrypt;
    encrypt.clean(this.opts());
});
/**
 * icon
 */
program
    .command('icon')
    .description('Generate logo')
    .option('-i, --input <file>', 'image file default /public/images/logo.png')
    .option('-o, --output <folder>', 'output directory default /build/icons/')
    .action(function () {
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
    .action(function () {
    serve.dev(this.opts());
});
/**
 * build
 */
program
    .command('build')
    .description('building multiple resources')
    .option('--config <folder>', 'config file', './electron/config/bin.js')
    .option('--cmds <flag>', 'custom commands')
    .action(function () {
    const serve = serve;
    serve.build(this.opts());
});
/**
 * start
 */
program
    .command('start')
    .description('preview effect')
    .option('--config <folder>', 'config file', './electron/config/bin.js')
    .action(function () {
    const serve = serve;
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
    .option('--cmds <flag>', 'custom commands')
    .action(function () {
    // command 选项是关键字，不再使用，改为 cmds
    const serve = serve;
    serve.exec(this.opts());
});
/**
 * updater
 */
program
    .command('updater')
    .description('updater commands')
    .option('--config <folder>', 'config file', './electron/config/bin.js')
    .option('--asar-file <file>', 'asar file path')
    .option('--platform <flag>', 'platform')
    .action(function () {
    updater.run(this.opts());
});
program.parse();

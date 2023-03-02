
const is = require('is-type-of');
let Exception;
let Loader;
let Log;
let UtilsCore;

// 开发环境下，ee-core是soft link
if (__dirname.indexOf("node_modules") == -1) {
  Exception = require('../../exception');
  Loader = require('../../loader');
  Log = require('../../log');
  UtilsCore = require('../../core/lib/utils');
} else {
  Exception = require('ee-core/module/exception');
  Loader = require('ee-core/module/loader');
  Log = require('ee-core/module/log');
  UtilsCore = require('../../core/lib/utils');
}

Exception.start();

class ChildApp {
  constructor() {
    const args = process.argv[2];
    this.args = JSON.parse(args);
    this.run();
  }

  /**
   * 运行脚本
   */  
  run() {
    let filepath = this.args.jobPath;
    let params = this.args.jobParams;

    let mod = Loader.loadJsFile(filepath);
    if (is.class(mod) || UtilsCore.isBytecodeClass(mod)) {
      let jobClass = new mod(params);
      jobClass.handle();
    } else if (is.function(mod)) {
      mod(params);
    }

    Log.coreLogger.info('[ee-core] [child-process] job run');
  }
}

new ChildApp();
const Exception = require('ee-core/module/exception');
const Loader = require('ee-core/module/loader');
const Log = require('ee-core/module/log');

Exception.start();

class ChildApp {
  constructor() {
    const args = process.argv[2];
    this.opt = args ? JSON.parse(args) : {};
  }

  run () {
    Log.info('[ee-core] [child-process] run');
    
    const jobFile = this.opt.jobPath;

    Loader.loadJobFile(jobFile);
  }
}

const app = new ChildApp()
app.run();
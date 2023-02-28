const Exception = require('ee-core/module/exception');
const Loader = require('ee-core/module/loader');
const Log = require('ee-core/module/log');

Exception.start();

class ChildApp {
  constructor() {
    // const args = process.argv[2];
    // this.opt = args ? JSON.parse(args) : {};

    this._initEvents();
  }

  /**
   * 初始化事件监听
   */
  _initEvents() {
    Log.info('[ee-core] [child-process] init Events');

    process.on('disconnect', () => {
      Log.coreLogger.info(`[ee-core] [module/message/childMessage] child process disconnected:${process.pid} !`);
    });
    process.on('exit', () => {
      Log.coreLogger.info(`[ee-core] [module/message/childMessage] child process exited:${process.pid} !`);
    });
    process.on('message', this._handleMessage.bind(this));
  }

  /**
   * 监听消息
   */
  _handleMessage(message) {
    Log.coreLogger.info(`[ee-core] [module/message/childMessage] Received a message ${message} from the mainProcess`);

    this.run(message);
  }

  run (msg = {}) {
    Log.info('[ee-core] [child-process] run');
    
    // const jobFile = this.opt.jobPath;
    // Loader.loadJobFile(jobFile);

    //Loader.loadJobFile(msg.jobPath, msg.params);
  }
}

let app = new ChildApp();
app.run();
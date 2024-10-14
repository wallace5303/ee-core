const EventEmitter = require('events');
const path = require('path');
const crossSpawn = require('cross-spawn');
const Log = require('../log');
const Ps = require('../ps');
const Channel = require('../const/channel');
const EE = require('../ee');
const Helper = require('../utils/helper');
const UtilsIs = require('../utils/is');
const UtilsPargv = require('../utils/pargv');

class SpawnProcess {
    constructor(host, opt = {}) {
        this.emitter = new EventEmitter();
        this.host = host;
        this.child = undefined;
        this.pid = 0;
        this.port = 0;
        this.name = "";
        this.config = {};
        this._init(opt);
    }

    /**
     * 初始化子进程
     */
    _init(options = {}) {
        const {targetConf, port} = options;
        this.config = targetConf;
        this.port = port;

        // 该名称如果在childrenMap重复，会被重写
        this.name = targetConf.name;

        // Launch executable program
        let cmdPath = '';
        let cmdArgs = targetConf.args;
        let execDir = Ps.getExtraResourcesDir();
        let standardOutput = ['inherit', 'inherit', 'inherit', 'ipc'];
        if (Ps.isPackaged()) {
            standardOutput = ['ignore', 'ignore', 'ignore', 'ipc'];
        }
        if (targetConf.stdio) {
            standardOutput = targetConf.stdio;
        }

        const {cmd, directory} = targetConf;
        // use cmd first
        if (cmd) {
            if (!directory) {
                throw new Error(`[ee-core] [cross] The config [directory] attribute does not exist`);
            }
            cmdPath = cmd;
            if (!path.isAbsolute(cmd) && !Ps.isDev()) {
                cmdPath = path.join(Ps.getExtraResourcesDir(), cmd);
            }
        } else {
            cmdPath = path.join(Ps.getExtraResourcesDir(), targetConf.name);
        }

        // windows
        if (UtilsIs.windows() && path.extname(cmdPath) != '.exe') {
            // Complete the executable program extension
            // notice: python.exe may bring up the App Store
            if (targetConf.windowsExtname === true || !Ps.isDev()) {
                cmdPath += ".exe";
            }
        }

        // executable program directory
        if (directory && path.isAbsolute(directory)) {
            execDir = directory;
        } else if (directory && !path.isAbsolute(directory)) {
            if (Ps.isDev()) {
                execDir = path.join(Ps.getHomeDir(), directory);
            } else {
                execDir = path.join(Ps.getExtraResourcesDir(), directory);
            }
        } else {
            execDir = Ps.getExtraResourcesDir();
        }

        const serverStart = () => {
            Log.coreLogger.info(`[ee-core] [cross/run] cmd: ${cmdPath}, args: ${cmdArgs}`);
            const coreProcess = crossSpawn(cmdPath, cmdArgs, {
                stdio: standardOutput,
                detached: false,
                cwd: execDir,
                maxBuffer: 1024 * 1024 * 1024
            });
            this.child = coreProcess;
            this.pid = coreProcess.pid;

            let data = {
                pid: this.pid
            }
            //设置自动更新环境变量
            process.env.ELECTRON_INCR_UPDATER=true
            process.env.ELECTRON_INCR_UPDATER_RELAUNCH=false
            coreProcess.on('exit', (code, signal) => {
                //如果是更新中，不退出
                //获取进程环境变量
                let electronincrupdater = process.env.ELECTRON_INCR_UPDATER
                Log.coreLogger.info("electronincrupdater", electronincrupdater)
                if (electronincrupdater=="true") {
                    Log.coreLogger.info("服务端更新中，不退出");
                    //每100ms检查一次process.env.ELECTRON_INCR_UPDATER_RELAUNCH,如果是true那么就重新唤起,表示安装完成了
                    //防止前端更新完毕用户不愿意重启,导致前端无法使用
                    //设置尝试次数为10s
                    let count = 30
                    let interval = setInterval(() => {
                        //如果尝试次数超过3s,则退出, 因为能走到这个一步一般来说,下载是成功的,然后处于替换文件阶段,这个节点非常快,一般来说不会超过1s,我这里设置3s保险一点
                        if (count <= 0) {
                            clearInterval(interval)
                            this.host.emitter.emit(Channel.events.childProcessExit, data);
                            Log.coreLogger.info(`服务端更新失败，退出, code:${code}, signal:${signal}, pid:${this.pid} , cmd:${cmdPath}, args: ${cmdArgs}`);
                            this._exitElectron();
                        }
                        let electronincrupdaterrelaunch = process.env.ELECTRON_INCR_UPDATER_RELAUNCH
                        if (electronincrupdaterrelaunch=="true") {
                            clearInterval(interval)
                            Log.coreLogger.info("服务端更新完成，重新唤起, cmd:${cmdPath}, args: ${cmdArgs}");
                            serverStart()
                        }
                        count--
                    }, 100)
                    return
                }
                this.host.emitter.emit(Channel.events.childProcessExit, data);
                Log.coreLogger.info(`子进程被杀死了,导致应用退出, code:${code}, signal:${signal}, pid:${this.pid}, cmd:${cmdPath}, args: ${cmdArgs}`);
                this._exitElectron();
            });

            coreProcess.on('error', (err) => {
                let data = {
                    pid: this.pid
                }
                this.host.emitter.emit(Channel.events.childProcessError, data);
                Log.coreLogger.error(`子进程未知错误,导致应用退出, error: ${err}, pid:${this.pid}, cmd:${cmdPath}, args: ${cmdArgs}`);
                this._exitElectron();
            });
        }

        serverStart()

    }


    /**
     * kill
     */
    kill(timeout = 1000) {
        this.child.kill('SIGINT');
        setTimeout(() => {
            if (this.child.killed) return;
            this.child.kill('SIGKILL');
        }, timeout)
    }

    // send(message) {
    //   return this.sendByType(message, 'message');
    // }

    // close() {
    //   return this.sendByType('close', 'close');
    // }

    // async sendByType(message, type) {
    //   const msg = typeof message === 'string' ? message : JSON.stringify(message);
    //   const id = this._generateId();

    //   this.child.send({
    //       id,
    //       type,
    //       data: msg,
    //   });
    //   return;
    // }

    getUrl() {
        const ssl = Helper.getValueFromArgv(this.config.args, 'ssl');
        let hostname = Helper.getValueFromArgv(this.config.args, 'hostname')
        let protocol = 'http://';
        if (ssl && (ssl == 'true' || ssl == '1')) {
            protocol = 'https://';
        }
        hostname = hostname ? hostname : '127.0.0.1';
        const url = protocol + hostname + ":" + this.port;

        return url;
    }

    getArgsObj() {
        const obj = UtilsPargv(this.config.args);
        return obj;
    }

    setPort(port) {
        this.port = parseInt(port);
    }

    _generateId() {
        const rid = Helper.getRandomString();
        return `node:${this.pid}:${rid}`;
    }

    /**
     * exit electron
     */
    _exitElectron(timeout = 1000) {
        const {CoreApp} = EE;
        if (this.config.appExit) {
            setTimeout(() => {
                // 进程退出前的一些清理工作
                CoreApp.appQuit();
            }, timeout)
        }
    }
}

module.exports = SpawnProcess;
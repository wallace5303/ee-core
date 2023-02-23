const ForkProcess = require('./forkProcess');
const Ps = require('../../utils/ps');

class ChildJob {

  /**
    * constructor
    * @param  {String} name - job name
    * @param  {String} filepath - filepath
    * @param  {Object} opt - child process options 
    */
  constructor(name, filepath, opt = {}) {

    //processArgs: Ps.isDev() ?  [`--inspect=${Constants.jobs.inspectStartIndex}`] : [],
    let options = Object.assign({
      processArgs: [],
      processOptions: { 
        //cwd: path.dirname(filepath),
        env: Ps.allEnv(), 
        stdio: 'pipe' 
      }
    }, opt);

    this.childProcess = new ForkProcess(this, filepath, options.processArgs, options.processOptions);

    this.jobReady = false;
    this.exec = filepath;
    this.name = name;
  }
}

module.exports = ChildJob;

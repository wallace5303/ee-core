const { nanoid } = require('nanoid');
const callbackTimeot = 2000;

class Bridge {
  constructor(proc) {
    this.proc = proc;
    this._eventHandlerMap = {};
    this._eventMap = {};
  }

  async init(options) {
    let handleInitResolve;
    const initPromise = new Promise(resolve => {
        handleInitResolve = resolve;
    })

    this.proc.on('message', msg => {
      if (!msg || !msg.id) {
        return;
      }
      if (msg.type === 'establish') {
        handleInitResolve();
        return;
      }
      if (msg.type === 'response') {
        const eventHandler = this._eventHandlerMap[msg.id];
        if (!eventHandler) {
            return;
        }
        delete this._eventHandlerMap[msg.id];
        clearTimeout(eventHandler.timeout);
        eventHandler.resolve(msg.data);
      }
    });

    await initPromise;
    await this.sendByType(options || {}, 'ready');
    return ;
  }

  on(eventType, callback) {
    this._eventMap[eventType] = callback;
  }

  async send(message, nocallback) {
    return this.sendByType(message, 'message', nocallback);
  }

  async close() {
    return this.sendByType('close', 'close', true);
  }

  async sendByType(message, type, nocallback) {
    const id = this.genId();
    let callback;;
    if (!nocallback) {
        callback = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.error(id, 'timeout');
            }, callbackTimeot);
            const eventHandler = { id, resolve, reject, timeout };
            this._eventHandlerMap[id] = eventHandler;
        });
    }
    this.proc.send({
        id,
        type,
        data: typeof message === 'string' ? message : JSON.stringify(message),
    });
    return callback;
  }

  genId() {
    return `node:${process.pid}:${nanoid()}`;
  }

  error(id, errorMessage) {
    const eventHandler = this._eventHandlerMap[id];
    if (!eventHandler) {
        return;
    }
    delete this._eventHandlerMap[id];
    clearTimeout(eventHandler.timeout);
    eventHandler.reject(new Error(errorMessage));
  }

}
const establish = async (proc, options) => {
  const b = new Bridge(proc);
  await b.init(options);
  return b;
}
module.exports = {
  establish
}
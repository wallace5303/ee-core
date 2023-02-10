
class IpcMain  {
  constructor() {
    this.event = new EventEmitter();
    this.services = {};
    /* 根据name获取window id */
    ipcMain.handle('MessageChannel.getIdFromName', (e, args) => {
      return (this.services[args.name] || {}).id;
    });
    /* 使用name和window id注册一个服务 */
    ipcMain.handle('MessageChannel.registryService', (e, args) => {
      const { name, id } = args;
      this.registry(name, id);
      return this.services[name];
    });

  }

  /**
    * invoke [在主进程(main)中向另外一个服务进程(service)发送异步请求，并取得回调Promise]
    * @param  {[String]} name [服务名]
    * @param  {[String]} channel [服务监听的信号名]
    * @param  {[Any]} args [携带参数(会被序列化，不会传递对象Proptype信息)]
    * @return {[Promise]} [回调]
    */
  invoke (name, channel, args={}) {
    const pid = getRandomString();
    const { id } = this.services[name];

    return new Promise((resolve, reject) => {
      if (name === 'main') reject(new Error(`MessageChannel: the main process can not send a message to itself!`))
      if (!id) reject(new Error(`MessageChannel: can not get the id of the window names ${name}`));
      const win = BrowserWindow.fromId(id);
      if (!win) reject(new Error(`MessageChannel: can not find a window with id: ${id}`));
      win.webContents.send(channel, Object.assign(args, { pid, isFromMain: true }));
      ipcMain.once(pid, function(event, rsp) {
        resolve(rsp);
      });

    });
  }

  /**
    * handle [在主进程中(main)监听来自其它渲染进程(service/window)的请求，将promiseFunc执行的结果返回]
    * @param  {[String]} channel [服务监听的信号名]
    * @param  {[Function]} promiseFunc [此函数执行的结果会被发送到消息发送者]
    * @return {[Promise]} [回调]
    */
  handle(channel, promiseFunc) {
    if (!promiseFunc instanceof Function) throw new Error('MessageChannel: promiseFunc must be a function!');
    ipcMain.handle(channel, (event, ...args) => {
      return promiseFunc(event, ...args).then((result) => {
  
        return result;
      });
    });
  }

  /**
    * handle [在主进程中(main)监听一次来自其它渲染进程(service/window)的请求，将promiseFunc执行的结果返回]
    * @param  {[String]} channel [服务监听的信号名]
    * @param  {[Function]} promiseFunc [此函数执行的结果会被发送到消息发送者]
    * @return {[Promise]} [回调]
    */
  handleOnce(channel, promiseFunc) {
    if (!promiseFunc instanceof Function) throw new Error('MessageChannel: promiseFunc must be a function!');
    ipcMain.handleOnce(channel, (event, ...args) => {
      return promiseFunc(event, ...args).then(result => {

        return result;
      });
    });
  }

  /**
    * send [在主进程(main)向另外一个服务进程(service)发送异步请求，不可立即取得值，请配合on监听信号使用]
    * @param  {[String]} name [服务名]
    * @param  {[String]} channel [服务监听的信号名]
    * @param  {[Any]} args [携带参数(会被序列化，不会传递对象Proptype信息)]
    */
  send(name, channel, args={}) {
    const id = (this.services[name] || {}).id;


    if (!id) throw new Error(`MessageChannel: can not get the id of the window names ${name}`);
    const win = BrowserWindow.fromId(id);
    if (!win) throw new Error(`MessageChannel: can not find a window with id: ${id}`);

    win.webContents.send(channel, args);
  }

  /**
    * send [在主进程中(main)向指定某个id的渲染进程窗口(service/window)发送请求，不可立即取得值，请配合on监听信号使用]
    * @param  {[String]} id [window id]
    * @param  {[String]} channel [服务监听的信号名]
    * @param  {[Any]} args [携带参数(会被序列化，不会传递对象Proptype信息)]
    */
  sendTo(id, channel, args) {

    if (!BrowserWindow.fromId(id)) throw new Error(`MessageChannel: can not find a window with id:${id}!`);
    BrowserWindow.fromId(id).webContents.send(channel, args);
  }

  /**
    * on [在主进程中(main)监听来自其它渲染进程(service/window)的请求]
    * @param  {[String]} channel [服务监听的信号名]
    * @param  {[Function]} func [消息到达后，此函数会被触发，同于原生ipcRenderer.on]
    */
  on(channel, func) {
    if (!func instanceof Function) throw new Error('MessageChannel: func must be a function!');
    ipcMain.on(channel, (event, ...args) => {

      func(event, ...args);
    });
  }

  /**
    * once [在主进程中(main)监听一次来自其它渲染进程(service/window)的请求]
    * @param  {[String]} channel [服务监听的信号名]
    * @param  {[Function]} func [消息到达后，此函数会被触发，同于原生ipcRenderer.on]
    */
   once(channel, func) {
    if (!func instanceof Function) throw new Error('MessageChannel: func must be a function!');
    ipcMain.once(channel, (event, ...args) => {

      func(event, ...args);
    });
  }
  
  /**
     * registry [注册BrowserWindow和BrowserService]
     * @param  {[String]} name [唯一的名字]
     * @param  {[String]} id [window id]
     * @param  {[String]} pid [process id]
     */
  registry(name, id, pid) {
    if (name === 'main') throw new Error(`MessageChannel: you can not registry a service named:${name}, it's reserved for the main process!`)
    if (this.services[name]) console.warn(`MessageChannel: the service - ${name} has been registeried!`)
    this.services[name] = { name, id, pid };
    this.event.emit('registry', this.services[name]);
  }

  /**
     * unregistry [注册BrowserWindow和BrowserService]
     * @param  {[String]} name [唯一的名字]
     * @param  {[String]} id [window id]
     * @param  {[String]} pid [process id]
     */
    unregistry(name) {
      if (name === 'main') throw new Error(`MessageChannel: you can not unregistry a service named:${name}, it's reserved for the main process!`);
      if (this.services[name]) console.warn(`MessageChannel: the service - ${name} will be unregisteried!`);
      if (this.services[name]) {
        this.event.emit('unregistry', this.services[name]);
        delete this.services[name];
      } else {
        console.warn(`MessageChannel: unregistry -> the service - ${name} is not found!`);
      }
    }
}


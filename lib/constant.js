module.exports = {
  autoLaunch: {
    LOGIN_SETTING_OPTIONS: {
      // For Windows
      args: [
        '--opened-at-login=1'
      ]
    }
  },
  storageKey: {
    EGG_CONFIG: 'egg_config',
    ELECTRON_IPC: 'electron_ipc',
    PREFERENCES: 'preferences'
  },
  ipcChannels: {
    appMessage: 'app.message',
    appUpdater: 'app.updater'
  },
  appUpdaterStatus: {
    error: -1,
    available: 1,
    noAvailable: 2,
    downloading: 3,
    downloaded: 4,
  }
};
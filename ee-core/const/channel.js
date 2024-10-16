module.exports = {
  process: {
    showException: 'ee#showException',
    sendToMain: 'ee#sendToMain',
    ELECTRON_INCR_UPDATER: 'false'
  },
  socketIo: {
    partySoftware: 'c1',
  },
  events: {
    childProcessExit: 'ee#childProcess#exit',
    childProcessError: 'ee#childProcess#error',
  },
  receiver: {
    childJob: 'job',
    forkProcess: 'task',
    all: 'all'
  }
};
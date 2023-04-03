module.exports = {
  process: {
    showException: 'ee#showException',
    sendToMain: 'ee#sendToMain'
  },
  socketIo: {
    partySoftware: 'c1',
  },
  events: {
    childJobExit: 'ee#ChildJob#exit',
    childJobError: 'ee#ChildJob#error',
  },
  receiver: {
    childJob: 'job',
    forkProcess: 'task',
    all: 'all'
  }
};
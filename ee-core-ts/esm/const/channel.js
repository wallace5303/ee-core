export const process = {
    showException: 'ee#showException',
    sendToMain: 'ee#sendToMain'
};
export const socketIo = {
    partySoftware: 'c1',
};
export const events = {
    childProcessExit: 'ee#childProcess#exit',
    childProcessError: 'ee#childProcess#error',
};
export const receiver = {
    childJob: 'job',
    forkProcess: 'task',
    all: 'all'
};
export default {
    process,
    socketIo,
    events,
    receiver
};

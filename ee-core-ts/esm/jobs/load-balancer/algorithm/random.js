export default (function (tasks) {
    const length = tasks.length;
    const target = tasks[Math.floor(Math.random() * length)];
    return target || null;
});

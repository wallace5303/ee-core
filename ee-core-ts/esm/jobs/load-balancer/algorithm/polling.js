export default (function (tasks, currentIndex, context) {
    if (!tasks.length)
        return null;
    const task = tasks[currentIndex];
    context.currentIndex++;
    context.currentIndex %= tasks.length;
    return task || null;
});

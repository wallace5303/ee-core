import assert from "assert";
export function noop() { }
export function getParamNames(func, cache) {
    var type = typeof func;
    assert(type === 'function', 'The "func" must be a function. Received type "' + type + '"');
    cache = cache !== false;
    if (cache && func.__cache_names) {
        return func.__cache_names;
    }
    var str = func.toString();
    var names = str.slice(str.indexOf('(') + 1, str.indexOf(')')).match(/([^\s,]+)/g) || [];
    func.__cache_names = names;
    return names;
}

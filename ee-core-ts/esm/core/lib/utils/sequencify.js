import * as debug$0 from "debug";
'use strict';
const debug = debug$0('ee-core#sequencify');
function sequence(tasks, names, results, missing, recursive, nest, optional, parent) {
    names.forEach(function (name) {
        if (results.requires[name])
            return;
        const node = tasks[name];
        if (!node) {
            if (optional === true)
                return;
            missing.push(name);
        }
        else if (nest.includes(name)) {
            nest.push(name);
            recursive.push(nest.slice(0));
            nest.pop(name);
        }
        else if (node.dependencies.length || node.optionalDependencies.length) {
            nest.push(name);
            if (node.dependencies.length) {
                sequence(tasks, node.dependencies, results, missing, recursive, nest, optional, name);
            }
            if (node.optionalDependencies.length) {
                sequence(tasks, node.optionalDependencies, results, missing, recursive, nest, true, name);
            }
            nest.pop(name);
        }
        if (!optional) {
            results.requires[name] = true;
            debug('task: %s is enabled by %s', name, parent);
        }
        if (!results.sequence.includes(name)) {
            results.sequence.push(name);
        }
    });
}
export default (function (tasks, names) {
    const results = {
        sequence: [],
        requires: {},
    }; // the final sequence
    const missing = []; // missing tasks
    const recursive = []; // recursive task dependencies
    sequence(tasks, names, results, missing, recursive, [], false, 'app');
    if (missing.length || recursive.length) {
        results.sequence = []; // results are incomplete at best, completely wrong at worst, remove them to avoid confusion
    }
    return {
        sequence: results.sequence.filter(item => results.requires[item]),
        missingTasks: missing,
        recursiveDependencies: recursive,
    };
});

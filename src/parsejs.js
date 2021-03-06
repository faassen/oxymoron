"use strict";

var acorn = require('acorn');

var parseExpr = function(s, clean) {
    var result = acorn.parse(s).body[0].expression;
    if (clean) {
        cleanup(result);
    }
    return result;
};

var cleanup = function(parsed) {
    if (parsed === null) {
        return;
    }
    if (parsed instanceof Array) {
        parsed.forEach(function(item) {
            cleanup(item);

        });
        return;
    }
    if (typeof parsed !== 'object') {
        return;
    }
    delete parsed.start;
    delete parsed.end;
    delete parsed.raw;
    var key;
    for (key in parsed) {
        cleanup(parsed[key]);
    }
    return parsed;
};

module.exports = {
    parseExpr: parseExpr,
    cleanup: cleanup
};

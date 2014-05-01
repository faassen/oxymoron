var chai = require('chai');
var acorn = require('acorn');
var oxymoron = require('../oxymoron');
var React = require('react');
var escodegen = require('escodegen');

var assert = chai.assert;

var parseJsExpr = function(s) {
    var result = acorn.parse(s).body[0].expression;
    cleanupParsedJs(result);
    return result;
};

// get rid of start, end and raw within parsed js as we don't generate it
var cleanupParsedJs = function(parsed) {
    if (parsed === null) {
        return;
    }
    if (parsed instanceof Array) {
        parsed.forEach(function(item) {
            cleanupParsedJs(item);

        });
        return;
    }
    if (typeof parsed !== 'object') {
        return;
    }
    delete parsed['start'];
    delete parsed['end'];
    delete parsed['raw'];
    var key;
    for (key in parsed) {
        cleanupParsedJs(parsed[key]);
    }
    return parsed;
};

suite("oyxmoron", function() {
    test("compile", function() {
        assert.deepEqual(
            oxymoron.compile('<p>Hello world!</p>'),
            parseJsExpr('React.DOM.p(null, "Hello world!")'));
    });
    test("compile with stache in text", function() {
        assert.deepEqual(
            cleanupParsedJs(oxymoron.compile('<p>Hello {{world}}!</p>')),
            parseJsExpr('React.DOM.p(null, ["Hello ", world, "!"])'));
    });
    test("compile with sub element", function() {
        assert.deepEqual(
            cleanupParsedJs(oxymoron.compile('<p>Hello <strong>world</strong>!</p>')),
            parseJsExpr('React.DOM.p(null, ["Hello ", React.DOM.strong(null, "world"), "!"])'));
    });
    test("compile with sub element with stache", function() {
        assert.deepEqual(
            cleanupParsedJs(oxymoron.compile('<p>Hello <strong>{{world}}</strong>!</p>')),
            parseJsExpr('React.DOM.p(null, ["Hello ", React.DOM.strong(null, world), "!"])'));
    });
    test("compile with attrib", function() {
        assert.deepEqual(
            oxymoron.compile('<p id="Foo">Hello world!</p>'),
            parseJsExpr('React.DOM.p({id: "Foo"}, "Hello world!")'));
    });
    test("compile with attrib with stache", function() {
        assert.deepEqual(
            cleanupParsedJs(oxymoron.compile('<p id="Hello {{world}}!">c</p>')),
            parseJsExpr('React.DOM.p({id: "Hello " + world + "!"}, "c")'));
    });


});

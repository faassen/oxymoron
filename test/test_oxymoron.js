"use strict";

var chai = require('chai');
var React = require('react');
var parsejs = require('../parsejs');
var oxymoron = require('../oxymoron');

var assert = chai.assert;
var parseExpr = parsejs.parseExpr;
var cleanup = parsejs.cleanup;

suite("compilation", function() {
    test("compile", function() {
        assert.deepEqual(
            oxymoron.compile('<p>Hello world!</p>'),
            parseExpr('React.DOM.p(null, "Hello world!")', true));
    });
    test("compile with stache in text", function() {
        assert.deepEqual(
            cleanup(oxymoron.compile('<p>Hello {{world}}!</p>')),
            parseExpr('React.DOM.p(null, ["Hello ", world, "!"])', true));
    });
    test("compile with sub element", function() {
        assert.deepEqual(
            cleanup(oxymoron.compile('<p>Hello <strong>world</strong>!</p>')),
            parseExpr('React.DOM.p(null, ["Hello ", React.DOM.strong(null, "world"), "!"])', true));
    });
    test("compile with sub element with stache", function() {
        assert.deepEqual(
            cleanup(oxymoron.compile('<p>Hello <strong>{{world}}</strong>!</p>')),
            parseExpr('React.DOM.p(null, ["Hello ", React.DOM.strong(null, world), "!"])', true));
    });
    test("compile with attrib", function() {
        assert.deepEqual(
            oxymoron.compile('<p id="Foo">Hello world!</p>'),
            parseExpr('React.DOM.p({id: "Foo"}, "Hello world!")', true));
    });
    test("compile with attrib with stache", function() {
        assert.deepEqual(
            cleanup(oxymoron.compile('<p id="Hello {{world}}!">c</p>')),
            parseExpr('React.DOM.p({id: "Hello " + world + "!"}, "c")', true));
    });

});


suite("function generation", function() {
    test("func", function() {
        var f = oxymoron.func(['React', 'name'], '<p>Hello {{name}}!</p>');
        assert.deepEqual(f(React, "foo"),
                         React.DOM.p(null, ["Hello ", "foo", "!"]));
    });

    test("func", function() {
        var f = oxymoron.func(['React', 'a', 'b'], '<p>Sum: {{a + b}}</p>');
        assert.deepEqual(f(React, 1, 2),
                         React.DOM.p(null, ["Sum: ", 3]));
    });
});

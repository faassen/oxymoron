"use strict";

var chai = require('chai');
var React = require('react');
var parsejs = require('../src/parsejs');
var oxymoron = require('../src/oxymoron');

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

// XXX test for dealing with className, event handlers

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

    test("if success", function() {
        var f = oxymoron.func(['React', 'a'], '<div><p data-if="a > 3">Yes</p></div>');
        assert.deepEqual(f(React, 4),
                         React.DOM.div(null, React.DOM.p(null, "Yes")));
    });

    test("if failure", function() {
        var f = oxymoron.func(['React', 'a'],
                              '<div><p data-if="a > 3">Yes</p></div>');
        assert.deepEqual(f(React, 2),
                         React.DOM.div(null, null));
    });
    test("repeat", function() {
        var f = oxymoron.func(['React', 'a'],
                              '<ul><li data-repeat="item in a">{{item}}</li></ul>');
        assert.deepEqual(f(React, [1, 2, 3, 4]),
                         React.DOM.ul(null, [
                             React.DOM.li(null, 1),
                             React.DOM.li(null, 2),
                             React.DOM.li(null, 3),
                             React.DOM.li(null, 4)]));
    });
    test("repeat empty", function() {
        var f = oxymoron.func(['React', 'a'],
                              '<ul><li data-repeat="item in a">{{item}}</li></ul>');
        assert.deepEqual(f(React, []),
                         React.DOM.ul(null, []));
    });

    test("repeat and if", function() {
        var f = oxymoron.func(['React', 'a'],
                              '<ul><li data-repeat="item in a" data-if="item > 3">{{item}}</li></ul>');
        assert.deepEqual(f(React, [2, 3, 4, 5]),
                         React.DOM.ul(null, [
                             React.DOM.li(null, 4),
                             React.DOM.li(null, 5)
                             ]));
    });


    test("let with single expression", function() {
        var f = oxymoron.func(['React'],
                              '<div data-let="a = 3">{{a}}</div>');
        assert.deepEqual(f(React),
                         React.DOM.div(null, 3));
    });

    test("let with multiple expressions", function() {
        var f = oxymoron.func(['React'],
                              '<div data-let="a = 3, b = 2">{{a}} {{b}}</div>');
        assert.deepEqual(f(React),
                         React.DOM.div(null, [3, ' ', 2]));
    });


    test("let shadow name", function() {
        var f = oxymoron.func(['React', 'a'],
                              '<div data-let="a = 2">{{a}}</div>');
        assert.deepEqual(f(React, 1),
                         React.DOM.div(null, 2));
    });

    test("let with if", function() {
        var f = oxymoron.func(['React', 'a'],
                              '<div data-if="true" data-let="a = 3, b = 2">{{a}}{{b}}</div>');
        assert.deepEqual(f(React, [2, 3, 4, 5]),
                         React.DOM.div(null, [3, 2]));
    });

    test("repeat and let", function() {
        var f = oxymoron.func(['React', 'a'],
                              '<ul><li data-repeat="item in a" data-let="m = item * item">{{m}}</li></ul>');
        assert.deepEqual(f(React, [1, 2, 3]),
                         React.DOM.ul(null, [
                             React.DOM.li(null, 1),
                             React.DOM.li(null, 4),
                             React.DOM.li(null, 9)
                             ]));
    });

    test("repeat and use iterable in iteration", function() {
        var f = oxymoron.func(['React', 'a'],
                              '<ul><li data-repeat="item in a">{{a[0]}}</li></ul>');
        assert.deepEqual(f(React, [1, 2]),
                         React.DOM.ul(null, [
                             React.DOM.li(null, 1),
                             React.DOM.li(null, 1)
                         ]));
    });

    test("repeat and if and let", function() {
        var f = oxymoron.func(['React', 'a'],
                              '<ul><li data-repeat="item in a" data-if="item > 3" data-let="r = item * item">{{r}}</li></ul>');
        assert.deepEqual(f(React, [2, 3, 4, 5]),
                         React.DOM.ul(null, [
                             React.DOM.li(null, 16),
                             React.DOM.li(null, 25)
                             ]));
    });

    // XXX this fails due to weird scoping rules
    // test("repeat and let shadow repeat name", function() {
    //     var f = oxymoron.func(['React', 'a'],
    //                           '<ul><li data-repeat="item in a" data-let="item = item * item">{{item}}</li></ul>');
    //     assert.deepEqual(f(React, [1, 2, 3]),
    //                      React.DOM.ul(null, [
    //                          React.DOM.li(null, 1),
    //                          React.DOM.li(null, 4),
    //                          React.DOM.li(null, 9)
    //                          ]));
    // });



});

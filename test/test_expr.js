"use strict";

var chai = require('chai');
var acorn = require('acorn');
var escodegen = require('escodegen');
var parsejs = require('../parsejs');
var expr = require('../expr');

var assert = chai.assert;

suite("oyxmoron", function() {
    test("createElementExpr", function() {
        var e = expr.createElementExpr('p');
        assert.equal(escodegen.generate(e), "React.DOM.p");
    });
    test("createAttribExpr", function() {
        var e = expr.createAttribExpr({'foo': 'bar'});
        var expected = "{ foo: 'bar' }";
        assert.equal(escodegen.generate(e), expected);
    });
    test("createAttribExpr with stache", function() {
        var e = expr.createAttribExpr({'foo': 'hello {{world}}!'});
        var expected = "{ foo: 'hello ' + world + '!' }";
        assert.equal(escodegen.generate(e), expected);
    });
    test("createAttribExpr null", function() {
        var e = expr.createAttribExpr(null);
        assert.equal(escodegen.generate(e), 'null');
    });
    test("createAttribExpr empty dict", function() {
        var e = expr.createAttribExpr({});
        assert.equal(escodegen.generate(e), 'null');
    });
    test("createTextExprArray one string", function() {
        var e = expr.createTextExprArray("hello world");
        assert.equal(e.length, 1);
        assert.equal(escodegen.generate(e[0]), "'hello world'");
    });
    test("createTextExprArray empty", function() {
        var e = expr.createTextExprArray('');
        assert.equal(e.length, 1);
        assert.equal(escodegen.generate(e[0]), "''");
    });
    test("createTextExprArray stache", function() {
        var e = expr.createTextExprArray('Hello {{foo}}!');
        assert.equal(e.length, 3);
        assert.equal(escodegen.generate(e[0]), "'Hello '");
        assert.equal(escodegen.generate(e[1]), "foo");
        assert.equal(escodegen.generate(e[2]), "'!'");
    });
    test("createTextExprArray dotted", function() {
        var e = expr.createTextExprArray('Hello {{foo.bar}}!');
        assert.equal(e.length, 3);
        assert.equal(escodegen.generate(e[0]), "'Hello '");
        assert.equal(escodegen.generate(e[1]), "foo.bar");
        assert.equal(escodegen.generate(e[2]), "'!'");
    });
    test("createTextExprArray only stache", function() {
        var e = expr.createTextExprArray("{{foo}}");
        assert.equal(e.length, 1);
        assert.equal(escodegen.generate(e[0]), "foo");
    });
    test("createTextExprArray stache error", function() {
        assert.throws(function() {
            expr.createTextExprArray('Hello {{foo##bar}}!');
        }, acorn.SyntaxError);
    });
    test('createElementExpr with HTML', function() {
        var e = expr.createElementExpr('p');
        assert.equal(escodegen.generate(e), 'React.DOM.p');
    });
    test('createElementExpr with dotted name', function() {
        var e = expr.createElementExpr('foo.bar');
        assert.equal(escodegen.generate(e), 'foo.bar');
    });
    test("createReactDomExpr", function() {
        var e = expr.createReactDomExpr('p');
        assert.equal(escodegen.generate(e), 'React.DOM.p');
    });
    test("createComponentExpr", function() {
        var e = expr.createComponentExpr(
            'p', {'className': 'foo'},
            expr.createTextExprArray("Hello {{world}}!"));
        var expected = [
            "React.DOM.p({ className: 'foo' }, [",
            "    'Hello ',",
            "    world,",
            "    '!'",
            "])"].join('\n');
        assert.equal(escodegen.generate(e), expected);
    });
    test("createComponentExpr single string", function() {
        var e = expr.createComponentExpr(
            'p', {'className': 'foo'},
            expr.createTextExprArray("Hello!"));
        var expected = "React.DOM.p({ className: 'foo' }, 'Hello!')";
        assert.equal(escodegen.generate(e), expected);
    });
    test("createFunctionalExpr", function() {
        var repeatExpr = parsejs.parseExpr('item in list');
        var e = expr.createFunctionalExpr(
            'map',
            repeatExpr.right,
            repeatExpr.left,
            expr.createComponentExpr(
                'p', null, expr.createTextExprArray("Hello!")));
        var expected = (
            "list.map(function (item) {\n" +
            "    return React.DOM.p(null, 'Hello!');\n" +
            "})");
        assert.equal(escodegen.generate(e), expected);
    });
    test("createVarExpr", function() {
        var exprs = {
            "a":  {
                type: "Literal",
                value: "Foo"
            },
            "b": {
                type: "Literal",
                value: 1
            }
        };
        var e = expr.createVarExpr(exprs);
        assert.equal(escodegen.generate(e), "var a = 'Foo', b = 1;");
    });
    test("createLetExpr", function() {
        var exprs = {
            "a":  {
                type: "Literal",
                value: "Foo"
            }
        };

        var expected = [
            "function () {",
            "    var a = 'Foo';",
            "    return a;",
            "}()"].join('\n');

        var e = expr.createLetExpr(exprs, {type: "Identifier", name: "a"});
        assert.equal(escodegen.generate(e), expected);

    });
});

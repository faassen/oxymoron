var chai = require('chai');
var acorn = require('acorn');
var escodegen = require('escodegen');
var expr = require('../expr');

var assert = chai.assert;

suite("oyxmoron", function() {
    test("createElementExpr", function() {
        var e = expr.createElementExpr('p');
        assert.equal(escodegen.generate(e), "React.DOM.p");
    });
    test("createAttribExpr", function() {
        var e = expr.createAttribExpr({'foo': 'bar'});
        var expected = "{ foo: 'bar' }"
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
    test("createContentsExpr one string", function() {
        var e = expr.createContentsExpr("hello world");
        assert.equal(escodegen.generate(e), "'hello world'");
    });
    test("createContentsExpr empty", function() {
        var e = expr.createContentsExpr('');
        assert.equal(escodegen.generate(e), "''");
    });
    test("createContentsExpr stache", function() {
        var e = expr.createContentsExpr('Hello {{foo}}!');
        var expected = [
            "[",
            "    'Hello ',",
            "    foo,",
            "    '!'",
            "]"].join('\n');
        assert.equal(escodegen.generate(e), expected);
    });
    test("createContentsExpr stache dotted", function() {
        var e = expr.createContentsExpr('Hello {{foo.bar}}!');
        var expected = [
            "[",
            "    'Hello ',",
            "    foo.bar,",
            "    '!'",
            "]"].join('\n');
        assert.equal(escodegen.generate(e), expected);
    });
    test("createContentsExpr only stache", function() {
        var e = expr.createContentsExpr("{{foo}}");
        assert.equal(escodegen.generate(e), "foo");
    });
    test("createContentsExpr stache error", function() {
        assert.throws(function() {
            expr.createContentsExpr('Hello {{foo##bar}}!');
        }, acorn.SyntaxError);
    });
});

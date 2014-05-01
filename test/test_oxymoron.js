var chai = require('chai');
var oxymoron = require('../oxymoron');
var React = require('react');
var escodegen = require('escodegen');

var assert = chai.assert;

suite("oyxmoron", function() {
    test("createElementExpr", function() {
        var expr = oxymoron.createElementExpr('p');
        assert.equal(escodegen.generate(expr), "React.DOM.p");
    });
    test("createAttribExpr", function() {
        var expr = oxymoron.createAttribExpr({'foo': 'bar',
                                              'qux': 1});
        var expected = [
            "{",
            "    foo: 'bar',",
            "    qux: 1",
            "}"].join('\n');
        assert.equal(escodegen.generate(expr), expected);
    });
    test("createAttribExpr null", function() {
        var expr = oxymoron.createAttribExpr(null);
        assert.equal(escodegen.generate(expr), 'null');
    });
    test("createAttribExpr empty dict", function() {
        var expr = oxymoron.createAttribExpr({});
        assert.equal(escodegen.generate(expr), 'null');
    });
    test("createContentsExpr one string", function() {
        var expr = oxymoron.createContentsExpr("hello world");
        assert.equal(escodegen.generate(expr), "'hello world'");
    });
    test("createContentsExpr empty", function() {
        var expr = oxymoron.createContentsExpr('');
        assert.equal(escodegen.generate(expr), "''");
    });
    test("createContentsExpr stache", function() {
        var expr = oxymoron.createContentsExpr('Hello {{foo}}!');
        var expected = [
            "[",
            "    'Hello ',",
            "    foo,",
            "    '!'",
            "]"].join('\n');
        assert.equal(escodegen.generate(expr), expected);
    });
    test("createContentsExpr stache dotted", function() {
        var expr = oxymoron.createContentsExpr('Hello {{foo.bar}}!');
        var expected = [
            "[",
            "    'Hello ',",
            "    foo.bar,",
            "    '!'",
            "]"].join('\n');
        assert.equal(escodegen.generate(expr), expected);
    });



});

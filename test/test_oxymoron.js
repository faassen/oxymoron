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
});

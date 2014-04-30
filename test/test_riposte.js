var chai = require('chai');
var oxymoron = require('../oxymoron');
var React = require('react');

var assert = chai.assert;

suite("oyxmoron", function() {
    test("parse HTML with text", function() {
        var r = oxymoron.compile('<p>Hello world!</p>');
        assert.deepEqual(r, React.DOM.p(null, "Hello world!"));
    });
    test("parsing HTML with mixed text", function() {
        var r = oxymoron.compile('<p>Hello <strong>world</strong>!</p>');
        debugger;
        assert.deepEqual(r, React.DOM.p(null,
                                        ["Hello ",
                                         React.DOM.strong(null, "world"),
                                         "!"]));
    });
});

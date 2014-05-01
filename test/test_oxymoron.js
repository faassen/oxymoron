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
        assert.deepEqual(r, React.DOM.p(
            null,
            ["Hello ",
             React.DOM.strong(null, "world"),
             "!"]));
    });
    test("parsing HTML with attributes", function() {
        var r = oxymoron.compile('<a href="http://example.com">Example</a>');
        assert.deepEqual(r, React.DOM.a(
            {'href': 'http://example.com'},
            "Example"));
    });
    test("parsing HTML no closing tag", function() {
        var r = oxymoron.compile('<p>Hello!');
        assert.deepEqual(r, React.DOM.p(null, "Hello!"));
    });

});

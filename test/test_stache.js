"use strict";

var chai = require('chai');
var stache = require('../stache');

var assert = chai.assert;

suite("stache", function() {
    test("parse no staches", function() {
        assert.deepEqual(stache.parse("Hello world"),
                         [{type: "text",
                           value: "Hello world"}]);
    });
    test("parse one stache", function() {
        assert.deepEqual(stache.parse("Hello {{foo}}!"),
                         [{type: "text",
                           value: "Hello "},
                          {type: "stache",
                           value: "foo"},
                          {type: "text",
                           value: "!"}]);
    });
    test("parse only stache", function() {
        assert.deepEqual(stache.parse("{{foo}}"),
                         [{type: "stache",
                           value: "foo"}]);
    });
    test("parse stache open but not close", function() {
        assert.throws(function() {stache.parse("{{foo");},
                      stache.ParseError);
        assert.throws(function() {stache.parse("bar{{foo");},
                      stache.ParseError);
    });
    test("parse stache open but no rest", function() {
        assert.throws(function() {stache.parse("{{");}, stache.ParseError);
    });
    test("parse stache close but not open", function() {
        assert.deepEqual(stache.parse("foo}}bar"),
                         [{type: "text",
                           value: "foo}}bar"}]);
    });
    test("parse stache curly then close", function() {
        assert.deepEqual(stache.parse("{{foo}}}"),
                         [{type: "stache",
                           value: "foo}"}]);
    });

});

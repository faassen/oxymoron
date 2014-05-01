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

});

/* */
var htmlparser = require('htmlparser2');
var domhandler = require('domhandler');
var ElementType = require('domelementtype');
var React = require('react');
var expr = require('./expr');

var dom = React.DOM;

var parse = function(html) {
    var handler = new domhandler.DomHandler();
    var parser = new htmlparser.Parser(handler);
    parser.write(s);
    parser.end();
    return handler.dom;
};

exports.compile = function(html) {
    var dom = parse(html);
};


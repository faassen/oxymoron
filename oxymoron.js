var htmlparser = require('htmlparser2');
var DomHandler = require('domhandler');
var ElementType = require('domelementtype');
var React = require('react');
var expr = require('./expr');

var dom = React.DOM;

var parse = function(html) {
    var handler = new DomHandler(function(error) {
        // XXX no error handling yet
    });
    var parser = new htmlparser.Parser(handler);
    parser.write(html);
    parser.end();
    return handler.dom;
};

var compileChildren = function(children) {
    var result = [];
    var i;
    for (i = 0; i < children.length; i++) {
        Array.prototype.push.apply(result, compileItem(children[i]));
    }
    return result;
};

var compileItem = function(item) {
    if (item.type === 'tag') {
        return [compileElement(item)];
    } else if (item.type === 'text') {
        return compileText(item);
    }
    return null;
};

var compileElement = function(item) {
    return expr.createComponentExpr(item.name,
                                    item.attribs || null,
                                    compileChildren(item.children));
};

var compileText = function(item) {
    return expr.createTextExprArray(item.data);
};

var firstElementChild = function(children) {
    var i;
    for (i = 0; i < children.length; i++) {
        if (children[i].type === 'tag') {
            return children[i];
        }
    };
};

exports.compile = function(html) {
    var d = parse(html);
    return compileItem(firstElementChild(d))[0];
};


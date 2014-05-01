"use strict";

var htmlparser = require('htmlparser2');
var DomHandler = require('domhandler');
var ElementType = require('domelementtype');
var escodegen = require('escodegen');
var expr = require('./expr');
var parsejs = require('./parsejs');

var parse = function(html) {
    // XXX no error handling yet
    var handler = new DomHandler();
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
    if (item.type === ElementType.Tag) {
        return [compileElement(item)];
    } else if (item.type === 'text') {
        return compileText(item);
    }
    return null;
};

var compileElement = function(item) {
    var ifValue = item.attribs['if'];
    if (ifValue !== undefined) {
        delete item.attribs['if'];
        var testExpr = parsejs.parseExpr(ifValue);
        return {
            type: "ConditionalExpression",
            test: testExpr,
            consequent: compileSimpleElement(item),
            alternate: {
                type: "Literal",
                value: null
            }
        }
    }
    return compileSimpleElement(item);
};

var compileSimpleElement = function(item) {
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
    }
};

var compile = function(html) {
    var d = parse(html);
    return compileItem(firstElementChild(d))[0];
};

var func = function(args, html) {
    /* jshint evil: true */
    return new Function(args, escodegen.generate({
        type: "ReturnStatement",
        argument: compile(html)
    }));
};

module.exports = {
    compile: compile,
    func: func
};

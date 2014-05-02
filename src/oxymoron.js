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
    var repeatValue = item.attribs['repeat']; // jshint ignore:line
    var ifValue = item.attribs['if'];
    var letValue = item.attribs['let'];

    delete item.attribs['repeat']; // jshint ignore:line
    delete item.attribs['if'];
    delete item.attribs['let'];

    if (repeatValue !== undefined) {
        return compileRepeatElement(repeatValue, ifValue, item);
    }

    if (ifValue !== undefined) {
        return compileIfElement(ifValue, item);
    }

    if (letValue !== undefined) {
        return compileLetElement(letValue, item);
    }

    return compileSimpleElement(item);
};

var compileRepeatElement = function(repeatValue, ifValue, item) {
    var repeatExpr = parsejs.parseExpr(repeatValue);
    // XXX validate that this is an identifier
    var itemExpr = repeatExpr.left;
    var iteratedExpr = repeatExpr.right;
    if (ifValue !== undefined) {
        var testExpr = parsejs.parseExpr(ifValue);
        iteratedExpr = expr.createFunctionalExpr(
            'filter',
            iteratedExpr, itemExpr,
            testExpr);
    }
    return expr.createFunctionalExpr('map', iteratedExpr, itemExpr,
                                     compileSimpleElement(item));
};

var compileIfElement = function(ifValue, item) {
    var testExpr = parsejs.parseExpr(ifValue);
    return {
        type: "ConditionalExpression",
        test: testExpr,
        consequent: compileSimpleElement(item),
        alternate: {
            type: "Literal",
            value: null
        }
    };
};

var compileLetElement = function(letValue, item) {
    var letExpr = parsejs.parseExpr(letValue);
    var exprs = {};
    var i;
    var e;
    for (i = 0; i < letExpr.expressions.length; i++) {
        e = letExpr.expressions[i];
        exprs[e.left.name] = e.right;
    }
    return expr.createLetExpr(exprs, compileSimpleElement(item));
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

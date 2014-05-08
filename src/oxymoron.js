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
    var repeatValue = item.attribs['data-repeat'];
    var ifValue = item.attribs['data-if'];
    var letValue = item.attribs['data-let'];

    delete item.attribs['data-repeat'];
    delete item.attribs['data-if'];
    delete item.attribs['data-let'];

    var elementExpr = compileElementCore(item);

    if (repeatValue !== undefined) {
        return compileRepeatElement(repeatValue, ifValue, letValue,
                                    elementExpr);
    }

    if (ifValue !== undefined) {
        return compileIfElement(ifValue, letValue, elementExpr);
    }

    if (letValue !== undefined) {
        return compileLetElement(letValue, elementExpr);
    }

    return elementExpr;
};

var compileRepeatElement = function(repeatValue, ifValue, letValue,
                                    elementExpr) {
    var repeatExpr = parsejs.parseExpr(repeatValue);
    // XXX validate that this is an identifier
    var itemExpr = repeatExpr.left;
    var parameterExprs;
    var indexExpr = null;
    if (itemExpr.type === 'SequenceExpression') {
        parameterExprs = itemExpr.expressions;
    } else {
        parameterExprs = [itemExpr];
    }
    var iteratedExpr = repeatExpr.right;
    if (letValue !== undefined) {
        elementExpr = compileLetElement(letValue, elementExpr);
    }
    if (ifValue !== undefined) {
        var testExpr = parsejs.parseExpr(ifValue);
        iteratedExpr = expr.createFunctionalExpr(
            'filter',
            iteratedExpr, parameterExprs,
            testExpr);
    }
    return expr.createFunctionalExpr('map', iteratedExpr, parameterExprs,
                                     elementExpr);
};

var compileIfElement = function(ifValue, letValue, elementExpr) {
    var testExpr = parsejs.parseExpr(ifValue);
    var consequentExpr;
    if (letValue !== undefined) {
        consequentExpr = compileLetElement(letValue, elementExpr);
    } else {
        consequentExpr = elementExpr;
    }
    return {
        type: "ConditionalExpression",
        test: testExpr,
        consequent: consequentExpr,
        alternate: {
            type: "Literal",
            value: null
        }
    };
};

var compileLetElement = function(letValue, elementExpr) {
    var letExpr = parsejs.parseExpr(letValue);
    var exprs = {};
    var i;
    var e;
    if (letExpr.type === 'SequenceExpression') {
        for (i = 0; i < letExpr.expressions.length; i++) {
            e = letExpr.expressions[i];
            exprs[e.left.name] = e.right;
        }
    } else {
        // AssignmentExpression
        exprs[letExpr.left.name] = letExpr.right;
    }
    return expr.createLetExpr(exprs, elementExpr);
};

var compileElementCore = function(item) {
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
    return compileItem(firstElementChild(parse(html)))[0];
};

var funcBody = function(html) {
    return escodegen.generate({
        type: 'ReturnStatement',
        argument: compile(html)
    });
};

var func = function(args, html) {
    /* jshint evil: true */
    return new Function(args, funcBody(html));
};

module.exports = {
    compile: compile,
    funcBody: funcBody,
    func: func
};

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
    var compiled;
    for (i = 0; i < children.length; i = compiled.index) {
        compiled = compileItem(children, i);
        Array.prototype.push.apply(result, compiled.result);
    }
    return result;
};

var compileItem = function(children, index) {
    var item = children[index];
    if (item.type === ElementType.Tag) {
        return compileElement(children, index);
    } else if (item.type === 'text') {
        return {result: compileText(item), index: index + 1};
    }
    return null;
};

var compileElement = function(children, index) {
    var item = children[index];
    var repeatValue = item.attribs['data-repeat'];
    var ifValue = item.attribs['data-if'];
    var letValue = item.attribs['data-let'];

    delete item.attribs['data-repeat'];
    delete item.attribs['data-if'];
    delete item.attribs['data-let'];

    var elementExpr = compileElementCore(item);

    var elseIndex = nextElementIndex(children, index + 1);
    var elseItem = null;
    var elseElementExpr = null;
    var elseValue;
    if (elseIndex !== null) {
        elseItem = children[elseIndex];
        elseValue = elseItem.attribs['data-else'] !== undefined;
        delete elseItem.attribs['data-else'];
        if (elseValue) {
            elseElementExpr = compileElementCore(elseItem);
            index = elseIndex;
        }
    }

    if (repeatValue !== undefined) {
        return {result: [compileRepeatElement(repeatValue, ifValue, letValue,
                                              elementExpr)],
                index: index + 1};
    }

    if (ifValue !== undefined) {
        return {result: [compileIfElement(ifValue, elseValue, letValue,
                                          elementExpr, elseElementExpr)],
                index: index + 1};
    }

    if (letValue !== undefined) {
        return {result: [compileLetElement(letValue, elementExpr)],
                index: index + 1};
    }

    return {result: [elementExpr], index: index + 1};
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

var compileIfElement = function(ifValue, elseValue, letValue,
                                elementExpr, elseElementExpr) {
    var testExpr = parsejs.parseExpr(ifValue);
    var consequentExpr, alternateExpr;
    if (letValue !== undefined) {
        consequentExpr = compileLetElement(letValue, elementExpr);
    } else {
        consequentExpr = elementExpr;
    }
    if (elseValue) {
        alternateExpr = elseElementExpr;
    } else {
        alternateExpr = {
            type: "Literal",
            value: null
        }
    }
    return {
        type: "ConditionalExpression",
        test: testExpr,
        consequent: consequentExpr,
        alternate: alternateExpr
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

var nextElementIndex = function(children, index) {
    for (; index < children.length; index++) {
        if (children[index].type === ElementType.Tag) {
            return index;
        }
    }
    return null;
};

var firstElementIndex = function(children) {
    return nextElementIndex(children, 0);
};

var compile = function(html) {
    var children = parse(html);
    return compileItem(children, firstElementIndex(children)).result[0];
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

/* */
var htmlparser = require('htmlparser2');
var domhandler = require('domhandler');
var ElementType = require('domelementtype');
var acorn = require('acorn');
var React = require('react');
var stache = require('./stache');

var dom = React.DOM;

var parse = function(html) {
    var handler = new domhandler.DomHandler();
    var parser = new htmlparser.Parser(handler);
    parser.write(s);
    parser.end();
    return handler.dom;
};

exports.createComponentExpr = function(componentExpr,
                                       attribExpr,
                                       contentsExpr) {
    return {
        type: "ExpressionStatement",
        expression: {
            type: "CallExpression",
            callee: componentExpr,
            "arguments": [
                attribExpr,
                contentsExpr
            ]
        }
    };
};

exports.createElementExpr = function(elementName) {
    return {
        type: "MemberExpression",
        object: {
            type: "MemberExpression",
            object: {
                type: "Identifier",
                name: "React"
            },
            property: {
                type: "Identifier",
                name: "DOM"
            },
            computed: false
        },
        property: {
            type: "Identifier",
            name: elementName
        },
        computed: false
    };
};

var isEmpty = function(obj) {
    return Object.keys(obj).length === 0;
};

exports.createAttribExpr = function(attrib) {
    if (attrib === null || isEmpty(attrib)) {
        return {
            "type": "Literal",
            "value": null
        };
    }
    var properties = [];
    var result = {
        'type': 'ObjectExpression',
        'properties': properties
    };
    var key;
    for (key in attrib) {
        if (!attrib.hasOwnProperty(key)) {
            continue;
        }
        properties.push({
            "key": {
                type: "Identifier",
                name: key
            },
            "value": {
                type: "Literal",
                value: attrib[key],
            },
            "kind": "init"
        });
    }
    return result;
};

exports.createContentsExpr = function(s) {
    var elements = stache.parse(s).map(function(item) {
        if (item.type === 'text') {
            return {
                type: "Literal",
                value: item.value
            }
        }
        if (item.type === 'stache') {
            return acorn.parse(item.value).body[0].expression;
        }
    });
    // if there is only a single literal element, return it instead
    if (elements.length === 1) {
        if (elements[0].type === 'Literal') {
            return elements[0];
        }
    }
    return {
        type: "ArrayExpression",
        elements: elements
    }
};

exports.compile = function(html) {
    var dom = parse(html);
};


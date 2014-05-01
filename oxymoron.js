/* */
var htmlparser = require('htmlparser2');
var domhandler = require('domhandler');
var ElementType = require('domelementtype');
var acorn = require('acorn');
var React = require('react');
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

exports.createAttribExpr = function(attrib) {
    if (attrib === null) {
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
                "type": "Identifier",
                "name": key
            },
            "value": {
                "type": "Literal",
                "value": attrib[key]
            },
            "kind": "init"
        });
    }
    return result;
};

exports.createContentsExpr = function(contents) {

};

exports.compile = function(html) {
    var dom = parse(html);
};


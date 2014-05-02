"use strict";

var parsejs = require('./parsejs');
var stache = require('./stache');

var createComponentExpr = function(tag, attribs, children) {
    return {
        type: "CallExpression",
        callee: createElementExpr(tag),
        "arguments": [
            createAttribExpr(attribs),
            createContentsExpr(children)
        ]
    };
};

var createContentsExpr = function(children) {
    if (children.length === 1) {
        return children[0];
    }
    return {
        type: "ArrayExpression",
        elements: children
    };
};

var createElementExpr = function(s) {
    var js = parsejs.parseExpr(s);
    // bare identifiers become React.DOM
    if (js.type === 'Identifier') {
        return createReactDomExpr(js.name);
    }
    return js;
};


var createReactDomExpr = function(elementName) {
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

var createAttribExpr = function(attrib) {
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
            "value": createAttribValueExpr(attrib[key]),
            "kind": "init"
        });
    }
    return result;
};

var createTextExprArray = function(s) {
    return stache.parse(s).map(function(item) {
        if (item.type === 'text') {
            return {
                type: "Literal",
                value: item.value
            };
        }
        if (item.type === 'stache') {
            return parsejs.parseExpr(item.value);
        }
    });
};

var createAttribValueExpr = function(s) {
    var elements = createTextExprArray(s);
    if (elements.length === 1) {
        return elements[0];
    }
    return createAddedExpr(elements);
};

var createAddedExpr = function(elements) {
    var el = elements.pop();
    if (elements.length === 0) {
        return el;
    }
    return {
        type: "BinaryExpression",
        left: createAddedExpr(elements),
        operator: "+",
        right: el
    };
};

var createFunctionalExpr = function(funcName,
                                    iteratedExpr,
                                    funcParameterExpr,
                                    itemExpr) {
    return {
        type: "CallExpression",
        callee: {
            type: "MemberExpression",
            object: iteratedExpr,
            property: {
                type: "Identifier",
                name: funcName
            },
            computed: false
        },
        arguments: [
            {
                type: "FunctionExpression",
                id: null,
                params: [
                    funcParameterExpr,
                ],
                body: {
                    type: "BlockStatement",
                    body: [
                        {
                            type: "ReturnStatement",
                            argument: itemExpr
                        }
                    ]
                }
            }
        ]
    };
};

var createVarExpr = function(variableExprs) {
    var declarations = [];
    var key;
    for (key in variableExprs) {
        declarations.push({
            type: "VariableDeclarator",
            id: {
                type: "Identifier",
                name: key
            },
            init: variableExprs[key]
        });
    }
    return {
        type: "VariableDeclaration",
        declarations: declarations,
        kind: "var"
    };
};

var createLetExpr = function(variableExprs, expr) {
    return {
        type: "CallExpression",
        callee: {
            type: "FunctionExpression",
            id: null,
            params: [],
            body: {
                type: "BlockStatement",
                body: [
                    createVarExpr(variableExprs),
                    {
                        type: "ReturnStatement",
                        argument: expr
                    }

                ]
            }
        },
        arguments: []
    };
};

module.exports = {
    createComponentExpr: createComponentExpr,
    createElementExpr: createElementExpr,
    createReactDomExpr: createReactDomExpr,
    createAttribExpr: createAttribExpr,
    createTextExprArray: createTextExprArray,
    createAttribValueExpr: createAttribValueExpr,
    createFunctionalExpr: createFunctionalExpr,
    createVarExpr: createVarExpr,
    createLetExpr: createLetExpr
};

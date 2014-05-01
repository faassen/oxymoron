var acorn = require('acorn');
var stache = require('./stache');

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
            "value": createAttribValueExpr(attrib[key]),
            "kind": "init"
        });
    }
    return result;
};

var exprArray = function(s) {
    debugger;
    return stache.parse(s).map(function(item) {
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
}

exports.createContentsExpr = function(s) {
    var elements = exprArray(s);
    if (elements.length === 1) {
        return elements[0];
    }
    return {
        type: "ArrayExpression",
        elements: elements
    }
};

exports.createAttribValueExpr = createAttribValueExpr = function(s) {
    var elements = exprArray(s);
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
    }
};

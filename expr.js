var acorn = require('acorn');
var stache = require('./stache');

exports.createComponentExpr = function(tag, attribs, children) {
    return {
        type: "CallExpression",
        callee: createElementExpr(tag),
        "arguments": [
            createAttribExpr(attribs),
            createContentsExpr(children)
        ]
    }
};

var createContentsExpr = function(children) {
    if (children.length === 1) {
        return children[0];
    }
    return {
        type: "ArrayExpression",
        elements: children
    }
};

exports.createElementExpr = createElementExpr = function(s) {
    var js = parseJsExpr(s);
    // bare identifiers become React.DOM
    if (js.type === 'Identifier') {
        return createReactDomExpr(js.name);
    }
    return js;
};

exports.createReactDomExpr = createReactDomExpr = function(elementName) {
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

exports.createAttribExpr = createAttribExpr = function(attrib) {
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

var parseJsExpr = function(s) {
    return acorn.parse(s).body[0].expression;
};

exports.createTextExprArray = createTextExprArray = function(s) {
    return stache.parse(s).map(function(item) {
        if (item.type === 'text') {
            return {
                type: "Literal",
                value: item.value
            }
        }
        if (item.type === 'stache') {
            return parseJsExpr(item.value);
        }
    });
}

exports.createAttribValueExpr = createAttribValueExpr = function(s) {
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
    }
};

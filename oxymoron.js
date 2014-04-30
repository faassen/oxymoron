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

var DOM_EXPR = acorn.parse('React.DOM.p(null, "text")').body[0].expression;

var clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

var domExpr = function(name, attrib, contents) {
    var result = clone(DOM_EXPR);
    result.callee.property.name = name;
    result.arguments[0] = attribExpr(attrib);
    result.arguments[1] = contentsExpr(contents);
    return result;
};

var attribExpr = function(attrib) {
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
            "value" {
                "type" "Literal",
                "value": attrib[key]
            },
            "kind": "init"
        });
    }
    return result;
};

var contentsExpr = function(contents) {

};

exports.compile = function(html) {
    var dom = parse(html);
}

};


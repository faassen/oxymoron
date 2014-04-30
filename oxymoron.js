/* */
var htmlparser = require('htmlparser2');
var domhandler = require('domhandler');
var ElementType = require('domelementtype');
var React = require('react');
var dom = React.DOM;

var parse = function(html) {
    var handler = new domhandler.DomHandler();
    var parser = new htmlparser.Parser(handler);
    parser.write(s);
    parser.end();
    return handler.dom;
};


var attribExpr = function(attrib) {
    if (attrib === null) {
        return {
            "type": "Literal",
            "value": null,
        };
    }
    return {
        "type": "ObjectExpression",
        "properties": [


        ]
    }
};

var domExpr = function(name, attrib, contents) {
    return {
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "object": {
                    "type": "MemberExpression",
                    "object": {
                        "type": "Identifier",
                        "name": "React"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "DOM"
                    },
                    "computed": false
                },
                "property": {
                    "type": "Identifier",
                    "name": name
                    },
                "computed": false
            },
            "arguments": [
                {
                    "type": "Literal",
                    "value": null,
                },
                {
                    "type": "Literal",
                    "value": "Hello world!",
                    "raw": "\"Hello world!\""
                }
            ]
        }
    };
};


exports.compile = function(html) {
    var dom = parse(html);
}

};


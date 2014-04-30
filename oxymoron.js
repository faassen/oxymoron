/* */
var htmlparser = require('htmlparser2');
var React = require('react');
var dom = React.DOM;

exports.compile = function(s) {
    var topBuilt = [];
    var stack = [{built: topBuilt}];

    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs) {
            stack.push({name: name, attribs: attribs, built: []});
        },
        ontext: function(text) {
            stack[stack.length - 1].built.push(text);
        },
        onclosetag: function(tagname) {
            var top = stack.pop();
            var built = top.built;
            if (built.length == 1) {
                built = built[0];
            }
            stack[stack.length -1].built.push(
                React.DOM[top.name](top.attribs, built));
        }
    });
    parser.write(s);
    parser.end();
    // topBuilt should be 1 entry
    return topBuilt[0];
};


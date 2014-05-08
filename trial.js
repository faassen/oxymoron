var acorn = require('acorn');

//var r = acorn.parse('item in a');

var r = acorn.parse('(function(a) { })(b)')

console.log(JSON.stringify(r, undefined, 4));

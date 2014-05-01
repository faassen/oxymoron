var acorn = require('acorn');

//var r = acorn.parse('item in a');

var r = acorn.parse('(function() { return 1; })()')

console.log(JSON.stringify(r, undefined, 4));

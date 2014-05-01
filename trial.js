var acorn = require('acorn');

var r = acorn.parse('var f = function() { return "Foo"; };');

console.log(JSON.stringify(r, undefined, 4));

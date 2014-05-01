var acorn = require('acorn');

//var r = acorn.parse('item in a');

var r = acorn.parse('[1].map(function(item) { return item + 1; })');

console.log(JSON.stringify(r, undefined, 4));

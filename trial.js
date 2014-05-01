var acorn = require('acorn');

var r = acorn.parse('a ? b: null');

console.log(JSON.stringify(r, undefined, 4));

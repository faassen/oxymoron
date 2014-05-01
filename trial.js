var acorn = require('acorn');
var React = require('react');

//var JSON = require('JSON');

var r = acorn.parse('qux([Foo + Bar])');

//console.log(r);

console.log(JSON.stringify(r, undefined, 4));

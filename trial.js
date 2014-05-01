var acorn = require('acorn');
var React = require('react');

//var JSON = require('JSON');

var r = acorn.parse('[p]');

//console.log(r);

console.log(JSON.stringify(r, undefined, 4));

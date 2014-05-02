oxymoron = require('./oxymoron');
React = require('react');

var helloHtml = '<h2>Hello {{value}}!</h2>';

var hello = oxymoron.func(['React', 'value'], helloHtml);

var Comment = React.createClass({
    render: function() {
        return hello(React, this.props.value);
    }
});

React.renderComponent(
    Comment({value: "Whoah"}),
    document.getElementById('main')
);

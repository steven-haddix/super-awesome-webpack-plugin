import React from 'react';
const logo = require('url-loader!./logo.svg');
import css from 'css-loader!./test.css';
var test = require('sass-loader!./test.scss')

export default class Component extends React.Component {
    constructor() {
        super();
    }

    render() {
        return <div>{ logo }</div>
    }
}
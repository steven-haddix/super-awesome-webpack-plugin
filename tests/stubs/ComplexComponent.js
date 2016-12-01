import React from 'react';
const logo = require('url!./logo.svg');
import css from './test.css';
var test = require('./test.scss')

export default class Component extends React.Component {
    constructor() {
        super();
    }

    render() {
        return <div>{ logo }</div>
    }
}
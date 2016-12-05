import fs from 'fs';
import path from 'path';
import React from 'react'
import { Provider } from 'react-redux'
import { combineReducers } from 'redux';

import { RouterContext } from 'react-router'

export function copyObjectProperty(object, oldKey, newKey) {
    // Do nothing if the names are the same
    if (oldKey == newKey) {
        return this;
    }

    if (object.hasOwnProperty(newKey)) {
        return this;
    }

    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (object.hasOwnProperty(oldKey)) {
        object[newKey] = object[oldKey];
        //delete object[oldKey];
    }
    return this;
}

export function providerWrapper(Component, props, store) {
    return <Provider store = {store}>
        <Component {...props} />
    </Provider>
}

export function es6SafeCombineReducers(reducers) {
    const es6SafeReducers = {};

    if(typeof reducers !== 'object' || Array.isArray(reducers)) {
        throw new Error('Reducers must be an Object whose keys represent the reducers name { product: product_reducer }')
    }

    Object.keys(reducers).forEach((reducer) => {
        if(reducers.hasOwnProperty(reducer)) {
            es6SafeReducers[reducer] = es6Accessor(reducers[reducer]);
        }
    });

    return combineReducers(es6SafeReducers);
}

export function es6Accessor(object) {
    if(Array.isArray(object)) {
        return object.map(object => {
            if(hasDefault(object)) {
                return object['default'];
            }

            return object;
        })
    }

    if(hasDefault(object)) {
        return object['default']
    }

    return object;
}

export function hasDefault(object) {
    if (typeof object === 'object' && object.hasOwnProperty('default')) {
        return true;
    }

    return false;
}

export function trimSplitRight(string, delimiter, places) {
    if (typeof string !== 'string') {
        return string;
    }

    const parts = string.split(delimiter);

    if (parts === 0) {
        return parts[0];
    }

    return parts.splice(0, parts.length - places).join('/');
}

export function trimSplitLeft(string, delimiter, places) {
    if (typeof string !== 'string') {
        return string;
    }

    const parts = string.split(delimiter);

    if (parts === 0) {
        return parts[0];
    }

    return parts.splice(places, parts.length - places).join('/');
}

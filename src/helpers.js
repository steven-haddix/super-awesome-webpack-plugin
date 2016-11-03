import fs from 'fs';
import path from 'path';
import React from 'react'
import { Provider } from 'react-redux'

export function singlePageBuilder(dir, route, component) {
    let page = {};
    fs.readdirSync(dir).forEach((file) => {
        if(!/.*\.json/.test(file)) {
            return;
        }

        page = {
            page: file.replace('.json', ''),
            state: require(path.resolve(dir, file)),
            route: route,
            component
        }
    })

    return page;
}

export function multiPageBuilder(pages) {
    const stateArray = [];

    pages.forEach(page => {
        fs.readdirSync(page.dir).forEach((file) => {
            if(!/.*\.json/.test(file)) {
                return;
            }

            stateArray.push({
                page: file.replace('.json', ''),
                state: require(path.resolve(page.dir, file)),
                route: page.route,
                component: page.component
            })
        })
    })

    return stateArray;
}

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

export function providerWrapper(Component, store) {
    return <Provider store = {store}>
        <Component />
    </Provider>
}

export function findAssetName(src, compilation, webpackStatsJson) {
    var asset = compilation.assets[src];

    if (asset) {
        return src;
    }

    var chunkValue = webpackStatsJson.assetsByChunkName[src];

    if (!chunkValue) {
        return null;
    }
    // Webpack outputs an array for each chunk when using sourcemaps
    if (chunkValue instanceof Array) {
        // Is the main bundle always the first element?
        chunkValue = chunkValue[0];
    }
    return chunkValue;
}

// Shamelessly stolen from html-webpack-plugin - Thanks @ampedandwired :)
export function getAssetsFromCompilation(compilation, webpackStatsJson) {
    var assets = {};
    for (var chunk in webpackStatsJson.assetsByChunkName) {
        var chunkValue = webpackStatsJson.assetsByChunkName[chunk];

        // Webpack outputs an array for each chunk when using sourcemaps
        if (chunkValue instanceof Array) {
            // Is the main bundle always the first element?
            chunkValue = chunkValue[0];
        }

        if (compilation.options.output.publicPath) {
            chunkValue = compilation.options.output.publicPath + chunkValue;
        }
        assets[chunk] = chunkValue;
    }

    return assets;
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

function hasDefault(object) {
    if (typeof object === 'object' && object.hasOwnProperty('default')) {
        return true;
    }

    return false;
}


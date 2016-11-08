import fs from 'fs';
import path from 'path';
import React from 'react'
import { Provider } from 'react-redux'

export function generatePageConfigs(pages, baseDir, locales, isMultiPage) {
    if(isMultiPage) {
        return multiPageConfigBuilder(pages, baseDir, locales)
    }
    return singlePageConfigBuilder(pages, baseDir, locales)
}

// TODO: Add ability to ignore locale
export function singlePageConfigBuilder(page, baseDataDir, locales) {
    let pageConfig = [];
    locales.forEach((locale) => {
        const pageDataPath = path.resolve(baseDataDir, locale, page.route);

        let route = page.route.replace(/^\/|\/$/g, '');
        let appRoute = `${locale}`;

        const pathSplitter = route.lastIndexOf('/');
        if(pathSplitter > 0) {
            appRoute = `/${appRoute}/${route.substr(0, pathSplitter)}/`
        } else {
            appRoute = `/${appRoute}/`
        }

        fs.readdirSync(pageDataPath).forEach((pageDataFile) => {
            if (!/.*\.json/.test(pageDataFile)) {
                return;
            }

            pageConfig.push({
                page: pageDataFile.replace('.json', ''),
                state: require(path.resolve(pageDataPath, pageDataFile)),
                appRoute,
                indexRoute: `/${locale}/${route}/`,
                component: page.component
            })
        })
    })

    return pageConfig;
}

// TODO: Add ability to ignore locale
export function multiPageConfigBuilder(page, baseDataDir, locales) {
    const pageConfigs = [];

    locales.forEach((locale) => {
        const pageDataPath = path.resolve(baseDataDir, locale, page.route);

        fs.readdirSync(pageDataPath).forEach((pageDataFile) => {
            if (!/.*\.json/.test(pageDataFile)) {
                return;
            }

            pageConfigs.push({
                page: pageDataFile.replace('.json', ''),
                state: require(path.resolve(pageDataPath, pageDataFile)),
                appRoute: `/${locale}/${page.route}/`,
                indexRoute: `/${locale}/${page.route}/${pageDataFile.replace('.json', '')}/`,
                component: page.component
            })
        })
    })

    return pageConfigs;
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


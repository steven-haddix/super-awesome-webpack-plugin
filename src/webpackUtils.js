import path from 'path';
import webpack from 'webpack';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import _ from 'lodash'
import merge from 'webpack-merge'

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

const baseConfiguration = {
    entry: {},
    target: 'node',
    output: {
        path: path.join(process.cwd(), './.super_awesome/build'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['', '.js'],
        modulesDirectories: ['src', 'node_modules']
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel', include: path.join(process.cwd(), './tests'), query: { compact: true }},
        ]
    },
    plugins: [
        new CleanWebpackPlugin([path.join(process.cwd(), './.super_awesome/build')], {
            root: process.cwd()
        })
    ]
};

export function prepareSiteConfigurations(site) {
    const uuid = require('uuid');
    const rootKey = uuid.v4();

    const keys = {
        root: rootKey,
        index: null,
        children: {}
    };

    const configurations = [{ key: rootKey, file: site.component, path: '/'}];

    if(!site.routes) throw new Error(`No routes configured for site "${site.entry}"`);

    site.routes.forEach((route) => {
        if(!route.component || !route.path) throw new Error('Invalid route configuration. Routes must have both path and component defined');
        if(keys.children[route.path]) throw new Error(`Duplicate paths found for ${route.path}`);

        const childKey = uuid.v4();
        keys.children[route.path] = childKey;
        configurations.push({ key: childKey, file: route.component, path: route.path })
    });

    if (site.index) {
        const indexKey = uuid.v4();
        keys.index = indexKey;
        configurations.push({ key: indexKey, file: site.index.component, path: '/' })
    }

    return {
        keys,
        configurations: generateConfiguration(configurations)
    };
}


export function generateConfiguration(entries = [], configuration = {}) {
    if (typeof configuration !== 'object') {
        throw new Error('Invalid webpack configuration passed to plugin. Must be an object.')
    }

    const config = merge({}, _.cloneDeep(baseConfiguration), _.cloneDeep(configuration));

    if (!Array.isArray(entries)) {
        throw new Error('Invalid list of entries passed to static configuration generator. Likely caused by an invalid site configuration.')
    }

    entries.forEach((entry) => {
        config.entry[entry.key] = entry.file;
    })

    return config;
}

export function compileConfiguration(config) {
    return new Promise((resolve) => {
        webpack(config, function(err, stats) {
            resolve(err, stats);
        });
    })
}
import path from 'path';
import webpack from 'webpack';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import _ from 'lodash'

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
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: ['src', 'node_modules']
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel', exclude: /(node_modules|\.super_awesome)/, query: { compact: false } },
        ]
    },
    plugins: [
        new CleanWebpackPlugin([path.join(process.cwd(), './.super_awesome/build')], {
            root: process.cwd()
        })
    ]
};

export function generateConfiguration(entries) {
    if(!entries || !Array.isArray(entries)) {
        return false;
    }
    const config = _.cloneDeep(baseConfiguration);

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
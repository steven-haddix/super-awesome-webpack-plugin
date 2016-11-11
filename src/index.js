// Needed in case the configuration requires non-babel'd files
require("babel-register");

import path from 'path';
const RawSource = require('webpack-sources/lib/RawSource');
import { renderToString } from 'react-dom/server'
import { createStore } from 'redux';

import { rootRoute, matchRoute } from './routingUtils'
import { walkSync } from './fileUtils'
import { findAssetName, getAssetsFromCompilation } from './webpackUtils';
import {
    copyObjectProperty,
    providerWrapper,
    es6Accessor,
    es6SafeCombineReducers,
    trimSplitRight,
    trimSplitLeft
} from './helpers'

function SuperAwesomeWebpackPlugin(config) {
    this.config = config;
}

SuperAwesomeWebpackPlugin.prototype.apply = function(compiler) {
    const self = this;

    compiler.plugin('this-compilation', function(compilation) {
        compilation.plugin('optimize-assets', function(_, done) {
            try {
                const webpackStats = compilation.getStats();
                const webpackStatsJson = webpackStats.toJson();
                const assets = getAssetsFromCompilation(compilation, webpackStatsJson);

                const config = self.config;
                const dataDir = config.dataDir;

                const dataFiles = walkSync(dataDir, [], /.*\.json/);

                config.sites.forEach((site) => {
                    const appRoutes = [];
                    const asset = findAssetName(site.entry, compilation, webpackStatsJson);

                    if(!asset) {
                        throw new Error(`No matching webpack entry for "${site.entry}" in ${JSON.stringify(Object.keys(assets))}`);
                    }

                    const siteReducer = es6SafeCombineReducers(site.reducers);
                    const routes = rootRoute(site.component, site.routes)

                    dataFiles.map((dataFile) => {
                        const indexRoute = dataFile.replace(dataDir.replace('./', ''), '').replace('.json', '');

                        matchRoute(indexRoute, routes, (route) => {
                            if(!route) {
                                return;
                            }
                            const state = require(path.resolve(dataFile));
                            const appRoute = trimSplitRight(dataFile.replace(dataDir.replace('./', ''), ''), '/', 1);
                            const store = createStore(siteReducer, state);
                            const renderedPage = renderToString(
                                providerWrapper(es6Accessor(route.component), store)
                            );

                            const template = es6Accessor(site.template);
                            const indexAssets = {
                                html: renderedPage,
                                state: state,
                                app: `${appRoute}/${asset}`,
                                webpack: assets
                            };

                            copyObjectProperty(compilation.assets, asset, `${appRoute}/${asset}`);
                            copyObjectProperty(compilation.assets, `${asset}.map`, `${appRoute}/${asset}.map`);
                            appRoutes.push(`${appRoute}/${asset}`);

                            compilation.assets[path.join(indexRoute, 'index.html')] = new RawSource(template(indexAssets));
                        });
                    })

                    // Clean up unused assets that have been copied to other routes
                    if(!appRoutes.includes(asset)) {
                        delete compilation.assets[asset];
                        delete compilation.assets[`${asset}.map`];
                    }

                })

                done();
            } catch (err) {
                compilation.errors.push(err.stack);
                done();
            }
        });
    });
};

module.exports = SuperAwesomeWebpackPlugin;

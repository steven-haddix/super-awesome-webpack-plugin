// Needed in case the configuration requires non-babel'd files
require("babel-register");

import path from 'path';
const RawSource = require('webpack-sources/lib/RawSource');
import ReactDOMServer from 'react-dom/server';
import { createStore } from 'redux';

import {
    getAssetsFromCompilation,
    findAssetName,
    copyObjectProperty,
    providerWrapper,
    generatePageConfigs,
    es6Accessor,
    es6SafeCombineReducers
} from './helpers'

function SuperAwesomeWebpackPlugin(config) {
    this.config = config;
}

SuperAwesomeWebpackPlugin.prototype.apply = function(compiler) {
    var self = this;

    compiler.plugin('this-compilation', function(compilation) {
        compilation.plugin('optimize-assets', function(_, done) {
            var webpackStats = compilation.getStats();
            var webpackStatsJson = webpackStats.toJson();

            try {
                const assets = getAssetsFromCompilation(compilation, webpackStatsJson);

                const config = self.config;
                const locales = config.locales ? config.locales : false;
                const baseDataDir = config.baseDataDir ? config.baseDataDir : './';

                if(!config.sites || !Array.isArray(config.sites)) {
                    throw new Error(`No array of sites found in your config.`);
                }

                config.sites.forEach((site) => {
                    if(!site.entry) {
                        throw new Error('Every site config must have an entry that matches a webpack entry')
                    }

                    const assetName = findAssetName(site.entry, compilation, webpackStatsJson);
                    if(!assetName) {
                        throw new Error(`No matching webpack entry for "${site.entry}" in ${JSON.stringify(Object.keys(assets))}`);
                    }

                    if(!site.pages || !Array.isArray(site.pages)) {
                        throw new Error(`No array of pages found in your ${site.entry} site config.`);
                    }

                    if(!site.reducers) {
                        throw new Error(`No valid reducers found for site: ${site.entry}`);
                    }
                    const siteReducer = es6SafeCombineReducers(site.reducers);

                    // Used to remove abandoned assets after the copying process
                    const appRoutes = [];
                    site.pages.map((page) => {
                        const isMultiplePage = page.multiPage ? true : false;
                        const pageConfigs = generatePageConfigs(page, baseDataDir, locales, isMultiplePage)

                        pageConfigs.forEach((pageConfig) => {
                            // Copy assets from the base directory to their route
                            copyObjectProperty(compilation.assets, assetName, `${pageConfig.appRoute}${assetName}`);
                            copyObjectProperty(compilation.assets, `${assetName}.map`, `${pageConfig.appRoute}${assetName}.map`);
                            appRoutes.push(`${pageConfig.appRoute}${assetName}`);

                            const store = createStore(siteReducer, pageConfig.state);
                            const renderedPage = ReactDOMServer.renderToString(
                                providerWrapper(es6Accessor(pageConfig.component), store)
                            );

                            const template = es6Accessor(site.template);
                            const style = assets.style.replace('.js', '.css');

                            const index = template(
                                renderedPage,
                                `${pageConfig.appRoute}${assetName}`,
                                pageConfig.state,
                                assets.manifest,
                                assets.vendor,
                                style
                            );

                            const indexOutputFile = path.join(pageConfig.indexRoute, 'index.html');
                            compilation.assets[indexOutputFile] = new RawSource(index);
                        })
                    });

                    // Clean up unused assets that have been copied to other routes
                    if(!appRoutes.includes(assetName)) {
                        delete compilation.assets[assetName];
                        delete compilation.assets[`${assetName}.map`];
                    }
                })

                done(); // ;)
            } catch (err) {

                compilation.errors.push(err.stack);
                done();
            }
        });
    });
};

module.exports = SuperAwesomeWebpackPlugin;

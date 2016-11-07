// Needed in case the configuration requires non-babel'd files
require("babel-register");

import path from 'path';
import RawSource from 'webpack-sources/lib/RawSource';
import ReactDOMServer from 'react-dom/server';
import { createStore, combineReducers } from 'redux';

import {
    getAssetsFromCompilation,
    findAssetName,
    copyObjectProperty,
    providerWrapper,
    generatePageConfigs,
    es6Accessor
} from './helpers'

const superAwesomeWebpackPlugin = function(config) {
    this.config = config;
};

superAwesomeWebpackPlugin.prototype.apply = function(compiler) {
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
                    throw `No array of sites found in your config.`;
                }

                config.sites.forEach((site) => {
                    if(!site.entry) {
                        throw 'Every site config must have an entry that matches a webpack entry'
                    }

                    const assetName = findAssetName(site.entry, compilation, webpackStatsJson);
                    if(assetName) {
                        throw `No matching webpack entry found for: ${site.entry}`;
                    }

                    if(!site.pages || !Array.isArray(site.pages)) {
                        throw `No array of pages found in your ${site.entry} site config.`;
                    }

                    if(!site.reducers || !Array.isArray(site.reducers)) {
                        throw `No valid reducers found for site: ${site.entry}`;
                    }
                    const siteReducer = combineReducers(es6Accessor(site.reducers));

                    // Used to remove abandoned assets after the copying process
                    const appRoutes = [];
                    sites.pages.map((page) => {
                        const isMultiplePage = page.multiPage ? true : false;
                        const pageConfigs = generatePageConfigs(page, baseDataDir, locales, isMultiplePage)

                        pageConfigs.forEach((pageConfig) => {
                            // Copy assets from the base directory to their route
                            copyObjectProperty(compilation.assets, assetName, `${pageConfig.appRoute}/${assetName}`);
                            copyObjectProperty(compilation.assets, `${assetName}.map`, `${pageConfig.appRoute}/${assetName}.map`);
                            appRoutes.push(`${pageConfig.appRoute}/${assetName}`);

                            const store = createStore(siteReducer, pageConfig.state);
                            const renderedPage = ReactDOMServer.renderToString(
                                providerWrapper(es6Accessor(pageConfig.component), store)
                            );

                            const template = es6Accessor(config.template);
                            const style = assets.style.replace('.js', '.css');

                            const index = template(
                                renderedPage,
                                `${pageConfig.appRoute}/${assetName}`,
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

export {
    superAwesomeWebpackPlugin
}

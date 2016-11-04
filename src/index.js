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
    singlePageBuilder,
    multiPageBuilder,
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
                Object.keys(self.config).map(page => {
                    const config = self.config[page];
                    const rootReducer = combineReducers(es6Accessor(config.reducers))
                    const outputPages = config.pages;
                    const assetName = findAssetName(page, compilation, webpackStatsJson);

                    const appRoutes = [];
                    outputPages.map((outputPage) => {
                        const outPage = outputPage.page;
                        const state = outputPage.state;
                        const route = outputPage.route;
                        const component = es6Accessor(outputPage.component);

                        copyObjectProperty(compilation.assets, assetName, `${route}/${assetName}`);
                        copyObjectProperty(compilation.assets, `${assetName}.map`, `${route}/${assetName}.map`);
                        appRoutes.push(`${route}/${assetName}`);

                        // TODO: Add middleware functionality
                        const store = createStore(rootReducer, state);
                        const renderedPage = ReactDOMServer.renderToString(
                            providerWrapper(component, store)
                        );

                        const template = config.template.default;
                        const style = assets.style.replace('.js', '.css');

                        const index = template(
                            renderedPage,
                            `${route}/${assetName}`,
                            state,
                            assets.manifest,
                            assets.vendor,
                            style
                        );

                        const outputFileName = path.join(route, outPage, 'index.html');
                        compilation.assets[outputFileName] = new RawSource(index);
                    });

                    // Clean up unused assets that have been copied to other routes
                    if(!appRoutes.includes(assetName)) {
                        delete compilation.assets[assetName];
                        delete compilation.assets[`${assetName}.map`];
                    }
                });

                done(); // ;)
            } catch (err) {
                compilation.errors.push(err.stack);
                done();
            }
        });
    });
};

export {
    superAwesomeWebpackPlugin,
    singlePageBuilder,
    multiPageBuilder
}

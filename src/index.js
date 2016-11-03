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
    multiPageBuilder
} from './helpers'

const superAwesomeWebpackPlugin = function(config) {
    this.config = config;
};

// TODO: fix the way the plugin handles ES6 modules
superAwesomeWebpackPlugin.prototype.apply = function(compiler) {
    var self = this;

    compiler.plugin('this-compilation', function(compilation) {
        compilation.plugin('optimize-assets', function(_, done) {
            var webpackStats = compilation.getStats();
            var webpackStatsJson = webpackStats.toJson();

            try {
                const assets = getAssetsFromCompilation(compilation, webpackStatsJson);
                Object.keys(self.config).map(page => {
                    if(!self.config.hasOwnProperty(page)) {
                        return false;
                    }

                    const config = self.config[page];
                    const component = config.component.default;
                    const rootReducer = combineReducers(config.reducers)
                    const outputPages = config.pages;
                    const assetName = findAssetName(page, compilation, webpackStatsJson);

                    outputPages.map((outputPage) => {
                        const outPage = outputPage.page;
                        const state = outputPage.state;
                        const route = outputPage.route;

                        // TODO: Add function to cleanup unused assets
                        copyObjectProperty(compilation.assets, assetName, `${route}/${assetName}`)

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
                            assets.manifest,
                            assets.vendor,
                            style
                        )

                        const outputFileName = path.join(route, outPage, 'index.html');
                        compilation.assets[outputFileName] = new RawSource(index);
                    })
                })

                done(); // ;-)
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

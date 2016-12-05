// Needed in case the configuration requires non-babel'd files
require('babel-register')

import path from 'path';
const RawSource = require('webpack-sources/lib/RawSource');
import { renderToString } from 'react-dom/server'
import { createStore } from 'redux';
import lodash from 'lodash';

import {
    getComponent,
    match,
    browserHistory,
    RouterContext,
    createMemoryHistory
} from 'react-router'

import { rootRoute, matchRoute } from './routingUtils'
import { walkSync } from './fileUtils'
import { findAssetName, getAssetsFromCompilation, generateConfiguration, compileConfiguration } from './webpackUtils';
import {
    copyObjectProperty,
    providerWrapper,
    es6Accessor,
    es6SafeCombineReducers,
    trimSplitRight
} from './helpers'

function SuperAwesomeWebpackPlugin(config, staticWebpackConfig = {}) {
    this.config = config;
    this.staticWebpackConfig = staticWebpackConfig;
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

                const sitePromises = config.sites.map((site) => {
                    const appRoutes = [];
                    const asset = findAssetName(site.entry, compilation, webpackStatsJson);

                    if(!asset) {
                        throw new Error(`No matching webpack entry for "${site.entry}" in ${JSON.stringify(Object.keys(assets))}`);
                    }

                    const reducer = es6SafeCombineReducers(site.reducers);
                    const template = es6Accessor(site.template);

                    return self.resolveConfigComponents(lodash.cloneDeep(site)).then((siteFixed) => {
                        const routes = rootRoute(siteFixed.component, siteFixed.routes)

                        dataFiles.map((dataFile) => {
                            const indexRoute = dataFile.replace(dataDir.replace('./', ''), '').replace('.json', '');
                            const state = require(path.resolve(dataFile));
                            const appRoute = generateAppRoute(dataFile, dataDir);

                            matchRoute(indexRoute, routes, (component, error) => {
                                if(!component)
                                    throw new Error(error);

                                const renderedPage = renderPage(RouterContext, component, reducer, state);
                                const app = `${appRoute}/${asset}`;
                                const renderedIndex = template({
                                    html: renderedPage,
                                    state: state,
                                    app: app,
                                    webpack: assets
                                });

                                // TODO: Need to fix so assets are placed at minimum file directory
                                copyObjectProperty(compilation.assets, asset, app);
                                copyObjectProperty(compilation.assets, `${asset}.map`, `${app}.map`);
                                appRoutes.push(app);

                                compilation.assets[path.join(indexRoute, 'index.html')] = new RawSource(renderedIndex);
                            });
                        });
                        cleanUpAsset(appRoutes, asset, compilation);
                    });
                });

                Promise.all(sitePromises)
                    .then(() => done())
                    .catch((err) => compilation.errors.push(err.stack))
            } catch (err) {
                compilation.errors.push(err.stack);
                done();
            }
        });
    });
};

SuperAwesomeWebpackPlugin.prototype.resolveConfigComponents = function (site) {
    const uuid = require('uuid');
    const rootUUID = uuid.v4();

    const rootEntry = generateConfiguration([{ key: rootUUID, file: site.component, path: '/'}])

    return compileConfiguration(rootEntry, this.staticWebpackConfig)
        .then(() => {
            return new Promise((resolve) => {

                const component = require(path.join(process.cwd(), `.super_awesome/build/${rootUUID}.js`))
                site.component = es6Accessor(component);

                resolve()
            });
        }).then(() => {
            const entries = [];

            if(!site.routes) throw new Error(`No routes configured for site "${site.entry}"`);

            site.routes.forEach((route) => {
                if(!route.component || !route.path)
                    throw new Error('Invalid route configuration. Routes must have both path and component defined');
                entries.push({ key: uuid.v4(), file: route.component, path: route.path })
            });

            const entriesConfig = generateConfiguration(entries);
            return compileConfiguration(entriesConfig, this.staticWebpackConfig).then(() => {
                return new Promise((resolve) => {
                    entries.forEach((entry) => {
                        site.routes.forEach((route) => {
                            if(route.path === entry.path) {
                                const component = require(path.join(process.cwd(), `.super_awesome/build/${entry.key}.js`))
                                route.component = es6Accessor(component)
                            }
                        })
                    });

                    resolve(site);
                })
            })
        })
};

function generateAppRoute(file, base) {
    return trimSplitRight(file.replace(base.replace('./', ''), ''), '/', 1);
}

function renderPage(component, props, reducer,  state) {
    const store = createStore(reducer, state);
    return renderToString(
        providerWrapper(component, props, store)
    );
}

function cleanUpAsset(appRoutes, asset, compilation) {
    // Clean up unused assets that have been copied to other routes
    if(!appRoutes.includes(asset)) {
        delete compilation.assets[asset];
        delete compilation.assets[`${asset}.map`];
    }
}

module.exports = SuperAwesomeWebpackPlugin;

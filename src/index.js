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
import {
    findAssetName,
    getAssetsFromCompilation,
    generateConfiguration,
    compileConfiguration,
    prepareSiteConfigurations
} from './webpackUtils';

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
        self.compilation = compilation
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
                        try {
                            const routes = rootRoute(siteFixed.component, siteFixed.routes, siteFixed.index)

                            dataFiles.map((dataFile) => {
                                let fileRoute = dataFile.replace(dataDir.replace('./', ''), '').replace('.json', '');
                                const state = require(path.resolve(dataFile));

                                // TODO: find a better solution for handling index routes
                                if (fileRoute === '/index') {
                                    fileRoute = '/'
                                }

                                matchRoute(fileRoute, routes, (component, error) => {
                                    try {
                                        if (!component)
                                            throw new Error(`Error matching route ${fileRoute}`, error);

                                        let renderedPage  = renderPage(RouterContext, component, reducer, state);

                                        const renderedIndex = template({
                                            html: renderedPage,
                                            state: state,
                                            app: asset,
                                            webpack: assets
                                        });

                                        self.addCompilationAsset({
                                            key: path.join(fileRoute, 'index.html'),
                                            value: new RawSource(renderedIndex)
                                        })
                                    } catch(err) {
                                        self.handleError(err.stack);
                                    }
                                });
                            });
                        } catch(err) {
                            self.handleError(err.stack);
                        }
                    });
                });

                Promise.all(sitePromises)
                    .then(() => done())
                    .catch((err) =>{
                        self.handleError(err.stack);
                        done();
                    })
            } catch (err) {
                self.handleError(err.stack);
                done();
            }
        });
    });

    compiler.plugin('done', function(stats) {

    })
};

SuperAwesomeWebpackPlugin.prototype.handleError = function(err) {
    this.compilation.errors.push(err)
}

SuperAwesomeWebpackPlugin.prototype.resolveConfigComponents = function (site) {
    const preparedConfigurations = prepareSiteConfigurations(site, this.staticWebpackConfig);

    return compileConfiguration(preparedConfigurations.configurations).then((err, stat) => {
        if(err) {
            Promise.reject(err)
        }

        const component = require(path.join(process.cwd(), `.super_awesome/build/${preparedConfigurations.keys.root}.js`))
        site.component = es6Accessor(component);

        if(preparedConfigurations.keys.index) {
            const component = require(path.join(process.cwd(), `.super_awesome/build/${preparedConfigurations.keys.index}.js`))
            site.index = es6Accessor(component);
        }

        site.routes.forEach((route) => {
            if(!preparedConfigurations.keys.children[route.path]) {
                throw new Error('Route found with no matching statically generated bundle.', route)
            }

            const key = preparedConfigurations.keys.children[route.path]
            const component = require(path.join(process.cwd(), `.super_awesome/build/${key}.js`))
            route.component = es6Accessor(component)
        });

        return Promise.resolve(site);
    })
};

SuperAwesomeWebpackPlugin.prototype.addCompilationAsset = function (asset) {
    cleanAsset(asset)
    this.compilation.assets[asset.key] = asset.value;
}

function cleanAsset(asset) {
    asset.key = asset.key.replace(/^\/|\.\//g, '')
}

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

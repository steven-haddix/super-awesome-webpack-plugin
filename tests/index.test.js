import test from 'tape';
import React from 'react'
var proxyquire = require('proxyquire');

// TODO: Refactor to be more modular and have better acceptance criteria
test('should handle configuration files properly', (t) => {
    const component = class Product extends React.Component {
        constructor() {
            super();
        }

        render() {
            return <div></div>
        }
    }

    const staticConfig = {
        dataDir: './tests/fakeDirectory',
        sites: [
            {
                entry: 'main',
                component: component,
                template: function(assets) {
                    return {
                        html: '',
                        app: assets.app,
                        state: assets.state,
                        manifest: assets.webpack.manifest,
                        vendor: assets.webpack.vendor,
                        style: assets.webpack.style.replace('js', 'css')
                    }
                },
                routes: [
                    { path: '/*/fake1', component: component },
                    { path: '/*/fake2', component: component },
                    { path: '/**/fake', component: component }

                ],
                reducers: { content: function() {
                    return []
                }}
            }
        ]
    };

    const SuperAwesomeWebpackPlugin = proxyquire('../src/index', {
        'webpack-sources/lib/RawSource': function(value) {
            return value;
        },
        './webpackUtils': {
            findAssetName: function() {
                return 'main.js'
            },
            getAssetsFromCompilation: function() {
                return {
                    main: 'main.js',
                    style: 'style.js',
                    manifest: 'manifest.js',
                    vendor: 'vendor.js'
                }
            },
        },
        './helpers': {
            generatePageConfigs: function() {
                return [
                    {
                        page: 'test/home',
                        state: { content: '123' },
                        appRoute: '/en_US/test/',
                        indexRoute: '/en_US/test/home/',
                        component: component
                    },
                    {
                        page: 'test/home',
                        state: { content: '123' },
                        appRoute: '/es_US/test/',
                        indexRoute: '/es_US/test/home/',
                        component: component
                    },
                ]
            },
            copyObjectProperty: function() {
                return true;
            }
        }
    });

    const plugin = new SuperAwesomeWebpackPlugin(staticConfig);
    plugin.apply({
        plugin: function(event, callback) {
            if(event === 'this-compilation') {
                const errors = [];
                const assets = {};
                callback({
                    plugin: (event, callback) => {
                        if(event === 'optimize-assets') {
                            callback({}, () => {
                                t.deepEqual(assets,  {
                                    'tests/fakeDirectory/fake/index.html': {
                                        app: 'tests/fakeDirectory/main.js',
                                        html: '',
                                        manifest: 'manifest.js',
                                        state: {
                                            content: {}
                                        },
                                        style: 'style.css',
                                        vendor: 'vendor.js'
                                    },
                                    'tests/fakeDirectory/fakeSubDirectory/fake1/index.html': {
                                        app: 'tests/fakeDirectory/fakeSubDirectory/main.js',
                                        html: '',
                                        manifest: 'manifest.js',
                                        state: {
                                            content: {}
                                        },
                                        style: 'style.css',
                                        vendor: 'vendor.js'
                                    },
                                    'tests/fakeDirectory/fakeSubDirectory/fake2/index.html': {
                                        app: 'tests/fakeDirectory/fakeSubDirectory/main.js',
                                        html: '',
                                        manifest: 'manifest.js',
                                        state: {
                                            content: {}
                                        },
                                        style: 'style.css',
                                        vendor: 'vendor.js'
                                    }
                                });

                                t.end()
                            })
                        }
                    },
                    getStats: function() {
                        return {
                            toJson: function() {
                                return '';
                            }
                        }
                    },
                    errors,
                    assets
                })
            }
        }
    })
})

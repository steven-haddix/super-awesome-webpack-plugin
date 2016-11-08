import test from 'tape';
import React from 'react'
var proxyquire = require('proxyquire');

// TODO: Refactor to be more modular and have better acceptance criteria
test('should handle configuration files properly', (t) => {
    const component = class Category extends React.Component {
        constructor() {
            super();
        }

        render() {
            return <div></div>
        }
    }

    const staticConfig = {
        baseDataDir: './data',
        locales: ['en_US', 'es_US'],
        sites: [
            {
                entry: 'main',
                template: function(html, app, state, manifest, vendor, style) {
                    return { html: '', app, state, manifest, vendor, style }
                },
                pages: [
                    { route: 'home', component: function() {} },
                    { route: 'explore', component: function() {} }
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
        './helpers': {
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
                                    '/en_US/test/home/index.html': {
                                        app: '/en_US/test/main.js',
                                        html: '',
                                        manifest: 'manifest.js',
                                        state: { content: '123' },
                                        style: 'style.css',
                                        vendor: 'vendor.js'
                                    },
                                    '/es_US/test/home/index.html': {
                                        app: '/es_US/test/main.js',
                                        html: '',
                                        manifest: 'manifest.js',
                                        state: { content: '123' },
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

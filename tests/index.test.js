import test from 'tape';
import blueTape from 'blue-tape';
import React from 'react'
var proxyquire = require('proxyquire');


// TODO: Refactor to be more modular and have better acceptance criteria
test('should handle configuration files properly', (t) => {

    const staticConfig = {
        dataDir: './tests/fakeDirectory',
        sites: [
            {
                entry: 'main',
                component: './tests/stubs/Component.stub.js',
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
                    { path: '/*/fake1', component: './tests/stubs/Component.stub.js' },
                    { path: '/*/fake2', component: './tests/stubs/Component.stub.js' },
                    { path: '/fake', component: './tests/stubs/Component.stub.js' }

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
                                    'fake/index.html': {
                                        app: '/main.js',
                                        html: '',
                                        manifest: 'manifest.js',
                                        state: {
                                            content: {}
                                        },
                                        style: 'style.css',
                                        vendor: 'vendor.js'
                                    },
                                    'fakeSubDirectory/fake1/index.html': {
                                        app: '/main.js',
                                        html: '',
                                        manifest: 'manifest.js',
                                        state: {
                                            content: {}
                                        },
                                        style: 'style.css',
                                        vendor: 'vendor.js'
                                    },
                                    'fakeSubDirectory/fake2/index.html': {
                                        app: '/main.js',
                                        html: '',
                                        manifest: 'manifest.js',
                                        state: {
                                            content: {}
                                        },
                                        style: 'style.css',
                                        vendor: 'vendor.js'
                                    },
                                    'index.html': {
                                        app: '/main.js',
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

blueTape('resolveConfigComponents', (t) => new Promise((resolve) => {
    const siteConfig = {
        component: './tests/stubs/Component.stub.js',
        index: {  component: './tests/stubs/Component.stub.js' },
        routes: [
            { path: '/*/fake1', component: './tests/stubs/Component.stub.js' },
            { path: '/*/fake2', component: './tests/stubs/Component.stub.js' },
            { path: '/fake', component: './tests/stubs/Component.stub.js' }
        ]
    };

    const superAwesome = new (require('../src/index'))()
    superAwesome.resolveConfigComponents(siteConfig).then(() => {
        t.ok(siteConfig, 'should update site config with webpack components')
        resolve()
    }).catch((err) => {
        console.log(err)
        resolve()
    })
}))

import test from 'tape';
import {
    multiPageConfigBuilder,
    es6Accessor
} from '../src/helpers';
var proxyquire = require('proxyquire');

test('build single page configurations', (t) => {
    const helpers = proxyquire('../src/helpers', {
        'fs': {
            readdirSync: function (path) {
                return [
                    'explore.json'
                ]
            }
        },
        'path': {
            resolve: function(path) {
                return '../tests/state.stub.js'
            }
        }
    });

    const page = {
        route: 'explore',
        component: { test: '123' }
    };

    const pageConfigs = helpers.singlePageConfigBuilder(page, './data', ['en_US', 'es_US'])

    t.deepEqual(pageConfigs,
        [
            {
                page: 'explore',
                state: { test: '123' },
                appRoute: '/en_US/',
                indexRoute: '/en_US/explore/',
                component: { test: '123' }
            },
            {
                page: 'explore',
                state: { test: '123' },
                appRoute: '/es_US/',
                indexRoute: '/es_US/explore/',
                component: { test: '123' }
            },
        ]);

    t.end();
});

test('build single page configurations', (t) => {
    const helpers = proxyquire('../src/helpers', {
        'fs': {
            readdirSync: function (path) {
                return [
                    'test/explore.json'
                ]
            }
        },
        'path': {
            resolve: function(path) {
                return '../tests/state.stub.js'
            }
        }
    });

    const page = {
        route: '/test/explore/',
        component: { test: '123' }
    };

    const pageConfigs = helpers.singlePageConfigBuilder(page, './data', ['en_US', 'es_US'])

    t.deepEqual(pageConfigs,
        [
            {
                page: 'test/explore',
                state: { test: '123' },
                appRoute: '/en_US/test/',
                indexRoute: '/en_US/test/explore/',
                component: { test: '123' }
            },
            {
                page: 'test/explore',
                state: { test: '123' },
                appRoute: '/es_US/test/',
                indexRoute: '/es_US/test/explore/',
                component: { test: '123' }
            },
        ]);

    t.end();
});

test('build multi page configurations', (t) => {
    const helpers = proxyquire('../src/helpers', {
        'fs': {
            readdirSync: function (path) {
                return [
                    '4-for-4-meal.json',
                    'bakery.json',
                ]
            }
        },
        'path': {
            resolve: function(path) {
                return '../tests/state.stub.js'
            }
        }
    });

    const page = {
        route: 'menu/category',
        component: { test: '123' }
    };

    const pageConfigs = helpers.multiPageConfigBuilder(page, './data', ['en_US', 'es_US'])

    t.deepEqual(pageConfigs,
    [
        {
            page: '4-for-4-meal',
            state: { test: '123' },
            appRoute: '/en_US/menu/category/',
            indexRoute: '/en_US/menu/category/4-for-4-meal/',
            component: { test: '123' }
        },
        {
            page: 'bakery',
            state: { test: '123' },
            appRoute: '/en_US/menu/category/',
            indexRoute: '/en_US/menu/category/bakery/',
            component: { test: '123' }
        },
        {
            page: '4-for-4-meal',
            state: { test: '123' },
            appRoute: '/es_US/menu/category/',
            indexRoute: '/es_US/menu/category/4-for-4-meal/',
            component: { test: '123' }
        },
        {
            page: 'bakery',
            state: { test: '123' },
            appRoute: '/es_US/menu/category/',
            indexRoute: '/es_US/menu/category/bakery/',
            component: { test: '123' }
        }
    ]);

    t.end();
});


test('properly access es6 default objects', (t) => {
    const es6Object = {
        default: function() {
            return '123'
        }
    }
    t.equal(es6Accessor(es6Object)(), '123', 'outcome equals 123');
    t.end();
});

test('properly access es6 default objects', (t) => {
    const es6Object = { test: '123' }
    t.deepEqual(es6Accessor(es6Object), { test: '123' }, 'outcome equals { test: 123 }');
    t.end();
});
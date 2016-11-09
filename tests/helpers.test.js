import test from 'tape';
import {
    copyObjectProperty,
    es6Accessor,
    es6SafeCombineReducers,
    hasDefault
} from '../src/helpers';
import { combineReducers } from 'redux';
var proxyquire = require('proxyquire');

test('singlePageConfigBuilder', (t) => {
    const helpers = proxyquire('../src/helpers', {
        'fs': {
            readdirSync: function (path) {
                return [
                    'home.json'
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
        route: 'home',
        component: { test: '123' }
    };

    const pageConfigs = helpers.singlePageConfigBuilder(page, './data', ['en_US', 'es_US'])

    t.deepEqual(pageConfigs,
        [
            {
                page: 'home',
                state: { test: '123' },
                appRoute: '/en_US/',
                indexRoute: '/en_US/home/',
                component: { test: '123' }
            },
            {
                page: 'home',
                state: { test: '123' },
                appRoute: '/es_US/',
                indexRoute: '/es_US/home/',
                component: { test: '123' }
            },
        ], 'should match expected configuration output with no nested paths');

    t.end();
});

test('singlePageConfigBuilder', (t) => {
    const helpers = proxyquire('../src/helpers', {
        'fs': {
            readdirSync: function (path) {
                return [
                    'test/home.json'
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
        route: '/test/home/',
        component: { test: '123' }
    };

    const pageConfigs = helpers.singlePageConfigBuilder(page, './data', ['en_US', 'es_US'])

    t.deepEqual(pageConfigs,
        [
            {
                page: 'test/home',
                state: { test: '123' },
                appRoute: '/en_US/test/',
                indexRoute: '/en_US/test/home/',
                component: { test: '123' }
            },
            {
                page: 'test/home',
                state: { test: '123' },
                appRoute: '/es_US/test/',
                indexRoute: '/es_US/test/home/',
                component: { test: '123' }
            },
        ], 'should match expected configuration output with nested paths');

    t.end();
});

test('multiPageConfigBuilder', (t) => {
    const helpers = proxyquire('../src/helpers', {
        'fs': {
            readdirSync: function (path) {
                return [
                    'product1.json',
                    'product2.json',
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
        route: '/product',
        component: { test: '123' }
    };

    const pageConfigs = helpers.multiPageConfigBuilder(page, './data', ['en_US', 'es_US'])

    t.deepEqual(pageConfigs,
    [
        {
            page: 'product1',
            state: { test: '123' },
            appRoute: '/en_US/product/',
            indexRoute: '/en_US/product/product1/',
            component: { test: '123' }
        },
        {
            page: 'product2',
            state: { test: '123' },
            appRoute: '/en_US/product/',
            indexRoute: '/en_US/product/product2/',
            component: { test: '123' }
        },
        {
            page: 'product1',
            state: { test: '123' },
            appRoute: '/es_US/product/',
            indexRoute: '/es_US/product/product1/',
            component: { test: '123' }
        },
        {
            page: 'product2',
            state: { test: '123' },
            appRoute: '/es_US/product/',
            indexRoute: '/es_US/product/product2/',
            component: { test: '123' }
        }
    ], 'should match expected configuration output');

    t.end();
});

test('es6Accessor', (t) => {
    const es6Object = {
        default: function() {
            return '123'
        }
    }

    t.plan(3)

    t.equal(es6Accessor(es6Object)(), '123', 'should return the "default" value function');
    t.deepEqual(es6Accessor([es6Object])[0](), '123', 'should handle an array of es6 objects');

    const nonEs6Object = { test: '123' }

    t.deepEqual(es6Accessor(nonEs6Object), { test: '123' }, 'should handle non-es6 objects');


    t.end();
});

test('copyObjectProperty', (t) => {
    t.plan(3);

    const object1 = {
        test1: {
            property: 'test'
        }
    }

    copyObjectProperty(object1, 'test1', 'test2')

    t.deepEqual(object1, {
        test1: {
            property: 'test'
        },
        test2: {
            property: 'test'
        }
    }, 'should deep equal an object with the original keys plus the copied key')

    const object2 = { test1: 'test1' }
    copyObjectProperty(object2, 'test1', 'test1')
    t.deepEqual(object2, object2, 'should not change original object if new key matches old key')

    const object3 = { test1: 'test1', test2: 'test2' }
    copyObjectProperty(object3, 'test1', 'test2')
    t.deepEqual(object3, object3, 'should not change original object if new key matches an existing key')

    t.end();
})

test('hasDefault', (t) => {
    const es6object = { default: () => {} }
    const nonEs6object = () => {}
    t.plan(2)
    t.equal(hasDefault(es6object), true, 'should return true if object has a "default" key.')
    t.equal(hasDefault(nonEs6object), false, 'should return false if object DOES NOT have a "default" key.')

    t.end();
})

test('es6SafeCombineReducers', (t) => {
    const helpers = proxyquire('../src/helpers', {
        redux: {
            combineReducers: function(object) {
                return object;
            }
        }
    });

    const reducer1es6 = {
        default: function reducer1() {}
    }

    const reducer2es6 = {
        default: function reducer2() {}
    }

    const reducer1 = function reducer1() {};
    const reducer2 = function reducer2() {};

    t.plan(2);

    t.deepEqual(
        helpers.es6SafeCombineReducers({ reducer1, reducer2 }), { reducer1, reducer2 },
        'function output should match input minus "default" wrappers'
    );
    t.throws(() => helpers.es6SafeCombineReducers([]), 'should throw error if in is an array');
    t.end();
})

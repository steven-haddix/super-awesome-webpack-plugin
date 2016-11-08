import test from 'tape';
import {
    copyObjectProperty,
    es6Accessor,
    hasDefault
} from '../src/helpers';
var proxyquire = require('proxyquire');

test('build single page configurations', (t) => {
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
        ]);

    t.end();
});

test('build single page nested configurations', (t) => {
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
        ]);

    t.end();
});

test('build multi page configurations', (t) => {
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

test('properly access objects if not es6 objects', (t) => {
    const es6Object = { test: '123' }
    t.deepEqual(es6Accessor(es6Object), { test: '123' }, 'outcome equals { test: 123 }');
    t.end();
});

test('properly access an array of es6 objects', (t) => {
    const es6Object = {
        default: function() {
            return '123'
        }
    }

    t.deepEqual(es6Accessor([es6Object])[0](), '123', 'outcome equals { test: 123 }');
    t.end();
});

test('copy object properties', (t) => {
    const object = {
        test1: {
            property: 'test'
        }
    }

    copyObjectProperty(object, 'test1', 'test2')

    t.deepEqual(object, {
        test1: {
            property: 'test'
        },
        test2: {
            property: 'test'
        }
    })

    t.end();
})

test('returns true if object has default property', (t) => {
    const object = {
        default: function() {}
    }

    t.equal(hasDefault(object), true)
    t.end();
})

test('returns false if object has no default property', (t) => {
    const object = {
        default: function() {}
    }

    t.equal(hasDefault(object), true)
    t.end();
})
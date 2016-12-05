import tape from 'tape';
import blueTape from 'blue-tape';
import { matchRoute, createRoute, rootRoute } from '../src/routingUtils';

tape('rootRoute', (t) => {
    t.deepEqual(
        rootRoute({}, [{ path: '/path', component: {}}]),
        { childRoutes: [ { component: {}, path: '/', childRoutes: [{ path: '/path', component: {}}] }] },
        'should generate a route with a child array'
    )

    t.deepEqual(
        rootRoute({}),
        { childRoutes: [ { component: {}, path: '/' }] },
        'should generate a route without a child array if none are provided'
    )
    t.end();
})

tape('createRoute', (t) => {
    t.deepEqual(createRoute('/', {}, []), { childRoutes: [], component: {}, path: '/' }, 'should generate a route with a child array' )
    t.deepEqual(createRoute('/', {}), { component: {}, path: '/' }, 'should generate a route without a childRoutes attribute if no childRoutes are provided' )
    t.throws(() => createRoute({}, {}),'should throw error if invalid type is provided for path' )

    t.end();
})

blueTape('matchRoute', (t) => new Promise(resolve => {
    const Component = require('./stubs/Component.stub');
    const routes = {
        childRoutes: [createRoute(
            '/',
            Component,
            [
                createRoute('/**/product/*', Component.default),
                createRoute('/**/test', Component)
            ]
        )]
    };

    const match = matchRoute('/en_US/product/product1', routes, (match) => {
        t.deepEqual('/en_US/product/product1', match.location.pathname, 'should return a matching route dynamically');
        resolve()
    })
}));

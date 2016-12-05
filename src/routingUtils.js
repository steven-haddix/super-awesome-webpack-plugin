import React from 'react'
import { renderToString } from 'react-dom/server'
import {
    getComponent,
    match,
    browserHistory,
    RouterContext,
    createMemoryHistory
} from 'react-router'

export function rootRoute(component, childRoutes) {
    return {
        childRoutes: [createRoute('/', component, children(childRoutes))]
    }
}

export function children(routes) {
    if (!Array.isArray(routes)) {
        return null;
    }
    return routes.map(route => createRoute(route.path, route.component))
}

export function createRoute(path, component, childRoutes) {

    if (typeof path !== 'string' || (childRoutes && !Array.isArray(childRoutes))) {
        throw new Error(`Route found with an invalid path type. Should be string.`)
    }

    const route = {
        path,
        component
    };

    if(childRoutes) {
        route.childRoutes = childRoutes;
    }

    return route
}

export function matchRoute(route, routes, callback) {
    try {
        const history = createMemoryHistory();
        const location = history.createLocation(route);

        match({routes, location}, (error, redirectLocation, renderProps) => {
            if (error) {
                callback(null, error);
            } else if (renderProps) {
                callback(renderProps);
            } else {
                callback(null);
            }
        })
    } catch(err) {
        console.log(err)
    }
}
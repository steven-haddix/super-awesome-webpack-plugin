[![Build Status](https://travis-ci.org/steven-haddix/super-awesome-webpack-plugin.svg?branch=master)](https://travis-ci.org/steven-haddix/super-awesome-webpack-plugin)
[![Coverage Status](https://coveralls.io/repos/github/steven-haddix/super-awesome-webpack-plugin/badge.svg?branch=master)](https://coveralls.io/github/steven-haddix/super-awesome-webpack-plugin?branch=master)
[![dependencies Status](https://david-dm.org/steven-haddix/super-awesome-webpack-plugin/status.svg)](https://david-dm.org/steven-haddix/super-awesome-webpack-plugin)

# Super Awesome Webpack Plugin
A slightly opinionated Webpack plugin for generating static websites using React, React Router & Redux.

## Requirements
Currently only tested on node v6.3.1

## Install
```bash
npm install --save-dev super-awesome-webpack-plugin
```

## Setup


### webpack.config.js
Require plugin & build config
```javascript
const SuperAwesomeWebpackPlugin = require('super-awesome-webpack-plugin');
const staticBuildConfig = require('./static.config');
```
Each site entry be matched to the sites build entries and added to its index.html
```javascript
entry: {
    // site entry
    home: path.join(__dirname, 'src/js/sites/order/home.js'),
    // site entry
    product: path.join(__dirname, 'src/js/sites/order/product.js'),
    // style asset referenced by index.html's
    style: path.join(__dirname, 'src/less', 'styles.less'),
    // vendor chunked .js asset referenced by index.html's
    vendor: Object.keys(require('./package.json').dependencies)
}
```
New up the plugin and add it to the plugin array. The first parameter is the site configuration and the second parameter
takes a webpack configuration object (everything in the site configuration is ran through webpack).
```javascript

plugins: [

    new webpack.optimize.CommonsChunkPlugin({
        // These will be output as assets.webpack.vendor and assets.webpack.manifest in the template
        names: ['vendor', 'manifest'],
        minChunks: Infinity
    })
    new SuperAwesomeWebpackPlugin(buildConfig, {})
]
```
## Example Configuration

### Example configuration file
```javascript
/**
 * Template used to generate index.html files. See example below.
 */
const template = require('./template');

// Reducers
const product_reducer = require('./src/js/redux/reducers/product');
const content_reducer = require('./src/js/redux/reducers/content');

const staticConfig = {
  dataDir: './data',
  sites: [
    {
        // All pages under this site will share this entry, template, and reducers
        entry: 'main',
        template,
        component: './src/js/components/pages/Wrapper', // wrapper component that wraps each route component
        pages: [
            /**
             * Pages dictate what index.html's get created. Each page must have a matching
             * .JSON file at /[dataDir]/[route].
             *
             * NOTE: If you use multiple pages per entry you will need to use something like react-router
             * to properly serve the correct page in the client.
             *
             * This site will generate four pages.
             * - /en_US/home/index.html
             * - /es_US/home/index.html
             * - /en_US/explore/index.html
             * - /es_US/explore/index.html
             */
            { route: '/*/home', component: './src/js/components/pages/Home' },
            { route: '/*/explore', component: './src/js/components/pages/Explore' }
        ],
        reducers: { content: content_reducer }
    },
    {
      entry: 'product',
      template,
      component: layout_component,
      pages: [
        { route: '/*/menu/product/*', component: './src/js/components/pages/Product'},
      ],
      reducers: { product: product_reducer, content: content_reducer }
    }
  ]
};
```
### Example Data Directory
```javascript
/data
    /en_US
        home.json // /en_US/home/index.html
        explore.json // /en_US/explore/index.html
        /products
            product_1.json // /en_US/products/product_1/index.html
            product_2.json // /en_US/products/product_2/index.html
            product_3.json // /en_US/products/product_3/index.html
    /en_US
        home.json // /es_US/home/index.html
        explore.json // /es_US/explore/index.html
        /products
            product_1.json // /es_US/products/product_1/index.html
            product_2.json // /es_US/products/product_2/index.html
            product_3.json // /es_US/products/product_3/index.html
```
### Example Template File
```javascript
/**
 * Template must be a function that accepts a single configuration and returns a string.
 * assets = {
 *  html: <rendered html page>,
 *  state: <state object>,
 *  app: <path to js file>,
 *  webpack: {<all assets generated during webpack bundling>}
 * }
 *
 **/
export default function (assets) {
    return `
    <html lang="en">
        <head>
            <title>My Store</title>
            <script>
                window.__data = ${JSON.stringify(assets.state)};
            </script>
        </head>
        <link rel="stylesheet" type="text/css" href="/${assets.webpack.style.replace('js', 'css')}" />
        <body id="body">
            <div id="app">
                ${assets.html}
            </div>
            <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
            <script src="/${assets.webpack.manifest}"></script>
            <script src="/${assets.webpack.vendor}"></script>
            <script src="${assets.app}"></script>
        </body>
    </html>
    `
}
```

## TODO
## Project
- Create example site
- ~~Tests & coverage reports~~

### Core
- ~~Handle ES6 modules more seamlessly~~
- Add ability to define asset-to-template mapping.
- ~~Integrate with react-router for configuration field mapping~~
- ~~Test/add webpack-dev-server support~~
- ~~Change template to accept generic objects~~
- ~~Locale needs to be handled better.~~
- Abstract state management so users have more flexibility.

### Page Builders
- ~~Base paths for data directories~~
- ~~Support localization in builder functions to reduce configuration noise (Partially complete)~~
- Validation around configuration (Partially complete)
- ~~Remove multiPage flag in favor of a better architecture~~
# super-awesome-webpack-plugin-example-site

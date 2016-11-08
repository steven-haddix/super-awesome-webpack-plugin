[![Build Status](https://travis-ci.org/steven-haddix/super-awesome-webpack-plugin.svg?branch=master)](https://travis-ci.org/steven-haddix/super-awesome-webpack-plugin)[![Coverage Status](https://coveralls.io/repos/github/steven-haddix/super-awesome-webpack-plugin/badge.svg)](https://coveralls.io/github/steven-haddix/super-awesome-webpack-plugin)

# Super Awesome Webpack Plugin
An opinionated Webpack plugin for generating static websites using React and Redux.

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
Each entry will be use
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
New up the plugin and add it to the plugin array
```javascript

plugins: [
    // The plugin supports chunk loading, but is currently hardcoded for vendor and manifest file only.
    new webpack.optimize.CommonsChunkPlugin({
        // Must be 'vendor', must be 'manifest'
        names: ['vendor', 'manifest'],
        minChunks: Infinity
    })
    new SuperAwesomeWebpackPlugin(buildConfig)
]
```
## Example Confguration

### Example configuration file
```javascript
/**
 * Template used to generate index.html files.
 * Must be a function that takes the following parameters and returns a string
 * function (html, app, state, manifest, vendor, css) {
 *      return '';
 * }
 */
const template = require('./template');

// Components
const home_component = require('./src/js/pages/Home');
const explore_component = require('./src/js/pages/Explore');
const category_component = require('./src/js/pages/Category');

// Reducers
const categories_reducer = require('./src/js/redux/reducers/categories');
const category_reducer = require('./src/js/redux/reducers/category');
const content_reducer = require('./src/js/redux/reducers/content');


const staticConfig = {
  baseDataDir: './data',
  // Adding locales will cause the pages to be multiplied for each locale.
  locales: ['en_US', 'es_US'],
  sites: [
    {
        // All pages under this site will share this entry, template, and reducers
        entry: 'main',
        template,
        pages: [
            /**
             * Pages dictate what index.html's get created. Each page must have a matching
             * .JSON fiele at /[baseDataDir]/[route]
             *
             * This site will generate four pages.
             * - /en_US/home/index.html
             * - /es_US/home/index.html
             * - /en_US/explore/index.html
             * - /es_US/explore/index.html
             */
            { route: 'home', component: home_component },
            { route: 'explore', component: explore_component }
        ],
        reducers: [ content_reducer ]
    },
    {
      entry: 'product',
      template,
      pages: [
        /**
         * multiPage configurations allow you to generate an index.html for each
         * JSON data file at the specified route. See Example Data Directory below.
         */
        { route: 'menu/category', component: category_component, multiPage: true },
      ],
      reducers: [ category_reducer, content_reducer ]
    }
  ]
};
```
### Example Data Directory
```javascript
/data
    /en_US
        /home
            home.json // /en_US/home/index.html
        /explore
            explore.json // /en_US/explore/index.html
        /products
            product_1.json // /en_US/prodcuts/product_1/index.html
            product_2.json // /en_US/prodcuts/product_2/index.html
            product_3.json // /en_US/prodcuts/product_3/index.html
    /en_US
        /home
            home.json // /es_US/home/index.html
        /explore
            explore.json // /es_US/explore/index.html
        /products
            product_1.json // /es_US/prodcuts/product_1/index.html
            product_2.json // /es_US/prodcuts/product_2/index.html
            product_3.json // /es_US/prodcuts/product_3/index.html
```
### Example Template File
```javascript
// Currently only supports a function that returns html string
export default function (html, app, manifest, vendor, css) {
    return `
    <html lang="en">
        <head>
            <title>My Store</title>
            <script>
                window.__data = ${JSON.stringify(state)};
            </script>
        </head>
        <link rel="stylesheet" type="text/css" href="/${css}" />
        <body id="body">
            <div id="app">
                ${html}
            </div>
            <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
            <script src="/${manifest}"></script>
            <script src="/${vendor}"></script>
            <script src="${app}"></script>
        </body>
    </html>
    `
}
```

## TODO
## Project
- Create example site
- Tests & coverage reports

### Core
- ~~Handle ES6 modules more seamlessly~~
- Add ability to define asset-to-template mapping.
- Integrate with react-router for configuration field mapping
- Test/add webpack-dev-server support

### Page Builders
- ~~Base paths for data directories~~
- Support localization in builder functions to reduce configuration noise (Partially complete)
- Validation around configuration (Partially complete)

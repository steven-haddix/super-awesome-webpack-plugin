# Super Awesome Webpack Plugin
An opinionated Webpack plugin for generating static websites using React and Redux.

## Setup
### Configuration File
The configuration file dictates the following:
- page creation
- page path
- root js location
- initial state

### Example configuration file
```javascript
import { singlePageBuilder, multiPageBuilder } from 'super-awesome-webpack-plugin';

const templateFile = require('./template');
const build = {
    // top levels need to match entries in webpack.config.js
    home: {
        component: require('./src/js/pages/Home'),
        pages: [singlePageBuilder('./data/en_US/home', '/en_US/menu/home')],
        template: templateFile,
        reducers: {
            content: require('./src/js/redux/reducers/content')
        }
    },
    category: {
        component: require('./src/js/pages/Category'),
        pages: [singlePageBuilder('./data/en_US/menu/category', '/en_US/menu/category')],
        template: templateFile,
        reducers: {
            categories: require('./src/js/redux/reducers/categories'),
            content: require('./src/js/redux/reducers/content')
        }
    },
    product: {
        component: require('./src/js/pages/Product'),
        pages: [multiPageBuilder('./data/en_US/menu/category', '/en_US/menu/category')],
        template: templateFile,
        reducers: {
            products: require('./src/js/redux/reducers/products'),
            content: require('./src/js/redux/reducers/content')
        }
    }
}

module.exports = build;
```

### Setup webpack.config.js
Require plugin & build config
```javascript
const SuperAwesomeWebpackPlugin = require('super-awesome-webpack-plugin').superAwesomeWebpackPlugin;
const buildConfig = require('./build.config');
```
Create matching entries
```javascript
entry: {
    home: path.join(__dirname, 'src/js/sites/order/home.js'),
    product: path.join(__dirname, 'src/js/sites/order/product.js'),
    category: path.join(__dirname, 'src/js/sites/order/category.js'),
    style: path.join(__dirname, 'src/less', 'styles.less'),
    vendor: Object.keys(require('./package.json').dependencies)
}
```
Add plugin
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

### Example Template File
```javascript
// Currently only supports a function that returns html string
export default function (html, app, manifest, vendor, css) {
    return `
    <html lang="en">
      <head><title>My Store</title></head>
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
## API
### superAwesomeWebpackPlugin
Core plugin for generating static sites

### singlePageBuilder
Function for generating a single page configuration. The JSON data is pulled into the components state.

### multiPageBuilder
Function for generating a single page for each JSON file in a directory. The JSON data is pulled into the components state.

## TODO
### Core
- ~~Handle ES6 modules more seamlessly~~
- Add ability to define asset to template mapping.
- Integrate with react-router for configuration mapping
- Test/add webpack-dev-server support

### Page Builders
- Base paths for data directories
- Support localization in builder functions to reduce configuration noise
- Validation around configuration

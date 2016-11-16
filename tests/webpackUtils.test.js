import test from 'blue-tape';
import path from 'path';
import React from 'react'
import uuid from 'node-uuid';
import { renderToString } from 'react-dom/server'

import {
    findAssetName,
    getAssetsFromCompilation,
    generateConfiguration,
    compileConfiguration
} from '../src/webpackUtils';

import {
    hashText
} from '../src/helpers';

test('getAssetsFromCompilation', (t) => {
    const compilation1 = {
        options: {
            output: {}
        }
    };

    const webpackStatsJson1 = {
        assetsByChunkName: {
            main: ['main.8d2a322045f149c2f48f.js']
        }
    };

    t.deepEqual(
        getAssetsFromCompilation(compilation1, webpackStatsJson1),
        { main: 'main.8d2a322045f149c2f48f.js' },
        'should return all assets from webpackStatsJson'
    );

    const compilation2 = {
        options: {
            output: {
                publicPath: 'public/path/'
            }
        }
    };

    t.deepEqual(
        getAssetsFromCompilation(compilation2, webpackStatsJson1),
        { main: 'public/path/main.8d2a322045f149c2f48f.js' },
        'should return all assets from webpackStatsJson with public path prepended'
    );

    t.end()
})

test('findAssetName', (t) => {
    const compilation1 = {
        assets: {
            main: {}
        }
    };

    t.equal(findAssetName('main', compilation1, webpackStatsJson), 'main', 'should return main from compilation assets');

    const compilation2 = {
        assets: []
    };

    const webpackStatsJson = {
        assetsByChunkName: {
            main: ['main.8d2a322045f149c2f48f.js']
        }
    };

    t.equal(findAssetName('main', compilation2, webpackStatsJson), 'main.8d2a322045f149c2f48f.js', 'should return main chunk name from webpackStatsJson');


    const webpackStatsJson2 = {
        assetsByChunkName: {
        }
    };

    t.equal(findAssetName('main', compilation2, webpackStatsJson2), null, 'should return null if not compilation asset or chunk name is found');

    t.end()
})

test('compileConfiguration', (t) => new Promise((resolve, reject) => {
    const simpleEntry = uuid.v4();
    const complexEntry = uuid.v4();
    const ce = uuid.v4();

    const SimpleComponent = require('./stubs/Component.stub.js');
    const functionComponent = require('./stubs/Component.stub.js');
    const sc = generateConfiguration(ce, './tests/stubs/Component.stub.js');

    const config = generateConfiguration([
        { key: simpleEntry, file: './tests/stubs/Component.stub.js' },
        { key: ce, file: './tests/stubs/ModulesExportComponent.js' },
        { key: complexEntry, file: './tests/stubs/ComplexComponent.js' }
    ]);

    compileConfiguration(config).then((err, stats) => {
        if(err) {
            console.log(err);
        }

        const SimpleComponenetRendered = require(path.join(process.cwd(), `.super_awesome/build/${simpleEntry}.js`))
        t.equal(renderToString(<SimpleComponenetRendered.default />), renderToString(<SimpleComponent.default />), 'should render simple components')

        const functionComponent2 = renderToString(<functionComponent/>);
        const functionComponent = require(path.join(process.cwd(), `.super_awesome/build/${ce}.js`))
        t.equal(renderToString(<functionComponent />), functionComponent2, 'should render simple components')

        const ComplexComponentRendered = require(path.join(process.cwd(), `.super_awesome/build/${complexEntry}.js`))
        t.ok(renderToString(<ComplexComponentRendered.default />), 'should render complex webpack components')

        resolve()
    }).catch((err) => console.log(err));
}).catch((err) => console.log(err)))


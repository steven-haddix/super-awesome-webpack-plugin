import test from 'blue-tape';
import { findAssetName, getAssetsFromCompilation } from '../src/webpackUtils';

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
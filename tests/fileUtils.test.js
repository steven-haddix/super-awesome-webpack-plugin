import blueTape from 'blue-tape';
import tape from 'blue-tape';
import { walkAsync, walkSync } from '../src/fileUtils';

blueTape('walkAsync', (t) => new Promise((done) => {
    t.plan(6);

    const test1 = new Promise((resolve) => {
        walkAsync('./tests/fakeDirectory', (result) => {
            t.equal(result.length, 5, 'should return 5 files')
            resolve()
        })
    })

    const test2 = new Promise((resolve) => {
        walkAsync('./tests/fakeDirectory', (result) => {
            t.skip(result.length, 2, 'should return 2 files')
            resolve()
        }, 0)
    })

    const test3 = new Promise((resolve) => {
        walkAsync('./tests/fakeDirectory', (result) => {
            t.equal(result.length, 3, 'should filter results and return 3 json file')
            resolve()
        }, -1, /.*\.json/)
    })

    const test4 = new Promise((resolve) => {
        walkAsync('./test', (result, err) => {
            t.notEqual(err, null, 'should return error when passed invalid path')
            resolve()
        })
    })

    const test5 = new Promise((resolve) => {
        walkAsync(null, (result, err) => {
            t.notEqual(err, null, 'should return error when passed null path')
            resolve()
        })
    })

    const test6 = new Promise((resolve) => {
        walkAsync('./', (result, err) => {
            t.deepEqual(result, [], 'should return empty array when no files are found')
            resolve()
        }, -1, /noresult/)
    })

    Promise.all([test1, test2, test3, test4, test5, test6])
        .then((res) => {
            done()
        })
        .catch((err) => console.log(err));
}))

tape('walkSync', (t) => {
    t.plan(2);

    t.equal(walkSync('./tests/fakeDirectory').length, 5, 'should return all 5 files in directory');
    t.equal(walkSync('./tests/fakeDirectory', [], /.*\.json/).length, 3, 'should return only .json files when filter is applied')
    t.end()
})




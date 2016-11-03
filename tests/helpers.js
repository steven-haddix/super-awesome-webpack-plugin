import test from 'tape';
import {
    es6Accessor
} from '../src/helpers';

test('properly access es6 default objects', (t) => {
    const es6Object = {
        default: function() {
            return '123'
        }
    }
    t.equal(es6Accessor(es6Object)(), '123', 'outcome equals 123');
    t.end();
});

test('properly access es6 default objects', (t) => {
    const es6Object = { test: '123' }
    t.deepEqual(es6Accessor(es6Object), { test: '123' }, 'outcome equals { test: 123 }');
    t.end();
});
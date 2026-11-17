import assert from 'node:assert/strict';
import test from 'node:test';
import { errorMessage } from '../src/api/errors.ts';

test('shows field validation messages', () => {
    assert.equal(errorMessage({ status: 400, data: { errors: { Name: ['Enter a name.'], CategoryId: ['Select a category.'] } } }), 'Enter a name. Select a category.');
});
test('shows actionable conflict details', () => {
    assert.equal(errorMessage({ status: 409, data: { title: 'Conflict', detail: 'Reassign friends first.' } }), 'Reassign friends first.');
});
test('handles network failures and timeouts', () => {
    for (const status of ['FETCH_ERROR', 'TIMEOUT_ERROR'])
        assert.match(errorMessage({ status }), /Cannot reach the server/);
});
test('handles missing records and malformed responses safely', () => {
    assert.match(errorMessage({ status: 404 }), /no longer exists/);
    for (const value of [null, undefined, { status: 500, data: '<html>secret</html>' }, new Error('secret')])
        assert.equal(errorMessage(value), 'The request failed. Please try again.');
});

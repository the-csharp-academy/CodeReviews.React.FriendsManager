import assert from 'node:assert/strict';
import test from 'node:test';
import { daysOverdue, sortByAttention } from '../src/lib/attention.ts';
import type { Friend } from '../src/types/friend.ts';

function friend(name: string, date: string, frequency: number): Friend {
    return { id: 1, name, lastContactDate: date, desiredContactFrequencyDays: frequency, lastContactType: 'Text', categoryId: 1 };
}

test('exactly at the desired frequency is due today, not overdue', () => {
    assert.equal(daysOverdue(friend('A', '2026-10-01', 7), '2026-10-08'), 0);
});
test('one day beyond the desired frequency is overdue', () => {
    assert.equal(daysOverdue(friend('A', '2026-10-01', 7), '2026-10-09'), 1);
});
test('contact today is not overdue', () => {
    assert.equal(daysOverdue(friend('A', '2026-10-09', 7), '2026-10-09'), -7);
});
test('leap day is included', () => {
    assert.equal(daysOverdue(friend('A', '2024-02-28', 1), '2024-03-01'), 1);
});
test('daylight saving does not affect calendar-day calculation', () => {
    assert.equal(daysOverdue(friend('A', '2026-03-07', 1), '2026-03-09'), 1);
});
test('year boundary is included', () => {
    assert.equal(daysOverdue(friend('A', '2025-12-31', 1), '2026-01-02'), 1);
});
test('sorts overdue first and names on ties without mutating Redux data', () => {
    const friends = [friend('Recent', '2026-10-09', 7), friend('Zoe', '2026-10-01', 7), friend('Amy', '2026-10-01', 7)];
    assert.deepEqual(sortByAttention(friends, '2026-10-09').map(value => value.name), ['Amy', 'Zoe', 'Recent']);
    assert.equal(friends[0].name, 'Recent');
});

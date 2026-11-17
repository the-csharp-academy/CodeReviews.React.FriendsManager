import type { Friend } from '../types/friend';

export function utcToday(): string {
    return new Date().toISOString().slice(0, 10);
}

export function daysOverdue(
    friend: Pick<Friend, 'lastContactDate' | 'desiredContactFrequencyDays'>,
    today: string,
): number {
    const elapsedDays = Math.floor(
        (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${friend.lastContactDate}T00:00:00Z`)) / 86400000,
    );
    return elapsedDays - friend.desiredContactFrequencyDays;
}

export function sortByAttention(friends: Friend[], today: string): Friend[] {
    return [...friends].sort((a, b) =>
        daysOverdue(b, today) - daysOverdue(a, today) || a.name.localeCompare(b.name));
}

import { useState } from 'react';
import { errorMessage } from '../api/errors';
import { daysOverdue } from '../lib/attention';
import { useDeleteFriendMutation } from '../store';
import type { Friend } from '../types/friend';

export function FriendCard({ friend, categoryName, today, onEdit, onDeleted }: {
    friend: Friend;
    categoryName: string;
    today: string;
    onEdit: () => void;
    onDeleted: () => void;
}) {
    const [deleteFriend, deleting] = useDeleteFriendMutation();
    const [error, setError] = useState('');
    const overdue = daysOverdue(friend, today);
    const status = overdue > 0
        ? `${overdue} day${overdue === 1 ? '' : 's'} overdue`
        : overdue === 0 ? 'Due today' : `Due in ${-overdue} day${overdue === -1 ? '' : 's'}`;

    async function remove() {
        if (!window.confirm(`Delete ${friend.name}?`))
            return;
        setError('');
        try {
            await deleteFriend(friend.id).unwrap();
            onDeleted();
        } catch (failure) {
            setError(errorMessage(failure));
        }
    }

    return <article className={`friend-card ${overdue > 0 ? 'overdue' : ''}`}>
        <h3>{friend.name}</h3>
        <p>{categoryName}</p>
        <p><strong>{status}</strong></p>
        <dl>
            <dt>Last contact</dt>
            <dd><time dateTime={friend.lastContactDate}>{friend.lastContactDate}</time></dd>
            <dt>Contact type</dt>
            <dd>{friend.lastContactType === 'Unknown' ? 'Not recorded' :
                friend.lastContactType === 'InPerson' ? 'In person' : friend.lastContactType}</dd>
            <dt>Desired frequency</dt>
            <dd>Every {friend.desiredContactFrequencyDays} days</dd>
        </dl>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
            <button disabled={deleting.isLoading} onClick={onEdit}>Edit / log contact</button>
            <button className="danger" disabled={deleting.isLoading}
                onClick={() => void remove()}>{deleting.isLoading ? 'Deleting…' : 'Delete'}</button>
        </div>
    </article>;
}

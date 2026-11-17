import { useState } from 'react';
import type { FormEvent } from 'react';
import { errorMessage } from '../api/errors';
import { utcToday } from '../lib/attention';
import { useCreateFriendMutation, useGetCategoriesQuery, useUpdateFriendMutation } from '../store';
import { contactTypes } from '../types/friend';
import type { ContactType, Friend, FriendInput } from '../types/friend';

function emptyFriend(): FriendInput {
    return { name: '', lastContactDate: utcToday(), lastContactType: 'Text', desiredContactFrequencyDays: 7, categoryId: 0 };
}

export function FriendForm({ friend, today, onDone, onCancel }: {
    friend: Friend | null;
    today: string;
    onDone: () => void;
    onCancel?: () => void;
}) {
    const { data: categories = [] } = useGetCategoriesQuery();
    const [createFriend, creating] = useCreateFriendMutation();
    const [updateFriend, updating] = useUpdateFriendMutation();
    const [draft, setDraft] = useState<FriendInput>(() => friend ? {
        name: friend.name, lastContactDate: friend.lastContactDate,
        lastContactType: friend.lastContactType,
        desiredContactFrequencyDays: friend.desiredContactFrequencyDays,
        categoryId: friend.categoryId,
    } : emptyFriend());
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const busy = creating.isLoading || updating.isLoading;

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setNotice('');
        if (!draft.name.trim() || !categories.some(category => category.id === draft.categoryId) ||
            !draft.lastContactDate || draft.lastContactDate > utcToday() ||
            !Number.isInteger(draft.desiredContactFrequencyDays) ||
            draft.desiredContactFrequencyDays < 1 || draft.desiredContactFrequencyDays > 3650) {
            setError('Enter a name, existing category, valid date, and frequency from 1–3650 days.');
            return;
        }
        try {
            const body = { ...draft, name: draft.name.trim() };
            if (friend)
                await updateFriend({ id: friend.id, body }).unwrap();
            else
                await createFriend(body).unwrap();
            setDraft(emptyFriend());
            setNotice('Friend saved.');
            onDone();
        } catch (failure) {
            setError(errorMessage(failure));
        }
    }

    return (
        <section aria-labelledby="friend-form-heading">
            <h2 id="friend-form-heading">{friend ? 'Edit friend / log contact' : 'Add friend'}</h2>
            {categories.length === 0 && <p><a href="#categories">Create a category</a> first.</p>}
            {error && <p className="error" role="alert">{error}</p>}
            <p role="status">{notice}</p>
            <form onSubmit={save}>
                <fieldset disabled={busy}>
                    <label htmlFor="friend-name">Name</label>
                    <input id="friend-name" required maxLength={100} value={draft.name}
                        onChange={event => setDraft({ ...draft, name: event.target.value })} />
                    <label htmlFor="friend-category">Category</label>
                    <select id="friend-category" required value={draft.categoryId || ''}
                        onChange={event => setDraft({ ...draft, categoryId: Number(event.target.value) })}>
                        <option value="">Select a category</option>
                        {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    <label htmlFor="contact-date">Last contact date (UTC)</label>
                    <input id="contact-date" type="date" required min="0001-01-01" max={today}
                        value={draft.lastContactDate}
                        onChange={event => setDraft({ ...draft, lastContactDate: event.target.value })} />
                    <label htmlFor="contact-type">Last contact type</label>
                    <select id="contact-type" value={draft.lastContactType}
                        onChange={event => setDraft({ ...draft, lastContactType: event.target.value as ContactType })}>
                        {contactTypes.map(type => <option key={type} value={type}>
                            {type === 'Unknown' ? 'Not recorded' : type === 'InPerson' ? 'In person' : type}
                        </option>)}
                    </select>
                    <label htmlFor="frequency">Desired contact frequency (days)</label>
                    <input id="frequency" type="number" required min={1} max={3650} step={1}
                        value={draft.desiredContactFrequencyDays}
                        onChange={event => setDraft({ ...draft, desiredContactFrequencyDays: Number(event.target.value) })} />
                    <div className="actions">
                        <button type="submit" disabled={categories.length === 0}>{busy ? 'Saving…' : 'Save friend'}</button>
                        {(friend || onCancel) && <button type="button" onClick={onCancel ?? onDone}>Cancel</button>}
                    </div>
                </fieldset>
            </form>
        </section>
    );
}

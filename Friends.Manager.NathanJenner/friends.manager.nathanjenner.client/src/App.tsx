import { useEffect, useState } from 'react';
import { errorMessage } from './api/errors';
import { FriendCard } from './components/card';
import { FriendForm } from './components/FriendForm';
import { FriendModal } from './components/FriendModal';
import { CategoryManager } from './components/CategoryManager';
import { daysOverdue, sortByAttention, utcToday } from './lib/attention';
import { useGetCategoriesQuery, useGetFriendsQuery } from './store';
import type { Friend } from './types/friend';
import './App.css';

export default function App() {
    const friendsQuery = useGetFriendsQuery(undefined, { refetchOnFocus: true, refetchOnReconnect: true });
    const categoriesQuery = useGetCategoriesQuery(undefined, { refetchOnFocus: true, refetchOnReconnect: true });
    const [editing, setEditing] = useState<Friend | null>(null);
    const [creatingFriend, setCreatingFriend] = useState(false);
    const [page, setPage] = useState(() => window.location.hash === '#categories' ? 'categories' : 'friends');
    const [onlyOverdue, setOnlyOverdue] = useState(false);
    const [today, setToday] = useState(utcToday);
    const [notice, setNotice] = useState('');

    useEffect(() => {
        function navigate() {
            setPage(window.location.hash === '#categories' ? 'categories' : 'friends');
            setCreatingFriend(false);
            setEditing(null);
            setNotice('');
        }
        window.addEventListener('hashchange', navigate);
        return () => window.removeEventListener('hashchange', navigate);
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => setToday(utcToday()), 60000);
        return () => window.clearInterval(timer);
    }, []);

    const friends = friendsQuery.data ?? [];
    const categories = categoriesQuery.data ?? [];
    const overdueCount = friends.filter(friend => daysOverdue(friend, today) > 0).length;
    const visibleFriends = sortByAttention(friends, today)
        .filter(friend => !onlyOverdue || daysOverdue(friend, today) > 0);
    const loaded = friendsQuery.data !== undefined && categoriesQuery.data !== undefined;
    const queryError = friendsQuery.error ?? categoriesQuery.error;

    return <main>
        <header className="app-header">
            <div className="header-content">
                <div className="header-brand">
                    <h1>Friends Manager</h1>
                    <p className="header-tagline">Cultivate your friendships, not just your contact list.</p>
                </div>
                {loaded && <p className={`header-attention${overdueCount > 0 ? ' has-attention' : ''}`}>
                    <strong>{overdueCount}</strong>
                    <span>of {friends.length} friends need attention.</span>
                </p>}
            </div>
            <nav className="page-nav" aria-label="Main navigation">
                <a href="#friends" aria-current={page === 'friends' ? 'page' : undefined}>Friends</a>
                <a href="#categories" aria-current={page === 'categories' ? 'page' : undefined}>Categories</a>
            </nav>
        </header>
        {(friendsQuery.isLoading || categoriesQuery.isLoading) && <p role="status">Loading friendships…</p>}
        {queryError && <div className="error" role="alert">
            <p>{errorMessage(queryError)}</p>
            <button disabled={friendsQuery.isFetching || categoriesQuery.isFetching} onClick={() => {
                void friendsQuery.refetch();
                void categoriesQuery.refetch();
            }}>Retry loading</button>
        </div>}
        <p role="status">{notice}</p>
        {loaded && (page === 'categories' ?
            <div className="category-page">
                <CategoryManager />
            </div>
            : <>
            {editing && <div className="forms">
                <FriendForm key={editing.id} friend={editing} today={today}
                    onDone={() => {
                        setEditing(null);
                        setNotice('Friend saved.');
                    }}
                    onCancel={() => setEditing(null)} />
            </div>}
            <section aria-labelledby="friends-heading">
                <div className="section-heading">
                    <h2 id="friends-heading">Your friends</h2>
                    <button type="button" onClick={() => {
                        setEditing(null);
                        setNotice('');
                        setCreatingFriend(true);
                    }}>Add friend</button>
                </div>
                <label className="filter">
                    <input type="checkbox" checked={onlyOverdue}
                        onChange={event => setOnlyOverdue(event.target.checked)} />
                    Show only overdue friends
                </label>
                <p>Most overdue first. A friend due today is not yet overdue.</p>
                {visibleFriends.length === 0 && <p>
                    {friends.length === 0 ? 'Select Add friend to create your first friend.' : 'No overdue friends.'}
                </p>}
                <div className="friend-grid">
                    {visibleFriends.map(friend => <FriendCard key={friend.id}
                        friend={friend} today={today}
                        categoryName={categories.find(category => category.id === friend.categoryId)?.name ?? 'Unknown category'}
                        onEdit={() => {
                            setEditing(friend);
                            setNotice('');
                            window.requestAnimationFrame(() => document.getElementById('friend-name')?.focus());
                        }}
                        onDeleted={() => {
                            setEditing(current => current?.id === friend.id ? null : current);
                            setNotice('Friend deleted.');
                        }} />)}
                </div>
            </section>
            {creatingFriend && <FriendModal today={today}
                onSaved={() => {
                    setCreatingFriend(false);
                    setNotice('Friend saved.');
                }}
                onCancel={() => setCreatingFriend(false)} />}
        </>)}
    </main>;
}

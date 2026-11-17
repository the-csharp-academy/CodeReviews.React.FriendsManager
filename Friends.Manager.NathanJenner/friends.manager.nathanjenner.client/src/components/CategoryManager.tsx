import { useState } from 'react';
import type { FormEvent } from 'react';
import { errorMessage } from '../api/errors';
import {
    useGetCategoriesQuery, useGetFriendsQuery,
    useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation,
} from '../store';

export function CategoryManager() {
    const { data: categories = [] } = useGetCategoriesQuery();
    const { data: friends = [] } = useGetFriendsQuery();
    const [createCategory, creating] = useCreateCategoryMutation();
    const [updateCategory, updating] = useUpdateCategoryMutation();
    const [deleteCategory, deleting] = useDeleteCategoryMutation();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const busy = creating.isLoading || updating.isLoading || deleting.isLoading;

    function reset() {
        setEditingId(null);
        setName('');
    }

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setNotice('');
        if (!name.trim() || name.trim().length > 80) {
            setError('Enter a category name of 1–80 characters.');
            return;
        }
        try {
            if (editingId === null)
                await createCategory({ name: name.trim() }).unwrap();
            else
                await updateCategory({ id: editingId, name: name.trim() }).unwrap();
            reset();
            setNotice('Category saved.');
        } catch (failure) {
            setError(errorMessage(failure));
        }
    }

    async function remove(id: number, categoryName: string) {
        if (!window.confirm(`Delete category ${categoryName}?`))
            return;
        setError('');
        setNotice('');
        try {
            await deleteCategory(id).unwrap();
            if (editingId === id)
                reset();
            setNotice('Category deleted.');
        } catch (failure) {
            setError(errorMessage(failure));
        }
    }

    return (
        <section aria-labelledby="categories-heading">
            <h2 id="categories-heading">Categories</h2>
            {error && <p className="error" role="alert">{error}</p>}
            <p role="status">{notice}</p>
            <form onSubmit={save}>
                <fieldset disabled={busy}>
                    <label htmlFor="category-name">{editingId === null ? 'New category' : 'Rename category'}</label>
                    <input id="category-name" required maxLength={80} value={name}
                        onChange={event => setName(event.target.value)} />
                    <div className="actions">
                        <button type="submit">{busy ? 'Working…' : 'Save category'}</button>
                        {editingId !== null && <button type="button" onClick={reset}>Cancel</button>}
                    </div>
                </fieldset>
            </form>
            <ul className="categories">
                {categories.map(category => {
                    const inUse = friends.some(friend => friend.categoryId === category.id);
                    return <li key={category.id}>
                        <span>{category.name}{inUse ? ' (in use)' : ''}</span>
                        <button disabled={busy} aria-label={`Rename ${category.name}`} onClick={() => {
                            setEditingId(category.id);
                            setName(category.name);
                            setError('');
                            setNotice('');
                            document.getElementById('category-name')?.focus();
                        }}>Rename</button>
                        <button className="danger" disabled={busy || inUse}
                            aria-label={`Delete category ${category.name}`}
                            onClick={() => void remove(category.id, category.name)}>Delete</button>
                    </li>;
                })}
            </ul>
            <p>Reassign friends before deleting a category that is in use.</p>
        </section>
    );
}

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Category } from './types/category';
import type { Friend, FriendInput } from './types/friend';

export const api = createApi({
    reducerPath: 'friendshipsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/', timeout: 15000 }),
    tagTypes: ['Friends', 'Categories'],
    endpoints: builder => ({
        getFriends: builder.query<Friend[], void>({
            query: () => 'friends',
            providesTags: ['Friends'],
        }),
        getCategories: builder.query<Category[], void>({
            query: () => 'categories',
            providesTags: ['Categories'],
        }),
        createFriend: builder.mutation<Friend, FriendInput>({
            query: body => ({ url: 'friends', method: 'POST', body }),
            invalidatesTags: ['Friends'],
        }),
        updateFriend: builder.mutation<Friend, { id: number; body: FriendInput }>({
            query: ({ id, body }) => ({ url: `friends/${id}`, method: 'PUT', body }),
            invalidatesTags: ['Friends'],
        }),
        deleteFriend: builder.mutation<void, number>({
            query: id => ({ url: `friends/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Friends'],
        }),
        createCategory: builder.mutation<Category, { name: string }>({
            query: body => ({ url: 'categories', method: 'POST', body }),
            invalidatesTags: ['Categories'],
        }),
        updateCategory: builder.mutation<Category, { id: number; name: string }>({
            query: ({ id, name }) => ({ url: `categories/${id}`, method: 'PUT', body: { name } }),
            invalidatesTags: ['Categories'],
        }),
        deleteCategory: builder.mutation<void, number>({
            query: id => ({ url: `categories/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Categories'],
        }),
    }),
});

export const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export const {
    useGetFriendsQuery, useGetCategoriesQuery,
    useCreateFriendMutation, useUpdateFriendMutation, useDeleteFriendMutation,
    useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation,
} = api;

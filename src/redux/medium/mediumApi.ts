import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import { boardApi } from '../board/boardApi';

export const mediumApi = createApi({
  reducerPath: 'mediumApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Medium', 'Board'],
  endpoints: (builder) => ({
    getMedium: builder.query({
      query: () => ({ url: '/app/education-medium', redirect: 'follow' }),
      providesTags: ['Medium'],
    }),
    getMediumById: builder.query({
      query: (id) => ({ url: `/app/education-medium/${id}`, redirect: 'follow' }),
      providesTags: ['Medium'],
    }),
    addMedium: builder.mutation({
      query: (body) => ({
        url: '/app/education-medium',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Medium', 'Board'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // ✅ Example: Refetch user list after adding a user
          dispatch(boardApi.util.invalidateTags(['Board']));
        } catch (error) {
          console.error('Mutation failed', error);
        }
      },
    }),
    updateMedium: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/education-medium/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Medium'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // ✅ Example: Refetch user list after adding a user
          dispatch(boardApi.util.invalidateTags(['Board']));
        } catch (error) {
          console.error('Mutation failed', error);
        }
      },
    }),
    deleteMedium: builder.mutation({
      query: (id) => ({
        url: `/app/education-medium/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Medium'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // ✅ Example: Refetch user list after adding a user
          dispatch(boardApi.util.invalidateTags(['Board']));
        } catch (error) {
          console.error('Mutation failed', error);
        }
      },
    }),
  }),
});

export const {
  useAddMediumMutation,
  useDeleteMediumMutation,
  useGetMediumByIdQuery,
  useGetMediumQuery,
  useLazyGetMediumByIdQuery,
  useLazyGetMediumQuery,
  useUpdateMediumMutation,
} = mediumApi;

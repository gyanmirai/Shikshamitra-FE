import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const boardApi = createApi({
  reducerPath: 'boardApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Board'],
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: () => ({ url: '/app/education-board', redirect: 'follow' }),
      providesTags: ['Board'],
    }),
    getBoardById: builder.query({
      query: (id) => ({ url: `/app/education-board/${id}` }),
      providesTags: ['Board'],
    }),
    addBoard: builder.mutation({
      query: (body) => ({
        url: '/app/education-board',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Board'],
    }),
    updateBoard: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/education-board/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Board'],
    }),
    deleteBoard: builder.mutation({
      query: (id) => ({
        url: `/app/education-board/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Board'],
    }),
  }),
});

export const {
  useAddBoardMutation,
  useDeleteBoardMutation,
  useGetBoardByIdQuery,
  useGetBoardsQuery,
  useLazyGetBoardByIdQuery,
  useLazyGetBoardsQuery,
  useUpdateBoardMutation,
} = boardApi;

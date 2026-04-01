import { boardType } from 'src/redux/tagTypes';

import { api } from '../service';

export const boardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: () => ({ url: '/app/education-board', redirect: 'follow' }),
      providesTags: [boardType.board],
    }),
    getBoardById: builder.query({
      query: (id) => ({ url: `/app/education-board/${id}` }),
      providesTags: [boardType.board],
    }),
    addBoard: builder.mutation({
      query: (body) => ({
        url: '/app/education-board',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [boardType.board],
    }),
    updateBoard: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/education-board/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [boardType.board],
    }),
    deleteBoard: builder.mutation({
      query: (id) => ({
        url: `/app/education-board/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [boardType.board],
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

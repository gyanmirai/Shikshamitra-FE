import { boardType, organizationType } from 'src/redux/tagTypes';

import { api } from '../service';

export const boardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBoardOptions: builder.query<{ value: number; label: string }[], void>({
      query: () => ({ url: '/app/education-board/options' }),
    }),
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
        body,
      }),
      invalidatesTags: [boardType.board, organizationType.academicOrganizationOptions],
    }),
    updateBoard: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/education-board/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [boardType.board, organizationType.academicOrganizationOptions],
    }),
    deleteBoard: builder.mutation({
      query: (id) => ({
        url: `/app/education-board/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [boardType.board, organizationType.academicOrganizationOptions],
    }),
  }),
});

export const {
  useGetBoardOptionsQuery,
  useAddBoardMutation,
  useDeleteBoardMutation,
  useGetBoardByIdQuery,
  useGetBoardsQuery,
  useLazyGetBoardByIdQuery,
  useLazyGetBoardsQuery,
  useUpdateBoardMutation,
} = boardApi;

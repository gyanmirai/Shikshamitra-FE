import { api } from 'src/redux/service';
import { mediumType } from 'src/redux/tagTypes';

import { boardApi } from '../board/boardApi';

export const mediumApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMedium: builder.query({
      query: () => ({ url: '/app/education-medium', redirect: 'follow' }),
      providesTags: [mediumType.medium],
    }),
    getMediumById: builder.query({
      query: (id) => ({ url: `/app/education-medium/${id}`, redirect: 'follow' }),
      providesTags: [mediumType.medium],
    }),
    addMedium: builder.mutation({
      query: (body) => ({
        url: '/app/education-medium',
        method: 'POST',
        body,
      }),
      invalidatesTags: [mediumType.medium, mediumType.board],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // ✅ Example: Refetch user list after adding a user
          dispatch(boardApi.util.invalidateTags([mediumType.board]));
        } catch (error) {
          console.error('Mutation failed', error);
        }
      },
    }),
    updateMedium: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/education-medium/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [mediumType.medium],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // ✅ Example: Refetch user list after adding a user
          dispatch(boardApi.util.invalidateTags([mediumType.board]));
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
      invalidatesTags: [mediumType.medium],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // ✅ Example: Refetch user list after adding a user
          dispatch(boardApi.util.invalidateTags([mediumType.board]));
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

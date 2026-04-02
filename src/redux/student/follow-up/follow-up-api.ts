import { api } from 'src/redux/service';
import { followUpType } from 'src/redux/tagTypes';

export const FollowUpApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFollowUp: builder.query({
      query: (studentId) => ({
        url: `/student/enrollment/${studentId}/notes`,
        method: 'GET',
      }),
      providesTags: [followUpType.followUp],
    }),
    getAllFollowUp: builder.query({
      query: () => ({
        url: `/student-enrollment/follow-ups`,
        method: 'GET',
      }),
      providesTags: [followUpType.followUp],
    }),
    addFollowUp: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/enrollment/${studentId}/notes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [followUpType.followUp],
    }),
  }),
});

export const { useGetFollowUpQuery, useAddFollowUpMutation, useGetAllFollowUpQuery } = FollowUpApi;

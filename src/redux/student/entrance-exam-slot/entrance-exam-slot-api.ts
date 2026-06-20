import { api } from 'src/redux/service';
import { entranceExamSlotType } from 'src/redux/tagTypes';

export const EntranceExamSlotApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEntranceExamSlot: builder.query({
      query: (params) => ({
        url: `/student-enrollment/settings/entrance-exam-slots`,
        method: 'GET',
        params,
      }),
      providesTags: [entranceExamSlotType.entranceExamSlot],
    }),
    addEntranceExamSlot: builder.mutation({
      query: (data) => ({
        url: '/student-enrollment/settings/entrance-exam-slots',
        method: 'POST',
        data,
      }),
      invalidatesTags: [entranceExamSlotType.entranceExamSlot],
    }),
    updateEntranceExamSlot: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student-enrollment/settings/entrance-exam-slots/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [entranceExamSlotType.entranceExamSlot],
    }),
    deleteEntranceExamSlot: builder.mutation({
      query: (id) => ({
        url: `/student-enrollment/settings/entrance-exam-slots/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [entranceExamSlotType.entranceExamSlot],
    }),
  }),
});

export const {
  useAddEntranceExamSlotMutation,
  useUpdateEntranceExamSlotMutation,
  useDeleteEntranceExamSlotMutation,
  useGetEntranceExamSlotQuery,
} = EntranceExamSlotApi;

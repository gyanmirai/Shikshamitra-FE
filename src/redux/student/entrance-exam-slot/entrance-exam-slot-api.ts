import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const EntranceExamSlotApi = createApi({
  reducerPath: 'EntranceExamSlotApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Entrance-Exam-Slot'],
  endpoints: (builder) => ({
    getEntranceExamSlot: builder.query({
      query: () => ({
        url: '/app/entrance-exam-slot',
        method: 'GET',
      }),
      providesTags: ['Entrance-Exam-Slot'],
    }),
    addEntranceExamSlot: builder.mutation({
      query: (data) => ({
        url: '/app/entrance-exam-slot',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Entrance-Exam-Slot'],
    }),
    updateEntranceExamSlot: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/entrance-exam-slot/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Entrance-Exam-Slot'],
    }),
    deleteEntranceExamSlot: builder.mutation({
      query: (id) => ({
        url: `/app/entrance-exam-slot/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Entrance-Exam-Slot'],
    }),
  }),
});

export const {
  useAddEntranceExamSlotMutation,
  useUpdateEntranceExamSlotMutation,
  useDeleteEntranceExamSlotMutation,
  useGetEntranceExamSlotQuery,
} = EntranceExamSlotApi;

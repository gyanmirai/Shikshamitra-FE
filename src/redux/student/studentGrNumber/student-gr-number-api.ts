import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const studentGrNumberApi = createApi({
  reducerPath: 'studentGrNumberApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['studentGrNumber'],
  endpoints: (builder) => ({
    getStudentForGrNumber: builder.query({
      query: ({ educationBoardId, educationMediumId, educationMediumStageId }) => ({
        url: `/app/student/gr-no?educationBoardId=${educationBoardId}&educationMediumId=${educationMediumId}&educationMediumStageId=${educationMediumStageId}`,
        method: 'GET',
      }),

      providesTags: ['studentGrNumber'],
    }),

    updateStudentGrNumber: builder.mutation({
      query: ({ body }) => ({
        url: '/app/student/gr-numbers',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['studentGrNumber'],
    }),
  }),
});

export const { useLazyGetStudentForGrNumberQuery, useUpdateStudentGrNumberMutation } =
  studentGrNumberApi;

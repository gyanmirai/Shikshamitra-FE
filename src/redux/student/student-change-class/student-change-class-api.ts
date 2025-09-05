import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const studentChangeClassApi = createApi({
  reducerPath: 'studentChangeClassApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['studentChangeClass'],
  endpoints: (builder) => ({
    changeStudentClass: builder.mutation({
      query: (body) => ({
        url: '/app/student/student-standard',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['studentChangeClass'],
    }),
  }),
});

export const { useChangeStudentClassMutation } = studentChangeClassApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentApi = createApi({
  reducerPath: 'StudentApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student'],
  endpoints: (builder) => ({
    getFilterStudents: builder.query({
      query: ({ educationMediumStageId, standardId, divisionId }) => {
        let queryString = '';
        if (educationMediumStageId) {
          queryString += `educationMediumStageId=${educationMediumStageId}&`;
        }
        if (standardId) {
          queryString += `standardId=${standardId}&`;
        }
        if (divisionId) {
          queryString += `divisionId=${divisionId}&`;
        }
        queryString = queryString ? `?${queryString.slice(0, -1)}` : '';

        return {
          url: `/app/student/filtered-list${queryString}`,
          method: 'GET',
        };
      },
      providesTags: ['Student'],
    }),
    changeDivision: builder.mutation({
      query: (body) => ({
        url: `/app/student/student-division`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student'],
    }),
    getAllStudents: builder.query({
      query: () => ({
        url: `/app/student`,
        method: 'GET',
      }),
      providesTags: ['Student'],
    }),
    getStudentById: builder.query({
      query: (id) => ({
        url: `/app/student/${id}`,
        method: 'GET',
      }),
      providesTags: ['Student'],
    }),
  }),
});

export const {
  useGetFilterStudentsQuery,
  useLazyGetFilterStudentsQuery,
  useChangeDivisionMutation,
  useGetAllStudentsQuery,
  useGetStudentByIdQuery,
} = StudentApi;

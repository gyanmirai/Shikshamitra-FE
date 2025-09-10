import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentRegistrationFormApi = createApi({
  reducerPath: 'StudentRegistrationFormApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Registration-Form'],
  endpoints: (builder) => ({
    getStudentRegistrationForm: builder.query({
      query: (params) => ({
        url: '/app/student-enrollment/student-registration-form',
        method: 'GET',
        params,
      }),
      providesTags: ['Student-Registration-Form'],
    }),
    addStudentRegistrationForm: builder.mutation({
      query: (body) => ({
        url: '/app/student-enrollment/student-registration-form',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Student-Registration-Form'],
    }),
    updateStudentRegistrationForm: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/student-registration-form/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Registration-Form'],
    }),

    deleteStudentRegistrationForm: builder.mutation({
      query: (id) => ({
        url: `/app/student-enrollment/student-registration-form/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student-Registration-Form'],
    }),
  }),
});

export const {
  useAddStudentRegistrationFormMutation,
  useDeleteStudentRegistrationFormMutation,
  useGetStudentRegistrationFormQuery,
  useUpdateStudentRegistrationFormMutation,
} = StudentRegistrationFormApi;

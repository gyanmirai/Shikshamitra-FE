import { api } from 'src/redux/service';
import { studentRegistrationFormType } from 'src/redux/tagTypes';

export const StudentRegistrationFormApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentRegistrationForm: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/student/enrollment/registrations/forms?academicMediumId=${academicMediumId}`,
        method: 'GET',
      }),
      providesTags: [studentRegistrationFormType.studentRegistrationForm],
    }),
    addStudentRegistrationForm: builder.mutation({
      query: (body) => ({
        url: '/app/student-enrollment/student-registration-form',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [studentRegistrationFormType.studentRegistrationForm],
    }),
    updateStudentRegistrationForm: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/student-registration-form/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentRegistrationFormType.studentRegistrationForm],
    }),

    deleteStudentRegistrationForm: builder.mutation({
      query: (id) => ({
        url: `/app/student-enrollment/student-registration-form/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentRegistrationFormType.studentRegistrationForm],
    }),
  }),
});

export const {
  useAddStudentRegistrationFormMutation,
  useDeleteStudentRegistrationFormMutation,
  useGetStudentRegistrationFormQuery,
  useUpdateStudentRegistrationFormMutation,
} = StudentRegistrationFormApi;

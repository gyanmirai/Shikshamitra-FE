import { classManagementType } from 'src/redux/tagTypes';

import { classManagementApi } from '../classManagementApi';

export const studentElectiveAssignmentApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentElectiveAssignments: builder.query({
      query: (params) => ({
        url: 'class-management/student-elective-assignments',
        method: 'GET',
        params,
      }),
      providesTags: [classManagementType.studentElectiveAssignment],
    }),

    updateStudentElectiveAssignments: builder.mutation({
      query: (body) => ({
        url: 'class-management/student-elective-assignments',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [classManagementType.studentElectiveAssignment],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudentElectiveAssignmentsQuery,
  useUpdateStudentElectiveAssignmentsMutation,
} = studentElectiveAssignmentApi;

import { classManagementType } from 'src/redux/tagTypes';

import { classManagementApi } from '../classManagementApi';

export const studentElectiveAssignmentApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentElectiveAssignments: builder.query({
      query: (params) => ({
        url: 'electives/assignments',
        method: 'GET',
        params,
      }),
      providesTags: [classManagementType.studentElectiveAssignment],
    }),
    updateStudentElectiveAssignments: builder.mutation({
      query: (body) => ({
        url: 'electives/assignments',
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

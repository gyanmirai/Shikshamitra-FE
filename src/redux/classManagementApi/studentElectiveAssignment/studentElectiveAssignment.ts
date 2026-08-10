import { academicType, classManagementType } from 'src/redux/tagTypes';

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
      invalidatesTags: [classManagementType.studentElectiveAssignment, academicType.timetableManagement],
    }),

    lockStudentElectiveAssignments: builder.mutation({
      query: (body) => ({
        url: 'class-management/student-elective-assignments/lock',
        method: 'POST',
        body,
      }),
      invalidatesTags: [classManagementType.studentElectiveAssignment, academicType.timetableManagement],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudentElectiveAssignmentsQuery,
  useLazyGetStudentElectiveAssignmentsQuery,
  useUpdateStudentElectiveAssignmentsMutation,
  useLockStudentElectiveAssignmentsMutation,
} = studentElectiveAssignmentApi;

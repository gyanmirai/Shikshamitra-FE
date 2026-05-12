import { classManagementType } from 'src/redux/tagTypes';

import { classManagementApi } from '../classManagementApi';

export const classTeacherAssignmentApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassTeacherAssignments: builder.query<any, { organizationId: string }>({
      query: (params) => ({
        url: 'class-management/class-teacher-assignments',
        method: 'GET',
        params,
      }),
      providesTags: [classManagementType.classTeacherAssignment],
    }),
    updateClassTeacherAssignments: builder.mutation<
      any,
      {
        organizationId: string;
        assignments: {
          classId: string;
          divisionId: string;
          teacherId: string;
        }[];
      }
    >({
      query: (body) => ({
        url: 'class-management/class-teacher-assignments',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [classManagementType.classTeacherAssignment],
    }),
  }),
});

export const { useGetClassTeacherAssignmentsQuery, useUpdateClassTeacherAssignmentsMutation } =
  classTeacherAssignmentApi;

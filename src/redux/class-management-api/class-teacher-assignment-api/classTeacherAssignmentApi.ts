import { classManagementApi } from '../classManagementApi';

export const classTeacherAssignmentApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassTeacherAssignments: builder.query<any, { organizationId: string }>({
      query: (params) => ({
        url: 'class-teachers/assignments',
        method: 'GET',
        params,
      }),
      providesTags: ['ClassTeacherAssignment'],
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
        url: 'class-teachers/assignments',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['ClassTeacherAssignment'],
    }),
  }),
});

export const { useGetClassTeacherAssignmentsQuery, useUpdateClassTeacherAssignmentsMutation } =
  classTeacherAssignmentApi;

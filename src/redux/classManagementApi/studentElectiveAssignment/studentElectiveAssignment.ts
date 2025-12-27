import { classManagementApi } from '../classManagementApi';

export const studentElectiveAssignmentApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentElectiveAssignments: builder.query({
      query: (params) => ({
        url: 'electives/assignments',
        method: 'GET',
        params,
      }),
      providesTags: ['StudentElectiveAssignment'],
    }),
    updateStudentElectiveAssignments: builder.mutation({
      query: (body) => ({
        url: 'electives/assignments',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['StudentElectiveAssignment'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudentElectiveAssignmentsQuery,
  useUpdateStudentElectiveAssignmentsMutation,
} = studentElectiveAssignmentApi;

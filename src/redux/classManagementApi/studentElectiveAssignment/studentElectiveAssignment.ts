import { classManagementApi } from '../classManagementApi';
import { classManagementType } from 'src/redux/tagTypes';


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
        data: body,
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

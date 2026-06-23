import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

export const pendingAssignmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPendingAssignmentStudents: builder.query({
      query: (params) => ({
        url: `/students/records/pending-assignments`,
        method: 'GET',
        params,
      }),
      providesTags: [studentType.student],
    }),
  }),
});

export const { useLazyGetPendingAssignmentStudentsQuery, useGetPendingAssignmentStudentsQuery } =
  pendingAssignmentApi;

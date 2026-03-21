import { classManagementApi } from '../classManagementApi';

// Teacher Assignment APIs (reference: StudentElectiveAssignment)
// GET /api/teachers/assignments?academicMediumId={uuid}&classId={uuid}
// PUT /api/teachers/assignments
// {
//   "academicMediumId": "<uuid>",
//   "classId": "<uuid>",
//   "assignments": [
//     {
//       "divisionId": "<uuid>",
//       "subjectId": "<uuid>",
//       "teacherIds": ["<uuid>"]
//     }
//   ]
// }

export const teacherAssignmentApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeacherAssignments: builder.query<any, { academicMediumId: string; classId: string }>({
      query: (params) => ({
        url: 'teachers/assignments',
        method: 'GET',
        params,
      }),
      providesTags: ['TeacherAssignment'],
    }),
    updateTeacherAssignments: builder.mutation<
      any,
      {
        academicMediumId: string;
        classId: string;
        assignments: {
          divisionId: string;
          subjectId: string;
          teacherIds: string[];
        }[];
      }
    >({
      query: (body) => ({
        url: 'teachers/assignments',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['TeacherAssignment'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTeacherAssignmentsQuery, useUpdateTeacherAssignmentsMutation } =
  teacherAssignmentApi;

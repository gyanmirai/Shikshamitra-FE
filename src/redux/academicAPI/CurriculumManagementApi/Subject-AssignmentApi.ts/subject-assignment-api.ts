import { academicApi } from '../../academicApi';

export const subjectAssignmentsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subject assignments - academicMediumId passed in query params
    getSubjectAssignments: builder.query({
      query: ({ academicMediumId, classId }) => ({
        url: `/academics/curriculum/${academicMediumId}/subjects/${classId}`,
        method: 'GET',
      }),
      providesTags: ['SubjectAssignment'],
    }),

    // Get one assignment - academicMediumId also optional in query param
    getSubjectAssignmentById: builder.query({
      query: ({ assignmentId, academicMediumId }) => ({
        url: `/academics/curriculum/${assignmentId}`,
        method: 'GET',
        params: academicMediumId ? { academicMediumId } : undefined, // Optional param
      }),
      providesTags: ['SubjectAssignment'],
    }),

    // Create assignment
    addSubjectAssignment: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academics/curriculum`,
        method: 'POST',
        params: { academicMediumId }, // QUERY param again
        data: body,
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Update assignment
    updateSubjectAssignment: builder.mutation({
      query: ({ assignmentId, academicMediumId, body }) => ({
        url: `/academics/curriculum/${assignmentId}`,
        method: 'PUT',
        params: { academicMediumId }, // passing query again
        data: body,
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Delete assignment
    deleteSubjectAssignment: builder.mutation({
      query: ({ assignmentId }) => ({
        url: `/academics/curriculum/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Publish assignment
    publishSubjectAssignment: builder.mutation({
      query: ({ assignmentId, status }) => ({
        url: `/academics/curriculum/${assignmentId}/publish`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Upload Curriculum File
    uploadCurriculumFile: builder.mutation({
      query: (body) => ({
        url: `/academics/curriculum/files`,
        method: 'POST',
        data: body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['CurriculumFile'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetSubjectAssignmentsQuery,
  useGetSubjectAssignmentByIdQuery,
  useAddSubjectAssignmentMutation,
  useUpdateSubjectAssignmentMutation,
  useDeleteSubjectAssignmentMutation,
  usePublishSubjectAssignmentMutation,
  useUploadCurriculumFileMutation,
} = subjectAssignmentsApi;

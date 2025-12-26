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
      query: ({ assignmentId }) => ({
        url: `/academics/curriculum/${assignmentId}`,
        method: 'GET',
      }),
      providesTags: ['SubjectAssignment'],
    }),

    // Create assignment
    addSubjectAssignment: builder.mutation({
      query: ({ body }) => ({
        url: `/subject-assignments`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Update assignment
    updateSubjectAssignment: builder.mutation({
      query: ({ assignmentId, body }) => ({
        url: `/subject-assignments/${assignmentId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Delete assignment
    deleteSubjectAssignment: builder.mutation({
      query: ({ assignmentId }) => ({
        url: `/subject-assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Publish assignment
    publishSubjectAssignment: builder.mutation({
      query: ({ assignmentId, status }) => ({
        url: `/subject-assignments/${assignmentId}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Upload Curriculum File
    uploadCurriculumFile: builder.mutation({
      query: (body) => ({
        url: `/documents`,
        method: 'POST',
        data: body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['CurriculumFile'],
    }),

    // Get subject assignment documents
    getSubjectAssignmentDocuments: builder.query({
      query: ({ subjectAssignmentId, subjectId }) => ({
        url: `/subject-assignments/${subjectAssignmentId}/subjects/${subjectId}/documents`,
        method: 'GET',
      }),
      providesTags: ['CurriculumFile'],
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
  useGetSubjectAssignmentDocumentsQuery,
} = subjectAssignmentsApi;

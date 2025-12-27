import { academicApi } from '../../academicApi';

export const subjectsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subjects under academic medium
    getSubjects: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects`,
        method: 'GET',
      }),
      providesTags: ['Subject'],
    }),

    // Get specific subject under academic medium
    getSubjectById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}`,
        method: 'GET',
      }),
      providesTags: ['Subject'],
    }),

    // Add new subject under medium
    addSubject: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Subject'],
    }),

    // Update subject in medium
    updateSubject: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Subject'],
    }),

    // Delete subject under medium
    deleteSubject: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subject'],
    }),
  }),
  overrideExisting: false,
});

// RTK query hooks
export const {
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useAddSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi;

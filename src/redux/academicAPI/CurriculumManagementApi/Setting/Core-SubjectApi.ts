import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const subjectsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subjects under academic medium
    getSubjects: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects`,
        method: 'GET',
      }),
      providesTags: [academicType.subject],
    }),

    // Get specific subject under academic medium
    getSubjectById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}`,
        method: 'GET',
      }),
      providesTags: [academicType.subject],
    }),

    // Add new subject under medium
    addSubject: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.subject],
    }),

    // Update subject in medium
    updateSubject: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.subject],
    }),

    // Delete subject under medium
    deleteSubject: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.subject],
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

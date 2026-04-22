import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const chaptersApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET - Fetch all chapters of a subject
    getChapters: builder.query({
      query: ({ subjectId }) => ({
        url: `/subjects/${subjectId}/chapters`,
        method: 'GET',
      }),
      providesTags: [academicType.chapter],
    }),

    // GET - Fetch all chapters by assigned standard ID
    getChaptersByStandard: builder.query({
      query: ({ assignedStandardId }) => ({
        url: `/academic/curriculum/chapters/${assignedStandardId}`,
        method: 'GET',
      }),
      providesTags: [academicType.chapter],
    }),

    // POST - Create new chapter
    addChapter: builder.mutation({
      query: (body) => ({
        url: `/academic/curriculum/chapters`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.chapter],
    }),

    // PUT - Update chapter
    updateChapter: builder.mutation({
      query: ({ id, body }) => ({
        url: `/chapters/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.chapter],
    }),

    // DELETE - Remove chapter
    deleteChapter: builder.mutation({
      query: (id) => ({
        url: `/chapters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.chapter],
    }),
  }),

  overrideExisting: false,
});

// Export hooks
export const {
  useGetChaptersQuery,
  useGetChaptersByStandardQuery,
  useAddChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chaptersApi;

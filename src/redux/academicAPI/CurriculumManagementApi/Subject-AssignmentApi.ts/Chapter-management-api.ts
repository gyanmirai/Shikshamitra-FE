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

    // GET - Fetch all chapters by standardId and optional subjectId
    getChaptersByStandard: builder.query({
      query: ({ standardId, subjectId, divisionId }) => ({
        url: `/academic/curriculum/chapters`,
        method: 'GET',
        params: {
          standardId,
          subjectId,
          ...(divisionId ? { divisionId } : {}),
        },
      }),
      providesTags: [academicType.chapter],
    }),

    // POST - Create new chapter
    addChapter: builder.mutation({
      query: ({ standardId, subjectId, body }) => ({
        url: `/academic/curriculum/chapters`,
        method: 'POST',
        params: { standardId, subjectId },
        body,
      }),
      invalidatesTags: [academicType.chapter],
    }),

    // PUT - Update chapter
    updateChapter: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/chapters/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.chapter],
    }),

    // DELETE - Remove chapter
    deleteChapter: builder.mutation({
      query: (id) => ({
        url: `/academic/curriculum/chapters/${id}`,
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

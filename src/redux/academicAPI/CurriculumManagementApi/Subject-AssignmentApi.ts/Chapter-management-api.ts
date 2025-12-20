import { academicApi } from '../../academicApi';

export const chaptersApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET - Fetch all chapters of a subject under a standard
    getChapters: builder.query({
      query: ({ academicMediumId, standardId, subjectId }) => ({
        url: `/chapters`,
        method: 'GET',
        params: { academicMediumId, standardId, subjectId }, // ✔ QUERY param
      }),
      providesTags: ['Chapter'],
    }),

    // POST - Create new chapter
    addChapter: builder.mutation({
      query: (body) => ({
        url: `/chapters`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Chapter'],
    }),

    // PUT - Update chapter
    updateChapter: builder.mutation({
      query: ({ id, body }) => ({
        url: `/chapters/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Chapter'],
    }),

    // DELETE - Remove chapter
    deleteChapter: builder.mutation({
      query: (id) => ({
        url: `/chapters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chapter'],
    }),
  }),

  overrideExisting: false,
});

// Export hooks
export const {
  useGetChaptersQuery,
  useAddChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chaptersApi;

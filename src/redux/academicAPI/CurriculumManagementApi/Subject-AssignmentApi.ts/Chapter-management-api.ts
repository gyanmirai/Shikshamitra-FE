import { academicApi } from '../../academicApi';
import { academicType } from 'src/redux/tagTypes';


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

    // POST - Create new chapter
    addChapter: builder.mutation({
      query: (body) => ({
        url: `/subjects/${body.subjectId}/chapters`,
        method: 'POST',
        data: body,
        params: { subjectId: body.subjectId, classId: body.classId },
      }),
      invalidatesTags: [academicType.chapter],
    }),

    // PUT - Update chapter
    updateChapter: builder.mutation({
      query: ({ id, body }) => ({
        url: `/chapters/${id}`,
        method: 'PUT',
        data: body,
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
  useAddChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chaptersApi;

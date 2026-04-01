import { api } from 'src/redux/service';
import { coreSubjectType } from 'src/redux/tagTypes';

export const CoreSubjectApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query({
      query: () => ({ url: '/academic-mediums/{academicMediumId}/subjects' }),
      providesTags: [coreSubjectType.subject],
    }),
    addSubject: builder.mutation({
      query: (body) => ({
        url: '/subject/',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [coreSubjectType.subject],
    }),
    updateSubject: builder.mutation({
      query: ({ id, body }) => ({
        url: `/subject/${id}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [coreSubjectType.subject],
    }),
    deleteSubject: builder.mutation({
      query: ({ id }) => ({
        url: `/subject/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [coreSubjectType.subject],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useAddSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = CoreSubjectApi;

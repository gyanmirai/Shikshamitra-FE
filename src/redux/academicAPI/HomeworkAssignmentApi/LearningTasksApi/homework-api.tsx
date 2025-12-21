import { academicApi } from '../../academicApi';

export const homeworkApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all homework
    getHomeworks: builder.query({
      query: ({ academicMediumId, classId }) => ({
        url: `app/homework`,
        method: 'GET',
        params: {
          academicMediumId,
          classId,
        },
      }),
      providesTags: ['Homework'],
    }),

    // GET homework by id
    getHomeworkById: builder.query({
      query: ({ id, academicMediumId }) => ({
        url: `app/homework/${id}`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: ['Homework'],
    }),

    // CREATE homework
    addHomework: builder.mutation({
      query: ({ academicMediumId, ...body }) => ({
        url: `app/homework?academicMediumId=${academicMediumId}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Homework'],
    }),

    // UPDATE homework
    updateHomework: builder.mutation({
      query: ({ id, academicMediumId, body }) => ({
        url: `app/homework/${id}`,
        method: 'PUT',
        data: body,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: ['Homework'],
    }),

    // DELETE homework
    deleteHomework: builder.mutation({
      query: ({ id, academicMediumId }) => ({
        url: `app/homework/${id}`,
        method: 'DELETE',
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: ['Homework'],
    }),

    // PUBLISH homework
    publishHomework: builder.mutation({
      query: ({ id, academicMediumId }) => ({
        url: `app/homework/${id}/publish/${academicMediumId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Homework'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetHomeworksQuery,
  useGetHomeworkByIdQuery,
  useAddHomeworkMutation,
  useUpdateHomeworkMutation,
  useDeleteHomeworkMutation,
  usePublishHomeworkMutation,
} = homeworkApi;

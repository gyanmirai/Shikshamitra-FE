import { academicApi } from '../../academicApi';
import { academicType } from 'src/redux/tagTypes';


export const homeworkApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all homework
    getHomeworks: builder.query({
      query: ({ classId, divisionId, subjectId, homeworkDate }) => ({
        url: `app/homework`,
        method: 'GET',
        params: {
          classId,
          divisionId,
          subjectId,
          homeworkDate,
        },
      }),
      providesTags: [academicType.homework],
    }),

    // GET homework by id
    getHomeworkById: builder.query({
      query: (homeworkId) => ({
        url: `app/homework/${homeworkId}`,
        method: 'GET',
      }),
      providesTags: [academicType.homework],
    }),

    // CREATE homework
    addHomework: builder.mutation({
      query: ({ academicMediumId, ...body }) => ({
        url: `app/homework?academicMediumId=${academicMediumId}`,
        method: 'POST',
        data: body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: [academicType.homework],
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: [academicType.homework],
    }),

    // DELETE homework
    deleteHomework: builder.mutation({
      query: (homeworkId) => ({
        url: `app/homework/${homeworkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.homework],
    }),

    // PUBLISH homework
    publishHomework: builder.mutation({
      query: ({ homeworkId, status }) => ({
        url: `app/homework/${homeworkId}/publish`,
        method: 'POST',
        data: { status },
      }),
      invalidatesTags: [academicType.homework],
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

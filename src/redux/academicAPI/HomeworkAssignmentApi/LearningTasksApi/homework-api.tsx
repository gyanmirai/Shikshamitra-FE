import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const homeworkApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all homework
    getHomeworks: builder.query({
      query: ({ academicMediumId, StandardId, DivisionId, SubjectId, HomeworkDate }) => ({
        url: `/academic/homeworks`,
        method: 'GET',
        params: {
          academicMediumId,
          StandardId,
          DivisionId,
          SubjectId,
          HomeworkDate,
        },
      }),
      providesTags: [academicType.homework],
    }),

    // GET homework by id
    getHomeworkById: builder.query({
      query: ({
        homeworkId,
        academicMediumId,
      }: {
        homeworkId: string;
        academicMediumId?: string;
      }) => ({
        url: `/academic/homeworks/${homeworkId}`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: [academicType.homework],
    }),

    // CREATE homework
    addHomework: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic/homeworks`,
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: [academicType.homework],
    }),

    // UPDATE homework
    updateHomework: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/homeworks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.homework],
    }),

    // DELETE homework
    deleteHomework: builder.mutation({
      query: ({ homeworkId }) => ({
        url: `/academic/homeworks/${homeworkId}`,
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

    // UPDATE homework status
    updateHomeworkStatus: builder.mutation<any, { homeworkId: string; status: number }>({
      query: ({ homeworkId, status }) => ({
        url: `/academic/homeworks/${homeworkId}/status`,
        method: 'PATCH',
        body: { status },
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
  useUpdateHomeworkStatusMutation,
} = homeworkApi;

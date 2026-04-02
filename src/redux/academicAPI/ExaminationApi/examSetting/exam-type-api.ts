import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const examinationTypeApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all examination types under academic medium
    getExaminationTypes: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/academics/examination/settings/exam-type`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: [academicType.examinationType],
    }),

    // Get specific examination type under academic medium
    getExaminationTypeById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academics/examination/settings/exam-type/${id}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: [academicType.examinationType],
    }),

    // Add new examination type under medium
    addExaminationType: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academics/examination/settings/exam-type`,
        method: 'POST',
        body,
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.examinationType],
    }),

    // Update examination type in medium
    updateExaminationType: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academics/examination/settings/exam-type/${id}`,
        method: 'PUT',
        body,
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.examinationType],
    }),

    // Delete examination type under medium
    deleteExaminationType: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academics/examination/settings/exam-type/${id}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.examinationType],
    }),
  }),
  overrideExisting: false,
});

// RTK query hooks
export const {
  useGetExaminationTypesQuery,
  useGetExaminationTypeByIdQuery,
  useAddExaminationTypeMutation,
  useUpdateExaminationTypeMutation,
  useDeleteExaminationTypeMutation,
} = examinationTypeApi;

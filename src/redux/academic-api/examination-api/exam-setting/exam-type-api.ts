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
      providesTags: ['ExaminationType'],
    }),

    // Get specific examination type under academic medium
    getExaminationTypeById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academics/examination/settings/exam-type/${id}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: ['ExaminationType'],
    }),

    // Add new examination type under medium
    addExaminationType: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academics/examination/settings/exam-type`,
        method: 'POST',
        data: body,
        params: { academicMediumId },
      }),
      invalidatesTags: ['ExaminationType'],
    }),

    // Update examination type in medium
    updateExaminationType: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academics/examination/settings/exam-type/${id}`,
        method: 'PUT',
        data: body,
        params: { academicMediumId },
      }),
      invalidatesTags: ['ExaminationType'],
    }),

    // Delete examination type under medium
    deleteExaminationType: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academics/examination/settings/exam-type/${id}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: ['ExaminationType'],
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

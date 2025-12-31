import { academicApi } from '../../academicApi';

export const examinationTypeApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all examination types under academic medium
    getExaminationTypes: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/exam-type?academicMediumId=${academicMediumId}`,
        method: 'GET',
      }),
      providesTags: ['ExaminationType'],
    }),

    // Get specific examination type under academic medium
    getExaminationTypeById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/exam-type/${id}/academicMediumId=${academicMediumId}`,
        method: 'GET',
      }),
      providesTags: ['ExaminationType'],
    }),

    // Add new examination type under medium
    addExaminationType: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/exam-type/academicMediumId=${academicMediumId}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['ExaminationType'],
    }),

    // Update examination type in medium
    updateExaminationType: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/exam-type/${id}/academicMediumId=${academicMediumId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['ExaminationType'],
    }),

    // Delete examination type under medium
    deleteExaminationType: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/exam-type/${id}/academicMediumId=${academicMediumId}`,
        method: 'DELETE',
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

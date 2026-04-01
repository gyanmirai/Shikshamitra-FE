import { financeModuleApi } from './financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


export const concessionTypeApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionTypes: builder.query({
      query: ({ academicYearId }: { academicYearId: string }) => ({
        url: `/all-concession-types`,
        method: 'GET',
        params: {
          academicYearId,
        },
      }),
      providesTags: [financeModuleType.concessionType],
    }),
    getConcessionTypeById: builder.query({
      query: ({ concessionTypeId }) => ({
        url: `/concession-types/${concessionTypeId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionType],
    }),
    postConcessionType: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/${academicYearId}/concession-types`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [financeModuleType.concessionType],
    }),
    putConcessionType: builder.mutation({
      query: ({ concessionTypeId, body }) => ({
        url: `/concession-types/${concessionTypeId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [financeModuleType.concessionType],
    }),
    deleteConcessionType: builder.mutation({
      query: ({ concessionTypeId }) => ({
        url: `/concession-types/${concessionTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.concessionType],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetConcessionTypesQuery,
  useGetConcessionTypeByIdQuery,
  usePostConcessionTypeMutation,
  usePutConcessionTypeMutation,
  useDeleteConcessionTypeMutation,
} = concessionTypeApi;

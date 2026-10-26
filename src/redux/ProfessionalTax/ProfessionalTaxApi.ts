import { api } from 'src/redux/service';
import { professionalType } from 'src/redux/tagTypes';

export const professionalTaxEndpoint = '/payroll/professional-taxes';

export const ProfessionalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfessionalTax: builder.query<any, { page?: number; pageSize?: number } | void>({
      query: (args) => {
        const { page = 1, pageSize = 20 } = args ?? {};
        return { url: professionalTaxEndpoint, method: 'GET', params: { page, pageSize } };
      },
      providesTags: [professionalType.pf],
    }),
    addProfessionalTax: builder.mutation({
      query: (body) => ({
        url: professionalTaxEndpoint,
        method: 'POST',
        body,
      }),
      invalidatesTags: [professionalType.pf],
    }),
    updateProfessionalTax: builder.mutation({
      query: ({ id, body }) => ({
        url: `${professionalTaxEndpoint}/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [professionalType.pf],
    }),
    deleteProfessionalTax: builder.mutation({
      query: (id) => ({
        url: `${professionalTaxEndpoint}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [professionalType.pf],
    }),
  }),
});

export const {
  useAddProfessionalTaxMutation,
  useDeleteProfessionalTaxMutation,
  useGetProfessionalTaxQuery,
  useUpdateProfessionalTaxMutation,
} = ProfessionalApi;

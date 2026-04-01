import { api } from 'src/redux/service';
import { professionalType } from 'src/redux/tagTypes';

export const ProfessionalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfessionalTax: builder.query({
      query: () => ({
        url: '/app/professional-tax',
        method: 'GET',
      }),
      providesTags: [professionalType.pf],
    }),
    addProfessionalTax: builder.mutation({
      query: (data) => ({
        url: '/app/professional-tax',
        method: 'POST',
        data,
      }),
      invalidatesTags: [professionalType.pf],
    }),
    updateProfessionalTax: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/professional-tax/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [professionalType.pf],
    }),
    deleteProfessionalTax: builder.mutation({
      query: (id) => ({
        url: `/app/professional-tax/${id}`,
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

import { api } from 'src/redux/service';
import { issueReturnFormType } from 'src/redux/tagTypes';

export const issueReturnFormApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIssueReturnForms: builder.query({
      query: () => ({
        url: '/issueReturnFormData',
        method: 'GET',
      }),
      providesTags: [issueReturnFormType.issueReturnForm],
    }),
  }),
});

export const { useGetIssueReturnFormsQuery } = issueReturnFormApi;

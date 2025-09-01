import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import issueReturnFormData from '../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const issueReturnFormApi = createApi({
  reducerPath: 'IssueReturnFormApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/issueReturnFormData') {
          return { data: issueReturnFormData.issueReturnFormData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['IssueReturnForm'],
  endpoints: (builder) => ({
    getIssueReturnForms: builder.query({
      query: () => ({
        url: '/issueReturnFormData',
        method: 'GET',
      }),
      providesTags: ['IssueReturnForm'],
    }),
  }),
});

export const { useGetIssueReturnFormsQuery } = issueReturnFormApi;

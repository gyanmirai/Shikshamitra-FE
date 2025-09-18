import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const surveyTypeOptionsApi = createApi({
  reducerPath: 'SurveyTypeOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/surveyTypeData') {
          return { data: communicationData.surveyTypeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['SurveyTypeOptions'],
  endpoints: (builder) => ({
    getSurveyTypeOptions: builder.query({
      query: () => ({
        url: '/surveyTypeData',
        method: 'GET',
      }),
      providesTags: ['SurveyTypeOptions'],
    }),
  }),
});

export const { useGetSurveyTypeOptionsQuery } = surveyTypeOptionsApi;

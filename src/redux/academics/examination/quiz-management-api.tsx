import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import quizData from 'src/json/academic/examination/quizPortalData.json';

const isDev = process.env.NODE_ENV === 'development';

export const quizManagementApi = createApi({
  reducerPath: 'quizManagementApi',
  baseQuery: isDev
    ? axiosBaseQuery({
        baseUrl: 'http://localhost:3001',
      })
    : async ({ url }) => {
        console.log('url', url);

        if (url === '/questions') {
          return { data: [quizData] };
        }
        return {
          error: {
            status: 404,
            data: 'No data found for this route',
          },
        };
      },
  tagTypes: ['Quiz'],
  endpoints: (builder) => ({
    getQuizList: builder.query<any[], void>({
      query: () => ({
        url: '/questions',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetQuizListQuery } = quizManagementApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import quizData from 'src/json/academic/examination/quizPortalData.json';

const isDev = process.env.NODE_ENV === 'development';
const jsonUrl = 'http://localhost:3001';

export const quizManagementApi = createApi({
  reducerPath: 'quizManagementApi',
  baseQuery: isDev
    ? axiosBaseQuery({
        baseUrl: jsonUrl,
      })
    : async ({ url }: { url: string }) => {
        if (url === '/questions') {
          return { data: quizData.questions };
        }
        return {
          error: { status: 404, data: 'No data found for this route' },
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

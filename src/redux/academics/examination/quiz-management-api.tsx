import { api } from 'src/redux/service';

export const quizManagementApi = api.injectEndpoints({
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

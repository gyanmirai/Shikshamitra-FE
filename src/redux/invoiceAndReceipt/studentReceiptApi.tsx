import { studentReceiptType } from 'src/redux/tagTypes';

import { api } from '../service';

const isDev = process.env.NODE_ENV === 'development';

export const studentReceiptApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentReceiptData: builder.query({
      query: () => ({
        url: '/studentReceiptData',
        method: 'GET',
      }),
      providesTags: [studentReceiptType.studentReceipt],
    }),
  }),
});

export const { useGetStudentReceiptDataQuery } = studentReceiptApi;

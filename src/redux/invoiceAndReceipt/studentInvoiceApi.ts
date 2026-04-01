import { api } from 'src/redux/service';
import { studentInvoiceType } from 'src/redux/tagTypes';

import studentInvoiceData from '../../../invoiceAndReceipt.json';


export const studentInvoiceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentInvoiceData: builder.query({
      query: () => ({
        url: '/studentInvoiceData',
        method: 'GET',
      }),
      providesTags: [studentInvoiceType.studentInvoice],
    }),
  }),
});

export const { useGetStudentInvoiceDataQuery } = studentInvoiceApi;

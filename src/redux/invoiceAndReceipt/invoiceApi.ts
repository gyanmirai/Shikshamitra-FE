import { api } from 'src/redux/service';
import { invoiceType } from 'src/redux/tagTypes';

import invoiceData from '../../../invoiceAndReceipt.json';


export const invoiceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInvoiceData: builder.query({
      query: () => ({
        url: '/invoiceData',
        method: 'GET',
      }),
      providesTags: [invoiceType.invoice],
    }),
  }),
});

export const { useGetInvoiceDataQuery } = invoiceApi;

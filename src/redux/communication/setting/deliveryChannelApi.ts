import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const deliveryChannelTypeOptionsApi = createApi({
  reducerPath: 'DeliveryChannelTypeOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/deliveryChannelTypeData') {
          return { data: communicationData.deliveryChannelTypeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['DeliveryChannelTypeOptions'],
  endpoints: (builder) => ({
    getDeliveryChannelTypeOptions: builder.query({
      query: () => ({
        url: '/deliveryChannelTypeData',
        method: 'GET',
      }),
      providesTags: ['DeliveryChannelTypeOptions'],
    }),
  }),
});

export const { useGetDeliveryChannelTypeOptionsQuery } = deliveryChannelTypeOptionsApi;

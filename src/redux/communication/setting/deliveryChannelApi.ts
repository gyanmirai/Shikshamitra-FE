import { communicationApi } from '../communicationApi';

export const deliveryChannelTypeOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeliveryChannelTypeOptions: builder.query({
      query: () => ({
        url: '/deliveryChannelTypeData',
        method: 'GET',
      }),
      providesTags: ['DeliveryChannelTypeOptions'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDeliveryChannelTypeOptionsQuery } = deliveryChannelTypeOptionsApi;

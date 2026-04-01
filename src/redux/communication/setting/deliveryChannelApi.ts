import { communicationApi } from '../communicationApi';
import { communicationType } from 'src/redux/tagTypes';


export const deliveryChannelTypeOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeliveryChannelTypeOptions: builder.query({
      query: () => ({
        url: '/deliveryChannelTypeData',
        method: 'GET',
      }),
      providesTags: [communicationType.deliveryChannelTypeOptions],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDeliveryChannelTypeOptionsQuery } = deliveryChannelTypeOptionsApi;

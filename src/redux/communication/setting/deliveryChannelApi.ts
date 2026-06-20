import { communicationType } from 'src/redux/tagTypes';

import { communicationApi } from '../communicationApi';

import type { PagedResultDto, ChannelProviderSettingDto } from '../communicationTypes';

export const deliveryChannelTypeOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeliveryChannelTypeOptions: builder.query({
      query: () => ({
        url: '/deliveryChannelTypeData',
        method: 'GET',
      }),
      providesTags: [communicationType.deliveryChannelTypeOptions],
    }),
    getProviderSettings: builder.query<PagedResultDto<ChannelProviderSettingDto>, any | void>({
      query: (params) => ({
        url: '/communication/provider-settings',
        method: 'GET',
        params,
      }),
      providesTags: [communicationType.communicationProviderSettings],
    }),
    getProviderSettingById: builder.query<ChannelProviderSettingDto, string>({
      query: (id) => ({
        url: `/communication/provider-settings/${id}`,
        method: 'GET',
      }),
      providesTags: [communicationType.communicationProviderSettings],
    }),
    createProviderSetting: builder.mutation<ChannelProviderSettingDto, any>({
      query: (data) => ({
        url: '/communication/provider-settings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        communicationType.communicationProviderSettings,
        communicationType.communicationDashboard,
      ],
    }),
    updateProviderSetting: builder.mutation<ChannelProviderSettingDto, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/communication/provider-settings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [
        communicationType.communicationProviderSettings,
        communicationType.communicationDashboard,
      ],
    }),
    deleteProviderSetting: builder.mutation<void, string>({
      query: (id) => ({
        url: `/communication/provider-settings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        communicationType.communicationProviderSettings,
        communicationType.communicationDashboard,
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDeliveryChannelTypeOptionsQuery,
  useGetProviderSettingsQuery,
  useGetProviderSettingByIdQuery,
  useCreateProviderSettingMutation,
  useUpdateProviderSettingMutation,
  useDeleteProviderSettingMutation,
} = deliveryChannelTypeOptionsApi;

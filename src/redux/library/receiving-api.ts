import { libraryModuleType, librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { libraryInventoryMutationTags, libraryReservationMutationTags } from './library-cache-tags';

import type {
  StockReceipt,
  ReceiveCommand,
  ReceivingInput,
  ReceivingPreview,
  ReceivingOptions,
  ReceivingHistoryPage,
  ReceivingHistoryParams,
} from './receiving-types';

export const libraryReceivingApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryReceivingHistory: builder.query<ReceivingHistoryPage, ReceivingHistoryParams>({
      query: (params) => ({ url: '/library/receiving', params }),
      providesTags: [libraryModuleType.receiving],
    }),
    previewReceiving: builder.mutation<ReceivingPreview, ReceivingInput>({
      query: (body) => ({ url: '/library/receiving/preview', method: 'POST', body }),
    }),
    receiveLibraryStock: builder.mutation<StockReceipt, ReceiveCommand>({
      query: (body) => ({ url: '/library/receiving', method: 'POST', body }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              ...libraryInventoryMutationTags,
              ...libraryReservationMutationTags,
              libraryModuleType.libraryNotificationHistory,
              libraryModuleType.receiving,
            ],
    }),
    getLibraryStockReceipt: builder.query<StockReceipt, { id: string }>({
      query: ({ id }) => ({ url: `/library/receiving/${encodeURIComponent(id)}` }),
    }),
    getLibraryReceivingOptions: builder.query<ReceivingOptions, void>({
      query: () => ({ url: '/library/receiving/options' }),
      providesTags: [librarySettingsType.librarySettings],
    }),
  }),
  overrideExisting: false,
});
export const {
  usePreviewReceivingMutation,
  useReceiveLibraryStockMutation,
  useGetLibraryStockReceiptQuery,
  useGetLibraryReceivingOptionsQuery,
  useGetLibraryReceivingHistoryQuery,
} = libraryReceivingApi;

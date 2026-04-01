import { api } from 'src/redux/service';
import { libraryChargeCategoryOptionsType } from 'src/redux/tagTypes';

import libraryData from '../../../../issueReturnData.json';


export const libraryChargeCategoryOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryChargeCategoryOptions: builder.query({
      query: () => ({
        url: '/libraryChargeCategory',
        method: 'GET',
      }),
      providesTags: [libraryChargeCategoryOptionsType.libraryChargeCategoryOptions],
    }),
  }),
});

export const { useGetLibraryChargeCategoryOptionsQuery } = libraryChargeCategoryOptionsApi;

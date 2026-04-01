import { api } from 'src/redux/service';
import { surveyTypeOptionsType } from 'src/redux/tagTypes';

export const surveyTypeOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSurveyTypeOptions: builder.query({
      query: () => ({
        url: '/surveyTypeData',
        method: 'GET',
      }),
      providesTags: [surveyTypeOptionsType.surveyTypeOptions],
    }),
  }),
});

export const { useGetSurveyTypeOptionsQuery } = surveyTypeOptionsApi;

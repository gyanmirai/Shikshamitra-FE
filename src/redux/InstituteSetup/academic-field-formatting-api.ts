import { api } from 'src/redux/service';
import { academicFieldFormattingType } from 'src/redux/tagTypes';

import type {
  AcademicNamePreview,
  AcademicFieldFormatting,
  AcademicNamePreviewInput,
} from './academic-field-formatting-types';

export { AcademicTextCase } from './academic-field-formatting-types';
export type { AcademicFieldFormatting } from './academic-field-formatting-types';

export const academicFieldFormattingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicNamePreview: builder.query<AcademicNamePreview, AcademicNamePreviewInput>({
      query: (body) => ({ url: '/app/academic-field-formatting/preview', method: 'POST', body }),
    }),
    getAcademicFieldFormatting: builder.query<AcademicFieldFormatting, void>({
      query: () => '/app/academic-field-formatting',
      providesTags: [academicFieldFormattingType.academicFieldFormatting],
    }),
    updateAcademicFieldFormatting: builder.mutation<
      AcademicFieldFormatting,
      AcademicFieldFormatting
    >({
      query: (body) => ({ url: '/app/academic-field-formatting', method: 'PUT', body }),
      invalidatesTags: (_result, error) =>
        error ? [] : [academicFieldFormattingType.academicFieldFormatting],
    }),
  }),
});

export const {
  useGetAcademicNamePreviewQuery,
  useGetAcademicFieldFormattingQuery,
  useUpdateAcademicFieldFormattingMutation,
} = academicFieldFormattingApi;

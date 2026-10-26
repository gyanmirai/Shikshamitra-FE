import { api } from 'src/redux/service';
import { instituteFieldFormattingType } from 'src/redux/tagTypes';

import type { AcademicTextCase } from './academic-field-formatting-types';

export type InstituteFormattingScope =
  'buildings' | 'roomTypes' | 'rooms' | 'shifts' | 'schoolIdentity' | 'schoolDocuments';
export type InstituteFieldFormatting = { fields: Record<string, AcademicTextCase> };

const base = '/app/institute-field-formatting';
const tag = instituteFieldFormattingType.instituteFieldFormatting;

export const instituteFieldFormattingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInstituteFieldFormatting: builder.query<InstituteFieldFormatting, InstituteFormattingScope>({
      query: (scope) => `${base}/${scope}`,
      providesTags: (_result, _error, scope) => [{ type: tag, id: scope }],
    }),
    updateInstituteFieldFormatting: builder.mutation<
      InstituteFieldFormatting,
      InstituteFieldFormatting & { scope: InstituteFormattingScope }
    >({
      query: ({ scope, fields }) => ({ url: `${base}/${scope}`, method: 'PUT', body: { fields } }),
      invalidatesTags: (_result, error, { scope }) => (error ? [] : [{ type: tag, id: scope }]),
    }),
    getInstituteFieldPreview: builder.query<
      { value: string },
      { scope: InstituteFormattingScope; value: string; textCase: AcademicTextCase }
    >({
      query: ({ scope, ...body }) => ({ url: `${base}/${scope}/preview`, method: 'POST', body }),
    }),
  }),
});

export const {
  useGetInstituteFieldFormattingQuery,
  useUpdateInstituteFieldFormattingMutation,
  useGetInstituteFieldPreviewQuery,
} = instituteFieldFormattingApi;

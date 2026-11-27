import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type NumberYearFormat = 0 | 1 | 2;
export type NumberResetPolicy = 0 | 1 | 2;
export type SaveAdmissionNumbering = {
  expectedVersion: number;
  beginNewSeries?: boolean;
  prefix: string;
  separator: string;
  suffix: string;
  yearFormat: NumberYearFormat;
  resetPolicy: NumberResetPolicy;
  digits: number;
  startingNumber: number;
};
export type AdmissionNumbering = SaveAdmissionNumbering & {
  isConfigured: boolean;
  sequenceLocked: boolean;
};
export type PreviewAdmissionNumbering = SaveAdmissionNumbering & { academicYearId?: string };
export type AdmissionNumberPreview = {
  nextNumber: string;
  nextSequence: number;
  startingNumberUnavailable?: boolean;
};
export type AdmissionNumberingHistoryEntry = Pick<
  SaveAdmissionNumbering,
  'prefix' | 'suffix' | 'separator' | 'yearFormat' | 'resetPolicy' | 'digits' | 'startingNumber'
> & {
  version: number;
  creationTime: string;
  changedByName: string | null;
};
const unwrap = (response: AdmissionNumbering | { data: AdmissionNumbering }) =>
  'data' in response ? response.data : response;
const tag = { type: studentAdmissionsCrmType.admissionCycle, id: 'APPLICATION_NUMBERING' };

export const admissionNumberingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionNumberingHistory: builder.query<AdmissionNumberingHistoryEntry[], void>({
      query: () => ({
        url: '/student/enrollment/admissions/application-numbering/history',
        method: 'GET',
      }),
      transformResponse: (
        response: AdmissionNumberingHistoryEntry[] | { data: AdmissionNumberingHistoryEntry[] }
      ) => (Array.isArray(response) ? response : response.data),
      providesTags: [tag],
    }),
    previewAdmissionNumbering: builder.query<AdmissionNumberPreview, PreviewAdmissionNumbering>({
      query: (body) => ({
        url: '/student/enrollment/admissions/application-numbering/preview',
        method: 'POST',
        body,
      }),
      transformResponse: (response: AdmissionNumberPreview | { data: AdmissionNumberPreview }) =>
        'data' in response ? response.data : response,
    }),
    getAdmissionNumbering: builder.query<AdmissionNumbering, void>({
      query: () => ({ url: '/student/enrollment/admissions/application-numbering', method: 'GET' }),
      transformResponse: unwrap,
      providesTags: [tag],
    }),
    saveAdmissionNumbering: builder.mutation<AdmissionNumbering, SaveAdmissionNumbering>({
      query: (body) => ({
        url: '/student/enrollment/admissions/application-numbering',
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: (_result, error) => (error ? [] : [tag]),
    }),
  }),
});

export const {
  useGetAdmissionNumberingHistoryQuery,
  useGetAdmissionNumberingQuery,
  useSaveAdmissionNumberingMutation,
  useLazyPreviewAdmissionNumberingQuery,
} = admissionNumberingApi;

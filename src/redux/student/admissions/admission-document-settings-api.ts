import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import { unwrapDocuments, DOCUMENT_VERIFICATION_URL } from './admission-document-types';

export type AdmissionDocumentTypeOption = {
  id: string;
  name: string;
  isRequired: boolean;
  allowedExtensions: string[];
  maxFileSizeMb: number;
};

export type AdmissionDocumentClassOption = { id: string; name: string; context: string };

export const admissionDocumentSettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionDocumentClasses: builder.query<AdmissionDocumentClassOption[], void>({
      query: () => `${DOCUMENT_VERIFICATION_URL}/classes`,
      transformResponse: (
        response: AdmissionDocumentClassOption[] | { data: AdmissionDocumentClassOption[] }
      ) => unwrapDocuments(response),
      providesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
    getAdmissionDocumentTypes: builder.query<AdmissionDocumentTypeOption[], void>({
      query: () => `${DOCUMENT_VERIFICATION_URL}/document-types`,
      transformResponse: (
        response: AdmissionDocumentTypeOption[] | { data: AdmissionDocumentTypeOption[] }
      ) => unwrapDocuments(response),
      providesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
  }),
  overrideExisting: true,
});

export const { useGetAdmissionDocumentTypesQuery, useGetAdmissionDocumentClassesQuery } =
  admissionDocumentSettingsApi;

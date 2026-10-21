import type {
  SchoolDocument,
  DocumentListParams,
  DocumentFormValues,
} from 'src/screens/setting/school-documents/types';

import { api } from 'src/redux/service';
import { instituteSetupType } from 'src/redux/tagTypes';

const base = '/institute-setup/school-documents';
const tag = instituteSetupType.schoolDocuments;

export function documentFormData(values: DocumentFormValues, concurrencyStamp = '') {
  const body = new FormData();
  body.append('name', values.name.trim());
  body.append('category', String(values.category));
  body.append('notes', values.notes.trim());
  body.append('concurrencyStamp', concurrencyStamp);
  values.retainedFiles.forEach((file) => body.append('retainedFileIds', file.id));
  values.files.forEach((file) => body.append('files', file));
  return body;
}

export const schoolDocumentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSchoolDocuments: builder.query<
      { items: SchoolDocument[]; totalCount: number },
      DocumentListParams
    >({
      query: (params) => ({ url: base, params }),
      providesTags: [tag],
    }),
    getSchoolDocument: builder.query<SchoolDocument, string>({
      query: (id) => `${base}/${id}`,
      providesTags: [tag],
      keepUnusedDataFor: 0,
    }),
    createSchoolDocument: builder.mutation<SchoolDocument, DocumentFormValues>({
      query: (values) => ({ url: base, method: 'POST', body: documentFormData(values) }),
      invalidatesTags: [tag],
    }),
    updateSchoolDocument: builder.mutation<
      SchoolDocument,
      { id: string; values: DocumentFormValues; concurrencyStamp: string }
    >({
      query: ({ id, values, concurrencyStamp }) => ({
        url: `${base}/${id}`,
        method: 'PUT',
        body: documentFormData(values, concurrencyStamp),
      }),
      invalidatesTags: [tag],
    }),
    deleteSchoolDocument: builder.mutation<void, string>({
      query: (id) => ({ url: `${base}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tag],
    }),
    downloadSchoolDocument: builder.mutation<Blob, { id: string; fileId: string }>({
      query: ({ id, fileId }) => ({
        url: `${base}/${id}/files/${fileId}`,
        params: { download: true },
        responseHandler: async (response) => (response.ok ? response.blob() : response.json()),
      }),
    }),
  }),
});

export const {
  useGetSchoolDocumentsQuery,
  useGetSchoolDocumentQuery,
  useCreateSchoolDocumentMutation,
  useUpdateSchoolDocumentMutation,
  useDeleteSchoolDocumentMutation,
  useDownloadSchoolDocumentMutation,
} = schoolDocumentsApi;

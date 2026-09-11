import { api } from 'src/redux/service';

import { DOCUMENT_VERIFICATION_URL } from './admission-document-types';

export const admissionDocumentDownloadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    downloadAdmissionDocument: builder.mutation<
      { downloaded: true },
      { evidenceId: string; fileName: string; studentId?: string }
    >({
      async queryFn({ evidenceId, fileName, studentId }, _queryApi, _options, baseQuery) {
        const url = studentId
          ? `/student/records/students/${studentId}/admission-evidence/${evidenceId}/download`
          : `${DOCUMENT_VERIFICATION_URL}/evidence/${evidenceId}/download`;
        const result = await baseQuery({
          url,
          responseHandler: (response) => (response.ok ? response.blob() : response.json()),
        });
        if (result.error) return { error: result.error };
        if (!(result.data instanceof Blob))
          return {
            error: { status: 'CUSTOM_ERROR', error: 'The document could not be downloaded.' },
          };
        // Keep private bytes and temporary URLs outside the Redux cache; downloads use the authenticated base query.
        const objectUrl = URL.createObjectURL(result.data);
        const anchor = document.createElement('a');
        try {
          anchor.href = objectUrl;
          anchor.download = fileName.split(/[\\/]/).at(-1) || 'admission-document';
          document.body.appendChild(anchor);
          anchor.click();
        } finally {
          anchor.remove();
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        }
        return { data: { downloaded: true } };
      },
    }),
  }),
});
export const { useDownloadAdmissionDocumentMutation } = admissionDocumentDownloadApi;

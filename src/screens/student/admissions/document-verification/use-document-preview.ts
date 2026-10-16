import type { AdmissionDocumentEvidence } from 'src/redux/student/admissions/admission-document-types';

import { useState, useEffect } from 'react';
import { usePreviewAdmissionDocumentMutation } from 'src/redux/student/admissions/admission-document-download-api';

type PreviewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'unsupported' }
  | { status: 'ready'; url: string; contentType: string };

const previewTypes = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

export function useDocumentPreview(evidence: AdmissionDocumentEvidence) {
  const [load] = usePreviewAdmissionDocumentMutation();
  const [attempt, setAttempt] = useState(0);
  const [preview, setPreview] = useState<PreviewState>({ status: 'loading' });

  useEffect(() => {
    let disposed = false;
    let objectUrl = '';
    setPreview({ status: 'loading' });
    const request = load({
      evidenceId: evidence.id,
      receive: (file) => {
        if (disposed) return;
        const responseType = file.type.split(';')[0].toLowerCase();
        const contentType =
          !responseType || responseType === 'application/octet-stream'
            ? (evidence.contentType?.toLowerCase() ?? '')
            : responseType;
        if (!file.size) {
          setPreview({ status: 'error' });
        } else if (!previewTypes.has(contentType)) {
          setPreview({ status: 'unsupported' });
        } else {
          objectUrl = URL.createObjectURL(
            responseType === contentType ? file : new Blob([file], { type: contentType })
          );
          setPreview({ status: 'ready', url: objectUrl, contentType });
        }
      },
    });
    request.unwrap().catch(() => {
      if (!disposed) setPreview({ status: 'error' });
    });
    return () => {
      disposed = true;
      request.abort();
      request.reset();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [evidence.id, evidence.contentType, load, attempt]);

  return { preview, retry: () => setAttempt((value) => value + 1) };
}

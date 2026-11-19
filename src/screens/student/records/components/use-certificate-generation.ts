import type {
  CertificateResponse,
  CertificateBranding,
  CertificatePreviewInput,
} from 'src/redux/student/records/student-record-documents-api';

import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  downloadRecordPdf,
  useIssueRecordCertificateMutation,
  useDownloadRecordDocumentMutation,
  usePreviewRecordCertificateMutation,
} from 'src/redux/student/records/student-record-documents-api';

import { certificateFailureMessage } from './certificate-flow';

export function useCertificateGeneration(
  requests: CertificatePreviewInput[],
  focusedId: string,
  enabled: boolean
) {
  const [previewCertificate] = usePreviewRecordCertificateMutation();
  const [issueCertificate] = useIssueRecordCertificateMutation();
  const [downloadPdf] = useDownloadRecordDocumentMutation();
  const request = requests.find((item) => item.studentId === focusedId);
  const previewKey =
    enabled && request && (request.certificateType !== 3 || request.transitionId)
      ? JSON.stringify(request)
      : '';
  const [previewState, setPreviewState] = useState<{
    key: string;
    value?: CertificateResponse;
    failed?: string;
  }>({ key: '' });
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const brandingCache = useRef(
    new Map<string, { assets: string; branding?: CertificateBranding | null }>()
  );
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [failure, setFailure] = useState('');
  const [results, setResults] = useState<CertificateResponse[]>([]);
  const [complete, setComplete] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const attemptedRef = useRef(false);
  const issued = useRef(new Map<string, CertificateResponse>());
  const keys = useRef<Record<string, string>>({});
  const busyRef = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  useEffect(() => {
    enabledRef.current = enabled;
    return () => {
      enabledRef.current = false;
    };
  }, [enabled]);

  useEffect(() => {
    if (!previewKey || complete) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const input = JSON.parse(previewKey) as CertificatePreviewInput;
        if (input.omitSchoolBranding) {
          const value = await previewCertificate({ ...input, includeBranding: false }).unwrap();
          if (!cancelled) {
            setPreviewState({ key: previewKey, value: { ...value, branding: undefined } });
          }
          return;
        }
        const context = JSON.stringify([
          input.studentId,
          input.certificateType,
          input.expectedAcademicYearId,
        ]);
        const cached = brandingCache.current.get(context);
        let value = await previewCertificate({ ...input, includeBranding: !cached }).unwrap();
        if (cancelled) return;
        const assetsOf = (item: CertificateResponse) =>
          JSON.stringify([
            item.template.schoolIdentity?.logoAssetId,
            item.template.schoolIdentity?.bannerAssetId,
          ]);
        if (cached && cached.assets !== assetsOf(value)) {
          value = await previewCertificate({ ...input, includeBranding: true }).unwrap();
          if (cancelled) return;
        } else if (cached) value = { ...value, branding: cached.branding };
        brandingCache.current.set(context, { assets: assetsOf(value), branding: value.branding });
        if (brandingCache.current.size > 4) {
          const oldest = brandingCache.current.keys().next().value;
          if (oldest) brandingCache.current.delete(oldest);
        }
        if (!cancelled) setPreviewState({ key: previewKey, value });
      } catch (error) {
        if (!cancelled)
          setPreviewState({
            key: previewKey,
            failed: certificateFailureMessage(
              error,
              'Certificate preview could not be loaded. Retry or review the certificate details and student eligibility.'
            ),
          });
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [previewKey, previewCertificate, complete, previewAttempt]);

  const retryPreview = () => {
    if (!enabledRef.current || busyRef.current) return;
    setPreviewState({ key: '' });
    setPreviewAttempt((value) => value + 1);
  };

  const download = async (certificate: CertificateResponse) => {
    if (!certificate.certificateId) return;
    const blob = await downloadPdf({
      kind: 'certificates',
      id: certificate.certificateId,
    }).unwrap();
    if (enabledRef.current) downloadRecordPdf(blob, `${certificate.certificateNo}.pdf`);
  };
  const downloadExisting = async (certificate: CertificateResponse) => {
    if (busyRef.current || !enabledRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await download(certificate);
    } catch {
      shikshaMitraToast.error({
        message: 'The certificate is saved. Its PDF could not be downloaded; try Download again.',
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const generate = async () => {
    if (busyRef.current || !enabledRef.current || !requests.length || complete) return;
    busyRef.current = true;
    setBusy(true);
    setFailure('');
    const fingerprint = JSON.stringify(requests);
    const key = keys.current[fingerprint] ?? crypto.randomUUID();
    keys.current[fingerprint] = key;
    try {
      // Validate every unissued student before the first write. The server still rechecks issuance.
      const remaining = requests.filter((item) => !issued.current.has(item.studentId));
      await remaining.reduce(async (previous, input, index) => {
        await previous;
        if (!enabledRef.current) throw new Error('Document context changed');
        setProgress(`Checking ${index + 1} of ${remaining.length} certificates…`);
        await previewCertificate(input).unwrap();
      }, Promise.resolve());
      await remaining.reduce(async (previous, input) => {
        await previous;
        if (!enabledRef.current) throw new Error('Document context changed');
        setProgress(`Generating ${issued.current.size + 1} of ${requests.length} certificates…`);
        attemptedRef.current = true;
        setAttempted(true);
        const certificate = await issueCertificate({
          ...input,
          idempotencyKey: `${key}-${input.studentId}`,
        }).unwrap();
        issued.current.set(input.studentId, certificate);
        setResults([...issued.current.values()]);
      }, Promise.resolve());
      setComplete(true);
      shikshaMitraToast.success({
        message: `${issued.current.size} certificate${issued.current.size === 1 ? '' : 's'} generated.`,
      });
      await [...issued.current.values()].reduce(async (previous, certificate) => {
        await previous;
        if (!enabledRef.current) return;
        try {
          await download(certificate);
        } catch {
          shikshaMitraToast.error({
            message: `${certificate.certificateNo} is saved. Use Download to retry its PDF.`,
          });
        }
      }, Promise.resolve());
    } catch {
      setFailure(
        issued.current.size
          ? `${issued.current.size} of ${requests.length} certificates generated. Retry the remaining certificates without duplicating issued records.`
          : attemptedRef.current
            ? 'Generation could not be confirmed. Retry this request to recover saved certificates without creating duplicates.'
            : 'No certificates were generated. Review the certificate details and student eligibility, then try again.'
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
      setProgress('');
    }
  };
  const currentPreview = previewState.key === previewKey ? previewState : undefined;
  return {
    preview: currentPreview?.value,
    previewFailed: !!currentPreview?.failed,
    previewFailure: currentPreview?.failed,
    retryPreview,
    previewLoading: !!previewKey && !currentPreview,
    busy,
    progress,
    failure,
    results,
    complete,
    attempted,
    generate,
    downloadExisting,
  };
}

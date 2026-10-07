import { useState, useEffect, useCallback } from 'react';

export const isOfficialPayslipStatus = (status: string | number | null | undefined): boolean =>
  [1, 2, '1', '2', 'finalized', 'paid'].includes(typeof status === 'string' ? status.toLowerCase().trim() : status ?? '');

type Options = {
  selectionKey: string | null;
  fileName: string;
  loadPdf: (() => Promise<Blob | null | undefined>) | null;
};

// One server artifact serves preview, print and download. Never manufacture a fallback document.
export function usePayslipActions({ selectionKey, fileName, loadPdf }: Options) {
  const [pdf, setPdf] = useState<{ key: string; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    setPdf(null);
    setError(null);
    if (!selectionKey || !loadPdf) { setIsLoading(false); return undefined; }
    setIsLoading(true);
    loadPdf().then((blob) => {
      if (cancelled) return;
      if (!blob?.size || blob.type !== 'application/pdf') throw new Error('Invalid payslip PDF response.');
      url = URL.createObjectURL(blob);
      setPdf({ key: selectionKey, url });
    }).catch(() => {
      if (!cancelled) setError('The payslip PDF could not be loaded.');
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [selectionKey, loadPdf, retry]);

  const pdfUrl = pdf?.key === selectionKey ? pdf.url : null;
  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  }, [pdfUrl, fileName]);
  return { pdfUrl, isLoading, error, handleDownload, retry: () => setRetry((value) => value + 1) };
}

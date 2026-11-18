import { useRef, useState, useEffect } from 'react';

import type { AdmissionPrintDocument, AdmissionPrintBranding } from './form-print-model';

/** Only the latest request may become printable; superseded object URLs are always released. */
export function useAdmissionPrintPreview(
  model: AdmissionPrintDocument,
  branding: AdmissionPrintBranding,
  enabled: boolean
) {
  const request = JSON.stringify({ model, branding });
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ request: string; url: string } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const activeUrl = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    let url: string | undefined;
    const generate = async () => {
      const { createAdmissionFormPdfBlob } = await import('./form-print-pdf');
      const data = JSON.parse(request) as {
        model: AdmissionPrintDocument;
        branding: AdmissionPrintBranding;
      };
      const blob = await createAdmissionFormPdfBlob(data.model, data.branding);
      if (!active) return;
      url = URL.createObjectURL(blob);
      activeUrl.current = url;
      setResult({ request, url });
      setFailed(null);
    };
    generate().catch(() => {
      if (active) setFailed(request);
    });
    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
        if (activeUrl.current === url) activeUrl.current = null;
      }
    };
  }, [request, enabled, revision]);
  const ready =
    enabled &&
    failed !== request &&
    result?.request === request &&
    result.url === activeUrl.current;
  return {
    url: ready ? result.url : undefined,
    loading: enabled && failed !== request && !ready,
    error: enabled && failed === request,
    retry: () => {
      setFailed(null);
      setResult(null);
      setRevision((value) => value + 1);
    },
  };
}

export function downloadAdmissionForm(url: string, name: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  const safeName = Array.from(name)
    .map((character) => (character.charCodeAt(0) < 32 ? '-' : character))
    .join('')
    .replace(/[<>:"/\\|?*]/g, '-')
    .slice(0, 100);
  anchor.download = `${safeName || 'Registration form'}.pdf`;
  anchor.click();
}

export function printAdmissionForm(url: string) {
  const frame = document.createElement('iframe');
  frame.title = 'Registration form print document';
  frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-10000px;border:0';
  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
  };
  frame.src = url;
  document.body.appendChild(frame);
  const cleanup = () => {
    frame.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup, { once: true });
  // Browser PDF viewers do not consistently propagate afterprint to the parent.
  window.setTimeout(cleanup, 300_000);
}

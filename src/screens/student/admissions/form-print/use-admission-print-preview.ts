import { useRef, useState, useEffect } from 'react';

import { renderAdmissionPrintPdf } from './admission-print-render';

import type { AdmissionPrintDocument, AdmissionPrintBranding } from './form-print-model';

/** Only the latest request may become printable; superseded object URLs are always released. */
export function useAdmissionPrintPreview(
  model: AdmissionPrintDocument,
  branding: AdmissionPrintBranding,
  enabled: boolean,
  debounceMs = 0,
  previewContext?: string
) {
  const request = JSON.stringify({ model, branding });
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    request: string;
    context?: string;
    revision: number;
    url: string;
  } | null>(null);
  const [failed, setFailed] = useState<{ request: string; message?: string } | null>(null);
  const activeUrl = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
      activeUrl.current = null;
    },
    []
  );
  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    const { signal } = controller;
    const generate = async () => {
      const blob = await renderAdmissionPrintPdf(request, signal);
      if (signal.aborted) return;
      const url = URL.createObjectURL(blob);
      if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
      activeUrl.current = url;
      setResult({ request, context: previewContext, revision, url });
      setFailed(null);
    };
    const run = () =>
      generate().catch((error: unknown) => {
        if (!signal.aborted) {
          setFailed({
            request,
            message:
              error instanceof Error &&
              ['AdmissionPrintLayoutError', 'AdmissionPrintTimeoutError'].includes(error.name)
                ? error.message
                : undefined,
          });
        }
      });
    const timer = debounceMs ? window.setTimeout(run, debounceMs) : undefined;
    if (timer === undefined) run();
    return () => {
      controller.abort();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [request, enabled, revision, debounceMs, previewContext]);
  const retain = previewContext !== undefined && result?.context === previewContext;
  useEffect(() => {
    if (!result || retain || (enabled && result.request === request && result.context === previewContext)) return;
    if (result.url === activeUrl.current) {
      URL.revokeObjectURL(result.url);
      activeUrl.current = null;
    }
    setResult(null);
  }, [enabled, previewContext, request, result, retain]);
  const failedRequest = failed?.request === request;
  const ready =
    enabled &&
    !failedRequest &&
    result?.request === request &&
    result.context === previewContext &&
    result.revision === revision &&
    result.url === activeUrl.current;
  return {
    url: ready ? result.url : undefined,
    previewUrl: retain && result?.url === activeUrl.current ? result?.url : undefined,
    loading: enabled && !failedRequest && !ready,
    error: enabled && failedRequest,
    errorMessage: enabled && failedRequest ? failed.message : undefined,
    retry: () => {
      setFailed(null);
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

import type { AdmissionPrintDocument, AdmissionPrintBranding } from './form-print-model';

export type AdmissionPrintRenderRequest = { request: string; fontBasePath: string };
export type AdmissionPrintRenderResult = { blob: Blob } | { layoutError?: string };

function renderError(name: string, message: string) {
  return Object.assign(new Error(message), { name });
}

export async function renderAdmissionPrintPdf(request: string, signal: AbortSignal): Promise<Blob> {
  signal.throwIfAborted();
  if (typeof Worker === 'undefined') {
    const { createAdmissionFormPdfBlob } = await import('./form-print-pdf');
    signal.throwIfAborted();
    const { model, branding } = JSON.parse(request) as {
      model: AdmissionPrintDocument;
      branding: AdmissionPrintBranding;
    };
    return createAdmissionFormPdfBlob(model, branding);
  }

  return new Promise<Blob>((resolve, reject) => {
    const worker = new Worker(new URL('./form-print-pdf.worker.ts', import.meta.url), {
      type: 'module',
    });
    const finish = (callback: () => void) => {
      window.clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      worker.terminate();
      callback();
    };
    const abort = () => finish(() => reject(signal.reason));
    const timer = window.setTimeout(() => {
      finish(() =>
        reject(
          renderError(
            'AdmissionPrintTimeoutError',
            'The print preview took too long. Retry or print a smaller scope.'
          )
        )
      );
    }, 30_000);

    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = ({ data }: MessageEvent<AdmissionPrintRenderResult>) =>
      finish(() => {
        if ('blob' in data) resolve(data.blob);
        else if (data.layoutError) reject(renderError('AdmissionPrintLayoutError', data.layoutError));
        else reject(new Error('PDF generation failed.'));
      });
    const handleWorkerError = () => finish(() => reject(new Error('Could not load the PDF renderer.')));
    worker.onerror = handleWorkerError;
    worker.onmessageerror = handleWorkerError;
    try {
      const input: AdmissionPrintRenderRequest = {
        request,
        fontBasePath: new URL('/fonts', window.location.href).href,
      };
      worker.postMessage(input);
    } catch (error) {
      finish(() => reject(error));
    }
  });
}

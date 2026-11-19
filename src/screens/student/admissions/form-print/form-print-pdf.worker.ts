import { createAdmissionFormPdfBlob } from './form-print-pdf';

import type { AdmissionPrintDocument, AdmissionPrintBranding } from './form-print-model';
import type {
  AdmissionPrintRenderRequest,
  AdmissionPrintRenderResult,
} from './admission-print-render';

const worker = globalThis as unknown as {
  onmessage: (event: MessageEvent<AdmissionPrintRenderRequest>) => void;
  postMessage: (result: AdmissionPrintRenderResult) => void;
};

worker.onmessage = async ({ data: { request, fontBasePath } }) => {
  try {
    const { model, branding } = JSON.parse(request) as {
      model: AdmissionPrintDocument;
      branding: AdmissionPrintBranding;
    };
    worker.postMessage({ blob: await createAdmissionFormPdfBlob(model, branding, fontBasePath) });
  } catch (error) {
    worker.postMessage({
      layoutError:
        error instanceof Error && error.name === 'AdmissionPrintLayoutError'
          ? error.message
          : undefined,
    });
  }
};

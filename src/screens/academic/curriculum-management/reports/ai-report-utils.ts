import type { AcademicReportDownloadResponse } from 'src/redux/academicAPI/AcademicReportApi';

function base64ToBlob(bytes: string, contentType: string): Blob {
  const characters = window.atob(bytes);
  const values = new Uint8Array(characters.length);
  for (let index = 0; index < characters.length; index += 1) {
    values[index] = characters.charCodeAt(index);
  }
  return new Blob([values], { type: contentType });
}

export function saveAcademicReportFile(data: AcademicReportDownloadResponse): void {
  const contentType = data.contentType || 'application/pdf';
  const fileBlob = data.bytes
    ? base64ToBlob(data.bytes, contentType)
    : data.blob;

  if (!fileBlob || fileBlob.size === 0) {
    throw new Error('The report download did not contain file data.');
  }

  const url = URL.createObjectURL(fileBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = data.fileName || 'ShikshaMitra_AI_Report.pdf';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Chromium/WebView can consume the object URL after click() returns. Revoking it
  // synchronously makes the UI report success even though no file is written.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function startAcademicReportDownload(jobId: string): void {
  const normalizedJobId = jobId.trim();
  if (!normalizedJobId) {
    throw new Error('The report download is missing its job identifier.');
  }

  const link = document.createElement('a');
  link.href = `/api/academic-reports/${encodeURIComponent(normalizedJobId)}/download`;
  link.download = '';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function getAcademicReportErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;

  const apiError = error as {
    data?: {
      detail?: string;
      message?: string;
      error?: { code?: string; message?: string; data?: Record<string, unknown> };
    };
  };

  const knownMessages: Record<string, string> = {
    'Academic:Reports:AiNotConfigured':
      'ShikshaMitra AI is not configured. Ask an administrator to configure the AI provider API key.',
    'Academic:Reports:AiServiceUnavailable':
      'ShikshaMitra AI is temporarily unavailable. Please try again.',
    'Academic:Reports:AiInvalidResponse':
      'ShikshaMitra AI could not create a valid report plan. Please make your request more specific.',
    'Academic:Reports:AiUnsupportedReportType':
      'That report is not supported in Curriculum Reports yet.',
    'Academic:Reports:AiModuleNotAvailable':
      'This Academic report module is not available in ShikshaMitra AI yet.',
    'Academic:Reports:AiUnsafeRequest':
      'This request cannot be processed because it contains unsafe instructions.',
    'Academic:Reports:AiDatasetNotAllowed':
      'The requested data is not available in Curriculum Reports.',
    'Academic:Reports:AiInvalidCatalogToken':
      'The request refers to Curriculum data that is unavailable or outside your access scope.',
    'Academic:Reports:AiAcademicContextRequired':
      'Select an Academic Year, Board, and Medium before creating the report.',
    'Academic:Reports:AiAcademicContextInvalid':
      'The selected Academic Year, Board, and Medium are not a valid combination.',
    'Academic:Reports:AiFilterCouldNotBeResolved':
      'A requested report filter could not be matched. Check the class, division, subject, or chapter name and try again.',
  };
  const errorCode = apiError.data?.error?.code;
  const apiMessage =
    apiError.data?.detail || apiError.data?.error?.message || apiError.data?.message || '';
  if (
    errorCode?.endsWith('AiModuleScopeMismatch') ||
    /ai module scope mismatch/i.test(apiMessage)
  ) {
    const errorData = apiError.data?.error?.data;
    const requestedModule = errorData?.RequestedModule ?? errorData?.requestedModule;
    const moduleLabel = typeof requestedModule === 'string' ? requestedModule : 'another Academic';
    return `${moduleLabel} reports are not available from Curriculum Reports. Open the appropriate module to request that report.`;
  }
  if (errorCode && knownMessages[errorCode]) return knownMessages[errorCode];

  return (
    apiMessage || fallback
  );
}

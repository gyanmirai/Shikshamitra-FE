import { vi, it, expect, describe, afterEach } from 'vitest';

import {
  saveAcademicReportFile,
  startAcademicReportDownload,
  getAcademicReportErrorMessage,
} from './ai-report-utils';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('saveAcademicReportFile', () => {
  it('starts the browser download before releasing the PDF object URL', () => {
    vi.useFakeTimers();
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    saveAcademicReportFile({
      blob: new Blob(['%PDF-1.7'], { type: 'application/pdf' }),
      bytes: 'JVBERi0xLjc=',
      contentType: 'application/pdf',
      fileName: 'curriculum-report.pdf',
    });

    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:report');
  });

  it('reconstructs a fresh PDF blob from the base64 response', () => {
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    saveAcademicReportFile({
      blob: new Blob([]),
      bytes: 'JVBERi0xLjc=',
      contentType: 'application/pdf',
      fileName: 'curriculum-report.pdf',
    });

    const savedBlob = createObjectUrl.mock.calls[0][0] as Blob;
    expect(savedBlob.size).toBeGreaterThan(0);
    expect(savedBlob.type).toBe('application/pdf');
  });

  it('rejects an empty download payload instead of showing false success', () => {
    expect(() => saveAcademicReportFile({ blob: new Blob([]), bytes: '' })).toThrow(
      'The report download did not contain file data.'
    );
  });
});

describe('startAcademicReportDownload', () => {
  it('uses the authenticated same-origin download route', () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    startAcademicReportDownload('3a23a6b6-f55d-bc60-28c5-e3599a88f7c1');

    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector('a[href*="academic-reports"]')).toBeNull();
  });
});

describe('getAcademicReportErrorMessage', () => {
  it('maps missing AI configuration to an actionable message', () => {
    const message = getAcademicReportErrorMessage(
      {
        data: {
          error: { code: 'Academic:Reports:AiNotConfigured', message: 'Business error' },
        },
      },
      'fallback'
    );

    expect(message).toContain('AI provider API key');
  });

  it('explains when a prompt belongs to another Academic module', () => {
    const message = getAcademicReportErrorMessage(
      {
        data: {
          error: {
            code: 'Academic:Reports:AiModuleScopeMismatch',
            data: { RequestedModule: 'Homework' },
          },
        },
      },
      'fallback'
    );

    expect(message).toContain('Homework reports are not available from Curriculum Reports');
  });

  it('uses a specific API detail when the code is not known', () => {
    const message = getAcademicReportErrorMessage(
      { data: { detail: 'The selected division is outside your access scope.' } },
      'fallback'
    );

    expect(message).toBe('The selected division is outside your access scope.');
  });

  it('falls back safely for non-API errors', () => {
    expect(getAcademicReportErrorMessage(null, 'Could not generate report.')).toBe(
      'Could not generate report.'
    );
  });
});

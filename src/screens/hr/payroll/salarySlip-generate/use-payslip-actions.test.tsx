import { act, waitFor, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { usePayslipActions } from './use-payslip-actions';

const createObjectURL = vi.fn(() => 'blob:server-pdf');
const revokeObjectURL = vi.fn();
const blob = new Blob(['server PDF'], { type: 'application/pdf' });

describe('server payslip document actions', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    createObjectURL.mockClear(); revokeObjectURL.mockClear();
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('uses one fetched artifact URL for the PDF renderer and download', async () => {
    const loadPdf = vi.fn().mockResolvedValue(blob);
    let downloadedUrl: string | undefined;
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function clickDownload(this: HTMLAnchorElement) {
      downloadedUrl = this.href;
    });
    const { result } = renderHook(() => usePayslipActions({ selectionKey: 'document-1', fileName: 'Payslip.pdf', loadPdf }));
    await waitFor(() => expect(result.current.pdfUrl).toBe('blob:server-pdf'));
    act(() => { result.current.handleDownload(); });
    expect(loadPdf).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(downloadedUrl).toBe(result.current.pdfUrl);
    expect(click).toHaveBeenCalled();
  });

  it('does not fabricate a PDF when the server preview is missing', async () => {
    const loadPdf = vi.fn().mockRejectedValue({ status: 404 });
    const { result } = renderHook(() => usePayslipActions({ selectionKey: 'draft-1', fileName: 'Preview.pdf', loadPdf }));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.pdfUrl).toBeNull();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('ignores a late response for the previously selected employee', async () => {
    let resolveOld!: (value: Blob) => void;
    const oldLoad = vi.fn(() => new Promise<Blob>((resolve) => { resolveOld = resolve; }));
    const nextLoad = vi.fn().mockResolvedValue(blob);
    const { result, rerender } = renderHook(({ selectionKey, loadPdf }) => usePayslipActions({ selectionKey, loadPdf, fileName: 'Payslip.pdf' }),
      { initialProps: { selectionKey: 'employee-old', loadPdf: oldLoad } });
    rerender({ selectionKey: 'employee-new', loadPdf: nextLoad });
    await waitFor(() => expect(result.current.pdfUrl).toBe('blob:server-pdf'));
    await act(async () => { resolveOld(new Blob(['wrong employee'], { type: 'application/pdf' })); });
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledWith(blob);
  });

  it('revokes its private artifact URL on unmount', async () => {
    const loadPdf = vi.fn().mockResolvedValue(blob);
    const { result, unmount } = renderHook(() => usePayslipActions({ selectionKey: 'document-1', fileName: 'Payslip.pdf', loadPdf }));
    await waitFor(() => expect(result.current.pdfUrl).toBeTruthy());
    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:server-pdf');
  });
});

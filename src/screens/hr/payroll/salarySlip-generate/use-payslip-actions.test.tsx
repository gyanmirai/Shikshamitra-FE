import dayjs from 'dayjs';
import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach } from 'vitest';

import { usePayslipActions } from './use-payslip-actions';

const output = vi.fn(() => new Blob(['preview'], { type: 'application/pdf' }));

vi.mock('react-to-print', () => ({
  useReactToPrint: () => vi.fn(),
}));

vi.mock('jspdf', () => {
  class JsPdfMock {
    internal = {
      pageSize: {
        getWidth: () => 595,
        getHeight: () => 842,
      },
    };

    line = vi.fn();

    output = output;

    setDrawColor = vi.fn();

    setFont = vi.fn();

    setFontSize = vi.fn();

    setTextColor = vi.fn();

    text = vi.fn();
  }

  return { jsPDF: JsPdfMock };
});

describe('usePayslipActions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    output.mockClear();
  });

  it('generates a client preview PDF when preview endpoint returns resource not found', async () => {
    const createObjectURL = vi
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:preview-pdf');
    const revokeObjectURL = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const downloadPreviewPdf = vi.fn().mockRejectedValue({ status: 404, error: 'Not Found' });
    const downloadOfficialPdf = vi.fn();

    const { result } = renderHook(() =>
      usePayslipActions({
        printRef: { current: document.createElement('div') },
        employee: { label: 'Asha Patel' },
        monthYear: dayjs('2026-06-01'),
        employeeSalarySlip: {
          status: 'Draft',
          totalEarning: 25000,
          totalDeduction: 1500,
          netSalary: 23500,
          earnings: [{ name: 'Basic', amount: 25000 }],
          deductions: [{ name: 'PF', amount: 1500 }],
        },
        downloadOfficialPdf,
        downloadPreviewPdf,
      })
    );

    await act(async () => {
      await result.current.handleDownload();
    });

    expect(downloadPreviewPdf).toHaveBeenCalledTimes(1);
    expect(downloadOfficialPdf).not.toHaveBeenCalled();
    expect(output).toHaveBeenCalledWith('blob');
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview-pdf');
  });
});

import type { Dayjs } from 'dayjs';
import type { RefObject } from 'react';

import { toast } from 'sonner';
import { useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

// Standard structure for both earnings and deductions
interface EarningDeduction {
  name: string;
  amount: number | null | undefined; // Accept potentially missing amounts
}

// Minimal employee definition needed for this hook
interface Employee {
  label: string; // The primary display name
}

// Complete structure of a salary slip
interface SalarySlip {
  totalEarning: number | null | undefined;
  totalDeduction: number | null | undefined;
  netSalary: number | null | undefined;
  earnings: EarningDeduction[];
  deductions: EarningDeduction[];
}

// Parameters for the usePayslipActions hook
interface UsePayslipActionsParams {
  printRef: RefObject<HTMLDivElement | null>;
  employee: Employee | null | undefined;
  monthYear: Dayjs | null | undefined;
  employeeSalarySlip: SalarySlip | null | undefined;
  downloadOfficialPdf: () => Promise<Blob | null | undefined>;
}

// ---------------------------------------------------------------------------
// PDF-safe currency formatter used by payslip helpers.
// ---------------------------------------------------------------------------
export const pdfCurrency = (val: number | null | undefined): string => {
  // Gracefully handle undefined, null, or other falsey non-zero values
  if (!val && val !== 0) {
    return 'Rs. 0.00';
  }

  // Handle the edge case of formatting as zero when no valid number is present
  const valueToFormat = val ?? 0;

  return `Rs. ${valueToFormat.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ---------------------------------------------------------------------------
// Hook — returns handlePrint and handleDownload
// ---------------------------------------------------------------------------

export function usePayslipActions({
  printRef,
  employee,
  monthYear,
  employeeSalarySlip,
  downloadOfficialPdf,
}: UsePayslipActionsParams) {
  const [isDownloading, setIsDownloading] = useState(false);

  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Payslip_${employee?.label || 'Employee'}_${monthYear?.format('MMM-YYYY') || ''}`,
  });

  // ── Download PDF ─────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!employeeSalarySlip || isDownloading) return;

    setIsDownloading(true);
    downloadOfficialPdf()
      .then((blob) => {
        if (!blob || blob.size === 0 || (blob.type && blob.type !== 'application/pdf')) {
          throw new Error('Invalid payslip PDF response.');
        }

        const employeeName = sanitizeFileName(employee?.label || 'Employee');
        const fileName = `Payslip_${employeeName}_${monthYear?.format('MMM-YYYY') || 'unknown'}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        const message =
          error?.data?.error?.message ||
          error?.error ||
          error?.message ||
          'Could not download the official payslip PDF.';
        toast.error(message);
      })
      .finally(() => {
        setIsDownloading(false);
      });
  }, [downloadOfficialPdf, employee?.label, employeeSalarySlip, isDownloading, monthYear]);

  return { handlePrint, handleDownload, isDownloading };
}

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'Employee';

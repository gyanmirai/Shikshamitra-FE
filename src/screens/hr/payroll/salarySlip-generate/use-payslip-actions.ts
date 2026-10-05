import type { Dayjs } from 'dayjs';
import type { RefObject } from 'react';

import { toast } from 'sonner';
import { useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';

interface EarningDeduction {
  name: string;
  amount: number | null | undefined;
}

interface Employee {
  label: string;
}

interface SalarySlip {
  fullGrossSalary?: number | null;
  grossSalary?: number | null;
  additionalEarnings?: number | null;
  totalEarning: number | null | undefined;
  totalDeduction: number | null | undefined;
  netSalary: number | null | undefined;
  status?: string | number | null;
  employeeName?: string | null;
  employeeCode?: string | null;
  department?: string | null;
  designation?: string | null;
  slipNumber?: string | null;
  netPayInWords?: string | null;
  remarks?: string | null;
  earnings: EarningDeduction[];
  deductions: EarningDeduction[];
}

interface UsePayslipActionsParams {
  printRef: RefObject<HTMLDivElement | null>;
  employee: Employee | null | undefined;
  monthYear: Dayjs | null | undefined;
  employeeSalarySlip: SalarySlip | null | undefined;
  downloadOfficialPdf: () => Promise<Blob | null | undefined>;
  downloadPreviewPdf: () => Promise<Blob | null | undefined>;
}

export const pdfCurrency = (val: number | null | undefined): string => {
  if (!val && val !== 0) {
    return 'Rs. 0.00';
  }

  const valueToFormat = val ?? 0;

  return `Rs. ${valueToFormat.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const isOfficialPayslipStatus = (status: string | number | null | undefined): boolean => {
  if (status === 1 || status === 2 || status === '1' || status === '2') {
    return true;
  }

  const normalized = String(status ?? '')
    .trim()
    .replace(/[_\s-]/g, '')
    .toLowerCase();

  return normalized === 'finalized' || normalized === 'paid';
};

export function usePayslipActions({
  printRef,
  employee,
  monthYear,
  employeeSalarySlip,
  downloadOfficialPdf,
  downloadPreviewPdf,
}: UsePayslipActionsParams) {
  const [isDownloading, setIsDownloading] = useState(false);
  const isOfficialPayslip = isOfficialPayslipStatus(employeeSalarySlip?.status);
  const documentPrefix = isOfficialPayslip ? 'Payslip' : 'Payslip_Preview';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${documentPrefix}_${employee?.label || 'Employee'}_${monthYear?.format('MMM-YYYY') || ''}`,
  });

  const handleDownload = useCallback(async () => {
    if (!employeeSalarySlip || isDownloading) return;

    setIsDownloading(true);
    const downloadPdf = isOfficialPayslip ? downloadOfficialPdf : downloadPreviewPdf;

    try {
      const blob = await downloadPdf();

      if (!blob || blob.size === 0 || (blob.type && blob.type !== 'application/pdf')) {
        throw new Error('Invalid payslip PDF response.');
      }

      downloadBlob(blob, documentPrefix, employee?.label, monthYear);
    } catch (error) {
      if (!isOfficialPayslip && isResourceNotFoundError(error)) {
        const previewBlob = await generateClientPreviewPdf(employeeSalarySlip, employee, monthYear);
        downloadBlob(previewBlob, documentPrefix, employee?.label, monthYear);
        return;
      }

      const message =
        (await readErrorMessage(error)) ||
        error?.data?.error?.message ||
        error?.error ||
        error?.message ||
        'Could not download the payslip PDF.';

      const normalizedMessage = String(message).toLowerCase();
      toast.error(
        normalizedMessage.includes('finalized')
          ? 'Official payslip PDF is available only after the salary slip is finalized. Download the preview instead.'
          : message
      );
    } finally {
      setIsDownloading(false);
    }
  }, [
    documentPrefix,
    downloadOfficialPdf,
    downloadPreviewPdf,
    employee,
    employeeSalarySlip,
    isDownloading,
    isOfficialPayslip,
    monthYear,
  ]);

  return { handlePrint, handleDownload, isDownloading, isOfficialPayslip };
}

const downloadBlob = (
  blob: Blob,
  documentPrefix: string,
  employeeLabel: string | null | undefined,
  monthYear: Dayjs | null | undefined
) => {
  const employeeName = sanitizeFileName(employeeLabel || 'Employee');
  const fileName = `${documentPrefix}_${employeeName}_${monthYear?.format('MMM-YYYY') || 'unknown'}.pdf`;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const readErrorMessage = async (error: any): Promise<string | null> => {
  const data = error?.data;

  if (data instanceof Blob) {
    const text = await data.text();
    if (!text) return null;

    try {
      return JSON.parse(text)?.error?.message || text;
    } catch {
      return text;
    }
  }

  return data?.error?.message || data?.message || null;
};

const isResourceNotFoundError = (error: any): boolean => {
  const status = error?.status || error?.originalStatus;
  const message = [error?.data?.error?.message, error?.data?.message, error?.error, error?.message]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return status === 404 || message.includes('resource not found') || message.includes('not found');
};

const generateClientPreviewPdf = async (
  slip: SalarySlip,
  employee: Employee | null | undefined,
  monthYear: Dayjs | null | undefined
) => {
  const { jsPDF } = await import('jspdf');
  const JsPDF = jsPDF;
  const doc = new JsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 42;
  let y = 42;

  const write = (text: string, x = margin, size = 10, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.text(text, x, y);
  };
  const line = () => {
    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);
  };

  doc.setTextColor(25);
  write('Institution Payroll', margin, 14, true);
  write('PREVIEW - DRAFT', pageWidth - margin - 105, 10, true);
  y += 22;
  write('Preview salary statement. This is not an official salary slip.', margin, 9);
  y += 18;
  line();
  y += 28;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Salary Slip', pageWidth / 2, y, { align: 'center' });
  y += 32;

  const period = monthYear?.format('MMMM YYYY') || '-';
  const employeeName = slip.employeeName || employee?.label || '-';
  const headerRows = [
    ['Staff', employeeName],
    ['Staff Code', slip.employeeCode || '-'],
    ['Department', slip.department || '-'],
    ['Designation', slip.designation || '-'],
    ['Pay Period', period],
    ['Slip Number', slip.slipNumber || '-'],
  ];

  headerRows.forEach(([label, value], index) => {
    const x = index % 2 === 0 ? margin : pageWidth / 2;
    if (index % 2 === 0 && index > 0) y += 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(String(value), x, y + 13);
  });
  y += 44;

  const drawLines = (title: string, rows: EarningDeduction[], total: number | null | undefined) => {
    write(title, margin, 11, true);
    y += 16;
    line();
    y += 18;

    const safeRows = rows?.length ? rows : [{ name: 'No components', amount: 0 }];
    safeRows.forEach((row) => {
      write(row.name || '-', margin, 9);
      write(pdfCurrency(row.amount || 0), pageWidth - margin - 110, 9, true);
      y += 16;
    });

    y += 4;
    line();
    y += 16;
    write('Total', margin, 10, true);
    write(pdfCurrency(total || 0), pageWidth - margin - 110, 10, true);
    y += 28;
  };

  write(`Full-month gross: ${pdfCurrency(slip.fullGrossSalary ?? 0)}`, margin, 10);
  y += 16;
  write(`Gross Salary: ${pdfCurrency(slip.grossSalary ?? 0)} | Additional earnings: ${pdfCurrency(slip.additionalEarnings ?? 0)}`, margin, 10);
  y += 24;

  drawLines('Earnings', slip.earnings || [], slip.totalEarning);
  drawLines('Deductions', slip.deductions || [], slip.totalDeduction);

  y += 8;
  line();
  y += 22;
  write('Net Payable', margin, 12, true);
  write(pdfCurrency(slip.netSalary || 0), pageWidth - margin - 120, 12, true);
  y += 24;

  if (slip.netPayInWords) {
    write(`Amount in Words: ${slip.netPayInWords}`, margin, 9);
    y += 18;
  }

  if (slip.remarks) {
    write(`Remarks: ${slip.remarks}`, margin, 9);
    y += 18;
  }

  y = Math.max(y + 20, doc.internal.pageSize.getHeight() - 72);
  line();
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('This is a preview payslip and is not an official salary slip.', pageWidth / 2, y, {
    align: 'center',
  });

  return doc.output('blob');
};

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'Employee';

import type { Dayjs } from 'dayjs';
import type { RefObject } from 'react';

import JsPDF from 'jspdf';
import { useCallback } from 'react';
import autoTable from 'jspdf-autotable';
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
}

// ---------------------------------------------------------------------------
// PDF-safe currency formatter
// jsPDF's built-in Helvetica font doesn't support ₹ (U+20B9), so we use Rs.
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
}: UsePayslipActionsParams) {
  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Payslip_${employee?.label || 'Employee'}_${monthYear?.format('MMM-YYYY') || ''}`,
  });

  // ── Download PDF ─────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    // 1. Guard against null employeeSalarySlip, but use optional chaining below as a second line of defense
    if (!employeeSalarySlip) return;

    const period = monthYear ? monthYear.format('MMMM YYYY') : '-';
    const employeeName = employee?.label || 'Employee';
    const doc = new JsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageW = doc.internal.pageSize.getWidth();
    let y = 40;

    // ── Title ──
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('Salary Slip', 40, y);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 110, 110);
    doc.text(`Pay Period: ${period}`, 40, (y += 22));

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(employeeName, pageW - 40, 40, { align: 'right' });

    y += 18;
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.5);
    doc.line(40, y, pageW - 40, y);
    y += 22;

    // ── Summary boxes ──
    const gap = 12;
    const boxW = (pageW - 80 - gap * 2) / 3;
    const boxH = 58;
    const summaries = [
      {
        label: 'Total Earnings',
        value: employeeSalarySlip?.totalEarning || 0,
        r: 22,
        g: 101,
        b: 52,
      },
      {
        label: 'Total Deductions',
        value: employeeSalarySlip?.totalDeduction || 0,
        r: 185,
        g: 28,
        b: 28,
      },
      {
        label: 'Net Payable',
        value: employeeSalarySlip?.netSalary || 0,
        r: 30,
        g: 64,
        b: 175,
      },
    ];

    summaries.forEach((s, idx) => {
      const bx = 40 + idx * (boxW + gap);
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(bx, y, boxW, boxH, 6, 6, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(s.label ?? 'Error', bx + boxW / 2, y + 18, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(s.r, s.g, s.b);
      doc.text(pdfCurrency(s.value), bx + boxW / 2, y + 40, {
        align: 'center',
      });
    });

    doc.setTextColor(0);
    y += boxH + 26;

    // ── Section headings + side-by-side tables ──
    const halfW = (pageW - 80 - gap) / 2;
    const leftX = 40;
    const rightX = 40 + halfW + gap;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text('Earnings', leftX, y);

    doc.setTextColor(153, 27, 27);
    doc.text('Deductions', rightX, y);
    doc.setTextColor(0);
    y += 8;

    // Earnings table
    autoTable(doc, {
      startY: y,
      tableWidth: halfW,
      margin: { left: leftX, right: pageW - leftX - halfW },
      head: [['Earning Type', 'Amount']],
      body: (employeeSalarySlip.earnings ?? []).map((e: EarningDeduction) => [
        e.name,
        pdfCurrency(e.amount ?? 0),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: { top: 6, bottom: 6, left: 8, right: 8 },
      },
      headStyles: {
        fillColor: [240, 253, 244],
        textColor: [22, 101, 52],
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [187, 247, 208],
      },
      bodyStyles: { lineColor: [230, 230, 230], lineWidth: 0.3 },
      columnStyles: { 1: { halign: 'right', cellWidth: 90 } },
      alternateRowStyles: { fillColor: [250, 255, 250] },
    } as any);

    const earningsEndY = (doc as any).lastAutoTable.finalY;

    // Deductions table
    autoTable(doc, {
      startY: y,
      tableWidth: halfW,
      margin: { left: rightX, right: 40 },
      head: [['Deduction Type', 'Amount']],
      body: (employeeSalarySlip.deductions ?? []).map((d: EarningDeduction) => [
        d.name,
        pdfCurrency(d.amount ?? 0),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: { top: 6, bottom: 6, left: 8, right: 8 },
      },
      headStyles: {
        fillColor: [255, 241, 242],
        textColor: [153, 27, 27],
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [254, 205, 211],
      },
      bodyStyles: { lineColor: [230, 230, 230], lineWidth: 0.3 },
      columnStyles: { 1: { halign: 'right', cellWidth: 90 } },
      alternateRowStyles: { fillColor: [255, 250, 250] },
    } as any);

    const deductionsEndY = (doc as any).lastAutoTable.finalY;
    y = Math.max(earningsEndY, deductionsEndY) + 30;

    // ── Footer ──
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.5);
    doc.line(40, y, pageW - 40, y);
    y += 16;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    doc.text(
      'This is a computer-generated payslip and does not require a signature.',
      pageW / 2,
      y,
      { align: 'center' }
    );

    doc.save(`Payslip_${employeeName}_${monthYear?.format('MMM-YYYY') || 'unknown'}.pdf`);
  }, [employee, monthYear, employeeSalarySlip]);

  return { handlePrint, handleDownload };
}

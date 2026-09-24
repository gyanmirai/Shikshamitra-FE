import { SUBJECT_IMPORT_COLUMNS, SUBJECT_IMPORT_EXAMPLE } from './constants';

export type SubjectTemplateFormat = 'csv' | 'xlsx';

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const escapeCsv = (value: unknown) => `"${String(value).replace(/"/g, '""')}"`;

export const downloadSubjectTemplate = async (format: SubjectTemplateFormat) => {
  const rows = [Array.from(SUBJECT_IMPORT_COLUMNS), Array.from(SUBJECT_IMPORT_EXAMPLE)];
  if (format === 'csv') {
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`;
    saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'subject-import-template.csv');
    return;
  }

  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [24, 20, 18, 14, 16, 14, 14, 32].map((wch) => ({ wch }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Subjects');
  XLSX.writeFile(workbook, 'subject-import-template.xlsx');
};

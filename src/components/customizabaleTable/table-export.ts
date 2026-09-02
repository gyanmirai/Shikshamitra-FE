import type { ReactNode } from 'react';

import _ from 'lodash';

import { saveUnicodeTablePdf } from './pdf-export';
import { getExportableColumns, extractTextFromReactNode } from './utils';

import type { IData, IColumn } from './types';

type TableExportArgs = {
  format: string;
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  rows: IData[];
  tableTitle: ReactNode;
};

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(text)) {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  return text || '-';
}

export function getCellValueForExport(row: IData, column: IColumn): string {
  const rawValue = _.get(row, column.id);
  if (column.render) {
    try {
      const renderedText = extractTextFromReactNode(column.render(rawValue, row));
      if (renderedText !== '') return renderedText;
    } catch (error) {
      console.error('Error rendering cell for export:', column.id, error);
    }
  }
  return formatCellValue(rawValue);
}

export async function exportTable({
  format,
  columns,
  columnVisibility,
  rows,
  tableTitle,
}: TableExportArgs): Promise<void> {
  if (format === 'print') {
    window.print();
    return;
  }

  const exportColumns = getExportableColumns(columns, columnVisibility);
  const title = typeof tableTitle === 'string' ? tableTitle : 'Table_Export';
  const head = exportColumns.map((column) =>
    typeof column.label === 'string' ? column.label : column.id
  );
  const body = rows.map((row) => exportColumns.map((column) => getCellValueForExport(row, column)));

  if (format === 'pdf') {
    await saveUnicodeTablePdf({ title, head, body });
    return;
  }

  if (format === 'excel') {
    const XLSX = await import('xlsx');
    const dataObjects = body.map((row) =>
      Object.fromEntries(head.map((label, index) => [label, row[index]]))
    );
    const worksheet = XLSX.utils.json_to_sheet(dataObjects);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${title}.xlsx`);
  }
}

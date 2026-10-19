import type { ReactNode } from 'react';

import _ from 'lodash';

import { saveUnicodeTablePdf } from './pdf-export';
import { parseTableDate, getExportableColumns, extractTextFromReactNode } from './utils';

import type { IData, IColumn } from './types';

type TableExportArgs = {
  format: string;
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  rows: IData[];
  tableTitle: ReactNode;
  context?: string[];
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
  if (column.exportValue) return formatCellValue(column.exportValue(rawValue, row));
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

export function getTypedCellValueForExport(
  row: IData,
  column: IColumn
): string | number | boolean | Date | null {
  const raw = _.get(row, column.id);
  if (column.exportValue) return column.exportValue(raw, row);
  if (raw == null) return null;
  if (
    column.valueType === 'date' ||
    column.valueType === 'datetime' ||
    column.filterType === 'date' ||
    column.filterType === 'dateTime'
  ) {
    return parseTableDate(raw)?.toDate() ?? getCellValueForExport(row, column);
  }
  if (column.valueType === 'money' || column.valueType === 'number') {
    const value = Number(raw);
    return Number.isFinite(value) ? value : getCellValueForExport(row, column);
  }
  if (
    typeof raw === 'number' &&
    (column.filterType === 'number' || column.filterType === 'formattedNumber')
  ) {
    const displayed = getCellValueForExport(row, column);
    if (/\d/.test(displayed) && /^[\d₹$€£,\s().%+-]+$/.test(displayed)) return raw;
  }
  if (
    !column.render &&
    (typeof raw === 'number' || typeof raw === 'boolean' || raw instanceof Date)
  )
    return raw;
  return getCellValueForExport(row, column);
}

export async function exportTable({
  format,
  columns,
  columnVisibility,
  rows,
  tableTitle,
  context = [],
}: TableExportArgs): Promise<void> {
  if (format === 'print') {
    window.print();
    return;
  }

  const exportColumns = getExportableColumns(columns, columnVisibility);
  if (exportColumns.length === 0)
    throw new Error('Show at least one data column before exporting.');
  if (rows.length > 500000) throw new Error('The table exceeds 500,000 rows. Narrow its filters.');
  if (format === 'pdf' && (rows.length > 10000 || rows.length * exportColumns.length > 200000))
    throw new Error(
      'PDF supports up to 10,000 rows and 200,000 cells. Use Excel or narrow the filters.'
    );
  const title = typeof tableTitle === 'string' ? tableTitle : 'Table_Export';
  const head = exportColumns.map((column) =>
    typeof column.label === 'string' ? column.label : column.id
  );
  const body = rows.map((row) => exportColumns.map((column) => getCellValueForExport(row, column)));
  const details = [
    ...context,
    `Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} Asia/Kolkata`,
    `${rows.length} rows`,
  ];

  if (format === 'pdf') {
    await saveUnicodeTablePdf({ title, head, body, context: details });
    return;
  }

  if (format === 'excel') {
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.aoa_to_sheet(
      [
        head,
        ...rows.map((row) =>
          exportColumns.map((column) => getTypedCellValueForExport(row, column))
        ),
      ],
      { cellDates: true }
    );
    worksheet['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: rows.length, c: Math.max(0, head.length - 1) },
      }),
    };
    worksheet['!cols'] = head.map((label) => ({
      wch: Math.min(45, Math.max(16, label.length + 3)),
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([[title], ...details.map((line) => [line])]),
      'Details'
    );
    // SheetJS CE does not serialize frozen panes; amend its own OOXML archive.
    const archive = XLSX.CFB.read(
      new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })),
      { type: 'array' }
    );
    const sheetPath = archive.FullPaths.find((name: string) =>
      name.endsWith('/xl/worksheets/sheet1.xml')
    );
    if (!sheetPath)
      throw new Error('The Excel worksheet could not be prepared. Try exporting again.');
    const entry = XLSX.CFB.find(archive, sheetPath);
    const xml = new TextDecoder().decode(entry.content);
    const frozenColumns = Math.min(2, exportColumns.length);
    const view = `<sheetView workbookViewId="0"><pane xSplit="${frozenColumns}" ySplit="1" topLeftCell="${XLSX.utils.encode_cell({ r: 1, c: frozenColumns })}" activePane="bottomRight" state="frozen"/></sheetView>`;
    XLSX.CFB.utils.cfb_add(
      archive,
      sheetPath,
      new TextEncoder().encode(
        xml.replace(/<sheetViews>[\s\S]*?<\/sheetViews>/, `<sheetViews>${view}</sheetViews>`)
      )
    );
    const bytes = new Uint8Array(XLSX.CFB.write(archive, { type: 'array', fileType: 'zip' }));
    const href = URL.createObjectURL(
      new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    );
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `${title}.xlsx`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(href), 0);
  }
}

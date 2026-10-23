import { exportTable } from 'src/components/customizabaleTable/table-export';

import type { AuditLog } from '../types/auditLogs.types';

export function auditExportRows(logs: AuditLog[], withDiff: boolean) {
  return logs.map((log) => ({
    timestamp: log.timestamp,
    action: log.actionLabel,
    entity: log.entityName || '-',
    user: log.changedByName || '-',
    reason: log.reason || '-',
    ...(withDiff
      ? {
          changes: (log.diff || [])
            .map(
              (change) =>
                `${change.displayName}: ${change.oldValue ?? '(empty)'} -> ${change.newValue ?? '(empty)'}`
            )
            .join('; '),
        }
      : {}),
  }));
}

export function auditCsv(rows: ReturnType<typeof auditExportRows>): string {
  const escape = (value: unknown) => {
    const text = String(value ?? '');
    const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return [Object.keys(rows[0] || {}), ...rows.map(Object.values)]
    .map((row) => row.map(escape).join(','))
    .join('\r\n');
}

export async function exportAuditLogs(format: string, logs: AuditLog[], withDiff: boolean) {
  if (!logs.length) throw new Error('No displayed audit logs to export.');
  const rows = auditExportRows(logs, withDiff);
  if (format === 'csv') {
    const url = URL.createObjectURL(
      new Blob(['\ufeff', auditCsv(rows)], { type: 'text/csv;charset=utf-8' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Calendar audit logs - displayed rows.csv';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return;
  }
  const columns = Object.keys(rows[0]).map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
  }));
  await exportTable({
    format,
    columns,
    rows,
    columnVisibility: Object.fromEntries(columns.map(({ id }) => [id, true])),
    tableTitle: 'Calendar audit logs - displayed rows',
    context: ['Only the currently displayed, filtered page is included.'],
  });
}

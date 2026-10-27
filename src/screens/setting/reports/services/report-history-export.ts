/* eslint-disable no-await-in-loop */
import type { TableExportRequest } from 'src/components/customizabaleTable/types';

import { reportHistoryCriteria } from '../report-history-criteria';

import type { ReportHistoryRow, ReportHistoryPage, ReportHistoryParams } from '../types';

export async function collectReportHistory(
  request: TableExportRequest,
  timeZone: string,
  readPage: (params: ReportHistoryParams) => Promise<ReportHistoryPage>,
  assertCurrent: () => void
) {
  if (!request.columns.length) throw new Error('Show at least one data column before exporting.');
  const criteria = reportHistoryCriteria(
    request.searchTerm,
    request.sorts,
    request.filters,
    timeZone
  );
  const limit =
    request.format === 'pdf'
      ? Math.min(10000, Math.floor(200000 / request.columns.length))
      : 500000;
  const rows: ReportHistoryRow[] = [];
  const ids = new Set<string>();
  let total: number | undefined;
  do {
    assertCurrent();
    const page = await readPage({ ...criteria, skipCount: rows.length, maxResultCount: 100 });
    assertCurrent();
    total ??= page.totalCount;
    if (total > limit)
      throw new Error(
        `The export exceeds ${limit.toLocaleString()} rows. Narrow the filters${request.format === 'pdf' ? ' or use Excel' : ''}.`
      );
    if (page.totalCount !== total || (rows.length < total && !page.items.length))
      throw new Error('Report history changed during export. Export again for a complete result.');
    page.items.forEach((row) => {
      if (ids.has(row.id))
        throw new Error(
          'Report history changed during export. Export again for a complete result.'
        );
      ids.add(row.id);
      rows.push(row);
    });
  } while (rows.length < total);
  return rows;
}

import type { TableExportRequest } from 'src/components/customizabaleTable/types';

import { exportTable } from 'src/components/customizabaleTable/table-export';
import { useLazyGetRubricTemplatesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricTemplateReadApi';

import { rubricTemplateListRow, type RubricTemplateListRow } from './rubricTemplateListRows';

export function useRubricTemplateExport(academicMediumId?: string) {
  const [loadPage] = useLazyGetRubricTemplatesQuery();
  return async (request: TableExportRequest) => {
    if (!academicMediumId) return;
    const rows: RubricTemplateListRow[] = [];
    const collectPage = async (page: number): Promise<void> => {
      request.signal?.throwIfAborted();
      const pending = loadPage({ academicMediumId, page, pageSize: 100, search: request.searchTerm,
        filters: JSON.stringify(request.filters), sorts: JSON.stringify(request.sorts), timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone });
      const abort = () => pending.abort();
      request.signal?.addEventListener('abort', abort, { once: true });
      let hasMore = false;
      try {
        const result = await pending.unwrap();
        rows.push(...result.items.map(rubricTemplateListRow));
        hasMore = rows.length < result.totalCount && result.items.length > 0;
      } finally {
        request.signal?.removeEventListener('abort', abort);
        pending.unsubscribe();
      }
      if (hasMore) await collectPage(page + 1);
    };
    await collectPage(1);
    request.signal?.throwIfAborted();
    await exportTable({ format: request.format, columns: request.columns,
      columnVisibility: Object.fromEntries(request.columns.map(column => [column.id, true])),
      rows, tableTitle: 'Rubric Templates', beforeDownload: () => request.signal?.throwIfAborted() });
  };
}

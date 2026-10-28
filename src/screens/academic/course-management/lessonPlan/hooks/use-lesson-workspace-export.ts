import type { TableExportRequest } from 'src/components/customizabaleTable/types';
import type { LessonWorkspacePage, LessonWorkspaceInput } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-workspace-contracts';

import { exportTable } from 'src/components/customizabaleTable/table-export';
import { useLazyGetLessonPlanWorkspaceQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-workspace-api';

import { lessonPlanRead } from '../lessonPlanRead';
import { lessonPlansToReviewRows } from '../reviewQueueRows';

type Scope = Omit<LessonWorkspaceInput, 'skipCount' | 'maxResultCount'>;
type PageLoader = (input: LessonWorkspaceInput) => Promise<LessonWorkspacePage>;

export async function collectLessonWorkspaceRows(load: PageLoader, input: Scope, signal?: AbortSignal) {
  const rows: LessonWorkspacePage['items'] = [];
  let more = true;
  while (more) {
    signal?.throwIfAborted();
    // Each batch offset depends on the rows returned by the preceding page.
    // eslint-disable-next-line no-await-in-loop
    const page = await load({ ...input, skipCount: rows.length, maxResultCount: 250 });
    rows.push(...page.items);
    if (!page.items.length && rows.length < page.totalCount) {
      throw new Error('The lesson plan export ended before all matching rows were loaded. Please retry.');
    }
    more = page.items.length > 0 && rows.length < page.totalCount;
  }
  signal?.throwIfAborted();
  return rows.map(lessonPlanRead);
}

export function useLessonWorkspaceExport(scope: Scope) {
  const [load] = useLazyGetLessonPlanWorkspaceQuery();
  return async (request: TableExportRequest) => {
    const rows = await collectLessonWorkspaceRows(async input => {
      const pending = load(input);
      const abort = () => pending.abort();
      request.signal?.addEventListener('abort', abort, { once: true });
      try { return await pending.unwrap(); }
      finally { request.signal?.removeEventListener('abort', abort); pending.unsubscribe(); }
    }, { ...scope, searchTerm: request.searchTerm, filters: JSON.stringify(request.filters), sorts: JSON.stringify(request.sorts) }, request.signal);
    await exportTable({ format: request.format, columns: request.columns,
      columnVisibility: Object.fromEntries(request.columns.map(column => [column.id, true])),
      rows: scope.view === 'reviewQueue' ? lessonPlansToReviewRows(rows) : rows,
      tableTitle: scope.view === 'reviewQueue' ? 'Review Queue' : scope.view === 'teacherDiary' ? 'Teacher Diary' : 'Lesson Plans',
      beforeDownload: () => request.signal?.throwIfAborted() });
  };
}

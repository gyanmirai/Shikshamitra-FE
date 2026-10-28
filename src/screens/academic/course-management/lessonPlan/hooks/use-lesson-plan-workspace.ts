import type { IParams, ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import type { LessonWorkspaceInput } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-workspace-contracts';

import { useMemo, useState, useCallback } from 'react';
import { useGetLessonPlanWorkspaceQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-workspace-api';

import { lessonPlanRead } from '../lessonPlanRead';
import { teacherDiaryRead } from '../teacherDiaryRead';
import { useLessonWorkspaceExport } from './use-lesson-workspace-export';

type Scope = Omit<LessonWorkspaceInput, 'skipCount' | 'maxResultCount'>;
const defaults = { page: 1, pageSize: 25, search: '', filters: [] as IParams['filters'],
  sorts: [] as IParams['sorts'], searchColumns: undefined as string[] | undefined };

export function useLessonPlanWorkspace(scope: Scope, enabled: boolean) {
  const normalized = { ...scope, academicMediumId: scope.view === 'reviewQueue' ? undefined : scope.academicMediumId };
  const scopeKey = JSON.stringify([normalized.academicYearId, normalized.academicMediumId, normalized.teacherId, normalized.view]);
  const domainKey = JSON.stringify(normalized);
  const [state, setState] = useState({ scopeKey, domainKey, ...defaults });
  const criteria = state.scopeKey !== scopeKey ? { scopeKey, domainKey, ...defaults }
    : state.domainKey !== domainKey ? { ...state, domainKey, page: 1 } : state;
  if (criteria !== state) setState(criteria);
  const changeTable = (patch: Partial<typeof defaults>) => setState(previous => {
    if (Object.entries(patch).every(([key, value]) => JSON.stringify(criteria[key as keyof typeof defaults]) === JSON.stringify(value))) return previous;
    const next = { ...criteria, page: 1, ...patch };
    return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
  });
  const args = { ...normalized, skipCount: (criteria.page - 1) * criteria.pageSize, maxResultCount: criteria.pageSize,
    searchTerm: criteria.search, searchColumns: criteria.searchColumns,
    filters: JSON.stringify(criteria.filters), sorts: JSON.stringify(criteria.sorts) };
  const query = useGetLessonPlanWorkspaceQuery(args, { skip: !enabled, refetchOnMountOrArgChange: true });
  /** Memoization Justification: preserve mapped page identities while local dialogs change. */
  const items = useMemo(() => (query.currentData?.items ?? []).map(lessonPlanRead), [query.currentData]);
  /** Memoization Justification: preserve associated diary identities for action and progress dependencies. */
  const diaries = useMemo(() => (query.currentData?.diaries ?? []).map(teacherDiaryRead), [query.currentData]);
  const { isUninitialized, refetch } = query;
  /** Memoization Justification: mutation callbacks depend on this active-query refresh function. */
  const refresh = useCallback(() => enabled && !isUninitialized ? refetch() : undefined, [enabled, isUninitialized, refetch]);
  const onExport = useLessonWorkspaceExport({ ...normalized, searchColumns: criteria.searchColumns });
  const tableProps: Partial<ICustomizableTableProps> = {
    serverSidePagination: true, serverSideSearch: true, serverSideSort: true, serverSideFilter: true,
    exportScope: 'all', maxServerRowsPerPage: 100, page: criteria.page - 1, rowsPerPage: criteria.pageSize, searchTerm: criteria.search,
    filters: criteria.filters, sorts: criteria.sorts, totalCount: query.currentData?.totalCount ?? 0,
    onServerPagination: (page, pageSize) => changeTable({ page, pageSize: Math.max(1, Math.min(100, pageSize)) }), onServerSearch: search => changeTable({ search }),
    onServerSort: (_column, sorts) => changeTable({ sorts }), onServerFilter: filters => changeTable({ filters }),
    onVisibleColumnsChange: searchColumns => changeTable({ searchColumns, page: criteria.search ? 1 : criteria.page }),
    onClearCriteria: () => changeTable({ search: '', filters: [] }), onExport,
    error: query.error, onRetry: query.refetch,
  };
  return { ...query, items, diaries, summary: query.currentData?.summary, tableProps, changeTable,
    page: criteria.page - 1, pageSize: criteria.pageSize, totalCount: query.currentData?.totalCount ?? 0,
    refresh };
}

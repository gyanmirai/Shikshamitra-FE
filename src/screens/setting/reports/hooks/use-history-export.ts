import type { RootState } from 'src/redux/store';
import type { TableExportRequest } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import { exportTable } from 'src/components/customizabaleTable/table-export';
import { useInstituteReportHistoryExportPageMutation } from 'src/redux/InstituteSetup/instituteReportsApi';
import {
  getCachedAuthSession,
  isAuthSessionCacheCurrent,
  getAuthSessionCacheRevision,
} from 'src/redux/session-cache';

import { collectReportHistory } from '../services/report-history-export';

import type { ReportOptions } from '../types';

export function useHistoryExport(
  canView: boolean,
  options: ReportOptions | undefined,
  timeZone: string
) {
  const scopeKey = useSelector(
    (state: RootState) =>
      `${state.auth.sessionContext?.tenantId ?? ''}:${state.auth.user?.sub ?? ''}:${state.auth.initializationVersion ?? ''}`
  );
  const scope = useRef(scopeKey);
  scope.current = scopeKey;
  const active = useRef<AbortController | null>(null);
  const [readPage] = useInstituteReportHistoryExportPageMutation();
  useEffect(
    () => () => {
      active.current?.abort();
    },
    [scopeKey, canView]
  );

  return async (request: TableExportRequest) => {
    if (!canView || !options) throw new Error('Wait for report access to finish loading.');
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const cancel = () => controller.abort();
    request.signal?.addEventListener('abort', cancel, { once: true });
    if (request.signal?.aborted) cancel();
    const revision = getAuthSessionCacheRevision();
    const columns = request.columns.map((column) => ({ ...column }));
    const allowed = new Set(options.reportTypes.map((definition) => definition.id));
    try {
      const session = await getCachedAuthSession();
      const assertCurrent = () => {
        if (
          !isAuthSessionCacheCurrent(revision, session?.accessToken) ||
          scope.current !== scopeKey
        )
          cancel();
        if (controller.signal.aborted)
          throw new DOMException('The history export was cancelled.', 'AbortError');
      };
      assertCurrent();
      const rows = await collectReportHistory(
        { ...request, columns },
        timeZone,
        async (params) => {
          assertCurrent();
          const call = readPage(params);
          const abort = () => call.abort();
          controller.signal.addEventListener('abort', abort, { once: true });
          try {
            return await call.unwrap();
          } finally {
            controller.signal.removeEventListener('abort', abort);
            call.reset();
          }
        },
        assertCurrent
      );
      assertCurrent();
      await exportTable({
        format: request.format,
        columns,
        rows: rows.filter((row) => allowed.has(row.reportTypeId)),
        columnVisibility: Object.fromEntries(columns.map((column) => [column.id, true])),
        tableTitle: 'Institute Setup Reports',
        beforeDownload: assertCurrent,
        context: [
          request.searchTerm ? `Search: ${request.searchTerm}` : '',
          ...request.filters.map(
            (filter) => `${filter.column}: ${filter.type} ${filter.value ?? ''}`
          ),
          ...request.sorts.map((sort) => `${sort.column}: ${sort.direction}`),
        ].filter(Boolean),
      });
    } catch (error) {
      if (!controller.signal.aborted) throw error;
    } finally {
      request.signal?.removeEventListener('abort', cancel);
      if (active.current === controller) active.current = null;
    }
  };
}

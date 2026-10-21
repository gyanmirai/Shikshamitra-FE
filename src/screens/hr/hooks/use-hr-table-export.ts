import { reportTableCriteria } from 'src/screens/hr/reports/report-table-query';
/* eslint-disable no-await-in-loop */
// Poll each export sequentially so a stale response cannot finish a newer request.
import type { TableExportRequest } from 'src/components/customizabaleTable/types';

import { useRef, useEffect, useCallback } from 'react';
import { extractTextFromReactNode } from 'src/components/customizabaleTable/utils';
import {
  useCreateHrTableExportMutation,
  useCancelHrTableExportMutation,
  useLazyHrTableExportStatusQuery,
  useDownloadHrTableExportMutation,
} from 'src/redux/hr/hrTableExportApi';

export function downloadTableBlob(blob: Blob, name: string) {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(href), 0);
}

export function useHrTableExport(table: string, query: Record<string, unknown>) {
  const currentQuery = useRef(query);
  currentQuery.current = query;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [create] = useCreateHrTableExportMutation();
  const [status] = useLazyHrTableExportStatusQuery();
  const [download] = useDownloadHrTableExportMutation();
  const [cancel] = useCancelHrTableExportMutation();
  return useCallback(
    async (
      { format, columns, searchTerm, filters, sorts, signal }: TableExportRequest,
      queryOverride?: Record<string, unknown>
    ) => {
      const captured = structuredClone({ ...currentQuery.current, ...queryOverride });
      if (table === 'hr-generated-report' || table === 'hr-generated-report-history')
        captured.criteria = reportTableCriteria(searchTerm, filters, sorts);
      else if (searchTerm || Object.hasOwn(captured, 'search')) captured.search = searchTerm;
      let job = await create({
        table,
        query: captured,
        format,
        columns: columns.map((column) => ({
          id: column.id,
          label: extractTextFromReactNode(column.label) || column.id,
        })),
      }).unwrap();
      const cancelJob = () => {
        cancel(job.id);
      };
      signal?.addEventListener('abort', cancelJob, { once: true });
      try {
        if (signal?.aborted) {
          await cancel(job.id).unwrap();
          return;
        }
        const deadline = Date.now() + 10 * 60_000;
        while (job.status === 'Queued' || job.status === 'Running') {
          if (!mounted.current || signal?.aborted) return;
          if (Date.now() > deadline)
            throw new Error(
              'Export is taking longer than expected. Narrow the filters and try again.'
            );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          job = await status(job.id, false).unwrap();
        }
        if (job.status !== 'Completed')
          throw new Error(job.error || 'The table export was cancelled. Export again when ready.');
        if (mounted.current && !signal?.aborted) {
          const blob = await download(job.id).unwrap();
          if (mounted.current && !signal?.aborted)
            downloadTableBlob(
              blob,
              `${(job.name || table).replace(/[<>:"/\\|?*]+/g, '-')}.${format === 'excel' ? 'xlsx' : 'pdf'}`
            );
        }
      } finally {
        signal?.removeEventListener('abort', cancelJob);
      }
    },
    [table, create, status, download, cancel]
  );
}

/* eslint-disable no-await-in-loop */
// Generation must finish before an export can read the captured result.
import type { TableExportRequest } from 'src/components/customizabaleTable/types';
import type { ReportDesign, ReportParameters } from 'src/redux/hr/hrReportingWorkspaceApi';

import { useRef, useEffect, useCallback } from 'react';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import {
  useLazyGetReportingRunQuery,
  useCancelReportingRunMutation,
  useCaptureReportingPreviewMutation,
} from 'src/redux/hr/hrReportingWorkspaceApi';

export function useReportPreviewExport(definition: ReportDesign, parameters: ReportParameters) {
  const [capture] = useCaptureReportingPreviewMutation();
  const [read] = useLazyGetReportingRunQuery();
  const [cancel] = useCancelReportingRunMutation();
  const exportCaptured = useHrTableExport('hr-generated-report', {});
  const current = useRef({ definition, parameters });
  current.current = { definition, parameters };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return useCallback(
    async (request: TableExportRequest) => {
      let run = await capture(structuredClone(current.current)).unwrap();
      const cancelCapture = () => {
        cancel(run.id);
      };
      request.signal?.addEventListener('abort', cancelCapture, { once: true });
      try {
        if (request.signal?.aborted) {
          await cancel(run.id).unwrap();
          return;
        }
        const deadline = Date.now() + 10 * 60_000;
        while (run.status === 'Queued' || run.status === 'Running') {
          if (!mounted.current || request.signal?.aborted) return;
          if (Date.now() > deadline)
            throw new Error(
              'Preview generation is taking too long. Narrow the selection and try again.'
            );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          run = await read(run.id, false).unwrap();
        }
        if (run.status !== 'Completed')
          throw new Error(run.errorMessage || 'Preview generation failed. Try again.');
      } finally {
        request.signal?.removeEventListener('abort', cancelCapture);
      }
      if (mounted.current && !request.signal?.aborted)
        await exportCaptured(request, { runId: run.id });
    },
    [capture, read, exportCaptured, cancel]
  );
}

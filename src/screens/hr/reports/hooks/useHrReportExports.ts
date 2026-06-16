import type { HrReportFormat, HrReportRequest } from 'src/redux/hr/hrReportsApi';

import { useCallback } from 'react';
import { useCreateHrReportExportMutation } from 'src/redux/hr/hrReportsApi';

import { hrReportToast } from '../hr-report-notifications';
import { isHrReportRefetchErrorResult } from '../hr-report-center-utils';
import { getHrReportFormatLabel, DEFAULT_HR_REPORT_PAGE_SIZE } from '../hr-report-utils';

import type { HrReportQueuedExport } from '../hr-report-types';

type UseHrReportExportsInput = {
  isFetchingExports: boolean;
  refetchExports: () => unknown;
  onExportQueued?: (exportJob: HrReportQueuedExport) => void;
  requestFor: (page?: number, pageSize?: number, format?: HrReportFormat) => HrReportRequest;
};

export function useHrReportExports({
  isFetchingExports,
  refetchExports,
  onExportQueued,
  requestFor,
}: UseHrReportExportsInput) {
  const [createExport, { isLoading: isCreatingExport }] = useCreateHrReportExportMutation();
  const isExportHistoryFetching = isFetchingExports;

  const refreshExportHistory = useCallback(async () => {
    const refreshResult = await Promise.resolve(refetchExports());
    if (isHrReportRefetchErrorResult(refreshResult)) {
      throw new Error('Export history refresh failed.');
    }
  }, [refetchExports]);

  const exportReport = useCallback(
    async (format: HrReportFormat) => {
      let result: { jobId: string; status: string };
      try {
        result = await createExport(requestFor(1, DEFAULT_HR_REPORT_PAGE_SIZE, format)).unwrap();
      } catch {
        hrReportToast.error('Export could not be queued.');
        return;
      }

      onExportQueued?.({ jobId: result.jobId, format });
      hrReportToast.success(
        `${getHrReportFormatLabel(format)} export queued. Track it in Reports Center.`
      );
      try {
        await refreshExportHistory();
      } catch {
        hrReportToast.warning(
          'Export queued, but export history could not refresh. It will update on the next poll or manual refresh.'
        );
      }
    },
    [createExport, onExportQueued, refreshExportHistory, requestFor]
  );

  return {
    isExportHistoryFetching,
    isCreatingExport,
    refreshExportHistory,
    exportReport,
  };
}

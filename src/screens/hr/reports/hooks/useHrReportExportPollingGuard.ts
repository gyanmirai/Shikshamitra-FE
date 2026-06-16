import type { HrReportExportJob } from 'src/redux/hr/hrReportsApi';

import { useRef, useState, useCallback } from 'react';

import { hrReportToast } from '../hr-report-notifications';
import { getHrReportExportPollingDecision } from '../hr-report-center-utils';

type HrReportExportPollingSnapshot = {
  exportJobs: HrReportExportJob[];
  fulfilledTimeStamp?: number;
};

export function useHrReportExportPollingGuard() {
  const [shouldPollExports, setShouldPollExports] = useState(false);
  const [highlightedExportId, setHighlightedExportId] = useState<string | null>(null);
  const [missingHighlightedExportPolls, setMissingHighlightedExportPolls] = useState(0);
  const [lastCheckedExportsFulfilledAt, setLastCheckedExportsFulfilledAt] = useState<
    number | undefined
  >();
  const [missingHighlightWarningId, setMissingHighlightWarningId] = useState<string | null>(null);
  const latestFulfilledTimeStampRef = useRef<number | undefined>(undefined);

  const highlightExportJob = useCallback((jobId: string) => {
    setHighlightedExportId(jobId);
    setMissingHighlightedExportPolls(0);
    setLastCheckedExportsFulfilledAt(latestFulfilledTimeStampRef.current);
    setMissingHighlightWarningId(null);
    setShouldPollExports(true);
  }, []);

  const observeExports = useCallback(
    ({ exportJobs, fulfilledTimeStamp }: HrReportExportPollingSnapshot) => {
      latestFulfilledTimeStampRef.current = fulfilledTimeStamp;
      const decision = getHrReportExportPollingDecision(
        exportJobs,
        highlightedExportId,
        missingHighlightedExportPolls
      );

      if (decision.hasActiveExports) {
        setMissingHighlightedExportPolls(0);
        setShouldPollExports(decision.shouldPoll);
        return;
      }

      if (!highlightedExportId) {
        setShouldPollExports(decision.shouldPoll);
        return;
      }

      if (decision.hasHighlightedJob) {
        setMissingHighlightedExportPolls(0);
        setShouldPollExports(decision.shouldPoll);
        return;
      }

      if (!fulfilledTimeStamp || fulfilledTimeStamp === lastCheckedExportsFulfilledAt) {
        setShouldPollExports(decision.shouldPoll);
        return;
      }

      setLastCheckedExportsFulfilledAt(fulfilledTimeStamp);
      const nextMissingHighlightedExportPolls = missingHighlightedExportPolls + 1;
      const nextDecision = getHrReportExportPollingDecision(
        exportJobs,
        highlightedExportId,
        nextMissingHighlightedExportPolls
      );

      if (nextDecision.isMissingHighlightedExportLimitReached) {
        if (missingHighlightWarningId !== highlightedExportId) {
          hrReportToast.warning(
            'Export was queued, but it is not visible in the current export list. Use Refresh to check again.'
          );
          setMissingHighlightWarningId(highlightedExportId);
        }

        setHighlightedExportId(null);
        setMissingHighlightedExportPolls(0);
        setShouldPollExports(false);
        return;
      }

      setMissingHighlightedExportPolls(nextMissingHighlightedExportPolls);
      setShouldPollExports(nextDecision.shouldPoll);
    },
    [
      highlightedExportId,
      lastCheckedExportsFulfilledAt,
      missingHighlightedExportPolls,
      missingHighlightWarningId,
    ]
  );

  return {
    shouldPollExports,
    highlightedExportId,
    highlightExportJob,
    observeExports,
  };
}

'use client';

import { useState, useEffect } from 'react';
import { useLazyGetAcademicReportExportJobQuery } from 'src/redux/academicAPI/AcademicReportApi';

interface PollingResult {
  jobId: string | null;
  status: string | null;
  errorMessage: string | null;
}

const EMPTY_RESULT: PollingResult = { jobId: null, status: null, errorMessage: null };

export function useAiReportExportPolling(
  jobId: string | undefined,
  enabled: boolean
): PollingResult {
  const [result, setResult] = useState<PollingResult>(EMPTY_RESULT);
  const [getJob] = useLazyGetAcademicReportExportJobQuery();

  useEffect(() => {
    if (!jobId || !enabled) {
      setResult(EMPTY_RESULT);
      return undefined;
    }

    let cancelled = false;
    let timer: number | undefined;
    setResult({ jobId, status: null, errorMessage: null });
    const poll = async () => {
      try {
        const job = await getJob({ jobId }, false).unwrap();
        if (cancelled) return;
        setResult({ jobId, status: job.status, errorMessage: job.errorMessage ?? null });
        if (!['Completed', 'Failed', 'Cancelled'].includes(job.status)) {
          timer = window.setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) timer = window.setTimeout(poll, 2000);
      }
    };

    timer = window.setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [enabled, getJob, jobId]);

  return result;
}

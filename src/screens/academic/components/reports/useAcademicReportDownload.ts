'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useState, useEffect, useCallback } from 'react';
import { saveAcademicStandardReportFile } from 'src/screens/academic/curriculum-management/reports/ai-report-utils';
import {
  useLazyDownloadAcademicReportQuery,
  useLazyGetAcademicReportExportJobQuery,
} from 'src/redux/academicAPI/AcademicReportApi';

export function useAcademicReportDownload() {
  const account = useSelector((state: RootState) =>
    `${state.auth?.sessionContext?.tenantId ?? ''}:${state.auth?.user?.sub ?? ''}`);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const activeJob = useRef<string | null>(null);
  const currentAccount = useRef(account);
  currentAccount.current = account;
  const [getStatus] = useLazyGetAcademicReportExportJobQuery();
  const [getFile] = useLazyDownloadAcademicReportQuery();

  /** Memoization Justification: effects and in-flight work share one stable cancellation boundary. */
  const stopPolling = useCallback(() => {
    generation.current += 1;
    activeJob.current = null;
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    setDownloadingJobId(null);
    return stopPolling;
  }, [account, stopPolling]);

  const handleDownload = async (jobId: string, status: string) => {
    if (activeJob.current) return;
    stopPolling();
    const version = generation.current;
    const isCurrent = () => generation.current === version && currentAccount.current === account;
    activeJob.current = jobId;
    setDownloadingJobId(jobId);
    let failures = 0;

    const finish = () => {
      if (!isCurrent()) return;
      stopPolling();
      setDownloadingJobId(null);
    };
    const download = async () => {
      try {
        const file = await getFile({ jobId }, false).unwrap();
        if (isCurrent()) saveAcademicStandardReportFile(file);
      } catch {
        if (isCurrent()) shikshaMitraToast.error({ message: 'Download failed. Please try again.' });
      } finally {
        finish();
      }
    };
    const poll = async () => {
      if (!isCurrent()) return;
      try {
        const current = await getStatus({ jobId }, false).unwrap();
        if (!isCurrent()) return;
        failures = 0;
        if (current.status === 'Completed') {
          await download();
          return;
        }
        if (['Failed', 'Expired', 'Cancelled'].includes(current.status)) {
          finish();
          shikshaMitraToast.error({ message: current.errorMessage || (current.status === 'Failed' ? 'Export job failed.' : 'The export is no longer available. Generate the report again.') });
          return;
        }
      } catch {
        if (!isCurrent()) return;
        failures += 1;
        if (failures >= 5) {
          finish();
          shikshaMitraToast.error({ message: 'Report status could not be checked. Try Download again.' });
          return;
        }
      }
      if (isCurrent()) timer.current = setTimeout(poll, Math.min(2000 * 2 ** failures, 30000));
    };
    if (status === 'Completed') await download();
    else timer.current = setTimeout(poll, 2000);
  };

  return { downloadingJobId, handleDownload, stopPolling };
}

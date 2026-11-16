'use client';

import type { RootState, AppDispatch } from 'src/redux/store';

import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useState, useEffect, useCallback } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { academicReportApi } from 'src/redux/academicAPI/AcademicReportApi';
import {
  startAcademicReportDownload,
  saveAcademicStandardReportFile,
} from 'src/screens/academic/curriculum-management/reports/ai-report-utils';

export type DownloadPhase = 'idle' | 'creating' | 'polling' | 'downloading';
type ExportRequest = { reportType: string; filters?: object | null };
type PendingRequest = { abort: () => void };

export function useAcademicReportDownload() {
  const dispatch = useDispatch<AppDispatch>();
  const account = useSelector((state: RootState) =>
    `${state.auth?.sessionContext?.tenantId ?? ''}:${state.auth?.user?.sub ?? ''}`);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const [downloadPhase, setDownloadPhase] = useState<DownloadPhase>('idle');
  const [jobStatusLabel, setJobStatusLabel] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const active = useRef(false);
  const mounted = useRef(true);
  const pending = useRef<PendingRequest | null>(null);
  const currentAccount = useRef(account);
  currentAccount.current = account;

  /** Memoization Justification: effects and in-flight work share one stable cancellation boundary. */
  const stopPolling = useCallback(() => {
    generation.current += 1;
    active.current = false;
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    pending.current?.abort();
    pending.current = null;
  }, []);

  useEffect(() => {
    mounted.current = true;
    setDownloadingJobId(null);
    setDownloadPhase('idle');
    setJobStatusLabel('');
    return () => { mounted.current = false; stopPolling(); };
  }, [account, stopPolling]);

  const begin = () => {
    if (!mounted.current || active.current) return null;
    stopPolling();
    active.current = true;
    const version = generation.current;
    return () => mounted.current && generation.current === version && currentAccount.current === account;
  };
  const finish = (isCurrent: () => boolean) => {
    if (!isCurrent()) return;
    stopPolling();
    setDownloadingJobId(null);
    setDownloadPhase('idle');
    setJobStatusLabel('');
  };
  const runDownload = async (jobId: string, status: string, isCurrent: () => boolean, direct = false) => {
    if (!isCurrent()) return;
    setDownloadingJobId(jobId);
    setJobStatusLabel(status);
    let failures = 0;
    const download = async () => {
      if (!isCurrent()) return;
      setDownloadPhase('downloading');
      try {
        if (direct) startAcademicReportDownload(jobId);
        else {
          const request = dispatch(academicReportApi.endpoints.downloadAcademicReport.initiate({ jobId }, { subscribe: false, forceRefetch: true }));
          pending.current = request;
          const file = await request.unwrap();
          if (isCurrent()) saveAcademicStandardReportFile(file);
        }
      } catch {
        if (isCurrent()) shikshaMitraToast.error({ message: 'Download failed. Please try again.' });
      } finally { finish(isCurrent); }
    };
    const poll = async () => {
      if (!isCurrent()) return;
      try {
        const request = dispatch(academicReportApi.endpoints.getAcademicReportExportJob.initiate({ jobId }, { subscribe: false, forceRefetch: true }));
        pending.current = request;
        const current = await request.unwrap();
        if (!isCurrent()) return;
        failures = 0;
        setJobStatusLabel(current.status);
        if (current.status === 'Completed') { await download(); return; }
        if (['Failed', 'Expired', 'Cancelled'].includes(current.status)) {
          finish(isCurrent);
          shikshaMitraToast.error({ message: current.errorMessage || (current.status === 'Failed' ? 'Export job failed.' : 'The export is no longer available. Generate the report again.') });
          return;
        }
      } catch {
        if (!isCurrent()) return;
        failures += 1;
        if (failures >= 5) {
          finish(isCurrent);
          shikshaMitraToast.error({ message: 'Report status could not be checked. Try Download again.' });
          return;
        }
      }
      if (isCurrent()) timer.current = setTimeout(poll, Math.min(2000 * 2 ** failures, 30000));
    };
    if (status === 'Completed') await download();
    else { setDownloadPhase('polling'); timer.current = setTimeout(poll, 2000); }
  };
  const handleDownload = async (jobId: string, status: string, direct = false) => {
    const isCurrent = begin();
    if (isCurrent) await runDownload(jobId, status, isCurrent, direct);
  };
  const handleCreateDownload = async (body: ExportRequest, direct = false) => {
    const isCurrent = begin();
    if (!isCurrent) return;
    setDownloadPhase('creating');
    setJobStatusLabel('');
    try {
      const request = dispatch(academicReportApi.endpoints.createAcademicReportExport.initiate({ ...body, format: 'pdf' }, { track: false }));
      pending.current = request;
      const result = await request.unwrap();
      if (!isCurrent()) return;
      if (!result?.jobId) { finish(isCurrent); return; }
      await runDownload(result.jobId, result.status || 'Queued', isCurrent, direct);
    } catch (error) {
      if (!isCurrent()) return;
      finish(isCurrent);
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || 'Failed to initiate export' });
    }
  };

  return { downloadingJobId, downloadPhase, jobStatusLabel, handleDownload, handleCreateDownload, stopPolling };
}

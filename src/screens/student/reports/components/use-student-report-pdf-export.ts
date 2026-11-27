import { useRef, useState, useEffect, useCallback } from 'react';
import {
  useLazyDownloadStudentReportQuery,
  useCreateStudentReportExportMutation,
  useLazyGetStudentReportExportJobQuery,
} from 'src/redux/student/student-report/student-report-api';

export interface StudentRecordsReportRequest {
  reportType: string;
  format?: string | null;
  page?: number;
  pageSize?: number;
  filters?: Record<string, unknown>;
}

type ExportPhase = 'idle' | 'creating' | 'polling' | 'downloading';
type ExportJob = { jobId: string; phase: 'polling' | 'downloading' };
type ExportRecovery = { message: string; job?: ExportJob };
type Timer = ReturnType<typeof setTimeout>;

interface ExportAttempt {
  job?: ExportJob;
  deadline?: Timer;
  pollTimer?: Timer;
  request?: { abort: () => void };
}

const POLL_INTERVAL_MS = 2_000;
const ATTEMPT_TIMEOUT_MS = 120_000;
const MAX_STATUS_FAILURES = 5;

function savePdfFile(data: {
  bytes?: string;
  contentType?: string | null;
  fileName?: string | null;
}) {
  if (!data?.bytes) throw new Error('Missing PDF data');

  const bytes = Uint8Array.from(atob(data.bytes), (character) => character.charCodeAt(0));
  const blob = new Blob([bytes], { type: data.contentType || 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = data.fileName || 'report.pdf';
  link.style.display = 'none';
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Give the browser time to consume the file URL after the click.
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}

export function useStudentReportPdfExport(
  enabled: boolean,
  reportRequest: StudentRecordsReportRequest | null,
  owner: string
) {
  const [phase, setPhase] = useState<ExportPhase>('idle');
  const [jobStatus, setJobStatus] = useState('');
  const [recovery, setRecovery] = useState<ExportRecovery | null>(null);
  const activeAttempt = useRef<ExportAttempt | null>(null);
  const [createExport] = useCreateStudentReportExportMutation();
  const [getStatus] = useLazyGetStudentReportExportJobQuery();
  const [downloadFile] = useLazyDownloadStudentReportQuery();

  const stop = useCallback(() => {
    const attempt = activeAttempt.current;
    activeAttempt.current = null;
    clearTimeout(attempt?.deadline);
    clearTimeout(attempt?.pollTimer);
    attempt?.request?.abort();
  }, []);

  useEffect(() => {
    setPhase('idle');
    setJobStatus('');
    setRecovery(null);
    return stop;
  }, [enabled, reportRequest, owner, stop]);

  async function run() {
    if (!enabled || !reportRequest || activeAttempt.current) return;

    const attempt: ExportAttempt = { job: recovery?.job };
    activeAttempt.current = attempt;
    setRecovery(null);
    setJobStatus('');

    const isCurrent = () => activeAttempt.current === attempt;
    const finish = (message?: string) => {
      if (!isCurrent()) return;
      stop();
      setPhase('idle');
      setRecovery(message ? { message, job: attempt.job } : null);
    };

    attempt.deadline = setTimeout(() => {
      if (attempt.job?.phase === 'downloading') {
        finish('The PDF download timed out. Retry the download.');
      } else if (attempt.job) {
        finish('The PDF export is taking longer than expected. Check its status again.');
      } else {
        finish('The PDF export request timed out. Try again.');
      }
    }, ATTEMPT_TIMEOUT_MS);

    const download = async (jobId: string) => {
      attempt.job = { jobId, phase: 'downloading' };
      setPhase('downloading');
      try {
        const request = downloadFile({ jobId }, false);
        attempt.request = request;
        const file = await request.unwrap();
        if (!isCurrent()) return;
        attempt.request = undefined;
        savePdfFile(file);
        finish();
      } catch {
        attempt.request = undefined;
        finish('The PDF could not be downloaded. Retry the download.');
      }
    };

    let failedChecks = 0;
    const checkStatus = async (jobId: string) => {
      try {
        const request = getStatus({ jobId }, false);
        attempt.request = request;
        const job = await request.unwrap();
        if (!isCurrent()) return;
        attempt.request = undefined;
        if (!job?.status) throw new Error('Missing export status');
        failedChecks = 0;

        if (job.status === 'Completed') {
          await download(jobId);
          return;
        }
        if (['Failed', 'Expired', 'Cancelled'].includes(job.status)) {
          attempt.job = undefined;
          finish(
            job.status === 'Failed'
              ? 'The PDF could not be generated. Try the export again.'
              : 'This PDF export is no longer available. Try the export again.'
          );
          return;
        }
        setJobStatus(job.status);
      } catch {
        if (!isCurrent()) return;
        attempt.request = undefined;
        failedChecks += 1;
        if (failedChecks >= MAX_STATUS_FAILURES) {
          finish('The PDF export status could not be checked. Check its status again.');
          return;
        }
      }

      const delay = Math.min(POLL_INTERVAL_MS * 2 ** failedChecks, 30_000);
      attempt.pollTimer = setTimeout(() => checkStatus(jobId), delay);
    };

    if (attempt.job?.phase === 'downloading') {
      await download(attempt.job.jobId);
      return;
    }

    let jobId = attempt.job?.jobId;
    if (!jobId) {
      setPhase('creating');
      try {
        const request = createExport({ ...reportRequest, format: 'pdf' });
        attempt.request = request;
        const job = await request.unwrap();
        if (!isCurrent()) return;
        attempt.request = undefined;
        jobId = job?.jobId;
        if (!jobId) throw new Error('Missing export job ID');
        setJobStatus(job.status || 'Queued');
      } catch {
        attempt.request = undefined;
        finish('The PDF export could not be started. Try again.');
        return;
      }
    }

    const acceptedJobId = jobId;
    attempt.job = { jobId: acceptedJobId, phase: 'polling' };
    setPhase('polling');
    attempt.pollTimer = setTimeout(() => checkStatus(acceptedJobId), POLL_INTERVAL_MS);
  }

  return { phase, jobStatus, recovery, run, isActive: () => activeAttempt.current !== null };
}

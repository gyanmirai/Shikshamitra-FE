import type { RootState } from 'src/redux/store';
import type { RecordsReportJob } from 'src/redux/student/records/student-record-reports-api';

import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import {
  useGetRecordsReportJobsQuery,
  useCreateRecordsReportMutation,
  useCancelRecordsReportMutation,
  useDownloadRecordsReportMutation,
} from 'src/redux/student/records/student-record-reports-api';

import {
  reportJobActions,
  getStudentReportError,
  reportRegenerationInput,
  studentReportSourceGrants,
} from '../utils/compliance-report-model';

export function useStudentReportHistory() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Records.Reports.View');
  const canGenerate = hasGrantedPermission(permissions, 'Students.Records.Reports.Add');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [pollingInterval, setPollingInterval] = useState(0);
  const jobs = useGetRecordsReportJobsQuery(
    { skipCount: page * size, maxResultCount: size },
    {
      skip: !canView,
      pollingInterval,
      skipPollingIfUnfocused: true,
      refetchOnMountOrArgChange: true,
    }
  );
  useEffect(() => {
    setPollingInterval(
      jobs.currentData?.items.some((job) => ['Queued', 'Generating'].includes(job.status))
        ? 5000
        : 0
    );
  }, [jobs.currentData]);
  const [create, creating] = useCreateRecordsReportMutation();
  const [cancel, cancelling] = useCancelRecordsReportMutation();
  const [download, downloading] = useDownloadRecordsReportMutation();
  const [decision, setDecision] = useState<{
    kind: 'cancel' | 'generate';
    job: RecordsReportJob;
    clientKey: string;
  } | null>(null);
  const [scopeJob, setScopeJob] = useState<RecordsReportJob | null>(null);
  const pending = useRef(false);
  const actions = (job: RecordsReportJob) => {
    const grants = studentReportSourceGrants(job.reportType);
    return reportJobActions(
      job.status,
      job.canDownload,
      canGenerate,
      grants.length > 0 && grants.every((grant) => hasGrantedPermission(permissions, grant))
    );
  };
  const confirm = async () => {
    if (
      !decision ||
      pending.current ||
      (decision.kind === 'cancel'
        ? !actions(decision.job).cancel
        : !actions(decision.job).regenerate)
    )
      return;
    pending.current = true;
    try {
      if (decision.kind === 'cancel') await cancel(decision.job.id).unwrap();
      else
        await create({
          ...reportRegenerationInput(decision.job.request),
          clientKey: decision.clientKey,
        }).unwrap();
      shikshaMitraToast.success({
        message:
          decision.kind === 'cancel'
            ? 'Report generation cancelled.'
            : 'Report queued. Return here to download it when ready.',
      });
      setDecision(null);
    } catch (error) {
      shikshaMitraToast.error({
        message: getStudentReportError(
          error,
          'The report action could not be completed. Refresh its status and retry.'
        ),
      });
    } finally {
      pending.current = false;
    }
  };
  const downloadFile = async (job: RecordsReportJob) => {
    if (pending.current || !actions(job).download) return;
    pending.current = true;
    try {
      const blob = await download(job.id).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student-${job.reportType.toLowerCase()}-${job.creationTime.slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      shikshaMitraToast.error({
        message: getStudentReportError(
          error,
          'The file could not be downloaded. Refresh the report status and access, then retry.'
        ),
      });
    } finally {
      pending.current = false;
    }
  };
  return {
    jobs,
    canView,
    page,
    size,
    setPage,
    setSize,
    actions,
    decision,
    setDecision,
    scopeJob,
    setScopeJob,
    confirm,
    downloadFile,
    decisionAllowed: Boolean(
      decision &&
      (decision.kind === 'cancel' ? actions(decision.job).cancel : actions(decision.job).regenerate)
    ),
    busy: creating.isLoading || cancelling.isLoading || downloading.isLoading,
  };
}

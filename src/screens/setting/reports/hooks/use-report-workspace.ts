import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import {
  useInstituteReportOptionsQuery, useInstituteReportHistoryQuery,
  useInstituteReportExportMutation, useInstituteReportDownloadMutation,
} from 'src/redux/InstituteSetup/instituteReportsApi';

import { reportError, reportActions } from '../types';
import { permittedReportOptions } from '../report-source-permissions';

import type { ReportJob, InstituteReportRequest } from '../types';

export function useReportWorkspace() {
  const { permissions, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  const canView = permissionsInitialized && hasGrantedPermission(permissions, reportActions.view);
  const canAdd = canView && hasGrantedPermission(permissions, reportActions.add);
  const [mode, setMode] = useState<'history' | 'manual' | 'ai'>('history');
  const [preview, setPreview] = useState<InstituteReportRequest | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState(0);
  const catalogue = useInstituteReportOptionsQuery(undefined, { skip: !canView, refetchOnMountOrArgChange: true });
  const available = permittedReportOptions(catalogue.data, permissions);
  const options = { ...catalogue, data: available };
  const saved = useInstituteReportHistoryQuery(undefined, {
    skip: !canView, pollingInterval, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: true,
  });
  const allowed = (type: string) => Boolean(available?.reportTypes.some((definition) => definition.id === type));
  const history = { ...saved, data: saved.data?.filter((job) => allowed(job.request.reportType)), isLoading: saved.isLoading || catalogue.isLoading };
  useEffect(() => {
    setPollingInterval(saved.data?.some((job) => job.status === 'Queued' || job.status === 'Processing') ? 3000 : 0);
  }, [saved.data]);
  const [exportReport, exporting] = useInstituteReportExportMutation();
  const [downloadReport] = useInstituteReportDownloadMutation();
  async function generate(request: InstituteReportRequest) {
    if (!canAdd || !allowed(request.reportType)) return;
    try {
      await exportReport(request).unwrap();
      history.refetch();
      setPreview(null);
      setMode('history');
      shikshaMitraToast.success({ message: 'Report queued. You can return here to download it.' });
    } catch (error) { shikshaMitraToast.error({ message: reportError(error) }); }
  }
  async function download(job: ReportJob) {
    if (downloading || !canView || !allowed(job.request.reportType)) return;
    setDownloading(job.id);
    try {
      const blob = await downloadReport(job.id).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = job.fileName ?? 'Institute_Setup_Report';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { shikshaMitraToast.error({ message: reportError(error) }); }
    finally { setDownloading(null); }
  }
  return { canView, canAdd, ready: permissionsInitialized, options, history, mode, setMode, preview, setPreview,
    downloading, download, generate, exporting: exporting.isLoading };
}
export type ReportWorkspace = ReturnType<typeof useReportWorkspace>;

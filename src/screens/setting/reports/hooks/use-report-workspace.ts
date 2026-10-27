import type { RootState } from 'src/redux/store';
import type { IParams , TableExportRequest } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import {
  useInstituteReportOptionsQuery, useInstituteReportHistoryQuery,
  useLazyInstituteReportJobQuery, useInstituteReportStatusesQuery,
    useInstituteReportExportMutation, useInstituteReportDownloadMutation,
} from 'src/redux/InstituteSetup/instituteReportsApi';

import { reportError, reportActions } from '../types';
import { useHistoryExport } from './use-history-export';
import { permittedReportOptions } from '../report-source-permissions';
import { reportHistoryFilters, reportHistoryCriteria } from '../report-history-criteria';

import type { ReportHistoryRow, InstituteReportRequest } from '../types';

export function useReportWorkspace() {
  const { permissions, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  const canView = permissionsInitialized && hasGrantedPermission(permissions, reportActions.view);
  const canAdd = canView && hasGrantedPermission(permissions, reportActions.add);
  const [mode, setMode] = useState<'history' | 'manual' | 'ai'>('history');
  const [preview, setPreview] = useState<InstituteReportRequest | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchDraft = useRef('');
  const [sorts, setSorts] = useState<IParams['sorts']>([]);
  const [filters, setFilters] = useState<IParams['filters']>([]);
  const [timeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [loadJob, loadingJob] = useLazyInstituteReportJobQuery();
  const catalogue = useInstituteReportOptionsQuery(undefined, { skip: !canView, refetchOnMountOrArgChange: true });
  const available = permittedReportOptions(catalogue.data, permissions);
  const options = { ...catalogue, data: available };
  const exportHistory = useHistoryExport(canView, available, timeZone);
  const saved = useInstituteReportHistoryQuery({ skipCount: page * size, maxResultCount: size,
    ...reportHistoryCriteria(search, sorts, filters, timeZone),
  }, {
    skip: !canView, refetchOnMountOrArgChange: true,
  });
  const pending = (saved.currentData?.items ?? []).filter((job) => job.status === 'Queued' || job.status === 'Processing').map((job) => job.id).sort();
  const statuses = useInstituteReportStatusesQuery(pending, {
    skip: !canView || pending.length === 0, pollingInterval: 3000, skipPollingIfUnfocused: true,
  });
  const allowed = (type: string) => Boolean(available?.reportTypes.some((definition) => definition.id === type));
  const history = { ...saved, data: saved.currentData ? {
    ...saved.currentData,
    items: saved.currentData.items.filter((job) => allowed(job.reportTypeId)).map((job) => statuses.currentData?.find((status) => status.id === job.id) ?? job),
  } : undefined, isLoading: saved.isLoading || catalogue.isLoading };
  const { refetch: refreshHistory } = saved;
  useEffect(() => {
    if (statuses.currentData?.some((job) => job.status !== 'Queued' && job.status !== 'Processing')) refreshHistory();
  }, [statuses.currentData, refreshHistory]);
  const [exportReport, exporting] = useInstituteReportExportMutation();
  const [downloadReport] = useInstituteReportDownloadMutation();
  function updateSearchInput(value: string) { searchDraft.current = value; setSearchInput(value); }
  function onQueued() { setPage(0); setMode('history'); }
  async function generate(request: InstituteReportRequest) {
    if (!canAdd || !allowed(request.reportType)) return;
    try {
      await exportReport(request).unwrap();
      onQueued();
      setPreview(null);
      setMode('history');
      shikshaMitraToast.success({ message: 'Report queued. You can return here to download it.' });
    } catch (error) { shikshaMitraToast.error({ message: reportError(error) }); }
  }
  async function download(job: ReportHistoryRow) {
    if (downloading || !canView || !allowed(job.reportTypeId)) return;
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
  async function openSaved(job: ReportHistoryRow, regenerate = false) {
    if (loadingJob.isFetching || !allowed(job.reportTypeId)) return;
    try {
      const savedJob = await loadJob(job.id, false).unwrap();
      if (!allowed(savedJob.request.reportType)) return;
      if (regenerate) await generate(savedJob.request);
      else setPreview(savedJob.request);
    } catch (error) { shikshaMitraToast.error({ message: reportError(error) }); }
  }
  return { canView, canAdd, ready: permissionsInitialized, options, history, mode, setMode, preview, setPreview,
    exportHistory: (request: TableExportRequest) => exportHistory({ ...request, searchTerm: searchDraft.current }),
    downloading, download, generate, openSaved, onQueued, opening: loadingJob.isFetching, page, size,
    search, searchInput, setSearchInput: updateSearchInput, sorts, filters,
    changeSearch: (value: string) => { setSearch(value); updateSearchInput(value); setPage(0); },
    changeSort: (value: IParams['sorts']) => { setSearch(searchDraft.current); setSorts(value); setPage(0); },
    changeFilters: (value: IParams['filters']) => {
      try { reportHistoryFilters(value); setSearch(searchDraft.current); setFilters(value); setPage(0); }
      catch (error) { shikshaMitraToast.error({ message: reportError(error) }); }
    },
    clearCriteria: () => { setSearch(''); updateSearchInput(''); setSorts([]); setFilters([]); setPage(0); },
    setPagination: (nextPage: number, nextSize: number) => { setPage(searchDraft.current === search ? nextPage : 0); setSearch(searchDraft.current); setSize(nextSize); },
    exporting: exporting.isLoading };
}
export type ReportWorkspace = ReturnType<typeof useReportWorkspace>;

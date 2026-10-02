'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { RecordsReportJob, RecordsReportType, RecordsReportInput } from 'src/redux/student/records/student-record-reports-api';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Tab, Tabs, Stack, Alert, Paper, Button, Tooltip, IconButton, Typography, LinearProgress } from '@mui/material';
import { useGetRecordsReportJobsQuery, useCreateRecordsReportMutation, useCancelRecordsReportMutation, useGetRecordsReportPreviewQuery, useDownloadRecordsReportMutation } from 'src/redux/student/records/student-record-reports-api';

import RecordsStudentPicker from './records-student-picker';
import { recordsQueryUrl, positivePageValue } from './records-url-state';

const types: { value: RecordsReportType; label: string; grants: string[] }[] = [
  { value: 'Directory', label: 'Student directory', grants: ['Students.Records.StudentList.View'] },
  { value: 'Changes', label: 'Record changes', grants: ['Students.Records.Changes.View'] },
  { value: 'Documents', label: 'Document issuance', grants: ['Students.Records.Certificates.View', 'Students.Records.StudentICard.View'] },
  { value: 'Transitions', label: 'Year-end and transitions', grants: ['Students.Records.Transitions.View'] },
];

export default function StudentRecordReports() {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const reportType = types.some(x => x.value === params.get('type')) ? params.get('type') as RecordsReportType : 'Directory';
  const tab = params.get('tab') === 'history' ? 'history' : 'preview';
  const year = params.get('year') ?? currentYear?.id ?? 'all';
  const studentId = params.get('student') ?? '';
  const page = positivePageValue(params.get('page'), 0, 100000);
  const update = (values: Record<string, string | number | undefined>) => router.push(recordsQueryUrl(pathname, params.toString(), values), { scroll: false });
  const canGenerate = hasGrantedPermission(permissions, 'Students.Records.Reports.Add');
  const canCancel = hasGrantedPermission(permissions, 'Students.Records.Reports.Delete');
  const canRead = (type: RecordsReportType) => types.find(x => x.value === type)!.grants.every(grant => hasGrantedPermission(permissions, grant));
  const input: RecordsReportInput = { reportType, academicYearId: year === 'all' ? undefined : year, studentId: studentId || undefined, maxResultCount: 25, skipCount: page * 25 };
  const preview = useGetRecordsReportPreviewQuery(input, { skip: tab !== 'preview' || !canRead(reportType), refetchOnMountOrArgChange: true });
  const [pollingInterval, setPollingInterval] = useState(0);
  const jobs = useGetRecordsReportJobsQuery({ skipCount: page * 25, maxResultCount: 25 }, { skip: tab !== 'history', pollingInterval, skipPollingIfUnfocused: true });
  useEffect(() => { setPollingInterval(jobs.currentData?.items.some(x => x.status === 'Queued' || x.status === 'Generating') ? 5000 : 0); }, [jobs.currentData]);
  const [create, createState] = useCreateRecordsReportMutation(); const [cancel, cancelState] = useCancelRecordsReportMutation(); const [download, downloadState] = useDownloadRecordsReportMutation();
  const [failure, setFailure] = useState<string | null>(null);
  const [generation, setGeneration] = useState<RecordsReportInput | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const retryKey = useRef<{ signature: string; key: string } | null>(null);
  const startGeneration = async () => {
    if (!generation) return;
    setFailure(null);
    const { clientKey: _priorKey, ...scope } = generation;
    const signature = JSON.stringify(scope);
    if (retryKey.current?.signature !== signature) retryKey.current = { signature, key: crypto.randomUUID() };
    try {
      await create({ ...scope, skipCount: 0, maxResultCount: 100, clientKey: retryKey.current.key }).unwrap();
      retryKey.current = null; setGeneration(null); update({ tab: 'history', page: 0 });
      shikshaMitraToast.success({ message: 'Report queued. You can return here when it is ready.' });
    } catch { setFailure('The report could not be queued. Your scope has been kept. Retry when ready.'); }
  };
  const downloadFile = async (job: RecordsReportJob) => {
    setFailure(null);
    try {
      const file = await download(job.id).unwrap(); const url = URL.createObjectURL(file); const link = document.createElement('a');
      link.href = url; link.download = `student-${job.reportType.toLowerCase()}-${job.creationTime.slice(0, 10)}.xlsx`; link.click(); URL.revokeObjectURL(url);
    } catch { setFailure('The report could not be downloaded. Refresh the list to check availability and access.'); }
  };
  const cancelGeneration = async () => {
    if (!cancelId) return;
    setFailure(null);
    try { await cancel(cancelId).unwrap(); setCancelId(null); shikshaMitraToast.success({ message: 'Report generation cancelled.' }); }
    catch { setFailure('The report could not be cancelled. It may have finished already. Refresh and retry.'); }
  };
  const jobColumns: IColumn[] = [
    { id: 'reportType', label: 'Report', render: value => types.find(x => x.value === value)?.label ?? value },
    { id: 'status', label: 'Status', render: value => <Label color={value === 'Completed' ? 'success' : value === 'Failed' ? 'error' : 'default'}>{value === 'Completed' ? 'Report ready' : value}</Label> },
    { id: 'rowCount', label: 'Rows', render: value => value ?? '—' }, { id: 'creationTime', label: 'Created', render: value => fDateTime(value) },
    { id: 'expiresAt', label: 'Expires', render: value => fDateTime(value) },
    { id: 'actions', label: 'Actions', sticky: true, stickyPosition: 'right', excludeFromExport: true, render: (_value, row) => {
      const job = row as RecordsReportJob;
      return <Stack direction="row" justifyContent="flex-end">
        {job.canDownload ? <Tooltip title="Download Excel report"><IconButton aria-label="Download report" disabled={downloadState.isLoading} onClick={() => downloadFile(job)}><Iconify icon="solar:download-minimalistic-bold" /></IconButton></Tooltip> : job.status === 'Completed' ? <Typography variant="caption">Access changed. Generate again.</Typography> : null}
        {canGenerate && canRead(job.reportType) && ['Completed', 'Failed', 'Expired', 'Cancelled'].includes(job.status) && <Tooltip title="Generate again"><IconButton aria-label="Generate report again" disabled={createState.isLoading} onClick={() => setGeneration(job.request)}><Iconify icon="solar:restart-bold" /></IconButton></Tooltip>}
        {canCancel && ['Queued', 'Generating'].includes(job.status) && <Tooltip title="Cancel generation"><IconButton aria-label="Cancel report generation" onClick={() => setCancelId(job.id)}><Iconify icon="solar:close-circle-bold" /></IconButton></Tooltip>}
      </Stack>;
    } },
  ];
  return <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1 }}>
    <CustomBreadcrumbs heading="Reports" description="Preview scoped student records and generate Excel reports with download history." links={[{ name: 'Students', href: studentPaths.dashboard }, { name: 'Student Records', href: studentPaths.records.root }, { name: 'Reports' }]} action={tab === 'preview' && canGenerate ? <Button variant="contained" disabled={!canRead(reportType) || preview.isFetching || preview.isError} onClick={() => setGeneration(input)}>Generate report</Button> : undefined} />
    <Tabs value={tab} onChange={(_event, value) => update({ tab: value, page: 0 })} aria-label="Report workspace"><Tab value="preview" label="Preview" /><Tab value="history" label="Generated reports" /></Tabs>
    {tab === 'preview' && <Paper variant="outlined" sx={{ p: 1.5 }}><Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <CustomSelect label="Report type" value={reportType} options={types.map(({ value, label }) => ({ value, label }))} onChange={value => update({ type: String(value), page: 0 })} />
        <CustomSelect label="Academic year" value={year} options={[...(currentYear?.id ? [{ value: currentYear.id, label: currentYear.name ?? 'Current academic year' }] : []), { value: 'all', label: 'All years in my scope' }]} onChange={value => update({ year: String(value), student: undefined, page: 0 })} />
        <Button onClick={() => update({ student: undefined, page: 0 })}>All students in scope</Button>
      </Stack>
      <RecordsStudentPicker selectedId={studentId} onSelect={student => update({ student: student?.studentId, page: 0 })} />
    </Stack></Paper>}
    {failure && <Alert severity="error" onClose={() => setFailure(null)}>{failure}</Alert>}
    {tab === 'preview' && !canRead(reportType) && <Alert severity="info">You need permission to view the source module for this report.</Alert>}
    {(tab === 'preview' ? preview.isError : jobs.isError) && <Alert severity="error" action={<Button color="inherit" onClick={() => tab === 'preview' ? preview.refetch() : jobs.refetch()}>Retry</Button>}>Reports could not be loaded. Your selected scope has been kept.</Alert>}
    {(tab === 'preview' ? preview.isFetching : jobs.isFetching) && <LinearProgress aria-label="Refreshing report data" />}
    {tab === 'preview' && preview.currentData && <Typography variant="caption">{preview.currentData.totalCount} matching rows · Updated {fDateTime(preview.currentData.asOf)} · Excel generation includes every matching row.</Typography>}
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <CustomizableTable key={tab === 'preview' ? reportType : 'jobs'} tableId={`student-record-reports-${tab}-${reportType}`} tableTitle={tab === 'preview' ? 'Report preview' : 'Generated reports'} columns={tab === 'preview' ? preview.currentData?.columns.map(id => ({ id, label: id, minWidth: 140 })) ?? [] : jobColumns} data={tab === 'preview' ? preview.currentData?.rows.map((row, index) => ({ ...row, id: `${page}-${index}` })) ?? [] : jobs.currentData?.items ?? []} totalCount={tab === 'preview' ? preview.currentData?.totalCount ?? 0 : jobs.currentData?.totalCount ?? 0} isLoading={tab === 'preview' ? preview.isLoading : jobs.isLoading} isSearch={false} isFilter={false} serverSidePagination page={page} rowsPerPage={25} rowsPerPageOptions={[25]} onServerPagination={next => update({ page: next })} wrapperProps={{ sx: { height: 1 } }} tableContainerProps={{ sx: { height: 1 } }} noDataText={tab === 'preview' ? 'No student records match this scope.' : 'No reports have been generated yet.'} />
    </Box>
    <ConfirmDialog open={Boolean(generation)} onClose={() => { if (!createState.isLoading) setGeneration(null); }} icon="info" title="Generate student report?" content={<Stack spacing={1}><Typography variant="body2">Generate {types.find(x => x.value === generation?.reportType)?.label} as Excel for {generation?.academicYearId ? 'the selected academic year' : 'all years in your scope'} and {generation?.studentId ? 'the selected student' : 'all students in your scope'}. You can leave this page while it runs. Downloads expire after seven days.</Typography>{failure && <Alert severity="error">{failure}</Alert>}</Stack>} action={<Button variant="contained" loading={createState.isLoading} onClick={startGeneration}>Generate report</Button>} disableCancel={createState.isLoading} disableBackdropClick={createState.isLoading} />
    <ConfirmDialog open={Boolean(cancelId)} onClose={() => { if (!cancelState.isLoading) setCancelId(null); }} icon="warning" title="Cancel report generation?" content="This stops the selected report. Student records remain available, and you can generate the report again." action={<Button variant="contained" loading={cancelState.isLoading} onClick={cancelGeneration}>Cancel generation</Button>} disableCancel={cancelState.isLoading} />
  </Box>;
}

'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { CertificateType } from 'src/redux/student/records/student-record-documents-api';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { studentPaths } from 'src/constants/student-menu';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Tab, Stack, Paper, Alert, Button } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetRecordCertificateBatchesQuery } from 'src/redux/student/records/student-record-documents-api';

import { recordsQueryUrl } from './records-url-state';
import StudentCertificateForm from './student-certificate-form';
import RecordDocumentTemplates from './record-document-templates';
import CertificateBatchDialog from './components/certificate-batch-dialog';

const tabs: { value: string; label: string; type: CertificateType; icon: string }[] = [
  { value: 'bonafide', label: 'Bonafide', type: 1, icon: 'tdesign:certificate' },
  { value: 'first-trial', label: 'First Trial', type: 4, icon: 'ph:certificate-light' },
  { value: 'leaving', label: 'Leaving', type: 3, icon: 'streamline-cyber:wedding-certificate' },
  { value: 'character', label: 'Character', type: 2, icon: 'la:certificate' },
];

export default function StudentCertificateWorkspace() {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const tab = tabs.find(item => item.value === params.get('certificate')) ?? tabs[0];
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const canView = hasGrantedPermission(permissions, 'Students.Records.Certificates.View');
  const canIssue = canView && hasGrantedPermission(permissions, 'Students.Records.Certificates.Add');
  const formDialog = useBoolean(); const templatesDialog = useBoolean();
  const [month, setMonth] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(10);
  const [batchId, setBatchId] = useState('');
  const validMonth = month?.isValid() ? month : null;
  const query = useGetRecordCertificateBatchesQuery({ certificateType: tab.type,
    generatedFrom: validMonth ? validMonth.startOf('month').toISOString() : '', generatedTo: validMonth ? validMonth.startOf('month').add(1, 'month').toISOString() : '',
    skipCount: page * pageSize, maxResultCount: pageSize }, { skip: !canView || !validMonth });
  const columns: IColumn[] = [
    { id: 'firstCertificateNumber', label: 'Certificates', isSort: false, isFilter: false, render: (_, row) => row.firstCertificateNumber === row.lastCertificateNumber ? row.firstCertificateNumber : `${row.firstCertificateNumber} — ${row.lastCertificateNumber}` },
    { id: 'generatedAt', label: 'Generated', isSort: false, isFilter: false, render: value => fDateTime(value) },
    { id: 'studentCount', label: 'Students', isSort: false, isFilter: false },
    { id: 'status', label: 'Status', isSort: false, isFilter: false, render: value => <Label color={value === 'Voided' ? 'error' : value === 'Partly voided' ? 'warning' : 'success'}>{value}</Label> },
    { id: 'actions', label: 'Actions', isSort: false, isFilter: false, excludeFromExport: true, sticky: true,
      render: (_, row) => <Button size="small" startIcon={<Iconify icon="solar:eye-bold" />} aria-label={`View students for ${row.firstCertificateNumber}`} onClick={() => setBatchId(row.id)}>View</Button> },
  ];
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs heading="Certificates" description="Select students, preview their certificates, and manage generated certificates by month."
        links={[{ name: 'Student', href: studentPaths.dashboard }, { name: 'Student Records', href: studentPaths.records.studentList }, { name: 'Certificates' }]}
        action={<Stack direction="row" gap={1}>{canIssue && <Button onClick={templatesDialog.onTrue}>Configure template</Button>}
          {canIssue && <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={formDialog.onTrue}>Create certificate</Button>}</Stack>} />
      {!canView ? <Alert severity="warning">You do not have access to certificates.</Alert> : <>
        <Paper sx={{ px: 1 }}><CustomTabs aria-label="Certificate types" value={tab.value} onChange={(_, value) => {
          setPage(0); setBatchId(''); formDialog.onFalse();
          router.replace(recordsQueryUrl(pathname, params.toString(), { certificate: value }), { scroll: false });
        }}>
          {tabs.map(item => <Tab key={item.value} value={item.value} label={item.label} icon={<Iconify icon={item.icon} />} iconPosition="start" />)}
        </CustomTabs></Paper>
        <Paper sx={{ p: 1 }}><DatePicker label="Generated month" views={['year', 'month']} format="MMM YYYY" value={month}
          onChange={value => { setMonth(value); setPage(0); }} slotProps={{ textField: { size: 'small', sx: { width: { xs: 1, sm: 220 } } } }} /></Paper>
        <CustomizableTable key={tab.value} tableId={`student-${tab.value}-certificate-batches`} tableTitle={`${tab.label} generated certificates`}
          columns={columns} data={validMonth ? query.currentData?.items ?? [] : []} isLoading={query.isFetching} isPagination isSearch={false} serverSidePagination page={page} rowsPerPage={pageSize}
          totalCount={validMonth ? query.currentData?.totalCount ?? 0 : 0} onServerPagination={(nextPage, nextSize) => { setPage(nextPage); setPageSize(nextSize); }}
          noDataText={validMonth ? `No ${tab.label.toLowerCase()} certificates generated in this month.` : 'Select a month to see generated certificates.'}
          errorContent={query.isError ? <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>Generated certificates could not be loaded.</Alert> : undefined}
          wrapperProps={{ sx: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }} tableContainerProps={{ sx: { height: 1 } }} />
      </>}
      {formDialog.value && canIssue && <StudentCertificateForm key={`${academicYearId}-${tab.type}`} certificateType={tab.type} certificateLabel={tab.label}
        onClose={formDialog.onFalse} onGenerated={() => { setMonth(dayjs().startOf('month')); setPage(0); }} />}
      {batchId && <CertificateBatchDialog batchId={batchId} certificateType={tab.type} label={tab.label} onClose={() => setBatchId('')} />}
      <RecordDocumentTemplates open={templatesDialog.value} kind="certificates" certificateType={tab.type} onClose={templatesDialog.onFalse} />
    </Box>
  );
}

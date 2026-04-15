'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Tab,
  Tabs,
  Card,
  Stack,
  Button,
  Divider,
  MenuList,
  MenuItem,
  Typography,
} from '@mui/material';

// ─── Enum ──────────────────────────────────────────────────────────────────────

export enum ImportStatus {
  All = 0,
  Processed = 1,
  Failed = 2,
  Pending = 3,
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const statusLabelMap: Record<ImportStatus, string> = {
  [ImportStatus.All]: 'All',
  [ImportStatus.Processed]: 'Processed',
  [ImportStatus.Failed]: 'Failed',
  [ImportStatus.Pending]: 'Pending',
};

const statusColorMap: Record<ImportStatus, LabelColor> = {
  [ImportStatus.All]: 'default',
  [ImportStatus.Processed]: 'success',
  [ImportStatus.Failed]: 'error',
  [ImportStatus.Pending]: 'warning',
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ImportRecord {
  id: string;
  fileName: string;
  uploadDate: string;
  uploadedBy: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  status: ImportStatus;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_HISTORY: ImportRecord[] = [
  {
    id: '1',
    fileName: 'attendance_april_2026.xlsx',
    uploadDate: '2026-04-13T09:30:00',
    uploadedBy: 'Rahul Sharma',
    totalRecords: 240,
    validRecords: 235,
    invalidRecords: 5,
    status: ImportStatus.Processed,
  },
  {
    id: '2',
    fileName: 'attendance_march_2026.xlsx',
    uploadDate: '2026-04-10T14:15:00',
    uploadedBy: 'Priya Mehta',
    totalRecords: 180,
    validRecords: 180,
    invalidRecords: 0,
    status: ImportStatus.Processed,
  },
  {
    id: '3',
    fileName: 'biometric_export_week14.xlsx',
    uploadDate: '2026-04-08T11:00:00',
    uploadedBy: 'Admin User',
    totalRecords: 120,
    validRecords: 90,
    invalidRecords: 30,
    status: ImportStatus.Failed,
  },
  {
    id: '4',
    fileName: 'attendance_bulk_upload.xlsx',
    uploadDate: '2026-04-07T16:45:00',
    uploadedBy: 'Suresh Kumar',
    totalRecords: 300,
    validRecords: 0,
    invalidRecords: 0,
    status: ImportStatus.Pending,
  },
  {
    id: '5',
    fileName: 'feb_attendance_final.xlsx',
    uploadDate: '2026-03-28T10:20:00',
    uploadedBy: 'Rahul Sharma',
    totalRecords: 210,
    validRecords: 205,
    invalidRecords: 5,
    status: ImportStatus.Processed,
  },
];

// ─── Row Detail Mock ────────────────────────────────────────────────────────────

const MOCK_PREVIEW_ROWS = [
  {
    row: 1,
    employeeCode: 'EMP001',
    employeeName: 'Anita Rao',
    date: '2026-04-13',
    timeIn: '09:02 AM',
    timeOut: '06:01 PM',
    status: 'Present',
    valid: true,
    errors: [],
  },
  {
    row: 2,
    employeeCode: 'EMP002',
    employeeName: 'Ravi Gupta',
    date: '2026-04-13',
    timeIn: '09:15 AM',
    timeOut: '05:55 PM',
    status: 'Present',
    valid: true,
    errors: [],
  },
  {
    row: 3,
    employeeCode: 'EMP999',
    employeeName: '',
    date: '2026-04-13',
    timeIn: '',
    timeOut: '',
    status: 'Absent',
    valid: false,
    errors: ['Employee not found', 'Missing punch-in time'],
  },
  {
    row: 4,
    employeeCode: 'EMP004',
    employeeName: 'Neha Singh',
    date: '2026-04-13',
    timeIn: '09:30 AM',
    timeOut: '06:10 PM',
    status: 'Present',
    valid: true,
    errors: [],
  },
  {
    row: 5,
    employeeCode: 'EMP005',
    employeeName: 'Karan Patel',
    date: '2026-04-13',
    timeIn: '08:50 AM',
    timeOut: '',
    status: 'Absent',
    valid: false,
    errors: ['Missing attendance date', 'Missing punch-out time'],
  },
];

// ─── Preview table columns (defined outside component to be stable refs) ───────

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const PREVIEW_COLUMNS: import('src/components/customizabaleTable/types').IColumn[] = [
  { id: 'row', label: 'Row', minWidth: '2vw', align: 'left', sticky: true },
  {
    id: 'employeeName',
    label: 'Employee Name',
    minWidth: '12vw',
    align: 'left',
    render(value, row) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          {value} ({row.employeeCode})
        </Box>
      );
    },
    sticky: true,
  },
  {
    id: 'date',
    label: 'Date',
    minWidth: '8vw',
    align: 'left',
    render: (value: string) => (
      <Typography variant="body2">{dayjs(value).format('DD-MM-YYYY')}</Typography>
    ),
  },
  { id: 'timeIn', label: 'In Time', minWidth: '7vw', align: 'left', render: (v) => v || '—' },
  { id: 'timeOut', label: 'Out Time', minWidth: '7vw', align: 'left', render: (v) => v || '—' },
  {
    id: 'errors',
    label: 'Errors',
    minWidth: '10vw',
    align: 'left',
    render: (value: string[]) =>
      value?.length > 0 ? (
        <CustomTooltip title={value.join(' • ')}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Iconify icon="material-symbols:error-outline" color="error.main" width={16} />
            <Typography variant="caption" color="error.main">
              {value.length} error{value.length > 1 ? 's' : ''}
            </Typography>
          </Stack>
        </CustomTooltip>
      ) : (
        <Typography variant="caption" color="success.main">
          —
        </Typography>
      ),
  },
  {
    id: 'status',
    label: 'Status',
    align: 'left',
    minWidth: '6vw',
    sticky: true,
    render(value) {
      return (
        <Label color={value === 'Present' ? 'success' : value === 'Absent' ? 'error' : 'warning'}>
          {value}
        </Label>
      );
    },
  },
];

// ─── enum options for column filter ───────────────────────────────────────────

const STATUS_ENUM_OPTIONS = [
  { label: statusLabelMap[ImportStatus.Processed], value: ImportStatus.Processed },
  { label: statusLabelMap[ImportStatus.Failed], value: ImportStatus.Failed },
  { label: statusLabelMap[ImportStatus.Pending], value: ImportStatus.Pending },
];

// ─── Main Screen ───────────────────────────────────────────────────────────────

const AttendanceImportHistoryScreen = () => {
  const tabs = useTabs(ImportStatus.All);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [viewRecord, setViewRecord] = useState<ImportRecord | null>(null);
  const [selectedRow, setSelectedRow] = useState<ImportRecord | null>(null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const downloadDialog = useBoolean();
  const errorReportDialog = useBoolean();
  const reprocessDialog = useBoolean();

  // ── Popover actions ───────────────────────────────────────────────────────
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              setViewRecord(row as ImportRecord);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:eye-outline" sx={{ height: '16px', width: '16px' }} />
            View Details
          </MenuItem>

          <MenuItem
            onClick={() => {
              setSelectedRow(row as ImportRecord);
              downloadDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:download-outline" sx={{ height: '16px', width: '16px' }} />
            Download File
          </MenuItem>

          {(row as ImportRecord).invalidRecords > 0 && (
            <MenuItem
              onClick={() => {
                setSelectedRow(row as ImportRecord);
                errorReportDialog.onTrue();
                pop.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="mdi:file-alert-outline" sx={{ height: '16px', width: '16px' }} />
              Download Error Report
            </MenuItem>
          )}

          {((row as ImportRecord).status === ImportStatus.Failed ||
            (row as ImportRecord).status === ImportStatus.Pending) && (
            <MenuItem
              onClick={() => {
                setSelectedRow(row as ImportRecord);
                reprocessDialog.onTrue();
                pop.onClose();
              }}
              sx={{ color: 'warning.main' }}
            >
              <Iconify icon="mdi:refresh" sx={{ height: '16px', width: '16px' }} />
              Reprocess File
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [downloadDialog.onTrue, errorReportDialog.onTrue, reprocessDialog.onTrue]
  );

  // ── Counts per status ──────────────────────────────────────────────────────
  const counts = useMemo(
    () => ({
      [ImportStatus.All]: MOCK_HISTORY.length,
      [ImportStatus.Processed]: MOCK_HISTORY.filter((r) => r.status === ImportStatus.Processed)
        .length,
      [ImportStatus.Failed]: MOCK_HISTORY.filter((r) => r.status === ImportStatus.Failed).length,
      [ImportStatus.Pending]: MOCK_HISTORY.filter((r) => r.status === ImportStatus.Pending).length,
    }),
    []
  );

  const TABS = useMemo(
    () => [
      { value: ImportStatus.All, label: 'All', color: 'default' as LabelColor },
      { value: ImportStatus.Processed, label: 'Processed', color: 'success' as LabelColor },
      { value: ImportStatus.Failed, label: 'Failed', color: 'error' as LabelColor },
      { value: ImportStatus.Pending, label: 'Pending', color: 'warning' as LabelColor },
    ],
    []
  );

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = MOCK_HISTORY;

    // Tab filter
    if (tabs.value !== ImportStatus.All) {
      data = data.filter((r) => r.status === tabs.value);
    }

    // Date range
    if (fromDate) {
      data = data.filter((r) => dayjs(r.uploadDate).isAfter(dayjs(fromDate).subtract(1, 'day')));
    }
    if (toDate) {
      data = data.filter((r) => dayjs(r.uploadDate).isBefore(dayjs(toDate).add(1, 'day')));
    }

    return data;
  }, [tabs.value, fromDate, toDate]);

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'fileName',
        label: 'File Name',
        minWidth: '18vw',
        align: 'left',
        sticky: true,
      },
      {
        id: 'uploadDate',
        label: 'Upload Date',
        minWidth: '10vw',
        align: 'left',
        render: (value: string) => (
          <Typography variant="body2">{dayjs(value).format('DD-MM-YYYY')}</Typography>
        ),
      },
      {
        id: 'uploadedBy',
        label: 'Uploaded By',
        minWidth: '10vw',
        align: 'left',
      },
      {
        id: 'totalRecords',
        label: 'Total Records',
        minWidth: '6vw',
        filterType: 'number',
        render: (value: number) => (
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        ),
      },
      {
        id: 'validRecords',
        label: 'Valid',
        minWidth: '5vw',
        filterType: 'number',
        render: (value: number) => (
          <Typography variant="body2" color="success.main" fontWeight={600}>
            {value}
          </Typography>
        ),
      },
      {
        id: 'invalidRecords',
        label: 'Invalid',
        minWidth: '5vw',
        filterType: 'number',
        render: (value: number) => (
          <Typography
            variant="body2"
            color={value > 0 ? 'error.main' : 'text.disabled'}
            fontWeight={600}
          >
            {value}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: '8vw',
        align: 'center',
        isFilter: true,
        filterType: 'enum',
        sticky: true,
        enumOptions: STATUS_ENUM_OPTIONS,
        render: (value: ImportStatus) => (
          <Label color={statusColorMap[value] ?? 'default'}>{statusLabelMap[value] ?? value}</Label>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        minWidth: '80px',
        align: 'center',
        sticky: true,
        render: (_value: string, row: any) => (
          <ThreeDotsActions actions={(props) => actions({ ...props, row })} placement="right-top" />
        ),
      },
    ],
    [actions]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Breadcrumbs */}
      <CustomBreadcrumbs
        heading="Import History"
        description="Track uploaded biometric attendance files, review records, and manage imports."
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave', href: '/hr/biometric-integration/' },
          { name: 'Import History' },
        ]}
      />

      {/* Status Tabs (matching attendance-tracking style) */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 1,
          gap: 2,
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mb: 1,
          flexWrap: 'wrap',
        }}
      >
        {/* Search + Date filters on left */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={setFromDate}
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            format="DD-MM-YYYY"
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={setToDate}
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            format="DD-MM-YYYY"
            slotProps={{ textField: { size: 'small' } }}
          />
          {(fromDate || toDate) && (
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<Iconify icon="mdi:filter-off-outline" />}
              onClick={() => {
                setFromDate(null);
                setToDate(null);
              }}
            >
              Clear
            </Button>
          )}
        </Stack>

        {/* Status Tabs on right */}
        <Tabs
          value={tabs.value}
          onChange={(e, val) => tabs.onChange(e, val)}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2, justifyContent: 'end' },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              sx={{ fontSize: '12px' }}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}
                  <Label variant="soft" color={tab.color}>
                    {counts[tab.value]}
                  </Label>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Table */}
      <CustomizableTable
        tableId="attendance-import-history-table"
        columns={columns}
        data={filteredData}
        isLoading={false}
        noDataText={
          <Stack alignItems="center" spacing={1} py={4}>
            <Iconify icon="mdi:file-clock-outline" width={48} color="text.disabled" />
            <Typography color="text.secondary" variant="body2">
              No import history found.
            </Typography>
          </Stack>
        }
      />

      {/* Detail View Dialog */}
      {viewRecord && <ImportDetailDialog record={viewRecord} onClose={() => setViewRecord(null)} />}
    </Box>
  );
};

export default AttendanceImportHistoryScreen;

// ─── Detail Dialog ─────────────────────────────────────────────────────────────

const ImportDetailDialog = ({ record, onClose }: { record: ImportRecord; onClose: () => void }) => (
  <CustomDialog
    title={
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h6">File Details</Typography>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
          — {record.fileName}
        </Typography>
      </Stack>
    }
    open
    handleClose={onClose}
    maxWidth="md"
  >
    <Box sx={{ p: 2 }}>
      {/* Summary */}
      <Card sx={{ display: 'flex', gap: 3, p: 2, mb: 2, bgcolor: 'background.neutral' }}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Upload Date
          </Typography>
          <Typography variant="subtitle2">
            {dayjs(record.uploadDate).format('DD MMM YYYY, hh:mm A')}
          </Typography>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Uploaded By
          </Typography>
          <Typography variant="subtitle2">{record.uploadedBy}</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box>
          <Typography variant="overline" color="text.secondary">
            Total Records
          </Typography>
          <Typography variant="h6">{record.totalRecords}</Typography>
        </Box>
        <Box>
          <Typography variant="overline" color="success.main">
            Valid Rows
          </Typography>
          <Typography variant="h6" color="success.main">
            {record.validRecords}
          </Typography>
        </Box>
        <Box>
          <Typography variant="overline" color="error.main">
            Invalid Rows
          </Typography>
          <Typography variant="h6" color="error.main">
            {record.invalidRecords}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Label color={statusColorMap[record.status]}>{statusLabelMap[record.status]}</Label>
        </Box>
      </Card>

      {/* Row Preview Table */}
      <Typography variant="subtitle2" mb={1}>
        Row Preview
      </Typography>
      <CustomizableTable
        tableId="import-detail-preview-table"
        columns={PREVIEW_COLUMNS}
        data={MOCK_PREVIEW_ROWS}
        isPagination={false}
        isSearch={false}
        isFilter={false}
      />
    </Box>
  </CustomDialog>
);

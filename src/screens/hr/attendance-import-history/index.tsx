'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AttendanceImportItem } from 'src/redux/hr/attendanceImportApi';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetAttendanceImportsQuery,
  useGetAttendanceImportByIdQuery,
  useGetAttendanceImportRowsQuery,
} from 'src/redux/hr/attendanceImportApi';
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
  CircularProgress,
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

// ─── enum options for column filter ───────────────────────────────────────────

const STATUS_ENUM_OPTIONS = [
  { label: 'Processed', value: ImportStatus.Processed },
  { label: 'Failed', value: ImportStatus.Failed },
  { label: 'Pending', value: ImportStatus.Pending },
];

// ─── Preview table columns (defined outside component to be stable refs) ───────

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const PREVIEW_COLUMNS: import('src/components/customizabaleTable/types').IColumn[] = [
  { id: 'rowNumber', label: 'Row #', minWidth: '4vw', align: 'left' },
  { id: 'employeeName', label: 'Employee Name', minWidth: '12vw', align: 'left' },
  {
    id: 'employeeCode',
    label: 'Emp Code',
    minWidth: '8vw',
    align: 'left',
  },
  {
    id: 'attendanceDate',
    label: 'Date',
    minWidth: '8vw',
    align: 'left',
  },
  { id: 'timeIn', label: 'In Time', minWidth: '7vw', align: 'left', render: (v) => v || '—' },
  { id: 'timeOut', label: 'Out Time', minWidth: '7vw', align: 'left', render: (v) => v || '—' },
  {
    id: 'action',
    label: 'Action',
    minWidth: '6vw',
    align: 'left',
    render: (v: string) => v || '—',
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: '6vw',
    align: 'left',
    render: (value: string) => (
      <Label color={value === 'Valid' ? 'success' : value === 'Invalid' ? 'error' : 'warning'}>
        {value || '—'}
      </Label>
    ),
  },
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
    id: 'warnings',
    label: 'Warnings',
    minWidth: '10vw',
    align: 'left',
    render: (value: string[]) =>
      value?.length > 0 ? (
        <CustomTooltip title={value.join(' • ')}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Iconify icon="material-symbols:warning-outline" color="warning.main" width={16} />
            <Typography variant="caption" color="warning.main">
              {value.length} warning{value.length > 1 ? 's' : ''}
            </Typography>
          </Stack>
        </CustomTooltip>
      ) : (
        <Typography variant="caption" color="text.disabled">
          —
        </Typography>
      ),
  },
];

// ─── Main Screen ───────────────────────────────────────────────────────────────

const AttendanceImportHistoryScreen = () => {
  const tabs = useTabs(ImportStatus.All);

  // Month picker — null means "no filter"
  const [selectedMonth, setSelectedMonth] = useState<any>(null);

  // The import ID to show in the detail dialog
  const [viewImportId, setViewImportId] = useState<string | null>(null);

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const downloadDialog = useBoolean();
  const errorReportDialog = useBoolean();
  const reprocessDialog = useBoolean();

  // Build payrollMonth param: "YYYY-MM" from the dayjs picker value
  const payrollMonthParam = selectedMonth
    ? (dayjs(selectedMonth).format('YYYY-MM') as string)
    : undefined;

  // ── API call 1: fetch list ─────────────────────────────────────────────────
  const { data: listData, isLoading: listLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceImportsQuery,
    params: {
      payrollMonth: payrollMonthParam,
      maxResultCount: 50,
    },
  });

  // ── Counts per status for tab labels ──────────────────────────────────────
  const counts = useMemo(
    () => ({
      [ImportStatus.All]: listData?.items.length,
      [ImportStatus.Processed]: listData?.items.filter(
        (r: any) => r.status === ImportStatus.Processed
      ).length,
      [ImportStatus.Failed]: listData?.items.filter((r: any) => r.status === ImportStatus.Failed)
        .length,
      [ImportStatus.Pending]: listData?.items.filter((r: any) => r.status === ImportStatus.Pending)
        .length,
    }),
    [listData?.items]
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

  // ── Tab-filtered data ──────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (tabs.value === ImportStatus.All) return listData?.items;
    return listData?.items.filter((r: any) => r.status === tabs.value);
  }, [listData?.items, tabs.value]);

  // ── Popover actions ───────────────────────────────────────────────────────
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              setViewImportId((row as AttendanceImportItem).id);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:eye-outline" sx={{ height: '16px', width: '16px' }} />
            View Details
          </MenuItem>

          <MenuItem
            onClick={() => {
              downloadDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:download-outline" sx={{ height: '16px', width: '16px' }} />
            Download File
          </MenuItem>

          {(row as AttendanceImportItem).invalidRows > 0 && (
            <MenuItem
              onClick={() => {
                errorReportDialog.onTrue();
                pop.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="mdi:file-alert-outline" sx={{ height: '16px', width: '16px' }} />
              Download Error Report
            </MenuItem>
          )}

          {((row as AttendanceImportItem).status === ImportStatus.Failed ||
            (row as AttendanceImportItem).status === ImportStatus.Pending) && (
            <MenuItem
              onClick={() => {
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
        id: 'importedAt',
        label: 'Imported At',
        minWidth: '10vw',
        align: 'left',
        render: (value: string) => (
          <Typography variant="body2">{dayjs(value).format('DD-MM-YYYY hh:mm A')}</Typography>
        ),
      },
      {
        id: 'importedByName',
        label: 'Imported By',
        minWidth: '10vw',
        align: 'left',
      },
      {
        id: 'payrollMonth',
        label: 'Payroll Month',
        minWidth: '8vw',
        align: 'left',
        render: (value: string) =>
          value ? <Typography variant="body2">{dayjs(value).format('MMM YYYY')}</Typography> : '—',
      },
      {
        id: 'totalRows',
        label: 'Total',
        minWidth: '5vw',
        filterType: 'number',
        render: (value: number) => (
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        ),
      },
      {
        id: 'validRows',
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
        id: 'invalidRows',
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
        render: (value: number) => (
          <Label color={statusColorMap[value as ImportStatus] ?? 'default'}>
            {statusLabelMap[value as ImportStatus] ?? value ?? '—'}
          </Label>
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

      {/* Toolbar: Month Picker + Tabs */}
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
        {/* Month picker on left */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
          <DatePicker
            label="Payroll Month"
            views={['year', 'month']}
            openTo="month"
            value={selectedMonth}
            onChange={setSelectedMonth}
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            format="MMM YYYY"
            slotProps={{ textField: { size: 'small' } }}
          />
          {selectedMonth && (
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<Iconify icon="mdi:filter-off-outline" />}
              onClick={() => setSelectedMonth(null)}
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
        data={filteredData || []}
        isLoading={listLoading}
        noDataText={
          <Stack alignItems="center" spacing={1} py={4}>
            {' '}
            <Typography color="text.secondary" variant="body2">
              No import history found.
            </Typography>
          </Stack>
        }
      />

      {/* Detail View Dialog — triggered by View action */}
      {viewImportId && (
        <ImportDetailDialog importId={viewImportId} onClose={() => setViewImportId(null)} />
      )}
    </Box>
  );
};

export default AttendanceImportHistoryScreen;

// ─── Detail Dialog ─────────────────────────────────────────────────────────────

const ImportDetailDialog = ({ importId, onClose }: { importId: string; onClose: () => void }) => {
  // API call 2: fetch detail by id
  const { data: detail, isLoading: detailLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceImportByIdQuery,
    params: importId,
  });

  // API call 3: fetch employee rows for this import
  const { data: rowsData, isLoading: rowsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceImportRowsQuery,
    params: {
      importId,
      maxResultCount: 50,
    },
  });

  return (
    <CustomDialog
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">File Details</Typography>
          {detail && (
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
              — {detail.fileName}
            </Typography>
          )}
        </Stack>
      }
      open
      handleClose={onClose}
      maxWidth="lg"
    >
      <Scrollbar sx={{ height: 500, p: 2 }}>
        {detailLoading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={32} />
          </Stack>
        ) : detail ? (
          <>
            {/* Summary Card */}
            <Card
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                p: 2,
                mb: 2,
                bgcolor: 'background.neutral',
              }}
            >
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Imported At
                </Typography>
                <Typography variant="subtitle2">
                  {dayjs(detail.importedAt).format('DD MMM YYYY, hh:mm A')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Imported By
                </Typography>
                <Typography variant="subtitle2">{detail.importedByName}</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Payroll Month
                </Typography>
                <Typography variant="subtitle2">
                  {detail.payrollMonth ? dayjs(detail.payrollMonth).format('MMM YYYY') : '—'}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Total Rows
                </Typography>
                <Typography variant="h6">{detail.totalRows}</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="success.main">
                  Valid Rows
                </Typography>
                <Typography variant="h6" color="success.main">
                  {detail.validRows}
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="error.main">
                  Invalid Rows
                </Typography>
                <Typography variant="h6" color="error.main">
                  {detail.invalidRows}
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="h6">{detail.createdCount}</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Replaced
                </Typography>
                <Typography variant="h6">{detail.replacedCount}</Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                <Label color={statusColorMap[detail.status as ImportStatus] ?? 'default'}>
                  {statusLabelMap[detail.status as ImportStatus] ?? detail.status}
                </Label>
              </Box>
            </Card>

            {/* Error/Warning Summary */}
            {(detail.errorsSummary?.length ?? 0) > 0 && (
              <Stack spacing={0.5} mb={2}>
                <Typography variant="subtitle2" color="error.main">
                  Errors Summary
                </Typography>
                {detail.errorsSummary!.map((e: any, i: number) => (
                  <Typography key={i} variant="caption" color="error.main">
                    • {e}
                  </Typography>
                ))}
              </Stack>
            )}

            {/* Row Preview Table — API call 3 */}
            <Typography variant="subtitle2" mb={1}>
              Employee Rows
            </Typography>
            <CustomizableTable
              tableId="import-detail-preview-table"
              columns={PREVIEW_COLUMNS}
              data={rowsData?.items || []}
              isLoading={rowsLoading}
              isPagination={false}
              isSearch={false}
              isFilter={false}
              noDataText={
                <Stack alignItems="center" spacing={1} py={3}>
                  <Typography color="text.secondary" variant="body2">
                    No rows found for this import.
                  </Typography>
                </Stack>
              }
            />
          </>
        ) : (
          <Typography color="text.secondary" variant="body2">
            Unable to load import details.
          </Typography>
        )}
      </Scrollbar>
    </CustomDialog>
  );
};

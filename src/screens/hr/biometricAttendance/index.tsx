'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AttendanceImportItem } from 'src/redux/hr/attendanceImportApi';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AttendanceRowStatus } from 'src/enums/attendance-row-status';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';
import {
  Person,
  Numbers,
  FilePresent,
  ErrorOutline,
  CalendarMonth,
  CheckCircleOutline,
} from '@mui/icons-material';
import {
  AttendanceImportBatchStatus,
  AttendanceImportBatchStatusColors,
  AttendanceImportBatchStatusOptions,
} from 'src/enums/attendance-import-batch-statusType';
import {
  useConfirmAttendanceMutation,
  usePreviewAttendanceMutation,
  useSaveDayAttendanceMutation,
  useDownloadAttendanceTemplateMutation,
} from 'src/redux/hr/attendanceApi';
import {
  Box,
  Card,
  Grid,
  Paper,
  Stack,
  Button,
  Checkbox,
  Collapse,
  MenuItem,
  MenuList,
  Skeleton,
  IconButton,
  Typography,
  CardContent,
} from '@mui/material';
import {
  useGetAttendanceImportsQuery,
  AttendanceImportRowStatusCode,
  useGetAttendanceImportByIdQuery,
  useGetAttendanceImportRowsQuery,
  useLockAttendanceImportBatchMutation,
  useUnlockAttendanceImportBatchMutation,
} from 'src/redux/hr/attendanceImportApi';

// ─── Inner-table (row-level) attendance status ─────────────────────────────────
type RowStatusType = AttendanceRowStatus | 'Pending';
const ROW_STATUS = {
  Present: AttendanceRowStatus.Present,
  Absent: AttendanceRowStatus.Absent,
  HalfDay: AttendanceRowStatus.HalfDay,
  Pending: 'Pending' as const,
};

const mapImportRowStatusToUi = (
  statusCode?: number | null,
  statusText?: string | null
): RowStatusType => {
  if (statusCode === AttendanceImportRowStatusCode.Present) return ROW_STATUS.Present;
  if (statusCode === AttendanceImportRowStatusCode.Absent) return ROW_STATUS.Absent;
  if (statusCode === AttendanceImportRowStatusCode.HalfDay) return ROW_STATUS.HalfDay;

  const normalizedStatus = (statusText || '')
    .trim()
    .toUpperCase()
    .replace(/[\s_-]/g, '');
  if (normalizedStatus === 'PRESENT') return ROW_STATUS.Present;
  if (normalizedStatus === 'ABSENT' || normalizedStatus === 'FULLDAYLEAVE')
    return ROW_STATUS.Absent;
  if (normalizedStatus === 'HALFDAY' || normalizedStatus === 'HALFDAYLEAVE')
    return ROW_STATUS.HalfDay;
  return ROW_STATUS.Pending;
};

const segmentBtnBase = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'all 0.2s',
};

const DEVICE_INTEGRATION_MODES = [
  {
    title: 'Excel / CSV Import',
    status: 'Available',
    color: 'success' as LabelColor,
    icon: 'mdi:file-excel-outline',
    description: 'Use the standard import template to upload employee attendance punches.',
  },
  {
    title: 'Biometric Device Sync',
    status: 'Coming soon',
    color: 'warning' as LabelColor,
    icon: 'mdi:fingerprint',
    description: 'Device-company connector will be added after vendor requirements are finalized.',
  },
  {
    title: 'RFID / Device API Sync',
    status: 'Coming soon',
    color: 'warning' as LabelColor,
    icon: 'mdi:card-account-details-outline',
    description: 'API-based sync remains a placeholder until the device contract is known.',
  },
  {
    title: 'Vendor-specific Connector',
    status: 'Requirement pending',
    color: 'default' as LabelColor,
    icon: 'mdi:puzzle-outline',
    description: 'No vendor fields are required now; this will be configured when selected.',
  },
];

// ─── Preview table columns (defined outside component to be stable refs) ───────

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const PREVIEW_COLUMNS: import('src/components/customizabaleTable/types').IColumn[] = [
  {
    id: 'employeeName',
    label: 'Employee Name',
    minWidth: '12vw',
    align: 'left',
    sticky: true,
    render(value, row) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          {value} ({row.employeeCode})
        </Box>
      );
    },
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
  {
    id: 'status',
    label: 'Status',
    minWidth: '6vw',
    sticky: true,
    align: 'left',
    render: (value: string) => {
      const colorMap: Record<string, 'primary' | 'error' | 'warning' | 'info' | 'default'> = {
        Present: 'primary',
        Absent: 'error',
        Pending: 'warning',
        HalfDay: 'info',
      };
      return <Label color={colorMap[value] || 'default'}>{value || '—'}</Label>;
    },
  },
];

// ─── Main Screen ───────────────────────────────────────────────────────────────

const AttendanceImportHistoryScreen = () => {
  const theme = useTheme();

  // Selected rows for bulk actions
  const [selectedRows, setSelectedRows] = useState<AttendanceImportItem[]>([]);

  const [lockConfirmRow, setLockConfirmRow] = useState<AttendanceImportItem | null>(null);

  const handleToggleLock = useCallback((row: AttendanceImportItem) => {
    setLockConfirmRow(row);
  }, []);

  const [lockAttendanceImportBatch, { isLoading: isLockingBatch }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLockAttendanceImportBatchMutation,
  });
  const [unlockAttendanceImportBatch, { isLoading: isUnlockingBatch }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUnlockAttendanceImportBatchMutation,
  });

  const handleConfirmToggleLock = useCallback(async () => {
    if (!lockConfirmRow) return;
    try {
      if (lockConfirmRow.isBatchLocked) {
        await unlockAttendanceImportBatch({ batchId: lockConfirmRow.id }).unwrap();
      } else {
        await lockAttendanceImportBatch({ batchId: lockConfirmRow.id }).unwrap();
      }
      shikshaMitraToast.success({
        message: lockConfirmRow.isBatchLocked
          ? 'Automated marking unlocked successfully.'
          : 'Automated marking locked successfully.',
      });
      setLockConfirmRow(null);
    } catch (error: any) {
      console.error('Failed to toggle automated marking lock:', error);
      shikshaMitraToast.error({
        message:
          error?.data?.error?.message || error?.data?.message || 'Failed to update lock state.',
      });
    }
  }, [lockAttendanceImportBatch, lockConfirmRow, unlockAttendanceImportBatch]);

  // Month picker — null means "no filter"
  const [selectedMonth, setSelectedMonth] = useState<any>(null);

  // The import ID to show in the detail dialog
  const [viewImportData, setViewImportData] = useState<AttendanceImportItem | null>(null);
  const viewImportDialog = useBoolean();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const downloadDialog = useBoolean();
  const errorReportDialog = useBoolean();
  const reprocessDialog = useBoolean();
  const isDownLoadingTemplate = useBoolean();
  const isUploadingFile = useBoolean();
  const [previewAttendance] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePreviewAttendanceMutation,
  });

  const [confirmAttendance] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useConfirmAttendanceMutation,
  });

  const [downloadAttendanceTemplate] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDownloadAttendanceTemplateMutation,
  });
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Popover actions ───────────────────────────────────────────────────────
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              viewImportDialog.onTrue();
              setViewImportData(row as AttendanceImportItem);
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

          {Number((row as AttendanceImportItem).status) === AttendanceImportBatchStatus.Preview && (
            <MenuItem
              onClick={() => {
                viewImportDialog.onTrue();
                setViewImportData(row as AttendanceImportItem);
                pop.onClose();
              }}
              sx={{ color: 'info.main' }}
            >
              <Iconify icon="mdi:table-check" sx={{ height: '16px', width: '16px' }} />
              Review & Confirm Import
            </MenuItem>
          )}

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

          {Number((row as AttendanceImportItem).status) === AttendanceImportBatchStatus.Preview && (
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

  const handleDownloadTemplate = async () => {
    try {
      isDownLoadingTemplate.onTrue();
      const blob: any = await downloadAttendanceTemplate({}).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Employee_import_attendance.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download attendance template:', error);
      shikshaMitraToast.error({
        message: 'Failed to download template. Please try again.',
      });
    } finally {
      isDownLoadingTemplate.onFalse();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!validTypes.includes(file.type)) {
      shikshaMitraToast.error({
        message: 'Please upload a valid Excel file (.xls or .xlsx)',
      });
      return;
    }

    isUploadingFile.onTrue();
    try {
      const formData = new FormData();
      formData.append('File', file);

      // Step 1: Preview
      const previewResponse = await previewAttendance(formData).unwrap();

      if (previewResponse?.previewToken) {
        // Step 2: Confirm
        const confirmResponse = await confirmAttendance({
          previewToken: previewResponse.previewToken,
        }).unwrap();

        // setImportResults(previewResponse);

        shikshaMitraToast.success({
          message: `Attendance data has been imported successfully (${confirmResponse?.summary?.totalRows || 0} rows)`,
        });
      }
    } catch (error: any) {
      console.error('Failed to import attendance:', error);
      shikshaMitraToast.error({
        message: `Failed to import attendance: ${error?.data?.error?.message || 'Unknown error'}`,
      });
    } finally {
      isUploadingFile.onFalse();
      // Always reset the file input so the same file can be re-uploaded if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  // ── Columns ────────────────────────────────────────────────────────────────
  const tableData = useMemo(() => listData?.items || [], [listData?.items]);

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'checkBox',
        label: '',
        align: 'center',
        minWidth: '60px',
        isSort: false,
        isFilter: false,
        sticky: true,
        renderColumn() {
          return (
            <Checkbox
              checked={tableData.length > 0 && selectedRows.length === tableData.length}
              indeterminate={selectedRows.length > 0 && selectedRows.length < tableData.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRows(tableData);
                } else {
                  setSelectedRows([]);
                }
              }}
            />
          );
        },
        render(_value: any, row: any) {
          const isChecked = selectedRows.some((r) => r.id === row.id);
          return (
            <Checkbox
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                if (e.target.checked) {
                  setSelectedRows((prev) => [...prev, row as AttendanceImportItem]);
                } else {
                  setSelectedRows((prev) => prev.filter((r) => r.id !== row.id));
                }
              }}
            />
          );
        },
      },
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
        filterType: 'date',
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
        enumOptions: AttendanceImportBatchStatusOptions,
        render: (value: number) => (
          <Label color={AttendanceImportBatchStatusColors[value] as LabelColor}>
            {AttendanceImportBatchStatus[value]}
          </Label>
        ),
      },
      {
        id: 'isBatchLocked',
        label: 'Lock',
        minWidth: '60px',
        isFilter: false,
        isSort: false,
        sticky: true,
        render: (_value: any, row: any) => {
          const isLocked = row.isBatchLocked;
          const color = isLocked ? theme.palette.grey[500] : theme.vars.palette.success.main;
          return (
            <CustomTooltip title={isLocked ? 'Unlock' : 'Lock'} arrow placement="left">
              <IconButton
                onClick={() => handleToggleLock(row as AttendanceImportItem)}
                sx={{
                  p: 0.6,
                  borderRadius: '50%',
                  backgroundColor: color,
                  transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.1)', backgroundColor: color },
                }}
              >
                <Iconify
                  icon={isLocked ? 'mdi:lock-outline' : 'mdi:lock-open-outline'}
                  sx={{ width: 20, height: 20, color: '#fff' }}
                />
              </IconButton>
            </CustomTooltip>
          );
        },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actions, handleToggleLock, selectedRows, tableData, theme]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Breadcrumbs */}
      {viewImportDialog.value ? (
        <CustomBreadcrumbs
          heading="Device Integration"
          description="Review imported attendance batches and keep device sync placeholders visible until vendor requirements are finalized."
          links={[
            { name: 'HR/Staff', href: '/hr/dashboard/' },
            { name: 'Attendance Management' },
            { name: 'Device Integration' },
          ]}
          isBack
          onBack={() => {
            viewImportDialog.onFalse();
            setViewImportData(null);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Device Integration"
          description="Excel import is available now. Biometric, RFID, and vendor-specific sync will be enabled after device requirements are confirmed."
          links={[
            { name: 'HR/Staff', href: '/hr/dashboard/' },
            { name: 'Attendance Management' },
            { name: 'Device Integration' },
          ]}
        />
      )}

      {/* Toolbar: Month Picker + Tabs */}
      {!viewImportDialog.value ? (
        <>
          <Grid container spacing={1.5} sx={{ mb: 1 }}>
            {DEVICE_INTEGRATION_MODES.map((mode) => (
              <Grid key={mode.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card sx={{ height: '100%', p: 2 }}>
                  <Stack spacing={1.25}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'background.neutral',
                        }}
                      >
                        <Iconify icon={mode.icon} width={20} />
                      </Box>
                      <Label color={mode.color}>{mode.status}</Label>
                    </Stack>
                    <Typography variant="subtitle2">{mode.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mode.description}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              p: 1,
              gap: 2,
              borderRadius: '12px',
              bgcolor: 'background.paper',
              boxShadow: 'var(--shadows-3)',
              mb: 1,
              flexWrap: 'wrap',
            }}
          >
            {/* Month picker on left */}
            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}> */}
            <DatePicker
              label="Month"
              views={['year', 'month']}
              openTo="month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
              format="MMM YYYY"
              slotProps={{ textField: { size: 'small' } }}
            />
            {/* Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LoadingButton
                loading={isDownLoadingTemplate.value}
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="eva:download-fill" />}
                onClick={handleDownloadTemplate}
                sx={{ px: '32px' }}
              >
                Download Sample File
              </LoadingButton>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <LoadingButton
                loading={isUploadingFile.value}
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:upload-fill" />}
                onClick={handleUploadClick}
                sx={{ px: '32px' }}
              >
                Upload File
              </LoadingButton>
            </Box>
            {/* </Box> */}
          </Box>

          <CustomizableTable
            tableId="biometric-attendance-history-table"
            showCheckbox={selectedRows.length > 0}
            columns={columns}
            data={listData?.items || []}
            isLoading={listLoading}
            noDataText={
              <Stack alignItems="center" spacing={1} py={4}>
                {' '}
                <Typography color="text.secondary" variant="body2">
                  No biometric attendance found.
                </Typography>
              </Stack>
            }
          />
        </>
      ) : (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ImportDetailDialog importData={viewImportData} onClose={() => setViewImportData(null)} />
        </Card>
      )}
      {/* Lock/Unlock Confirm Dialog */}
      <ConfirmDialog
        open={!!lockConfirmRow}
        onClose={() => setLockConfirmRow(null)}
        title={
          lockConfirmRow?.isBatchLocked ? 'Unlock Automated Marking?' : 'Lock Automated Marking?'
        }
        content={
          lockConfirmRow?.isBatchLocked
            ? 'Are you sure you want to unlock this automated marking import for payroll?'
            : 'Are you sure you want to lock this automated marking import for payroll? This will prevent further edits.'
        }
        action={
          <Button
            variant="contained"
            color={lockConfirmRow?.isBatchLocked ? 'warning' : 'primary'}
            size="small"
            disabled={isLockingBatch || isUnlockingBatch}
            onClick={handleConfirmToggleLock}
          >
            Yes, {lockConfirmRow?.isBatchLocked ? 'Unlock' : 'Lock'}
          </Button>
        }
      />
    </Box>
  );
};

export default AttendanceImportHistoryScreen;

// ─── Import Detail Skeleton ────────────────────────────────────────────────────

const ImportDetailSkeleton = () => (
  <Box>
    {/* Summary Card Skeleton */}
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        mb: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Skeleton variant="text" width={140} height={28} />
          <Skeleton variant="text" width={220} height={20} />
        </Box>
      </Box>

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="80%" height={22} />
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Paper>

    {/* Table Header Skeleton */}
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
      <Skeleton variant="text" width={140} height={28} />
      <Skeleton variant="rounded" width={90} height={32} />
    </Stack>

    {/* Status summary skeleton */}
    <Stack direction="row" spacing={2} mb={1}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="text" width={80} height={18} />
      ))}
    </Stack>

    {/* Table skeleton */}
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Table head */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          px: 2,
          py: 1.2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.neutral',
        }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" width="70%" height={18} />
        ))}
      </Box>
      {/* Table rows */}
      {Array.from({ length: 6 }).map((_row, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            px: 2,
            py: 1.2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': { borderBottom: 'none' },
          }}
        >
          {Array.from({ length: 7 }).map((_col, j) => (
            <Skeleton key={j} variant="text" width={j === 0 ? '90%' : '60%'} height={20} />
          ))}
        </Box>
      ))}
    </Paper>
  </Box>
);

type EditingCell = { rowId: string; field: 'timeIn' | 'timeOut'; value: dayjs.Dayjs | null } | null;

const ImportDetailDialog = ({
  importData,
  onClose,
}: {
  importData: AttendanceImportItem | null;
  onClose: () => void;
}) => {
  // Local row state for attendance status overrides
  const [rowsData2, setRowsData2] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const isPayrollLocked = !!importData?.isBatchLocked;
  const summaryOpen = useBoolean(false);
  const isSaving = useBoolean();

  const [saveDayAttendance] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveDayAttendanceMutation,
  });

  // API call 2: fetch detail by id
  const { data: detail, isLoading: detailLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceImportByIdQuery,
    params: { id: importData?.id },
    options: { skip: !importData?.id },
  });

  // API call 3: fetch employee rows for this import
  const { data: rowsData, isLoading: rowsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceImportRowsQuery,
    params: {
      id: importData?.id,
      maxResultCount: 50,
    },
    options: { skip: !importData?.id },
  });

  // Sync API rows into local state
  React.useEffect(() => {
    if (rowsData?.items) {
      setRowsData2(
        rowsData.items.map((r: any) => ({
          ...r,
          id: r.id,
          attendanceStatus: mapImportRowStatusToUi(r.statusCode, r.status),
        }))
      );
    }
  }, [rowsData]);

  const updateRow = React.useCallback((id: string, patch: any) => {
    setRowsData2((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  // Map numeric enum to string for API statusWire
  const getStatusWire = (status: RowStatusType): string => {
    if (status === ROW_STATUS.Present) return 'Present';
    if (status === ROW_STATUS.Absent) return 'Absent';
    if (status === ROW_STATUS.HalfDay) return 'HalfDay';
    return 'Pending';
  };

  const handleSubmitAttendance = async () => {
    const nonPendingRows = rowsData2.filter((r) => r.attendanceStatus !== ROW_STATUS.Pending);
    const submitReadyRows = nonPendingRows.filter((r) => !!r.employeeId);
    if (submitReadyRows.length === 0) {
      shikshaMitraToast.error({
        message: 'No valid rows available to submit. Resolve employee mapping issues first.',
      });
      return;
    }

    // Group entries by attendanceDate
    const dateGroups = submitReadyRows.reduce(
      (acc: Record<string, any[]>, row) => {
        const date = row.attendanceDate || '';
        if (!acc[date]) acc[date] = [];
        acc[date].push(row);
        return acc;
      },
      {} as Record<string, any[]>
    );

    isSaving.onTrue();
    try {
      const requests = Object.entries(dateGroups).map(([date, rows]) => {
        const body = {
          attendanceDate: date,
          entries: rows.map((r: any) => ({
            employeeId: r.employeeId,
            statusWire: getStatusWire(r.attendanceStatus),
            inTime: r.timeIn || '',
            outTime: r.timeOut || '',
            remarks: r.remarks || '',
          })),
        };
        return saveDayAttendance(body).unwrap();
      });
      await Promise.all(requests);
      const unresolvedCount = nonPendingRows.length - submitReadyRows.length;
      shikshaMitraToast.success({
        message:
          unresolvedCount > 0
            ? `Attendance saved for ${submitReadyRows.length} employee(s). Skipped ${unresolvedCount} unresolved row(s).`
            : `Attendance saved successfully for ${submitReadyRows.length} employee(s).`,
      });
    } catch (error: any) {
      console.error('Failed to save attendance:', error);
      shikshaMitraToast.error({
        message: `Failed to save attendance: ${error?.data?.error?.message || 'Unknown error'}`,
      });
    } finally {
      isSaving.onFalse();
    }
  };

  // Attendance column — defined here so updateRow closure is fresh
  const attendanceColumn = useMemo(
    () => ({
      id: 'attendanceStatus',
      label: 'Attendance',
      sticky: true,
      minWidth: '180px',
      align: 'left' as const,
      isSort: false,
      isFilter: false,
      render: (value: RowStatusType, row: any) => {
        const isRowEditable = !isPayrollLocked && !!row.employeeId;
        return (
          <Box
            sx={{
              display: 'flex',
              width: '172px',
              height: '30px',
              bgcolor: (t: any) => t.vars.palette.background.neutral,
              borderRadius: '6px',
              p: 0.25,
              gap: 0.25,
            }}
          >
            <CustomTooltip title="Present" arrow placement="top">
              <Box
                onClick={() => {
                  if (!isRowEditable) return;
                  updateRow(row.id, { attendanceStatus: ROW_STATUS.Present });
                }}
                sx={{
                  ...segmentBtnBase,
                  cursor: isRowEditable ? 'pointer' : 'not-allowed',
                  opacity: isRowEditable ? 1 : 0.45,
                  bgcolor:
                    value === ROW_STATUS.Present
                      ? (t: any) => t.vars.palette.success.main
                      : 'transparent',
                  color:
                    value === ROW_STATUS.Present
                      ? (t: any) => t.vars.palette.success.contrastText
                      : (t: any) => t.vars.palette.text.secondary,
                  '&:hover': {
                    bgcolor: (t: any) =>
                      value === ROW_STATUS.Present
                        ? t.vars.palette.success.dark
                        : varAlpha(t.vars.palette.success.mainChannel, 0.08),
                  },
                }}
              >
                <Iconify icon="eva:checkmark-fill" width={16} />
              </Box>
            </CustomTooltip>

            <CustomTooltip title="Half Day" arrow placement="top">
              <Box
                onClick={() => {
                  if (!isRowEditable) return;
                  updateRow(row.id, { attendanceStatus: ROW_STATUS.HalfDay });
                }}
                sx={{
                  ...segmentBtnBase,
                  cursor: isRowEditable ? 'pointer' : 'not-allowed',
                  opacity: isRowEditable ? 1 : 0.45,
                  bgcolor:
                    value === ROW_STATUS.HalfDay
                      ? (t: any) => t.vars.palette.info.main
                      : 'transparent',
                  color:
                    value === ROW_STATUS.HalfDay
                      ? (t: any) => t.vars.palette.info.contrastText
                      : (t: any) => t.vars.palette.text.secondary,
                  '&:hover': {
                    bgcolor: (t: any) =>
                      value === ROW_STATUS.HalfDay
                        ? t.vars.palette.info.dark
                        : varAlpha(t.vars.palette.info.mainChannel, 0.08),
                  },
                }}
              >
                <Iconify icon="mdi:fraction-one-half" width={16} />
              </Box>
            </CustomTooltip>

            <CustomTooltip title="Pending" arrow placement="top">
              <Box
                onClick={() => {
                  if (!isRowEditable) return;
                  updateRow(row.id, { attendanceStatus: ROW_STATUS.Pending });
                }}
                sx={{
                  ...segmentBtnBase,
                  cursor: isRowEditable ? 'pointer' : 'not-allowed',
                  opacity: isRowEditable ? 1 : 0.45,
                  bgcolor:
                    value === ROW_STATUS.Pending
                      ? (t: any) => t.vars.palette.warning.main
                      : 'transparent',
                  color:
                    value === ROW_STATUS.Pending
                      ? (t: any) => t.vars.palette.warning.contrastText
                      : (t: any) => t.vars.palette.text.secondary,
                  '&:hover': {
                    bgcolor: (t: any) =>
                      value === ROW_STATUS.Pending
                        ? t.vars.palette.warning.dark
                        : varAlpha(t.vars.palette.warning.mainChannel, 0.08),
                  },
                }}
              >
                <Iconify icon="eva:minus-fill" width={16} />
              </Box>
            </CustomTooltip>

            <CustomTooltip title="Absent" arrow placement="top">
              <Box
                onClick={() => {
                  if (!isRowEditable) return;
                  updateRow(row.id, { attendanceStatus: ROW_STATUS.Absent });
                }}
                sx={{
                  ...segmentBtnBase,
                  cursor: isRowEditable ? 'pointer' : 'not-allowed',
                  opacity: isRowEditable ? 1 : 0.45,
                  bgcolor:
                    value === ROW_STATUS.Absent
                      ? (t: any) => t.vars.palette.error.main
                      : 'transparent',
                  color:
                    value === ROW_STATUS.Absent
                      ? (t: any) => t.vars.palette.error.contrastText
                      : (t: any) => t.vars.palette.text.secondary,
                  '&:hover': {
                    bgcolor: (t: any) =>
                      value === ROW_STATUS.Absent
                        ? t.vars.palette.error.dark
                        : varAlpha(t.vars.palette.error.mainChannel, 0.08),
                  },
                }}
              >
                <Iconify icon="eva:close-fill" width={16} />
              </Box>
            </CustomTooltip>
          </Box>
        );
      },
    }),
    [isPayrollLocked, updateRow]
  );

  const makeTimeColumn = useCallback(
    (field: 'timeIn' | 'timeOut', label: string) => ({
      id: field,
      label,
      minWidth: '140px',
      align: 'left' as const,
      isSort: false,
      isFilter: false,
      render: (value: string, row: any) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.field === field;
        const isRowEditable = !isPayrollLocked && !!row.employeeId;

        if (isEditing) {
          return (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TimePicker
                value={editingCell.value}
                onChange={(newVal) => setEditingCell((prev) => prev && { ...prev, value: newVal })}
                format="HH:mm"
                ampm={false}
                slotProps={{
                  textField: {
                    size: 'small',
                    autoFocus: true,
                    sx: { width: '120px', '& input': { fontSize: '0.8rem', p: '4px 6px' } },
                  },
                }}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
              />
              <CustomTooltip title="Save" arrow placement="top">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    const formatted = editingCell.value?.isValid()
                      ? editingCell.value.format('HH:mm')
                      : null;
                    updateRow(row.id, { [field]: formatted });
                    setEditingCell(null);
                  }}
                  sx={{ p: 0.4 }}
                >
                  <Iconify icon="eva:checkmark-fill" width={16} />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip title="Cancel" arrow placement="top">
                <IconButton size="small" onClick={() => setEditingCell(null)} sx={{ p: 0.4 }}>
                  <Iconify icon="eva:close-fill" width={16} />
                </IconButton>
              </CustomTooltip>
            </Stack>
          );
        }

        return (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              '& .edit-btn': { opacity: 0, transition: 'opacity 0.15s' },
              '&:hover .edit-btn': { opacity: 1 },
            }}
          >
            <Typography variant="body2">{value || '—'}</Typography>
            {isRowEditable && (
              <CustomTooltip title={`Edit ${label}`} arrow placement="top">
                <IconButton
                  className="edit-btn"
                  size="small"
                  onClick={() =>
                    setEditingCell({
                      rowId: row.id,
                      field,
                      value: value ? dayjs(`1970-01-01T${value}`) : null,
                    })
                  }
                  sx={{ p: 0.3 }}
                >
                  <Iconify icon="eva:edit-2-outline" width={14} />
                </IconButton>
              </CustomTooltip>
            )}
          </Stack>
        );
      },
    }),
    [editingCell, isPayrollLocked, updateRow]
  );

  const editableTimeColumns = useMemo(
    () => [makeTimeColumn('timeIn', 'In Time'), makeTimeColumn('timeOut', 'Out Time')],
    [makeTimeColumn]
  );

  const PREVIEW_COLUMNS_WITH_EDIT = useMemo(
    () =>
      PREVIEW_COLUMNS.map((col) => {
        if (col.id === 'timeIn') return editableTimeColumns[0];
        if (col.id === 'timeOut') return editableTimeColumns[1];
        return col;
      }),
    [editableTimeColumns]
  );

  const previewColumns = useMemo(
    () =>
      isPayrollLocked
        ? PREVIEW_COLUMNS_WITH_EDIT
        : [...PREVIEW_COLUMNS_WITH_EDIT, attendanceColumn],
    [attendanceColumn, isPayrollLocked, PREVIEW_COLUMNS_WITH_EDIT]
  );

  return (
    <Box sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {detailLoading ? (
        <ImportDetailSkeleton />
      ) : detail ? (
        <>
          {/* Summary Card */}
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              boxShadow: (theme) =>
                `0 0 2px 0 ${varAlpha(theme.palette.grey['500Channel'], 0.2)}, 0 12px 24px -4px ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
              mb: 2,
            }}
          >
            <Box
              onClick={summaryOpen.onToggle}
              sx={{
                p: 1.5,
                borderBottom: summaryOpen.value ? '1px dashed' : 'none',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.02),
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  Import Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Details of this attendance import
                </Typography>
              </Box>
              <IconButton size="small" sx={{ pointerEvents: 'none' }}>
                <Iconify
                  icon={summaryOpen.value ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
                  width={20}
                />
              </IconButton>
            </Box>

            <Collapse in={summaryOpen.value} unmountOnExit>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<CalendarMonth />}
                      label="Imported At"
                      value={dayjs(detail.importedAt).format('DD MMM YYYY, hh:mm A')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<Person />}
                      label="Imported By"
                      value={detail.importedByName}
                      iconColor="warning.main"
                      iconBgColor={(theme) => varAlpha(theme.palette.warning.mainChannel, 0.08)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<CalendarMonth />}
                      label="Payroll Month"
                      value={
                        detail.payrollMonth ? dayjs(detail.payrollMonth).format('MMM YYYY') : '—'
                      }
                      iconColor="info.main"
                      iconBgColor={(theme) => varAlpha(theme.palette.info.mainChannel, 0.08)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<Numbers />}
                      label="Total Rows"
                      value={String(detail.totalRows)}
                      iconColor="text.secondary"
                      iconBgColor={(theme) => varAlpha(theme.palette.grey['500Channel'], 0.08)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<CheckCircleOutline />}
                      label="Valid Rows"
                      value={String(detail.validRows)}
                      iconColor="success.main"
                      iconBgColor={(theme) => varAlpha(theme.palette.success.mainChannel, 0.08)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<ErrorOutline />}
                      label="Invalid Rows"
                      value={String(detail.invalidRows)}
                      iconColor="error.main"
                      iconBgColor={(theme) => varAlpha(theme.palette.error.mainChannel, 0.08)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<FilePresent />}
                      label="Created"
                      value={String(detail.createdCount)}
                      iconColor="primary.main"
                      iconBgColor={(theme) => varAlpha(theme.palette.primary.mainChannel, 0.08)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<FilePresent />}
                      label="Replaced"
                      value={String(detail.replacedCount)}
                      iconColor="secondary.main"
                      iconBgColor={(theme) => varAlpha(theme.palette.secondary.mainChannel, 0.08)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Paper>

          {/* Row Preview Table — API call 3 */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6">Employee Rows</Typography>
            {!isPayrollLocked && (
              <LoadingButton
                variant="contained"
                color="primary"
                size="small"
                loading={isSaving.value}
                startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                disabled={
                  rowsData2.length === 0 ||
                  rowsData2.every((r) => r.attendanceStatus === ROW_STATUS.Pending)
                }
                onClick={handleSubmitAttendance}
              >
                Submit
              </LoadingButton>
            )}
          </Box>
          <CustomizableTable
            tableId="import-detail-preview-table"
            columns={previewColumns}
            data={rowsData2}
            isLoading={rowsLoading}
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
    </Box>
  );
};

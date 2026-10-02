'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { DashboardStaff, OperationalStaffPage } from 'src/redux/hr/hrOperationalDashboardApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { RouterLink } from 'src/routes/components';
import { useMemo, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  Tooltip,
  Skeleton,
  Accordion,
  TextField,
  Typography,
  LinearProgress,
  TablePagination,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import {
  dailyStatus,
  formatCount,
  attendanceHref,
  formatSchoolTime,
} from '../operational-dashboard-state';

type Props = {
  data?: OperationalStaffPage;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  onRetry: () => void;
  page: number;
  pageSize: number;
  search: string;
  status: string;
  sorting: string;
  onSearch: (value: string) => void;
  onPage: (page: number, size: number) => void;
  onSort: (value: string) => void;
  date: string;
  canViewEmployees: boolean;
};

const Status = ({ row }: { row: DashboardStaff }) => (
  <Stack spacing={0.5} alignItems="flex-start">
    <Label
      color={dailyStatus[row.status]?.color || 'default'}
      sx={dailyStatus[row.status]?.color === 'default' ? { color: 'text.primary' } : undefined}
    >
      {dailyStatus[row.status]?.label || 'Unavailable'}
    </Label>
    {row.approvedLeaveCoverage ? (
      <Typography variant="caption" color="text.secondary">
        Approved {row.approvedLeaveCoverage === 'HalfDay' ? 'half-day' : 'full-day'} leave
      </Typography>
    ) : null}
    {row.source ? (
      <Typography variant="caption" color="text.secondary">
        Source:{' '}
        {row.source === 'CsvImport'
          ? 'CSV import'
          : row.source === 'ManualTime'
            ? 'Manual time'
            : row.source}
      </Typography>
    ) : null}
    {row.reviewFlags.length ? (
      <Tooltip title={row.reviewFlags.map((flag) => flag.message).join(' ')}>
        <Typography variant="caption" color="warning.main" tabIndex={0}>
          Needs review
        </Typography>
      </Tooltip>
    ) : null}
  </Stack>
);

const StaffActions = ({
  row,
  date,
  canViewEmployees,
}: {
  row: DashboardStaff;
  date: string;
  canViewEmployees: boolean;
}) => (
  <Stack direction="row" spacing={0.5} flexWrap="wrap">
    <Button
      component={RouterLink}
      href={attendanceHref(row.employeeId, date)}
      aria-label={`View attendance for ${row.name}`}
      size="small"
    >
      Attendance
    </Button>
    {canViewEmployees ? (
      <Button
        component={RouterLink}
        href={`${hrPaths.employee.list}?employee=${encodeURIComponent(row.employeeId)}&date=${date}`}
        aria-label={`View profile for ${row.name}`}
        size="small"
      >
        Profile
      </Button>
    ) : null}
  </Stack>
);

export default function OperationalStaffOverview(props: Props) {
  const {
    data,
    date,
    canViewEmployees,
    loading,
    fetching,
    error,
    onRetry,
    page,
    pageSize,
    search,
    status,
    sorting,
    onSearch,
    onPage,
    onSort,
  } = props;
  const [mobileSearch, setMobileSearch] = useState(search);
  useEffect(() => setMobileSearch(search), [search]);
  useEffect(() => {
    if (mobileSearch === search) return undefined;
    const timer = setTimeout(() => onSearch(mobileSearch), 500);
    return () => clearTimeout(timer);
  }, [mobileSearch, search, onSearch]);
  const sorts = useMemo(
    () => [
      {
        column: sorting.split(' ')[0],
        direction: sorting.endsWith('desc') ? ('desc' as const) : ('asc' as const),
      },
    ],
    [sorting]
  );
  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'name',
        label: 'Staff member',
        isSort: true,
        minWidth: 220,
        render: (_, row) => (
          <Stack>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.employeeCode || 'Code unavailable'}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'department',
        label: 'Team',
        minWidth: 150,
        render: (_, row) => (
          <Stack>
            <Typography variant="body2">
              {row.department || (row.isTeaching ? 'Teaching' : 'Support staff')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.isTeaching ? 'Teaching' : 'Non-teaching'} ·{' '}
              {row.stages.map((stage: { name: string }) => stage.name).join(', ') ||
                (row.isTeaching ? 'Teaching' : 'Non-teaching')}
            </Typography>
          </Stack>
        ),
      },
      { id: 'shiftName', label: 'Shift', minWidth: 100 },
      {
        id: 'status',
        label: 'Attendance',
        isSort: true,
        minWidth: 180,
        render: (_, row) => <Status row={row as DashboardStaff} />,
      },
      {
        id: 'actions',
        label: 'Actions',
        sticky: true,
        stickyPosition: 'right',
        excludeFromExport: true,
        minWidth: 165,
        render: (_, row) => (
          <StaffActions
            row={row as DashboardStaff}
            date={date}
            canViewEmployees={canViewEmployees}
          />
        ),
      },
    ],
    [date, canViewEmployees]
  );

  return (
    <Card component="section" aria-label="Staff overview" sx={{ minWidth: 0 }}>
      <Stack spacing={0.5} sx={{ p: 2.5 }}>
        <Typography variant="h6" component="h2">
          Staff overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loading
            ? 'Loading staff...'
            : data
              ? `${formatCount(data.totalCount)} matching staff`
              : 'Staff count unavailable'}
          {' · '}
          {status
            ? dailyStatus[status as keyof typeof dailyStatus]?.label || 'Needs review'
            : 'All staff'}
          {' · Summary counts cover the selected staff filters.'}
        </Typography>
      </Stack>
      {fetching && !loading ? <LinearProgress aria-label="Refreshing staff overview" /> : null}
      {error ? (
        <Alert
          severity="warning"
          action={
            <Button onClick={onRetry} color="inherit">
              Retry
            </Button>
          }
        >
          {data
            ? 'Staff data could not refresh. The displayed records may be stale.'
            : 'Staff attendance could not be loaded.'}
        </Alert>
      ) : null}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <CustomizableTable
          tableId="hr-operational-staff"
          tableTitle="Staff attendance"
          columns={columns}
          data={data?.items || []}
          isLoading={loading}
          serverSide
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideSortMode="single"
          page={page - 1}
          rowsPerPage={pageSize}
          defaultRowsPerPage={25}
          rowsPerPageOptions={[25, 50, 100]}
          maxServerRowsPerPage={100}
          totalCount={data?.totalCount ?? 0}
          searchTerm={search}
          sorts={sorts}
          onServerSearch={onSearch}
          onServerPagination={onPage}
          onServerSort={(_, nextSorts) =>
            onSort(
              nextSorts.length
                ? `${nextSorts[0].column}${nextSorts[0].direction === 'desc' ? ' desc' : ''}`
                : 'name'
            )
          }
          isFilter={false}
          showCheckbox={false}
          noDataText={
            error
              ? 'Staff attendance is unavailable. Retry to load records.'
              : 'No staff match these filters.'
          }
          wrapperProps={{ sx: { boxShadow: 'none', borderRadius: 0 } }}
          tableContainerProps={{
            'aria-label': 'Staff attendance records',
            sx: { maxHeight: 520, overflow: 'auto' },
          }}
          searchFieldProps={{
            placeholder: 'Search staff name or code',
            inputProps: { 'aria-label': 'Search staff name or code' },
          }}
        />
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2 }}>
        <Stack spacing={1} sx={{ pb: 1 }}>
          <TextField
            size="small"
            label="Search staff name or code"
            value={mobileSearch}
            onChange={(event) => setMobileSearch(event.target.value)}
          />
          <TextField
            size="small"
            select
            label="Sort staff"
            value={sorting}
            onChange={(event) => onSort(event.target.value)}
            slotProps={{ select: { native: true } }}
          >
            <option value="name">Name A to Z</option>
            <option value="name desc">Name Z to A</option>
            <option value="status">Attendance status</option>
            <option value="status desc">Attendance status descending</option>
          </TextField>
        </Stack>
        {loading
          ? Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} variant="rounded" height={76} sx={{ mb: 1 }} />
            ))
          : null}
        {!loading && !error && !data?.items.length ? (
          <Typography sx={{ py: 3 }} color="text.secondary">
            No staff match these filters.
          </Typography>
        ) : null}
        {data?.items.map((row) => (
          <Accordion
            key={row.employeeId}
            disableGutters
            elevation={0}
            sx={{ borderTop: 1, borderColor: 'divider', '&:before': { display: 'none' } }}
          >
            <AccordionSummary
              expandIcon={<Iconify icon="mdi:chevron-down" />}
              aria-label={`Staff details for ${row.name}`}
            >
              <Stack spacing={1} sx={{ minWidth: 0, width: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {row.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.employeeCode} ·{' '}
                    {row.department || (row.isTeaching ? 'Teaching' : 'Support staff')}
                  </Typography>
                </Box>
                <Status row={row} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Typography variant="body2">Shift: {row.shiftName || 'Not assigned'}</Typography>
                <Typography variant="body2">
                  Stage: {row.stages.map((stage) => stage.name).join(', ') || 'Not assigned'}
                </Typography>
                <Typography variant="body2">
                  In: {row.timeIn ? formatSchoolTime(row.timeIn) : 'Not recorded'} · Out:{' '}
                  {row.timeOut ? formatSchoolTime(row.timeOut) : 'Not recorded'}
                </Typography>
                {row.reviewFlags.map((flag) => (
                  <Typography variant="caption" key={flag.code} color="text.secondary">
                    {flag.message}
                  </Typography>
                ))}
                <StaffActions row={row} date={date} canViewEmployees={canViewEmployees} />
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
        <TablePagination
          component="div"
          count={data?.totalCount ?? 0}
          page={page - 1}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[25, 50, 100]}
          onPageChange={(_, nextPage) => onPage(nextPage + 1, pageSize)}
          onRowsPerPageChange={(event) => onPage(1, Number(event.target.value))}
          sx={{
            '& .MuiTablePagination-toolbar': {
              px: 0,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            },
          }}
        />
      </Box>
    </Card>
  );
}

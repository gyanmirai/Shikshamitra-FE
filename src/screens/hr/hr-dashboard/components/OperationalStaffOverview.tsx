'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { DashboardStaff, OperationalStaffPage } from 'src/redux/hr/hrOperationalDashboardApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { RouterLink } from 'src/routes/components';
import { useMemo, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  Box,
  Card,
  Menu,
  Stack,
  Alert,
  Button,
  Tooltip,
  MenuItem,
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
  selectedStage: string;
  onStatus: (value: string) => void;
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
    {row.reviewFlags.length ? (
      <Tooltip title={row.reviewFlags.map((flag) => flag.message).join(' ')}>
        <Typography variant="caption" color="warning.main" tabIndex={0}>
          Needs review
        </Typography>
      </Tooltip>
    ) : null}
  </Stack>
);

const AttendanceDetails = ({ row }: { row: DashboardStaff }) => (
  <Stack spacing={1}>
    <Typography variant="body2">
      Source:{' '}
      {row.source === 'CsvImport'
        ? 'CSV import'
        : row.source === 'ManualTime'
          ? 'Manual time'
          : row.source || 'Not recorded'}
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
  </Stack>
);

function DesktopAttendance({ row }: { row: DashboardStaff }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Stack alignItems="flex-start" spacing={0.5}>
      <Status row={row} />
      <Button
        size="small"
        aria-expanded={expanded}
        aria-controls={`attendance-details-${row.employeeId}`}
        aria-label={`Attendance details for ${row.name}`}
        onClick={() => setExpanded(!expanded)}
        endIcon={<Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
      >
        Details
      </Button>
      {expanded ? (
        <Box id={`attendance-details-${row.employeeId}`}>
          <AttendanceDetails row={row} />
        </Box>
      ) : null}
    </Stack>
  );
}

function StageAssignments({ row, selectedStage }: { row: DashboardStaff; selectedStage: string }) {
  const popover = usePopover();
  const assignments = [...row.stages].sort((a, b) => a.name.localeCompare(b.name, 'en-IN'));
  const first = assignments.find((stage) => stage.id === selectedStage) || assignments[0];
  const remaining = assignments.filter((stage) => stage.id !== first?.id);
  const id = `staff-stages-${row.employeeId}`;
  return (
    <Stack alignItems="flex-start">
      <Typography variant="caption" color="text.secondary">
        {first?.name || 'Stage not assigned'}
      </Typography>
      {remaining.length ? (
        <>
          <Button
            size="small"
            onClick={popover.onOpen}
            aria-expanded={popover.open}
            aria-controls={popover.open ? id : undefined}
            aria-label={`Show ${remaining.length} more stages for ${row.name}`}
          >
            +{remaining.length} stages
          </Button>
          <CustomPopover
            id={id}
            open={popover.open}
            anchorEl={popover.anchorEl}
            onClose={popover.onClose}
            slotProps={{ paper: { sx: { p: 2, maxWidth: 320 } }, arrow: { placement: 'top-left' } }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Assigned stages
            </Typography>
            <Stack spacing={1}>
              {assignments.map((stage) => (
                <Typography key={stage.id} variant="body2">
                  {stage.name}
                </Typography>
              ))}
            </Stack>
          </CustomPopover>
        </>
      ) : null}
    </Stack>
  );
}

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
    selectedStage,
    onStatus,
    sorting,
    onSearch,
    onPage,
    onSort,
  } = props;
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const sortOptions = [
    { value: 'name', label: 'Name A to Z' },
    { value: 'name desc', label: 'Name Z to A' },
    { value: 'status', label: 'Attendance status' },
    { value: 'status desc', label: 'Attendance status descending' },
  ];
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
              {row.isTeaching ? 'Teaching' : 'Non-teaching'}
            </Typography>
            <StageAssignments row={row as DashboardStaff} selectedStage={selectedStage} />
          </Stack>
        ),
      },
      { id: 'shiftName', label: 'Shift', minWidth: 100 },
      {
        id: 'status',
        label: 'Attendance',
        isSort: true,
        minWidth: 180,
        render: (_, row) => <DesktopAttendance row={row as DashboardStaff} />,
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
    [date, canViewEmployees, selectedStage]
  );

  return (
    <Card component="section" aria-label="Staff overview" sx={{ minWidth: 0 }}>
      <Stack spacing={0.5} sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography
            id="hr-staff-heading"
            tabIndex={-1}
            variant="h6"
            component="h2"
            sx={{
              scrollMarginTop: 80,
              '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 4 },
            }}
          >
            Staff overview
          </Typography>
          <TextField
            select
            size="small"
            label="Attendance status"
            value={status}
            onChange={(event) => onStatus(event.target.value)}
            slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
            sx={{ width: { xs: 140, sm: 220 }, flexShrink: 0 }}
          >
            <MenuItem value="">All staff</MenuItem>
            {Object.entries(dailyStatus).map(([key, item]) => (
              <MenuItem key={key} value={key}>
                {item.label}
              </MenuItem>
            ))}
            <MenuItem value="Review">Needs review</MenuItem>
          </TextField>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {loading
            ? 'Loading staff...'
            : data
              ? `${formatCount(data.totalCount)} matching staff`
              : 'Staff count unavailable'}
          {' · '}
          {status
            ? dailyStatus[status as keyof typeof dailyStatus]?.label || 'Needs review'
            : 'All staff'}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Summary counts cover the selected staff filters.
        </Typography>
      </Stack>
      <Box sx={{ height: 4 }}>
        {fetching && !loading ? <LinearProgress aria-label="Refreshing staff overview" /> : null}
      </Box>
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
          wrapperProps={{
            sx: {
              boxShadow: 'none',
              borderRadius: 0,
              border: 0,
              '& > .MuiCard-root': { boxShadow: 'none', border: 0, borderRadius: 0 },
            },
          }}
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
      <Box sx={{ display: { xs: 'block', md: 'none' }, px: 1.5 }}>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ pb: 1 }}>
          <TextField
            size="small"
            label="Search staff name or code"
            value={mobileSearch}
            sx={{ flex: 1, minWidth: 0 }}
            onChange={(event) => setMobileSearch(event.target.value)}
          />
          <Button
            size="small"
            aria-label={`Sort staff: ${sortOptions.find((option) => option.value === sorting)?.label}`}
            aria-haspopup="menu"
            aria-expanded={Boolean(sortAnchor)}
            onClick={(event) => setSortAnchor(event.currentTarget)}
            startIcon={<Iconify icon="mdi:sort" />}
          >
            Sort
          </Button>
          <Menu
            anchorEl={sortAnchor}
            open={Boolean(sortAnchor)}
            onClose={() => setSortAnchor(null)}
            aria-label="Sort staff"
          >
            {sortOptions.map((option) => (
              <MenuItem
                key={option.value}
                selected={sorting === option.value}
                onClick={() => {
                  onSort(option.value);
                  setSortAnchor(null);
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
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
                <AttendanceDetails row={row} />
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

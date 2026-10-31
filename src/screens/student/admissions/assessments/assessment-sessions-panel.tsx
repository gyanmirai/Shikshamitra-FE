'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';

import { assessmentErrorMessage } from './assessment-utils';

import type { SharedSessionView } from './assessment-session-setup-model';

export type AssessmentSessionsPanelProps = {
  sessions: SharedSessionView[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isFetching?: boolean;
  error?: string;
  selectedSessionId?: string;
  canManage: boolean;
  onSelect: (session: SharedSessionView) => void;
  onEdit: (session: SharedSessionView) => void;
  onCancel: (session: SharedSessionView, reason: string) => Promise<void>;
  onPage: (page: number, size: number) => void;
  onSearch: (query: string) => void;
  onRetry: () => void;
  search: string;
};

export function AssessmentSessionsPanel({
  sessions,
  totalCount,
  page,
  pageSize,
  isLoading,
  isFetching,
  error,
  selectedSessionId,
  canManage,
  onSelect,
  onEdit,
  onCancel,
  onPage,
  onSearch,
  onRetry,
  search,
}: AssessmentSessionsPanelProps) {
  const cancellation = useBoolean();
  const [selected, setSelected] = useState<SharedSessionView | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const classes = (row: SharedSessionView) =>
    [...new Set((row.scopeDetails ?? []).map((scope) => scope.className).filter(Boolean))].join(
      ', '
    ) || '—';
  const status = (row: SharedSessionView) =>
    row.isCancelled
      ? 'Cancelled'
      : row.roomReservationStatus === 2
        ? 'Room approval pending'
        : row.roomReservationStatus === 8
          ? 'Room rejected'
          : Date.parse(row.endsAt) <= Date.now()
            ? 'Ended'
            : Date.parse(row.startsAt) <= Date.now()
              ? 'Ongoing'
              : 'Scheduled';
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Session',
      filterType: 'string',
      isSort: false,
      render: (value, row) => (
        <Stack>
          <Typography variant="subtitle2">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.sessionType === 'individualInterview'
              ? 'Individual interview'
              : row.sessionType === 'groupInterview'
                ? 'Group interview'
                : 'School exam'}{' '}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'classes',
      label: 'Classes',
      isSort: false,
      isFilter: false,
      render: (_, row) => classes(row as SharedSessionView),
      exportValue: (_, row) => classes(row as SharedSessionView),
    },
    {
      id: 'startsAt',
      label: 'Schedule',
      exportValue: (value, row) => `${fDateTime(value as string)} – ${fDateTime(row.endsAt)}`,
      filterType: 'dateTime',
      isSort: false,
      render: (value, row) => (
        <Stack>
          <Typography variant="body2">{fDateTime(value)}</Typography>
          <Typography variant="caption" color="text.secondary">
            to {fDateTime(row.endsAt)}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'location',
      label: 'Room',
      isSort: false,
      isFilter: false,
      render: (value) => value || '—',
    },
    {
      id: 'capacity',
      label: 'Booked / capacity',
      filterType: 'number',
      isSort: false,
      render: (value, row) => `${row.bookedCount} / ${value}`,
      exportValue: (value, row) => `${row.bookedCount} / ${value}`,
    },
    {
      id: 'isCancelled',
      label: 'Status',
      exportValue: (_, row) => status(row as SharedSessionView),
      isSort: false,
      render: (value, row) => (
        <Label
          color={
            value
              ? 'default'
              : row.roomReservationStatus === 2
                ? 'warning'
                : row.roomReservationStatus === 8
                  ? 'error'
                  : 'default'
          }
        >
          {status(row as SharedSessionView)}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Action',
      sticky: true,
      stickyPosition: 'right',
      minWidth: 180,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, raw) => {
        const row = raw as SharedSessionView;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              color="inherit"
              variant="outlined"
              onClick={() => onSelect(row)}
              aria-label={`View students in ${row.name}`}
            >
              View
            </Button>
            <ThreeDotsActions
              showEditIcon={canManage}
              editLabel={
                row.canManage === false
                  ? 'Editing requires access to all linked Offerings'
                  : `Edit ${row.name}`
              }
              disableEditIcon={
                row.canManage === false || row.isCancelled || Date.parse(row.startsAt) <= Date.now()
              }
              handleEditClick={() => onEdit(row)}
              showThreeDots={canManage && !row.isCancelled}
              moreLabel={`More actions for ${row.name}`}
              actions={({ popover }) => (
                <MenuItem
                  disabled={
                    row.canManage === false || !canManage || Date.parse(row.startsAt) <= Date.now()
                  }
                  onClick={() => {
                    popover.onClose();
                    setSelected(row);
                    cancellationForm.resetForm();
                    setCancelError('');
                    cancellation.onTrue();
                  }}
                >
                  <Iconify icon="mdi:calendar-remove-outline" />
                  {row.canManage === false
                    ? 'Cancellation requires access to all linked Offerings'
                    : 'Cancel session'}
                </MenuItem>
              )}
            />
          </Stack>
        );
      },
    },
  ];
  const cancellationForm = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string().trim().max(1024, 'Use at most 1,024 characters'),
    }),
    onSubmit: async ({ reason }) => {
      if (!selected || selected.canManage === false || busy || !canManage) return;
      setBusy(true);
      setCancelError('');
      try {
        await onCancel(selected, reason.trim());
        cancellation.onFalse();
        setSelected(null);
      } catch (failure) {
        setCancelError(
          assessmentErrorMessage(failure, 'Unable to cancel this session. Please retry.')
        );
      } finally {
        setBusy(false);
      }
    },
  });
  return (
    <>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <CustomizableTable
          tableId="admissions-assessment-sessions"
          tableTitle="Assessment sessions"
          exportLabel="Export"
          exportScope="loaded"
          tableContainerProps={{ sx: { height: 1 } }}
          data={sessions}
          rowProps={(row) => ({ 'aria-selected': row.id === selectedSessionId })}
          columns={columns}
          isLoading={isLoading}
          isRefreshing={isFetching && !isLoading}
          isSearch
          showColumns
          showExport
          showFullScreen
          searchTerm={search}
          searchFieldProps={{
            placeholder: 'Search sessions...',
            inputProps: { 'aria-label': 'Search sessions' },
          }}
          isPagination
          serverSidePagination
          serverSideSearch
          totalCount={totalCount}
          page={page}
          rowsPerPage={pageSize}
          defaultRowsPerPage={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onServerPagination={(nextPage, size) => onPage(Math.max(0, nextPage - 1), size)}
          onServerSearch={onSearch}
          isFilter={false}
          wrapperProps={{ sx: { flex: 1, minHeight: 0, minWidth: 0 } }}
          noDataText={
            search
              ? 'No sessions match this search.'
              : 'No assessment sessions in this academic context.'
          }
          errorContent={
            error ? (
              <StudentFeedback
                notificationKey="STU-0257"
                presentation="inline"
                severity="error"
                action={
                  <Button size="small" onClick={onRetry}>
                    Retry
                  </Button>
                }
              >
                {error}
              </StudentFeedback>
            ) : undefined
          }
        />
      </Box>
      <ConfirmDialog
        open={cancellation.value}
        onClose={() => {
          if (!busy) cancellation.onFalse();
        }}
        disableCancel={busy}
        disableEscapeKeyDown={busy}
        disableBackdropClick={busy}
        title="Cancel Assessment Session?"
        icon="warning"
        content={
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Cancel {selected?.name}? Its {selected?.bookedCount ?? 0} active bookings will be
              cancelled and the room reservation released. Applicants remain available for a new
              session.
            </Typography>
            <ShakingTextField
              error={Boolean(cancellationForm.touched.reason && cancellationForm.errors.reason)}
            >
              <TextField
                size="small"
                fullWidth
                label="Cancellation reason"
                {...cancellationForm.getFieldProps('reason')}
                error={Boolean(cancellationForm.touched.reason && cancellationForm.errors.reason)}
                helperText={cancellationForm.touched.reason ? cancellationForm.errors.reason : ''}
                disabled={busy}
                inputProps={{ maxLength: 1024 }}
              />
            </ShakingTextField>
            {cancelError && (
              <StudentFeedback
                notificationKey="STU-0260"
                presentation="persistent"
                severity="error"
              >
                {cancelError}
              </StudentFeedback>
            )}
          </Stack>
        }
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={busy || !canManage}
            onClick={() => cancellationForm.handleSubmit()}
          >
            {busy ? 'Cancelling…' : 'Cancel session'}
          </Button>
        }
      />
    </>
  );
}

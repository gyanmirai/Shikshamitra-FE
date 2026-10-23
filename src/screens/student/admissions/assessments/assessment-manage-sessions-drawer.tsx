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
import {
  Box,
  Stack,
  Drawer,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { assessmentErrorMessage } from './assessment-utils';
import { AdmissionDialogTitle } from '../admission-dialog-title';

import type { SharedSessionView } from './assessment-session-setup-model';

export type AssessmentManageSessionsDrawerProps = {
  open: boolean;
  sessions: SharedSessionView[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isFetching?: boolean;
  error?: string;
  selectedSessionId?: string;
  canManage: boolean;
  canBook?: boolean;
  onClose: () => void;
  onSelect: (session: SharedSessionView) => void;
  onEdit: (session: SharedSessionView) => void;
  onBook: (session: SharedSessionView) => void;
  onCancel: (session: SharedSessionView, reason: string) => Promise<void>;
  onPage: (page: number, size: number) => void;
  onSearch: (query: string) => void;
  onRetry: () => void;
};

export function AssessmentManageSessionsDrawer({
  open,
  sessions,
  totalCount,
  page,
  pageSize,
  isLoading,
  isFetching,
  error,
  selectedSessionId,
  canManage,
  canBook = canManage,
  onClose,
  onSelect,
  onEdit,
  onBook,
  onCancel,
  onPage,
  onSearch,
  onRetry,
}: AssessmentManageSessionsDrawerProps) {
  const cancellation = useBoolean();
  const [selected, setSelected] = useState<SharedSessionView | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancelError, setCancelError] = useState('');
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
            · {row.location}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'startsAt',
      label: 'Schedule',
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
      id: 'capacity',
      label: 'Bookings / capacity',
      filterType: 'number',
      isSort: false,
      render: (value, row) => `${row.bookedCount} / ${value}`,
    },
    {
      id: 'isCancelled',
      label: 'Status',
      sticky: true,
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
          {value
            ? 'Cancelled'
            : row.roomReservationStatus === 2
              ? 'Room approval pending'
              : row.roomReservationStatus === 8
                ? 'Room rejected'
                : Date.parse(row.endsAt) <= Date.now()
                  ? 'Ended'
                  : 'Scheduled'}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, raw) => {
        const row = raw as SharedSessionView;
        return (
          <ThreeDotsActions
            showViewIcon
            viewLabel={`View applicants in ${row.name}`}
            handleViewClick={() => onSelect(row)}
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
            showThreeDots={(canManage || canBook) && !row.isCancelled}
            moreLabel={`More actions for ${row.name}`}
            actions={({ popover }) => (
              <>
                <MenuItem
                  disabled={
                    row.canManage === false ||
                    !canBook ||
                    !row.roomId ||
                    row.bookedCount >= row.capacity ||
                    (Date.parse(row.startsAt) <= Date.now() &&
                      (row.sessionType !== 'individualInterview' ||
                        Date.parse(row.endsAt) <= Date.now()))
                  }
                  onClick={() => {
                    popover.onClose();
                    onBook(row);
                  }}
                >
                  <Iconify icon="mdi:account-plus-outline" />
                  {row.canManage === false
                    ? 'Booking requires access to all linked Offerings'
                    : row.roomId
                      ? 'Book applicants'
                      : 'Select an Institute room in Edit first'}
                </MenuItem>
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
              </>
            )}
          />
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
      <Drawer
        anchor="right"
        open={open}
        onClose={() => {
          if (!busy) onClose();
        }}
        PaperProps={{ sx: { width: { xs: 1, sm: 960 }, maxWidth: 1 } }}
      >
        <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
            <Typography variant="h6">
              <AdmissionDialogTitle
                title="Manage Assessment Sessions"
                helpText="Select a session to see its applicants. Edit future arrangements or cancel with a reason."
              />
            </Typography>
            <IconButton
              size="small"
              aria-label="Close manage sessions"
              disabled={busy}
              onClick={onClose}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />
          <Box sx={{ p: 2, flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <CustomizableTable
              tableId="admissions-assessment-manage-sessions"
              data={sessions}
              rowProps={(row) => ({ 'aria-selected': row.id === selectedSessionId })}
              columns={columns}
              isLoading={isLoading}
              isSearch
              isPagination
              serverSidePagination
              serverSideSearch
              totalCount={totalCount}
              page={page}
              rowsPerPage={pageSize}
              defaultRowsPerPage={25}
              rowsPerPageOptions={[25, 50, 100]}
              onServerPagination={(nextPage, size) => onPage(Math.max(0, nextPage - 1), size)}
              onServerSearch={onSearch}
              isFilter={false}
              wrapperProps={{ sx: { height: 1 } }}
              tableContainerProps={{ sx: { height: 1 } }}
              noDataText="No assessment sessions match this view."
              errorContent={
                error ? (
                  <StudentFeedback
                    notificationKey="STU-0257"
                    presentation="toast"
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
            {isFetching && !isLoading && (
              <Typography role="status" variant="caption" color="text.secondary">
                Refreshing sessions…
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>
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

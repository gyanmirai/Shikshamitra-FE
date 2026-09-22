'use client';

import type { StudentOnboardingServiceHandoffStatus } from 'src/redux/student/onboarding/student-onboarding-types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetUsersQuery } from 'src/redux/user/userApi';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useCancelStudentOnboardingMutation,
  useAssignStudentOnboardingOwnerMutation,
  useGetStudentOnboardingServiceHandoffsQuery,
  useRetryStudentOnboardingServiceHandoffMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import type { StudentOnboardingItem } from './student-onboarding-model';

type UserOption = {
  id: string;
  userName?: string;
  name?: string;
  surname?: string;
  email?: string;
};

const handoffStatusMeta: Record<
  StudentOnboardingServiceHandoffStatus,
  { label: string; color: 'default' | 'info' | 'success' | 'error' | 'warning' }
> = {
  0: { label: 'Pending', color: 'warning' },
  1: { label: 'Dispatched', color: 'info' },
  2: { label: 'Acknowledged', color: 'success' },
  3: { label: 'Failed', color: 'error' },
  4: { label: 'Cancelled', color: 'default' },
};

type StudentOnboardingCaseOperationsProps = {
  student: StudentOnboardingItem;
  canManage: boolean;
  canCancel: boolean;
  onCancelled: () => void;
};

export default function StudentOnboardingCaseOperations({
  student,
  canManage,
  canCancel,
  onCancelled,
}: StudentOnboardingCaseOperationsProps) {
  const isClosed = student.backendStatus === 4 || student.backendStatus === 5;
  const usersQuery = useGetUsersQuery(undefined, { skip: !canManage || isClosed });
  const handoffsQuery = useGetStudentOnboardingServiceHandoffsQuery(student.id, {
    skip: student.source !== 'onboarding-case',
  });
  const [assignOwner, assignOwnerState] = useAssignStudentOnboardingOwnerMutation();
  const [cancelOnboarding, cancelState] = useCancelStudentOnboardingMutation();
  const [retryHandoff, retryState] = useRetryStudentOnboardingServiceHandoffMutation();
  const [ownerId, setOwnerId] = useState(student.assignedToUserId ?? '');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const userResponse = usersQuery.data as
    { items?: UserOption[]; data?: { items?: UserOption[] } } | undefined;
  const users = useMemo(
    () => userResponse?.items ?? userResponse?.data?.items ?? [],
    [userResponse]
  );

  useEffect(() => {
    setOwnerId(student.assignedToUserId ?? '');
    setCancelOpen(false);
    setCancellationReason('');
  }, [student.assignedToUserId, student.id]);

  const saveOwner = async () => {
    try {
      await assignOwner({
        id: student.id,
        concurrencyStamp: student.concurrencyStamp,
        userId: ownerId || null,
      }).unwrap();
      shikshaMitraToast.success({
        message: ownerId ? 'Onboarding owner assigned.' : 'Onboarding owner cleared.',
      });
    } catch {
      shikshaMitraToast.error({
        message: 'The onboarding owner could not be changed. Refresh the case and retry.',
      });
    }
  };

  const cancelCase = async () => {
    if (!cancellationReason.trim()) return;

    try {
      await cancelOnboarding({
        id: student.id,
        concurrencyStamp: student.concurrencyStamp,
        reason: cancellationReason.trim(),
      }).unwrap();
      shikshaMitraToast.success({ message: 'Onboarding case cancelled.' });
      setCancelOpen(false);
      onCancelled();
    } catch {
      shikshaMitraToast.error({
        message: 'The onboarding case could not be cancelled. Refresh the case and retry.',
      });
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Case owner"
          value={ownerId}
          onChange={(event) => setOwnerId(event.target.value)}
          disabled={!canManage || isClosed || usersQuery.isFetching}
          helperText={
            isClosed
              ? 'Closed cases retain their final owner for audit.'
              : 'Assign one staff member who is accountable for resolving blockers.'
          }
        >
          <MenuItem value="">Unassigned</MenuItem>
          {users.map((user) => {
            const fullName = [user.name, user.surname].filter(Boolean).join(' ');
            return (
              <MenuItem key={user.id} value={user.id}>
                {fullName || user.userName || user.email || user.id}
              </MenuItem>
            );
          })}
        </TextField>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:account-check-outline" width={18} />}
          disabled={
            !canManage ||
            isClosed ||
            assignOwnerState.isLoading ||
            ownerId === (student.assignedToUserId ?? '')
          }
          onClick={saveOwner}
          sx={{ minWidth: 130, minHeight: 40 }}
        >
          {assignOwnerState.isLoading ? 'Saving...' : 'Save owner'}
        </Button>
      </Stack>

      {usersQuery.isError ? (
        <Alert severity="warning" variant="outlined">
          Staff options could not be loaded. The current owner is unchanged.
        </Alert>
      ) : null}

      <Stack direction="row" justifyContent="flex-end">
        <Button
          color="error"
          variant="outlined"
          startIcon={<Iconify icon="mdi:cancel" width={18} />}
          disabled={!canCancel || isClosed}
          onClick={() => setCancelOpen(true)}
        >
          Cancel onboarding
        </Button>
      </Stack>

      {handoffsQuery.data?.length ? (
        <Stack spacing={1}>
          <Typography variant="subtitle2">Service handoffs</Typography>
          {handoffsQuery.data.map((handoff) => {
            const meta = handoffStatusMeta[handoff.status];
            return (
              <Stack
                key={handoff.id}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                spacing={1}
                sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {handoff.serviceKey}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {handoff.lastError ||
                      `${handoff.attemptCount} dispatch attempt${handoff.attemptCount === 1 ? '' : 's'}`}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Label color={meta.color}>{meta.label}</Label>
                  {handoff.status === 3 && canManage ? (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={retryState.isLoading}
                      onClick={async () => {
                        try {
                          await retryHandoff({ id: student.id, handoffId: handoff.id }).unwrap();
                          shikshaMitraToast.success({ message: 'Service handoff retry queued.' });
                        } catch {
                          shikshaMitraToast.error({
                            message: 'The service handoff retry could not be queued.',
                          });
                        }
                      }}
                    >
                      Retry
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      ) : null}

      <CustomDialog
        open={cancelOpen}
        handleClose={() => setCancelOpen(false)}
        title="Cancel onboarding?"
        maxWidth="sm"
      >
        <DialogScrollContent dividers>
          <Stack spacing={1.5}>
            <Alert severity="warning" variant="outlined">
              Cancelling releases the reserved seat and identifier. The case remains available for
              audit but cannot be activated.
            </Alert>
            <TextField
              fullWidth
              required
              multiline
              minRows={3}
              label="Cancellation reason"
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              inputProps={{ maxLength: 1000 }}
              helperText="Required and recorded in the onboarding audit history."
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button color="inherit" onClick={() => setCancelOpen(false)}>
            Keep case
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={!cancellationReason.trim() || cancelState.isLoading}
            onClick={cancelCase}
          >
            {cancelState.isLoading ? 'Cancelling...' : 'Confirm cancellation'}
          </Button>
        </DialogActions>
      </CustomDialog>
    </Stack>
  );
}

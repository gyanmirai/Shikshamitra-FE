'use client';

import type { AdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  useGetAdmissionCrmExamSlotsQuery,
  useScheduleAdmissionCrmEntranceExamMutation,
} from 'src/redux/student/admissions-crm/communication-exams-events-api';
import {
  Alert,
  Stack,
  Switch,
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { formatEnrollmentDate } from './enrollment-display';
import { getAdmissionCrmLeadName } from './admissions-crm-utils';
import {
  useApplicantWorkspaceDirtyState,
  useOptionalApplicantWorkspaceTransition,
} from './applicant-workspace-dirty-context';

type Props = {
  lead: AdmissionCrmLeadDto | null;
  academicYearId?: string;
  canOverrideCapacity?: boolean;
  onClose: () => void;
  onScheduled?: () => void | Promise<void>;
};

export function ApplicantExamSchedulingDialog({
  lead,
  academicYearId,
  canOverrideCapacity = false,
  onClose,
  onScheduled,
}: Props) {
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [capacityOverrideReason, setCapacityOverrideReason] = useState('');
  const slotsQuery = useGetAdmissionCrmExamSlotsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !lead }
  );
  const [scheduleExam, scheduleExamState] = useScheduleAdmissionCrmEntranceExamMutation();
  const capacityOverrideEnabled = canOverrideCapacity && overrideCapacity;
  const hasDraft = Boolean(selectedSlotId || overrideCapacity || capacityOverrideReason.trim());
  const workspaceTransition = useOptionalApplicantWorkspaceTransition();
  useApplicantWorkspaceDirtyState(`exam-scheduling-${lead?.id || 'closed'}`, hasDraft);
  const activeExamSlots = useMemo(
    () => (slotsQuery.data?.items || []).filter((slot) => slot.isActive),
    [slotsQuery.data?.items]
  );

  useEffect(() => {
    if (lead) return;
    setSelectedSlotId('');
    setOverrideCapacity(false);
    setCapacityOverrideReason('');
  }, [lead]);

  const handleSchedule = async () => {
    if (!lead || !selectedSlotId) return;
    if (capacityOverrideEnabled && !capacityOverrideReason.trim()) return;

    try {
      await scheduleExam({
        leadId: lead.id,
        body: {
          entranceExamSlotId: selectedSlotId,
          overrideCapacity: capacityOverrideEnabled,
          capacityOverrideReason: capacityOverrideEnabled
            ? capacityOverrideReason.trim()
            : undefined,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Entrance exam scheduled.' });
      await onScheduled?.();
      onClose();
    } catch {
      shikshaMitraToast.error({
        message: 'The exam could not be scheduled. Check readiness and slot capacity, then retry.',
      });
    }
  };

  const requestClose = () => {
    if (workspaceTransition) {
      workspaceTransition.requestTransition(onClose);
      return;
    }
    if (hasDraft && !window.confirm('Discard the unsaved exam schedule?')) return;
    onClose();
  };

  return (
    <Dialog
      open={Boolean(lead)}
      onClose={scheduleExamState.isLoading ? undefined : requestClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { overscrollBehavior: 'contain' } } }}
    >
      <DialogTitle>Schedule Assessment</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          {lead ? (
            <Alert severity="info">
              {getAdmissionCrmLeadName(lead)} · {lead.desiredClassName || 'Class not captured'}
            </Alert>
          ) : null}
          {slotsQuery.isFetching ? (
            <LinearProgress aria-label="Loading entrance exam slots" />
          ) : null}
          {slotsQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => slotsQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Exam slots could not be loaded. Retry before scheduling this applicant.
            </Alert>
          ) : null}
          {!slotsQuery.isFetching && !slotsQuery.isError && activeExamSlots.length === 0 ? (
            <Alert severity="warning">
              No active exam slots are available for this admission year.
            </Alert>
          ) : null}
          <FormControl fullWidth disabled={slotsQuery.isFetching || slotsQuery.isError}>
            <InputLabel id="applicant-exam-slot-label">Exam Slot</InputLabel>
            <Select
              labelId="applicant-exam-slot-label"
              name="entranceExamSlot"
              label="Exam Slot"
              value={selectedSlotId}
              onChange={(event) => setSelectedSlotId(event.target.value)}
            >
              {activeExamSlots.map((slot) => (
                <MenuItem
                  key={slot.id}
                  value={slot.id}
                  disabled={slot.remainingCapacity <= 0 && !capacityOverrideEnabled}
                >
                  {slot.slotName} · {formatEnrollmentDate(slot.startDate, true)} ·{' '}
                  {slot.remainingCapacity} seats
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {canOverrideCapacity ? (
            <FormControlLabel
              control={
                <Switch
                  checked={overrideCapacity}
                  onChange={(_, checked) => setOverrideCapacity(checked)}
                />
              }
              label="Override slot capacity"
            />
          ) : null}
          {capacityOverrideEnabled ? (
            <TextField
              required
              name="capacityOverrideReason"
              autoComplete="off"
              label="Capacity Override Reason"
              value={capacityOverrideReason}
              onChange={(event) => setCapacityOverrideReason(event.target.value)}
              multiline
              minRows={2}
              error={!capacityOverrideReason.trim()}
              helperText="Required because this action can exceed the configured slot capacity."
            />
          ) : null}
          <Typography variant="caption" color="text.secondary">
            Scheduling updates this applicant’s journey and Assessments worklist.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={requestClose} disabled={scheduleExamState.isLoading}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={scheduleExamState.isLoading}
          disabled={
            !selectedSlotId ||
            slotsQuery.isError ||
            activeExamSlots.length === 0 ||
            (capacityOverrideEnabled && !capacityOverrideReason.trim())
          }
          onClick={handleSchedule}
        >
          Schedule Assessment
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

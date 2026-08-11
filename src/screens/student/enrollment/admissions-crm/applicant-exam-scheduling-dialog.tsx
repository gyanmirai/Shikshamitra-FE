'use client';

import type { AdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/core-leads-contracts';
import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  useGetAdmissionCrmExamSlotsQuery,
  useScheduleAdmissionCrmEntranceExamMutation,
} from 'src/redux/student/admissions-crm/communication-exams-events-api';
import {
  Alert,
  Box,
  Chip,
  Stack,
  Paper,
  Switch,
  Button,
  Dialog,
  TextField,
  ButtonBase,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

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
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => dayjs().startOf('month'));
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [capacityOverrideReason, setCapacityOverrideReason] = useState('');
  const slotsQuery = useGetAdmissionCrmExamSlotsQuery(
    {
      academicYearId: academicYearId || '',
      from: visibleMonth.startOf('month').toISOString(),
      to: visibleMonth.endOf('month').toISOString(),
    },
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
  const availableDates = useMemo(
    () =>
      new Set(
        activeExamSlots
          .filter((slot) => slot.remainingCapacity > 0 || capacityOverrideEnabled)
          .map((slot) => dayjs(slot.startDate).format('YYYY-MM-DD'))
      ),
    [activeExamSlots, capacityOverrideEnabled]
  );
  const slotsForSelectedDate = useMemo(
    () =>
      selectedDate
        ? activeExamSlots.filter((slot) => dayjs(slot.startDate).isSame(selectedDate, 'day'))
        : [],
    [activeExamSlots, selectedDate]
  );

  useEffect(() => {
    if (lead) return;
    setSelectedSlotId('');
    setSelectedDate(null);
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
      maxWidth="md"
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '320px minmax(0, 1fr)' },
              gap: 1.5,
              alignItems: 'start',
            }}
          >
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <DateCalendar
                value={selectedDate}
                disablePast
                loading={slotsQuery.isFetching}
                onMonthChange={(month) => {
                  setVisibleMonth(month.startOf('month'));
                  setSelectedDate(null);
                  setSelectedSlotId('');
                }}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedSlotId('');
                }}
                shouldDisableDate={(date) => !availableDates.has(date.format('YYYY-MM-DD'))}
              />
            </Paper>
            <Stack spacing={1} aria-live="polite">
              <Box>
                <Typography variant="subtitle2">Available times</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedDate
                    ? selectedDate.format('dddd, DD MMMM YYYY')
                    : 'Choose an available date to view its exam slots.'}
                </Typography>
              </Box>
              {selectedDate && slotsForSelectedDate.length === 0 ? (
                <Alert severity="info">No active slots are available on this date.</Alert>
              ) : null}
              {slotsForSelectedDate.map((slot) => {
                const full = slot.remainingCapacity <= 0;
                const selected = slot.id === selectedSlotId;
                return (
                  <ButtonBase
                    key={slot.id}
                    disabled={full && !capacityOverrideEnabled}
                    onClick={() => setSelectedSlotId(slot.id)}
                    aria-pressed={selected}
                    sx={{ width: '100%', borderRadius: 1 }}
                  >
                    <Paper
                      variant="outlined"
                      sx={{
                        width: '100%',
                        p: 1.25,
                        textAlign: 'left',
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'action.selected' : 'background.paper',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" gap={1}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2">{slot.slotName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatEnrollmentDate(slot.startDate, true)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {slot.roomOrHall || 'Venue to be confirmed'}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          color={full ? 'warning' : 'success'}
                          label={full ? 'Full' : `${slot.remainingCapacity} seats`}
                        />
                      </Stack>
                    </Paper>
                  </ButtonBase>
                );
              })}
            </Stack>
          </Box>
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

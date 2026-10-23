import dayjs from 'dayjs';
import { useRef, useEffect } from 'react';
import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { EmptyContent } from 'src/components/empty-content';
import { StudentFeedback } from 'src/components/student-feedback';
import { useGetAssessmentSessionsQuery } from 'src/redux/student/admissions/admission-assessment-sessions-api';
import { useGetAssessmentSessionSlotsQuery } from 'src/redux/student/admissions/admission-assessment-planning-api';

import { normalizeAssessmentDateTime } from './assessment-date-time';
import { getAvailableAssessmentSessions } from './assessment-session-availability';

type Props = {
  admissionOfferingId: string;
  workflowStageDefinitionId: string;
  value: string;
  slotStartsAt?: string;
  onSlotChange?: (value: string) => void;
  onSlotRequirementChange?: (value: boolean) => void;
  slotError?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
  onAddSlot?: () => void;
  inlineBooking?: boolean;
};

export function AssessmentBookingField({
  admissionOfferingId,
  workflowStageDefinitionId,
  value,
  slotStartsAt = '',
  onSlotChange,
  onSlotRequirementChange,
  slotError,
  onChange,
  error,
  disabled,
  onAddSlot,
  inlineBooking = false,
}: Props) {
  const sessions = useGetAssessmentSessionsQuery(
    {
      admissionOfferingId,
      workflowStageDefinitionId,
    },
    { refetchOnMountOrArgChange: true }
  );
  const available = getAvailableAssessmentSessions(sessions.currentData ?? []);
  const selected = available.find((session) => session.id === value);
  const isIndividual = selected?.sessionType === 'individualInterview';
  const slotRequirementCallback = useRef(onSlotRequirementChange);
  useEffect(() => {
    slotRequirementCallback.current = onSlotRequirementChange;
  }, [onSlotRequirementChange]);
  useEffect(() => {
    slotRequirementCallback.current?.(isIndividual);
  }, [isIndividual]);
  const slots = useGetAssessmentSessionSlotsQuery(value, {
    skip: !isIndividual || !value,
    refetchOnMountOrArgChange: true,
  });
  return (
    <Stack spacing={1}>
      {sessions.isError && (
        <StudentFeedback
          notificationKey="STU-0250"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={sessions.refetch}>
              Retry
            </Button>
          }
        >
          Unable to load sessions. Retry before booking.
        </StudentFeedback>
      )}
      <CustomSelect
        label="Assessment session"
        value={value}
        onChange={(next) => {
          onChange(String(next));
          onSlotChange?.('');
        }}
        disabled={disabled || sessions.isError || sessions.isFetching}
        isLoading={sessions.isLoading}
        error={Boolean(error)}
        helperText={error}
        options={available.map((session) => ({
          value: session.id,
          label: `${session.name} · ${dayjs(normalizeAssessmentDateTime(session.startsAt)).format('DD MMM, h:mm A')} · ${session.location} · ${session.capacity - session.bookedCount} places`,
        }))}
        noOptionsMessage={
          inlineBooking
            ? 'No slots available'
            : 'No available sessions. Create a session under Admissions → Assessments.'
        }
      />
      {inlineBooking &&
        !sessions.isFetching &&
        !sessions.isError &&
        (available.length ? (
          onAddSlot && (
            <Button
              size="small"
              variant="outlined"
              sx={{ alignSelf: 'flex-end' }}
              disabled={disabled}
              onClick={onAddSlot}
              startIcon={<Iconify icon="mdi:plus" />}
            >
              Add Slot
            </Button>
          )
        ) : (
          <EmptyContent
            title="No slots available"
            sx={{ py: 5, height: 'auto' }}
            slotProps={{ img: { maxWidth: 64 } }}
            action={
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {onAddSlot && (
                  <Button
                    size="small"
                    variant="contained"
                    disabled={disabled}
                    onClick={onAddSlot}
                    startIcon={<Iconify icon="mdi:plus" />}
                  >
                    Add Slot
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  disabled={disabled}
                  onClick={sessions.refetch}
                  startIcon={<Iconify icon="mdi:refresh" />}
                >
                  Refresh
                </Button>
              </Stack>
            }
          />
        ))}
      {isIndividual && (
        <>
          {slots.isError && (
            <StudentFeedback
              notificationKey="STU-0252"
              presentation="toast"
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={slots.refetch}>
                  Retry
                </Button>
              }
            >
              Unable to load interview slots. Retry before booking.
            </StudentFeedback>
          )}
          <CustomSelect
            label="Interview time slot"
            error={Boolean(slotError)}
            helperText={slotError}
            value={slotStartsAt}
            isLoading={slots.isLoading}
            disabled={disabled || slots.isFetching || slots.isError}
            onChange={(next) => onSlotChange?.(String(next))}
            options={(slots.currentData ?? []).map((slot) => ({
              value: slot.startsAt,
              label: `${dayjs(slot.startsAt).format('DD MMM, h:mm A')} – ${dayjs(
                slot.endsAt
              ).format('h:mm A')}`,
            }))}
            noOptionsMessage="No interview slots are available. Choose another session."
          />
        </>
      )}
    </Stack>
  );
}

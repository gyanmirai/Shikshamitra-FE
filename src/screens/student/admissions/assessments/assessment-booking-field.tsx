import dayjs from 'dayjs';
import { Alert, Stack, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useGetAssessmentSessionsQuery } from 'src/redux/student/admissions/admission-assessment-sessions-api';

import { normalizeAssessmentDateTime } from './assessment-date-time';

type Props = {
  admissionOfferingId: string;
  workflowStageDefinitionId: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
};

export function AssessmentBookingField({
  admissionOfferingId,
  workflowStageDefinitionId,
  value,
  onChange,
  error,
  disabled,
}: Props) {
  const sessions = useGetAssessmentSessionsQuery({
    admissionOfferingId,
    workflowStageDefinitionId,
  });
  const available = (sessions.currentData ?? []).filter(
    (session) =>
      !session.isCancelled &&
      session.bookedCount < session.capacity &&
      dayjs(normalizeAssessmentDateTime(session.startsAt)).isAfter(dayjs())
  );
  return (
    <Stack spacing={1}>
      {sessions.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={sessions.refetch}>
              Retry
            </Button>
          }
        >
          Unable to load sessions. Retry before booking.
        </Alert>
      )}
      <CustomSelect
        label="Assessment session"
        value={value}
        onChange={(next) => onChange(String(next))}
        disabled={disabled || sessions.isError || sessions.isFetching}
        isLoading={sessions.isLoading}
        error={Boolean(error)}
        helperText={error}
        options={available.map((session) => ({
          value: session.id,
          label: `${session.name} · ${dayjs(normalizeAssessmentDateTime(session.startsAt)).format('DD MMM, h:mm A')} · ${session.location} · ${session.capacity - session.bookedCount} places`,
        }))}
        noOptionsMessage="No available sessions. Create a session under Admissions → Assessments."
      />
    </Stack>
  );
}

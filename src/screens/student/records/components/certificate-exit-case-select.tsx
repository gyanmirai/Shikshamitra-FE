import { useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { useGetStudentRecordTransitionsQuery } from 'src/redux/student/records/student-record-transitions-api';

export default function CertificateExitCaseSelect({
  studentId,
  value,
  onChange,
  disabled,
  canView,
  error,
}: {
  studentId: string;
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
  canView: boolean;
  error?: string;
}) {
  const query = useGetStudentRecordTransitionsQuery(
    { studentId, maxResultCount: 100 },
    { skip: !canView }
  );
  const cases = (query.currentData?.items ?? []).filter(
    (item) =>
      ['Withdraw', 'Transfer', 'Graduate'].includes(item.outcome) &&
      ['Approved', 'Scheduled', 'Applied'].includes(item.status) &&
      (item.outcome !== 'Graduate' || item.status === 'Applied') &&
      !(query.currentData?.items ?? []).some(
        (correction) => correction.correctionOfId === item.id && correction.status === 'Applied'
      )
  );
  const noEligibleCases = !query.isFetching && !query.isError && !cases.length;
  useEffect(() => {
    if (!disabled && !value && cases.length === 1) onChange(cases[0].id);
  }, [disabled, value, cases, onChange]);
  if (!canView)
    return (
      <Typography role="alert" variant="body2">
        School exit access is required to select the linked exit case.
      </Typography>
    );
  return (
    <>
      {query.isError && (
        <StudentFeedback
          notificationKey="student-certificate-exit-cases-failed"
          presentation="toast"
          severity="error"
          toastAction={
            <Button
              size="small"
              color="inherit"
              disabled={disabled}
              onClick={() => query.refetch()}
            >
              Retry exit cases
            </Button>
          }
        >
          Student exit cases could not be loaded.
        </StudentFeedback>
      )}
      <ShakingTextField error={!!error}>
        <CustomSelect
          size="small"
          label="Linked exit case"
          value={value}
          required
          options={cases.map((item) => ({ id: item.id, name: `${item.outcome} · ${item.status}` }))}
          valueKey="id"
          labelKey="name"
          onChange={(id) => onChange(String(id))}
          disabled={disabled || query.isFetching || query.isError}
          isLoading={query.isFetching}
          error={!!error}
          helperTextProps={{ role: error ? 'alert' : undefined }}
          helperText={
            noEligibleCases
              ? 'No approved or completed exit case is available for this student.'
              : error ||
                'The server checks this case against the school’s Leaving Certificate policy.'
          }
          formControlProps={{ fullWidth: true }}
        />
      </ShakingTextField>
    </>
  );
}

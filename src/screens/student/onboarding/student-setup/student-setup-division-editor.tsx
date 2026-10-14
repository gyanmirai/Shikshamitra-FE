'use client';

import { Stack, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { useGetStudentOnboardingPlacementOptionsQuery } from 'src/redux/student/onboarding/student-onboarding-api';

/** Filter options describe the worklist, not all legal placements. Use the case's live choices. */
export default function StudentSetupDivisionEditor({
  caseId,
  currentDivisionId,
  studentName,
  value,
  disabled,
  onChange,
  onBlur,
  error,
  helperText,
}: {
  caseId: string;
  currentDivisionId?: string | null;
  studentName: string;
  value: string;
  disabled: boolean;
  onChange: (value: string | number) => void;
  onBlur: () => void;
  error: boolean;
  helperText?: string;
}) {
  const divisions = useGetStudentOnboardingPlacementOptionsQuery(caseId, {
    refetchOnMountOrArgChange: true,
  });
  return (
    <Stack spacing={0.5} sx={{ minWidth: 180 }}>
      <ShakingTextField error={error || divisions.isError}>
        <CustomSelect
          label="Division"
          multiple={false}
          value={value}
          labelKey="name"
          valueKey="id"
          options={divisions.currentData ?? []}
          size="small"
          disabledValues={(divisions.currentData ?? [])
            .filter((division) => division.isFull && division.id !== currentDivisionId)
            .map((division) => division.id)}
          disabledLabel="Full"
          inputProps={{ 'aria-label': `Division for ${studentName}` }}
          onChange={onChange}
          onBlur={onBlur}
          isLoading={divisions.isFetching}
          disabled={disabled || divisions.isFetching || divisions.isError}
          error={error || divisions.isError}
          helperText={divisions.isError ? 'Could not load available divisions.' : helperText}
        />
      </ShakingTextField>
      {divisions.isError && (
        <Button size="small" variant="text" disabled={disabled} onClick={() => divisions.refetch()}>
          Retry divisions
        </Button>
      )}
    </Stack>
  );
}

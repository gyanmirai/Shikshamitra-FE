import type { SeatingValidationDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import Stack from '@mui/material/Stack';
import { shikshaMitraToast } from 'src/components/toast';

export function showSeatingValidationWarnings(validation: SeatingValidationDto) {
  if (validation.warnings.length === 0) return;

  shikshaMitraToast.warning({
    message: (
      <Stack spacing={0.5}>
        <strong>
          {validation.isValid ? 'Mandatory checks passed.' : 'Seating needs attention.'} Review{' '}
          {validation.warnings.length} warning{validation.warnings.length === 1 ? '' : 's'} before
          publishing.
        </strong>
        {validation.warnings.map((issue, index) => (
          <span key={`${issue.code}-${issue.roomName ?? ''}-${index}`}>
            {issue.message}
            {issue.suggestedActionLabel ? ` Suggested action: ${issue.suggestedActionLabel}.` : ''}
          </span>
        ))}
      </Stack>
    ),
  });
}

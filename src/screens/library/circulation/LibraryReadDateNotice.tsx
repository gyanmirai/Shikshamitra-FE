import type { LibrarySchoolDateEvidence } from 'src/redux/library/read-date-types';
import type { LibraryOverdueClassification } from 'src/redux/library/member-statistics-types';

import { fDate } from 'src/utils/format-time';
import { Alert, Stack, Typography } from '@mui/material';

import { hasSchoolDay } from '../dashboard/dashboard-date-values';

export function LibraryReadDateNotice({
  school,
  overdue,
}: {
  school: LibrarySchoolDateEvidence;
  overdue?: LibraryOverdueClassification;
}) {
  const dated = hasSchoolDay(school);
  const incomplete = !dated || overdue?.overdueClassificationAvailable !== true;
  const unknownMovements =
    (school.unknownIssueDateCount || 0) + (school.unknownReturnDateCount || 0);
  return (
    <Alert severity={incomplete || unknownMovements > 0 ? 'warning' : 'info'}>
      <Stack spacing={0.5}>
        <Typography variant="body2">
          {dated
            ? `${school.schoolDateSource === 'ExplicitSchoolDate' ? 'Chosen school date' : 'School clock date'}: ${fDate(school.schoolAsOfDate)}`
            : 'School-date classification is unavailable.'}
        </Typography>
        {school.schoolDateUnavailableReason && (
          <Typography variant="body2">{school.schoolDateUnavailableReason}</Typography>
        )}
        {overdue?.overdueUnavailableReason && (
          <Typography variant="body2">{overdue.overdueUnavailableReason}</Typography>
        )}
        {unknownMovements > 0 && (
          <Typography variant="body2">
            {unknownMovements} movement {unknownMovements === 1 ? 'date needs' : 'dates need'}{' '}
            review. Date-based totals include confirmed records only.
          </Typography>
        )}
        {(overdue?.unknownDueDateCount || 0) > 0 && !overdue?.overdueUnavailableReason && (
          <Typography variant="body2">Some open loans have unconfirmed due dates.</Typography>
        )}
      </Stack>
    </Alert>
  );
}

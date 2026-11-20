import type { LibraryOverdueClassification } from 'src/redux/library/member-statistics-types';

import { Stack, Typography } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import CustomTooltip from 'src/components/custom-tooltip';

import { loanAsOfDate } from './loan-read-query';

export function MemberOverdueValue({
  count,
  classification,
}: {
  count: number;
  classification: LibraryOverdueClassification;
}) {
  const dated =
    Boolean(loanAsOfDate(classification.overdueAsOfDate || '')) &&
    (classification.overdueDateSource === 'ConfirmedLibraryClock' ||
      classification.overdueDateSource === 'ExplicitSchoolDate');
  const unknown = Math.max(0, classification.unknownDueDateCount || 0);
  const asOf = dated && (
    <Typography component="span" variant="caption" color="text.secondary">
      {classification.overdueDateSource === 'ExplicitSchoolDate'
        ? 'Chosen school date'
        : 'School clock date'}
      : {fDate(classification.overdueAsOfDate)}
    </Typography>
  );
  if (dated && classification.overdueClassificationAvailable === true && !unknown)
    return (
      <Stack component="span" spacing={0.5}>
        <Typography component="span" variant="body2">
          {fNumber(count)}
        </Typography>
        {asOf}
      </Stack>
    );
  return (
    <CustomTooltip
      title={
        classification.overdueUnavailableReason ||
        'A confirmed Library clock and confirmed due dates are needed before this total can be treated as complete.'
      }
    >
      <Stack component="span" spacing={0.5} tabIndex={0}>
        <Typography component="span" variant="body2">
          {dated ? `${fNumber(count)} confirmed overdue` : 'Not classified'}
        </Typography>
        {asOf}
        {unknown > 0 && (
          <Typography component="span" variant="caption" color="text.secondary">
            {fNumber(unknown)} due {unknown === 1 ? 'date needs' : 'dates need'} review
          </Typography>
        )}
      </Stack>
    </CustomTooltip>
  );
}

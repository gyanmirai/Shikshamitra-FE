import { fDate } from 'src/utils/format-time';
import { Stack, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { Label, type LabelColor } from 'src/components/label';
import { mapIssueStatus } from 'src/redux/library/library-adapters';
import { LibraryBookStatus, LibraryBookStatusColors } from 'src/enums/library-book-status';

import type { LibraryLoanRow } from './loan-types';

export function LoanStatusCell({ row }: { row: LibraryLoanRow }) {
  const known = row.storedStatus !== undefined && [0, 1, 2].includes(row.storedStatus);
  const status =
    row.storedStatus === 0 && row.isOverdue === true
      ? LibraryBookStatus.Overdue
      : known
        ? mapIssueStatus(row.storedStatus)
        : undefined;
  const unavailable =
    (row.storedStatus === 0 || row.storedStatus === 2) && typeof row.isOverdue !== 'boolean';
  return (
    <Stack spacing={0.5} alignItems="flex-start">
      <Label
        color={status === undefined ? 'default' : (LibraryBookStatusColors[status] as LabelColor)}
      >
        {status === undefined
          ? 'State unavailable'
          : row.storedStatus === 2 && row.isOverdue !== true
            ? 'Overdue (recorded)'
            : LibraryBookStatus[status]}
      </Label>
      {unavailable && (
        <CustomTooltip
          title={
            row.overdueUnavailableReason ||
            'A confirmed school date and confirmed due-date evidence are needed.'
          }
        >
          <Typography component="span" variant="caption" color="text.secondary" tabIndex={0}>
            Overdue not classified
          </Typography>
        </CustomTooltip>
      )}
      {row.overdueAsOfDate && (
        <Typography variant="caption" color="text.secondary">
          {row.overdueDateSource === 'ExplicitSchoolDate'
            ? 'Chosen school date'
            : row.overdueDateSource === 'ConfirmedLibraryClock'
              ? 'School clock date'
              : 'As-of date'}
          : {fDate(row.overdueAsOfDate)}
        </Typography>
      )}
    </Stack>
  );
}

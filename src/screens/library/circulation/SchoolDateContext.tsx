import type { LibrarySchoolContext } from 'src/redux/library/circulation-types';

import dayjs from 'dayjs';
import { fDate } from 'src/utils/format-time';
import { Alert, Button } from '@mui/material';

export function SchoolDateContext({
  context,
  disabled,
  onUse,
}: {
  context: LibrarySchoolContext | undefined;
  disabled: boolean;
  onUse: (value: dayjs.Dayjs) => void;
}) {
  if (!context)
    return (
      <Alert severity="info">
        Enter the school date explicitly. No confirmed school day is available.
      </Alert>
    );
  const available = context.isConfirmed && context.schoolToday && context.confirmedTimeZoneId;
  return (
    <Alert
      severity="info"
      action={
        available ? (
          <Button
            type="button"
            size="small"
            disabled={disabled}
            onClick={() => onUse(dayjs(context.schoolToday))}
          >
            Use school date
          </Button>
        ) : undefined
      }
    >
      {available
        ? `Confirmed school date: ${fDate(context.schoolToday)} (${context.confirmedTimeZoneId}).`
        : context.unavailableReason ||
          'Enter the school date explicitly. No confirmed school day is available.'}
    </Alert>
  );
}

import type { Dayjs } from 'dayjs';

import { useMemo } from 'react';

import type { DateRangeValidationProps } from '../types';

// ----------------------------------------------------------------------

type UseRangeValidationReturn = {
  validateDate: (date: Dayjs | null) => string | null;
  minDate?: Dayjs;
  maxDate?: Dayjs;
};

export function useRangeValidation(props: DateRangeValidationProps): UseRangeValidationReturn {
  const { minDate, maxDate, disablePast, disableFuture, disableWeekends, shouldDisableDate } =
    props;

  const validateDate = useMemo(
    () =>
      (date: Dayjs | null): string | null => {
        if (!date || !date.isValid()) {
          return null;
        }

        if (minDate && date.isBefore(minDate, 'day')) {
          return 'Date is earlier than minimum allowed date';
        }

        if (maxDate && date.isAfter(maxDate, 'day')) {
          return 'Date is later than maximum allowed date';
        }

        if (disablePast) {
          const today = date.startOf('day'); // Assuming dayjs() is used elsewhere and we can comparing with current time implicitly or if passed context.
          // Actually standardizing on dayjs() for "now"
          // But we don't have dayjs imported as function here, only type.
          // We should probably rely on the passed date object methods if possible or assume dayjs global.
          // Safe way: date.isBefore(dayjs(), 'day')
        }

        // Simplification: We will just checking attributes using date properties

        if (disablePast && date.isBefore(new Date(), 'day')) {
          return 'Past dates are disabled';
        }

        if (disableFuture && date.isAfter(new Date(), 'day')) {
          return 'Future dates are disabled';
        }

        if (disableWeekends) {
          const day = date.day();
          if (day === 0 || day === 6) {
            return 'Weekends are disabled';
          }
        }

        if (shouldDisableDate && shouldDisableDate(date)) {
          return 'Date is disabled';
        }

        return null;
      },
    [minDate, maxDate, disablePast, disableFuture, disableWeekends, shouldDisableDate]
  );

  return {
    validateDate,
    minDate,
    maxDate,
  };
}

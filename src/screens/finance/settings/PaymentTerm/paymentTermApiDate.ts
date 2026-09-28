import type { Dayjs } from 'dayjs';

import { toDateOnly } from 'src/utils/date-only';

// Schedule fields are calendar dates. UTC midnight preserves the selected day
// when the API validates these fields using UTC dates.
export const toPaymentTermApiDate = (value: string | null | Dayjs | undefined): string => {
  const date = toDateOnly(value);
  return date ? `${date}T00:00:00.000Z` : '';
};

import { Typography } from '@mui/material';
import { fDate } from 'src/utils/format-time';
import CustomTooltip from 'src/components/custom-tooltip';

import { confirmedDate } from './school-date';

export function LoanSchoolDate({
  value,
  provenance,
  raw,
}: {
  value?: string | null;
  provenance?: number;
  raw?: string | null;
}) {
  if (confirmedDate(value || null, provenance ?? 0)) return fDate(value);
  if (!value && !raw) return 'Not recorded';
  return (
    <CustomTooltip title={`The school date is unconfirmed. Preserved value: ${raw || value}`}>
      <Typography component="span" variant="body2" tabIndex={0}>
        Unconfirmed
      </Typography>
    </CustomTooltip>
  );
}

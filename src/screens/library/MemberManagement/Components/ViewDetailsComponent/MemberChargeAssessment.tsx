import type { MemberChargeRecord } from 'src/redux/library/libraryMembers/member-charge-types';

import { Label } from 'src/components/label';
import { Stack, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';

export function MemberChargeAssessment({ row }: { row: MemberChargeRecord }) {
  const currency = /^[A-Z]{3}$/.test(row.recordedCurrency || '')
    ? row.recordedCurrency!
    : undefined;
  const text = typeof row.amountText === 'string' && row.amountText !== '' ? row.amountText : null;
  const supported = text !== null && /^\d+(?:\.\d{1,2})?$/.test(text);
  const value =
    text === null
      ? 'Unavailable'
      : supported
        ? formatNumber(text, currency, { fractionDigits: 2 })
        : text;
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2">{value}</Typography>
      {!currency && <Typography variant="caption">Currency unconfirmed</Typography>}
      {text !== null && !supported && (
        <Typography variant="caption" color="warning.main">
          Assessment needs review
        </Typography>
      )}
    </Stack>
  );
}

export function MemberChargeDeclaration({ status }: { status?: number }) {
  const labels = ['Pending declaration', 'Paid declaration', 'Waived declaration'];
  const known = status != null && [0, 1, 2].includes(status);
  return <Label color="default">{known ? labels[status] : 'Declaration unavailable'}</Label>;
}

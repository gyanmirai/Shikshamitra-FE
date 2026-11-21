import type {
  MemberChargeAmounts,
  MemberChargePosition as Position,
} from 'src/redux/library/libraryMembers/member-charge-types';

import { Label } from 'src/components/label';
import { Box, Stack, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { DetailField } from 'src/components/detail-view';

type AmountField = [keyof MemberChargeAmounts, string];
const primaryFields: AmountField[] = [
  ['collectibleAmountText', 'Collectible'],
  ['pendingVerificationAmountText', 'Pending verification'],
];
const moreFields: AmountField[] = [
  ['originalAmountText', 'Original amount'],
  ['acceptedAmountText', 'Accepted amount'],
  ['settledAmountText', 'Settled'],
  ['netWaivedAmountText', 'Net waived'],
  ['financialOutstandingAmountText', 'Financial outstanding'],
  ['refundedAmountText', 'Refunded'],
];
const approvals = ['Pending approval', 'Approved', 'Rejected', 'Voided'];

function PositionAmounts({
  fields,
  amounts,
  currency,
}: {
  fields: AmountField[];
  amounts: MemberChargeAmounts | null;
  currency?: string;
}) {
  return fields.map(([field, label]) => {
    const value = amounts?.[field];
    return (
      <DetailField
        key={field}
        label={label}
        layout="inline"
        value={
          currency && typeof value === 'string' && /^\d+\.\d{2}$/.test(value)
            ? formatNumber(value, currency, { fractionDigits: 2 })
            : 'Unavailable'
        }
        labelTypographyProps={{ sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none' } }}
      />
    );
  });
}

export function MemberChargePosition({ position }: { position?: Position | null }) {
  if (!position || ![0, 1, 2].includes(position.evidence))
    return <Typography variant="body2">Finance position unavailable</Typography>;
  const verified = position.evidence === 1;
  const currency = /^[A-Z]{3}$/.test(position.currency || '') ? position.currency! : undefined;
  const issues = Array.isArray(position.reviewIssues)
    ? position.reviewIssues.filter((issue) => typeof issue === 'string' && issue !== '')
    : [];
  return (
    <Stack spacing={0.5} sx={{ minWidth: 280 }}>
      <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Label color={verified ? 'info' : 'warning'}>
          {verified ? 'Verified' : position.evidence === 0 ? 'Unposted' : 'Needs review'}
        </Label>
        {verified && (
          <Typography variant="caption">
            {position.approvalStatus != null
              ? approvals[position.approvalStatus] || 'Approval unavailable'
              : 'Approval unavailable'}
          </Typography>
        )}
      </Stack>
      {verified ? (
        <>
          {!currency && <Typography variant="caption">Finance currency unavailable</Typography>}
          <PositionAmounts fields={primaryFields} amounts={position.amounts} currency={currency} />
          <Box component="details" sx={{ minWidth: 0 }}>
            <Typography
              component="summary"
              variant="caption"
              color="text.secondary"
              sx={{ cursor: 'pointer', width: 'fit-content' }}
            >
              More amounts
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              <PositionAmounts fields={moreFields} amounts={position.amounts} currency={currency} />
            </Stack>
          </Box>
        </>
      ) : (
        <Typography variant="caption">Canonical amounts unavailable.</Typography>
      )}
      {issues.map((issue, index) => (
        <Typography key={`${index}:${issue}`} variant="caption">
          {issue}
        </Typography>
      ))}
    </Stack>
  );
}

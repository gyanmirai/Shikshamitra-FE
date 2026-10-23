import type {
  ConcessionPolicyOption,
  ConcessionRequestContext,
} from 'src/redux/finance/ConcessionManagement/types';

import { Box, Stack, Alert, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { concessionInstallmentLabel } from '../concessionInstallmentLabel';

export default function RequestEnteredInstallments({
  formik,
  requestContext,
  policy,
}: {
  formik: any;
  requestContext?: ConcessionRequestContext;
  policy: ConcessionPolicyOption;
}) {
  const { values, setFieldValue } = formik;
  const selectedHeads = new Set<string>(values.selectedFeeHeads[values.concessionTypeId] || []);
  const lines = (requestContext?.eligibleDueFees || []).filter(
    (line) => selectedHeads.has(line.feeHeadId) && line.eligibleConcessionAmount > 0
  );
  const entries: Record<string, number | string> = values.dueFeeEntries || {};
  const enteredTotal = lines.reduce((sum, line) => sum + Number(entries[line.dueFeeId] || 0), 0);
  const percentage = policy.calculationMethod === 'Percentage';
  const maximum = percentage
    ? Math.min(100, policy.maximumPercentage ?? 100)
    : (policy.maximumFixedAmount ?? Number.POSITIVE_INFINITY);
  const money = (amount: number) => formatNumber(amount, 'INR');
  const remaining = Math.max(0, Number((maximum - enteredTotal).toFixed(2)));
  const hasRequestLimit = !percentage && Number.isFinite(maximum);
  const columns = {
    xs: 'minmax(0, 1fr) minmax(0, 1fr)',
    md: 'minmax(100px, 0.8fr) minmax(140px, 1fr) minmax(100px, 0.7fr) minmax(180px, 1fr) minmax(130px, 0.8fr)',
  };

  return (
    <Stack spacing={1.5}>
      {hasRequestLimit ? (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            Maximum concession for this request: {money(maximum)}
          </Typography>
          <Typography
            variant="body2"
            role="status"
            aria-label="Concession request allowance"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            Entered: {money(enteredTotal)} | Remaining: {money(remaining)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This allowance is shared across all selected installments.
          </Typography>
        </Box>
      ) : percentage ? (
        <Typography variant="body2" color="text.secondary">
          Maximum concession per installment: {maximum}% of its eligible amount.
        </Typography>
      ) : null}
      {hasRequestLimit && remaining === 0 && (
        <Alert severity="info">
          The policy limit has been reached. Reduce another concession value before entering an
          amount here.
        </Alert>
      )}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: columns,
            gap: 1.5,
            px: 1.5,
            py: 1,
            bgcolor: 'background.neutral',
          }}
        >
          {[
            'Installment',
            'Fee head',
            'Eligible amount',
            percentage ? 'Concession % (editable)' : 'Concession amount (editable)',
            'Estimated reduction',
          ].map((heading) => (
            <Typography key={heading} variant="caption" color="text.secondary">
              {heading}
            </Typography>
          ))}
        </Box>
        {lines.map((line) => {
          const value = Number(entries[line.dueFeeId] || 0);
          // Replacing this row can reuse its current allocation; every other row shares
          // only the unspent request balance. Round the subtraction to money precision.
          const available = percentage
            ? maximum
            : Math.min(
                line.eligibleConcessionAmount,
                Math.max(0, Number((maximum - enteredTotal + value).toFixed(2)))
              );
          const estimate = percentage
            ? Math.round(line.eligibleConcessionAmount * value) / 100
            : Math.min(value, line.eligibleConcessionAmount);
          const error =
            formik.touched.dueFeeEntries?.[line.dueFeeId] &&
            formik.errors.dueFeeEntries?.[line.dueFeeId];
          return (
            <Box
              key={line.dueFeeId}
              sx={{
                display: 'grid',
                gridTemplateColumns: columns,
                gap: 1.5,
                alignItems: 'start',
                px: 1.5,
                py: 1.25,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" sx={{ pt: { md: 1 } }}>
                {concessionInstallmentLabel(line.installmentLabel, line.year)}
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ pt: { md: 1 } }}>
                {line.feeHeadName}
              </Typography>
              <Box
                sx={{
                  pt: { md: 1 },
                  fontVariantNumeric: 'tabular-nums',
                  gridColumn: { xs: '1 / -1', md: 'auto' },
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { md: 'none' } }}
                >
                  Eligible amount:{' '}
                </Typography>
                <Typography variant="body2" component="span">
                  {money(line.eligibleConcessionAmount)}
                </Typography>
              </Box>
              <NumericFormatCustom
                fullWidth
                size="small"
                name={`dueFeeEntries.${line.dueFeeId}`}
                label={percentage ? 'Concession %' : 'Concession amount'}
                value={entries[line.dueFeeId] ?? ''}
                roundToWholeRupees={false}
                decimalScale={2}
                prefix={percentage ? '' : '₹ '}
                suffix={percentage ? '%' : ''}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: {
                    'aria-label': `${line.installmentLabel} ${line.feeHeadName} ${percentage ? 'concession percentage' : 'concession amount'}`,
                  },
                }}
                isAllowed={({ floatValue }) =>
                  floatValue === undefined || (floatValue >= 0 && floatValue <= available)
                }
                onValueChange={(input, source) => {
                  if (source.source === 'event')
                    setFieldValue('dueFeeEntries', { ...entries, [line.dueFeeId]: input.value });
                }}
                onBlur={formik.handleBlur}
                error={Boolean(error)}
                helperText={
                  error ||
                  (percentage
                    ? `Up to ${maximum}%`
                    : `Available: ${money(available)}${value > 0 && hasRequestLimit ? ' (includes this value)' : ''}`)
                }
                FormHelperTextProps={{ sx: { mt: 0.75, mx: 0, minHeight: '1.5em' } }}
              />
              <Box sx={{ pt: 1, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Estimated reduction
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  −{money(estimate)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Calculated
                </Typography>
              </Box>
            </Box>
          );
        })}
        {lines.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 1.5 }}>
            Select eligible fee heads to enter installment amounts.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

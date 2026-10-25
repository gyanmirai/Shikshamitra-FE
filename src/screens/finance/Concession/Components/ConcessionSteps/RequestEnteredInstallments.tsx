import type {
  ConcessionPolicyOption,
  ConcessionRequestContext,
} from 'src/redux/finance/ConcessionManagement/types';

import { Box, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { roundUpWithinAmount } from 'src/utils/whole-rupee-amount';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { concessionInstallmentLabel } from '../concessionInstallmentLabel';
import { validateConcessionInstallments } from '../concessionValueValidation';

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
  const validationErrors = validateConcessionInstallments(
    [...selectedHeads],
    entries,
    requestContext,
    policy
  );
  const enteredTotal = lines.reduce((sum, line) => sum + Number(entries[line.dueFeeId] || 0), 0);
  const percentage = policy.calculationMethod === 'Percentage';
  const maximum = percentage
    ? Math.min(100, policy.maximumPercentage ?? 100)
    : (policy.maximumFixedAmount ?? Number.POSITIVE_INFINITY);
  const money = (amount: number) => formatNumber(amount, 'INR');
  // Respond to the editor's width, rather than the viewport: a wide screen can
  // still have a narrow editor beside the impact panel.
  const columns = 'minmax(0, 1.25fr) minmax(0, 0.8fr) minmax(0, 1.3fr) minmax(0, 0.9fr)';

  return (
    <Box sx={{ minWidth: 0, containerType: 'inline-size' }}>
      <Box
        component="section"
        aria-label="Installment concessions"
        sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}
      >
        <Box
          sx={{
            display: 'none',
            gridTemplateColumns: columns,
            '@container (min-width: 540px)': { display: 'grid' },
            gap: 1,
            px: 1.25,
            py: 0.75,
            bgcolor: 'background.neutral',
          }}
        >
          {[
            'Installment / fee',
            'Eligible',
            percentage ? 'Concession %' : 'Concession amount',
            'Reduction',
          ].map((heading, index) => (
            <Typography
              key={heading}
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: index === 3 ? 'right' : 'left', overflowWrap: 'anywhere' }}
            >
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
            ? roundUpWithinAmount(
                (line.eligibleConcessionAmount * value) / 100,
                line.eligibleConcessionAmount
              )
            : Math.min(value, line.eligibleConcessionAmount);
          const error =
            validationErrors[line.dueFeeId] ||
            (formik.touched.dueFeeEntries?.[line.dueFeeId] &&
              formik.errors.dueFeeEntries?.[line.dueFeeId]);
          return (
            <Box
              key={line.dueFeeId}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                '@container (min-width: 540px)': { gridTemplateColumns: columns },
                gap: 1,
                alignItems: 'center',
                px: 1.25,
                py: 1,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2">
                  {concessionInstallmentLabel(line.installmentLabel, line.year)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {line.feeHeadName}
                </Typography>
              </Box>
              <Box
                sx={{
                  minWidth: 0,
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'right',
                  '@container (min-width: 540px)': { textAlign: 'left' },
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', '@container (min-width: 540px)': { display: 'none' } }}
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
                sx={{ minWidth: 0, '& input': { px: 1 } }}
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
                helperText={error || undefined}
                FormHelperTextProps={{ sx: { mt: 0.5, mx: 0 } }}
              />
              <Box sx={{ minWidth: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', '@container (min-width: 540px)': { display: 'none' } }}
                >
                  Reduction
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {error ? '—' : `−${money(estimate)}`}
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
    </Box>
  );
}

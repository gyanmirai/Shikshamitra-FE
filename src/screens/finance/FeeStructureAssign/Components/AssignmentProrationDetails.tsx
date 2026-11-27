import type { AssignmentHead } from 'src/redux/finance/studentFeeAssignment';

import { Box, Stack, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';

import {
  formatProrationFactor,
  formatInstallmentProration,
  formatSavedProrationExplanation,
} from './assignmentReviewPresentation';

import type { FeeHeadProration } from './assignmentReviewPresentation';

export default function AssignmentProrationDetails({
  head,
  calculation,
  currency,
}: {
  head: AssignmentHead;
  calculation?: FeeHeadProration;
  currency: string;
}) {
  if (!head.included || !calculation) return null;

  const { scheduled, reduction, rules, lines } = calculation;
  const obligation = head.optionalServicePeriods?.length
    ? lines.reduce((total, line) => total + line.proratedAmount, 0)
    : head.obligation;
  if (reduction === 0 && rules.size === 0) return null;

  const money = (amount: number) => formatNumber(amount, currency);
  const factor = lines[0]?.factor;
  const byInstallment =
    lines.length > 1 &&
    (head.amountBasis === 'MonthlyRate' || lines.some((line) => line.factor !== factor));
  const hasSingleFactor = !byInstallment && factor != null;
  const explanations = Array.from(
    new Set(
      lines.flatMap((line) =>
        line.explanation ? [formatSavedProrationExplanation(line.explanation)] : []
      )
    )
  );
  const sharedExplanation =
    explanations.length === 1 && lines.every((line) => line.explanation)
      ? explanations[0]
      : undefined;

  return (
    <Stack
      spacing={0.5}
      sx={{
        minWidth: 0,
        px: 1.25,
        py: 0.75,
        bgcolor: 'action.hover',
        borderRadius: 1,
      }}
    >
      {!!rules.size && (
        <Typography variant="caption" color="text.secondary">
          Applied rule:{' '}
          <Box component="span" sx={{ color: 'text.primary' }}>
            {Array.from(rules).join(', ')}
          </Box>
        </Typography>
      )}
      {(reduction !== 0 || (factor != null && factor !== 1)) && (
        <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {hasSingleFactor
            ? `${money(scheduled)} × ${formatProrationFactor(factor)} → ${money(obligation)}`
            : `${money(scheduled)} − ${money(reduction)} = ${money(obligation)}`}
          {hasSingleFactor &&
            lines.every((line) => line.roundingMode === 'RoundUpRupee') &&
            ' (rounded up to a whole rupee)'}
        </Typography>
      )}
      {byInstallment ? (
        <Box component="details" sx={{ typography: 'caption' }}>
          <Box component="summary" sx={{ cursor: 'pointer', color: 'text.secondary' }}>
            Calculation by installment
          </Box>
          <Stack
            spacing={0.5}
            component="ul"
            divider={
              <Box
                component="li"
                role="presentation"
                sx={{ borderBottom: 1, borderColor: 'divider', listStyle: 'none' }}
              />
            }
            sx={{ m: 0, pl: 0, mt: 0.5, listStyle: 'none', fontVariantNumeric: 'tabular-nums' }}
          >
            {lines.map((line) => (
              <Box component="li" key={line.dueFeeId ?? line.sequence}>
                {line.installmentLabel} {formatInstallmentProration(line, currency)}
                {line.explanation && !sharedExplanation && (
                  <Typography component="div" variant="caption" color="text.secondary">
                    {formatSavedProrationExplanation(line.explanation)}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
          {sharedExplanation && (
            <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {sharedExplanation}
            </Typography>
          )}
        </Box>
      ) : (
        explanations.map((explanation) => (
          <Typography key={explanation} variant="caption" color="text.secondary">
            {explanation}
          </Typography>
        ))
      )}
    </Stack>
  );
}

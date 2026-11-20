import type { AdmissionFeeHead } from 'src/redux/student/admissions/admission-fee-selection-types';

import { fNumber, fCurrency } from 'src/utils/format-number';
import { Box, Stack, Divider, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function formatAdmissionFeeHeadAmount(head: AdmissionFeeHead, currency: string | null) {
  if (head.isVariable) return 'Entered during Finance assignment';
  return currency
    ? fCurrency(head.configuredAmount ?? 0, { currency })
    : fNumber(head.configuredAmount ?? 0);
}

export function AdmissionFeeHeads({
  heads,
  currency,
  label = 'Selected fee heads',
}: {
  heads: AdmissionFeeHead[];
  currency: string | null;
  label?: string;
}) {
  return heads.length ? (
    <Stack
      component="ul"
      spacing={0}
      aria-label={label}
      sx={{ m: 0, p: 0, listStyle: 'none', border: 1, borderColor: 'divider', borderRadius: 1 }}
    >
      {heads.map((head) => (
        <Box
          component="li"
          key={head.feeHeadId}
          sx={{ p: 1, '& + li': { borderTop: 1, borderColor: 'divider' } }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={0.5}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {head.feeHeadName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {head.isOptional ? 'Optional' : 'Mandatory'}
                {head.isOneTime ? ' · One-time' : ''}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ textAlign: { sm: 'right' }, overflowWrap: 'anywhere' }}
            >
              {formatAdmissionFeeHeadAmount(head, currency)}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  ) : (
    <Typography variant="body2" color="text.secondary">
      No fee heads selected.
    </Typography>
  );
}

export function AdmissionFeeSelectionSummary({
  selection,
}: {
  selection?: {
    structureName: string;
    revisionNumber: number;
    heads: AdmissionFeeHead[];
    currency: string | null;
  };
}) {
  const rows = selection && [
    ['Fee structure', selection.structureName],
    ['Revision', String(selection.revisionNumber)],
    ...(selection.currency ? [['Currency', selection.currency]] : []),
    ['Mandatory fee heads', String(selection.heads.filter((head) => !head.isOptional).length)],
    ['Selected optional heads', String(selection.heads.filter((head) => head.isOptional).length)],
  ];

  return (
    <FormSectionCard
      aria-label="Selection Summary"
      title="Selection Summary"
      titleTypographyProps={{ component: 'h4' }}
      icon="mdi:clipboard-check-outline"
      iconSize={16}
      iconContainerSize={28}
      descriptionTooltip="Published Amounts Are Shown for Reference. Finance Calculates Dues and Handles Payment Separately."
      sx={{ minWidth: 0, boxShadow: 'none' }}
    >
      {rows ? (
        <>
          <Divider />
          <Box
            component="dl"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 1,
              m: 0,
            }}
          >
            {rows.map(([label, value]) => (
              <Box key={label} sx={{ display: 'contents' }}>
                <Typography component="dt" variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Select a published fee structure to review its fee heads.
        </Typography>
      )}
    </FormSectionCard>
  );
}

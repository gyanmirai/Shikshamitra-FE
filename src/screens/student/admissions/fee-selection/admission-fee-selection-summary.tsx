import type { AdmissionFeeHead } from 'src/redux/student/admissions/admission-fee-selection-types';

import { fNumber, fCurrency } from 'src/utils/format-number';
import { Box, Stack, Divider, Typography } from '@mui/material';

import { AdmissionDialogTitle } from '../admission-dialog-title';

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
  structureName,
  revisionNumber,
  heads,
  currency,
}: {
  structureName: string;
  revisionNumber: number;
  heads: AdmissionFeeHead[];
  currency: string | null;
}) {
  const mandatory = heads.filter((head) => !head.isOptional);
  const optional = heads.filter((head) => head.isOptional);
  return (
    <Stack
      component="section"
      aria-label="Selection summary"
      spacing={1.5}
      sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5, minWidth: 0, height: 1 }}
    >
      <Typography variant="subtitle2">
        <AdmissionDialogTitle
          title="Selection summary"
          helpText="Published amounts are shown for reference. Finance calculates dues and handles payment separately."
        />
      </Typography>
      <Divider />
      <Box
        component="dl"
        sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 1, m: 0 }}
      >
        {[
          ['Fee structure', structureName],
          ['Revision', String(revisionNumber)],
          ...(currency ? [['Currency', currency]] : []),
          ['Mandatory fee heads', String(mandatory.length)],
          ['Selected optional heads', String(optional.length)],
        ].map(([label, value]) => (
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
    </Stack>
  );
}

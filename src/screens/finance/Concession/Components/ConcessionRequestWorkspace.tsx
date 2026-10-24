import type { ReactNode } from 'react';
import type {
  ConcessionPolicyOption,
  ConcessionEligibleDueFee,
  ConcessionRequestPreview,
} from 'src/redux/finance/ConcessionManagement/types';

import { GlobalIcons } from 'src/utils/icons';
import { useId, useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { FormSectionHeader } from 'src/components/form-section-card';
import { Box, Stack, Paper, Alert, Divider, Skeleton, Typography } from '@mui/material';

import { concessionInstallmentLabel } from './concessionInstallmentLabel';
import ConcessionFeeHeadSelection, {
  type ConcessionSelectableFeeHead,
} from './ConcessionFeeHeadSelection';

type Props = {
  policyFields: ReactNode;
  feeHeads: ConcessionSelectableFeeHead[];
  installments: ConcessionEligibleDueFee[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  policy?: ConcessionPolicyOption;
  preview?: ConcessionRequestPreview | null;
  loading?: boolean;
  feeSelectionMessage?: ReactNode;
  valueFields?: ReactNode;
  documents?: ReactNode;
  remarks?: ReactNode;
  missingDocumentNames?: string[];
};

export default function ConcessionRequestWorkspace({
  policyFields,
  feeHeads,
  installments,
  selectedIds,
  onToggle,
  policy,
  preview,
  loading = false,
  feeSelectionMessage,
  valueFields,
  documents,
  remarks,
  missingDocumentNames = [],
}: Props) {
  const detailsId = useId();
  const detailsRef = useRef<HTMLElement>(null);
  const [inspectedId, setInspectedId] = useState('');
  const inspectFee = (id: string) => {
    setInspectedId(id);
    const panel = detailsRef.current;
    const grid = panel?.parentElement;
    if (panel && grid && panel.getBoundingClientRect().top > grid.getBoundingClientRect().top + 1) {
      panel.scrollIntoView?.({ block: 'start' });
      panel.focus({ preventScroll: true });
    }
  };
  const activeHead =
    feeHeads.find((head) => head.feeHeadId === inspectedId) ??
    feeHeads.find((head) => selectedIds.includes(head.feeHeadId)) ??
    feeHeads[0];
  const lines = installments.filter((line) => line.feeHeadId === activeHead?.feeHeadId);
  const included = Boolean(activeHead && selectedIds.includes(activeHead.feeHeadId));
  const result =
    included && !feeSelectionMessage
      ? preview?.feeHeadConcessions.find((head) => head.feeHeadId === activeHead?.feeHeadId)
      : undefined;
  const isAutomatic = policy?.valueSource === 'PolicyFixed';
  const automaticValue =
    policy?.calculationMethod === 'Percentage'
      ? `${policy.percentageValue ?? 0}% reduction`
      : policy?.calculationMethod === 'FixedAmount'
        ? `${formatNumber(policy.fixedAmount ?? 0, 'INR')} concession`
        : 'Full waiver';

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', minWidth: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          '@container (min-width: 850px)': {
            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          },
        }}
      >
        <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
          <FormSectionHeader
            icon={GlobalIcons.receiptIcon}
            title="Policy & Fees"
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            descriptionTooltip="Choose a policy and concession type, select eligible fees, and inspect each fee in the detail panel."
          />
          {policyFields}
          {isAutomatic && (
            <Stack direction="row" gap={1} alignItems="flex-start" sx={{ color: 'primary.main' }}>
              <Iconify icon="solar:check-read-linear" width={20} sx={{ flexShrink: 0 }} />
              <Typography variant="body2">
                {automaticValue} applied automatically to selected fees
              </Typography>
            </Stack>
          )}
          <Box>
            {feeSelectionMessage || (
              <ConcessionFeeHeadSelection
                feeHeads={feeHeads}
                installments={installments}
                selectedIds={selectedIds}
                activeId={activeHead?.feeHeadId}
                detailsId={detailsId}
                onInspect={inspectFee}
                onToggle={(id) => {
                  setInspectedId(id);
                  onToggle(id);
                }}
              />
            )}
          </Box>
          {valueFields}
          {documents && (
            <Stack spacing={2}>
              <FormSectionHeader
                icon={GlobalIcons.doc}
                title="Required Documents"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                descriptionTooltip="Attach supporting documents for the selected concession type. Required evidence must be uploaded before submission."
              />
              {documents}
            </Stack>
          )}
          {remarks}
        </Stack>
        <Box
          component="aside"
          ref={detailsRef}
          tabIndex={-1}
          id={detailsId}
          aria-label="Fee details and request summary"
          sx={{
            minWidth: 0,
            bgcolor: 'background.neutral',
            borderTop: 1,
            borderColor: 'divider',
            '@container (min-width: 850px)': {
              borderTop: 0,
              borderLeft: 1,
              borderColor: 'divider',
            },
          }}
        >
          <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
            <FormSectionHeader
              icon={GlobalIcons.receiptIcon}
              title="Fee Details"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              descriptionTooltip="Inspect the original, paid, and eligible amounts for one fee. Opening details does not change your selection."
            />
            {activeHead && !feeSelectionMessage ? (
              <Stack spacing={2.5}>
                <Box>
                  <Typography component="h3" variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                    {activeHead.feeHeadName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Original{' '}
                    {lines.length
                      ? formatNumber(
                          lines.reduce((total, line) => total + line.originalAmount, 0),
                          'INR'
                        )
                      : '—'}
                    {' · '}Paid{' '}
                    {lines.length
                      ? formatNumber(
                          lines.reduce((total, line) => total + line.paidAmount, 0),
                          'INR'
                        )
                      : '—'}
                  </Typography>
                </Box>
                {lines.length > 0 && (
                  <Stack
                    component="ul"
                    aria-label={`${activeHead.feeHeadName} installments`}
                    spacing={1.5}
                    sx={{
                      m: 0,
                      py: 1,
                      pl: 2,
                      listStyle: 'none',
                      borderLeft: 2,
                      borderColor: 'divider',
                    }}
                  >
                    {lines.map((line) => (
                      <Stack
                        component="li"
                        direction="row"
                        justifyContent="space-between"
                        gap={2}
                        key={line.dueFeeId}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {concessionInstallmentLabel(line.installmentLabel, line.year)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatNumber(line.eligibleConcessionAmount, 'INR')}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    Eligible amount
                  </Typography>
                  <Typography variant="subtitle2">
                    {formatNumber(activeHead.amount, 'INR')}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  gap={2}
                  sx={{ color: included ? 'primary.main' : 'text.secondary' }}
                  aria-busy={loading}
                >
                  <Typography variant="body2">
                    Concession
                    {isAutomatic && policy?.calculationMethod === 'Percentage'
                      ? ` · ${policy.percentageValue}%`
                      : ''}
                  </Typography>
                  <Typography variant="subtitle2">
                    {result ? `−${formatNumber(result.discountAmount, 'INR')}` : '—'}
                  </Typography>
                </Stack>
                {!included && (
                  <Typography variant="caption" color="text.secondary">
                    Select this fee to include it in the request.
                  </Typography>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Choose a policy and concession type to inspect eligible fees.
              </Typography>
            )}
            <Divider />
            <Stack spacing={2} aria-busy={loading}>
              <FormSectionHeader
                icon={GlobalIcons.usage}
                title="Entire Request"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                descriptionTooltip="Totals for all selected fees come from the server calculation. Net payable is the selected eligible amount after concession."
              />
              <Stack spacing={1}>
                {[
                  { label: 'Selected eligible amount', amount: preview?.totalEligibleBase },
                  { label: 'Concession reduction', amount: preview?.totalConcessionAmount },
                ].map(({ label, amount }) => (
                  <Stack direction="row" justifyContent="space-between" gap={2} key={label}>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {amount == null ? '—' : formatNumber(amount, 'INR')}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Net payable · selected fees
                </Typography>
                {loading ? (
                  <Skeleton width="70%" height={52} />
                ) : (
                  <Typography
                    variant="h3"
                    component="p"
                    sx={{
                      mt: 1,
                      mb: 0.5,
                      fontVariantNumeric: 'tabular-nums',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {preview ? formatNumber(preview.netPayable, 'INR') : '—'}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {selectedIds.length} fee categor{selectedIds.length === 1 ? 'y' : 'ies'} included
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" role="status">
                {loading
                  ? 'Calculating fee impact…'
                  : !preview
                    ? 'Select fees and complete concession values to calculate the request.'
                    : 'Calculated for all selected fees.'}
              </Typography>
              {missingDocumentNames.length > 0 && (
                <Alert severity="warning">
                  Attach {missingDocumentNames.join(', ')} to enable submission.
                </Alert>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}

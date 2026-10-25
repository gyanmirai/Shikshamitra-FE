import type { ReactNode } from 'react';
import type {
  ConcessionPolicyOption,
  ConcessionEligibleDueFee,
  ConcessionRequestPreview,
} from 'src/redux/finance/ConcessionManagement/types';

import { useId, useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import CustomAccordion from 'src/components/custom-accordian';
import { Box, Stack, Divider, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import ConcessionImpactSummary from './ConcessionImpactSummary';
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
  missingDocumentNames = [],
}: Props) {
  const detailsId = useId();
  const [inspectedId, setInspectedId] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
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
    <Box
      sx={{
        display: 'grid',
        alignItems: 'start',
        gap: 1.5,
        minWidth: 0,
        gridTemplateColumns: 'minmax(0, 1fr)',
        '@container (min-width: 850px)': {
          gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
        },
      }}
    >
      <FormSectionCard
        title="Concession Details"
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        icon={GlobalIcons.receiptIcon}
        iconContainerSize={28}
        contentSpacing={1.25}
        descriptionTooltip="Select a policy, concession type and eligible fees. Enter installment values when the policy allows them."
        action={
          <Label color="default">
            {selectedIds.length} selected fee{selectedIds.length === 1 ? '' : 's'}
          </Label>
        }
        sx={{ p: 1.5, minWidth: 0, containerType: 'inline-size', bgcolor: 'background.paper' }}
      >
        {policyFields}
        <Box>
          {feeSelectionMessage || (
            <ConcessionFeeHeadSelection
              feeHeads={feeHeads}
              installments={installments}
              selectedIds={selectedIds}
              activeId={activeHead?.feeHeadId}
              detailsId={detailsId}
              detailsExpanded={detailsOpen}
              onInspect={(id) => {
                setInspectedId(id);
                setDetailsOpen(true);
              }}
              onToggle={(id) => {
                setInspectedId(id);
                onToggle(id);
              }}
            />
          )}
        </Box>
        {isAutomatic && (
          <Typography variant="body2" color="text.secondary">
            {automaticValue} applied automatically to selected fees
          </Typography>
        )}
        {valueFields}
        {activeHead && !feeSelectionMessage && (
          <CustomAccordion
            title="Fee Breakdown"
            expanded={detailsOpen}
            onChange={() => setDetailsOpen((value) => !value)}
            content={
              <Stack id={detailsId} component="section" aria-label="Fee details" spacing={1}>
                <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {activeHead.feeHeadName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
                {lines.length > 0 && (
                  <Stack
                    component="ul"
                    aria-label={`${activeHead.feeHeadName} installments`}
                    spacing={1}
                    sx={{ m: 0, p: 0, listStyle: 'none' }}
                  >
                    {lines.map((line) => (
                      <Stack
                        component="li"
                        direction="row"
                        justifyContent="space-between"
                        gap={1}
                        key={line.dueFeeId}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {concessionInstallmentLabel(line.installmentLabel, line.year)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatNumber(line.eligibleConcessionAmount, 'INR')}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
                <Divider />
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Eligible amount
                  </Typography>
                  <Typography variant="body2">{formatNumber(activeHead.amount, 'INR')}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" gap={1} aria-busy={loading}>
                  <Typography variant="body2" color="text.secondary">
                    Concession
                  </Typography>
                  <Typography variant="body2">
                    {result ? `−${formatNumber(result.discountAmount, 'INR')}` : '—'}
                  </Typography>
                </Stack>
                {!included && (
                  <Typography variant="caption" color="text.secondary">
                    Select this fee to include it in the request.
                  </Typography>
                )}
              </Stack>
            }
          />
        )}
      </FormSectionCard>
      <Stack
        component="aside"
        aria-label="Concession impact and supporting documents"
        spacing={1.5}
        sx={{ minWidth: 0 }}
      >
        <ConcessionImpactSummary
          preview={preview}
          selectedFeeHeadCount={selectedIds.length}
          loading={loading}
        />
        {documents && (
          <FormSectionCard
            title="Supporting Documents"
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            icon={GlobalIcons.doc}
            iconContainerSize={28}
            contentSpacing={1}
            sx={{ p: 1.5, bgcolor: 'background.paper' }}
            descriptionTooltip="Upload the evidence required by the selected concession type. File restrictions and any missing requirements appear beside each document."
            action={
              missingDocumentNames.length > 0 ? <Label color="warning">Required</Label> : undefined
            }
          >
            {documents}
          </FormSectionCard>
        )}
      </Stack>
    </Box>
  );
}

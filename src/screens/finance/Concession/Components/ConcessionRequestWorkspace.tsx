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
  preview,
  loading = false,
  feeSelectionMessage,
  valueFields,
  documents,
  missingDocumentNames = [],
}: Props) {
  const detailsId = useId();
  const [inspectedId, setInspectedId] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(true);
  const activeHead =
    feeHeads.find((head) => head.feeHeadId === inspectedId) ??
    feeHeads.find((head) => selectedIds.includes(head.feeHeadId)) ??
    feeHeads[0];

  const renderFeeDetails = (head: ConcessionSelectableFeeHead, headDetailsId: string) => {
    const lines = installments.filter((line) => line.feeHeadId === head.feeHeadId);
    const included = selectedIds.includes(head.feeHeadId);
    const result = included
      ? preview?.feeHeadConcessions.find((item) => item.feeHeadId === head.feeHeadId)
      : undefined;
    const expanded = activeHead?.feeHeadId === head.feeHeadId && detailsOpen;

    return (
      <CustomAccordion
        title="Fee Breakdown"
        expanded={expanded}
        onChange={() => {
          setInspectedId(head.feeHeadId);
          setDetailsOpen(!expanded);
        }}
        content={
          <Stack id={headDetailsId} component="section" aria-label="Fee details" spacing={0.75}>
            {lines.length > 0 && (
              <Stack
                component="ul"
                aria-label={`${head.feeHeadName} installments`}
                spacing={0.5}
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
                    <Typography variant="body2">
                      {concessionInstallmentLabel(line.installmentLabel, line.year)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatNumber(line.eligibleConcessionAmount, 'INR')}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
            <Divider />
            <Box
              aria-busy={loading}
              sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}
            >
              {[
                {
                  label: 'Original fee',
                  value: lines.length
                    ? formatNumber(
                        lines.reduce((total, line) => total + line.originalAmount, 0),
                        'INR'
                      )
                    : '—',
                },
                {
                  label: 'Already paid',
                  value: lines.length
                    ? formatNumber(
                        lines.reduce((total, line) => total + line.paidAmount, 0),
                        'INR'
                      )
                    : '—',
                },
                {
                  label: 'Concession',
                  value: result ? `−${formatNumber(result.discountAmount, 'INR')}` : '—',
                },
              ].map((item) => (
                <Box key={item.label} sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflowWrap: 'anywhere',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
            {!included && (
              <Typography variant="caption" color="text.secondary">
                Select this fee to include it in the request.
              </Typography>
            )}
          </Stack>
        }
      />
    );
  };

  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'start',
        gap: 1,
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
        contentSpacing={1}
        descriptionTooltip="Select a policy, concession type and eligible fees. Enter installment values when the policy allows them."
        action={
          <Label color="default">
            {selectedIds.length} selected fee{selectedIds.length === 1 ? '' : 's'}
          </Label>
        }
        sx={{ p: 1.25, minWidth: 0, containerType: 'inline-size', bgcolor: 'background.paper' }}
      >
        {policyFields}
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            sx={{ mb: 0.75 }}
          >
            <Typography component="h3" variant="subtitle2">
              Eligible Fees
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {feeHeads.length} fee{feeHeads.length === 1 ? '' : 's'} available
            </Typography>
          </Stack>
          {feeSelectionMessage || (
            <ConcessionFeeHeadSelection
              feeHeads={feeHeads}
              installments={installments}
              selectedIds={selectedIds}
              activeId={activeHead?.feeHeadId}
              detailsId={detailsId}
              detailsExpanded={detailsOpen}
              renderDetails={renderFeeDetails}
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
        {valueFields}
      </FormSectionCard>
      <Stack
        component="aside"
        aria-label="Concession impact and supporting documents"
        spacing={1}
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

import type { ConcessionPolicyOption } from 'src/redux/finance/ConcessionManagement/types';

import { Box, Stack, Button, DialogActions } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { formatNumber } from 'src/utils/formate_number';
import { DetailField, DetailGrid } from 'src/components/detail-view';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import {
  CONCESSION_SCOPES,
  CONCESSION_METHODS,
  CONCESSION_VALUE_SOURCES,
  concessionOptionLabel,
} from '../../policies/components/concession/concessionPresentation';

export default function ConcessionRequestPolicyDialog({
  policy,
  onClose,
}: {
  policy: ConcessionPolicyOption;
  onClose: () => void;
}) {
  const fixed = policy.valueSource === 'PolicyFixed';
  const percentage = policy.calculationMethod === 'Percentage';
  const value = percentage
    ? fixed
      ? policy.percentageValue
      : policy.maximumPercentage
    : fixed
      ? policy.fixedAmount
      : policy.maximumFixedAmount;
  const scope = CONCESSION_SCOPES.find((option) => option.value === policy.applyOn);
  // Use the same field typography as the concession policy detail view.
  const field = (label: string, content: React.ReactNode, secondary?: string) => (
    <DetailField label={label} value={content} secondary={secondary} />
  );
  const sectionProps = {
    titleTypographyProps: { variant: 'subtitle1' as const, fontWeight: 600 },
    iconContainerSize: 28,
    contentSpacing: 1.5,
    sx: { p: 1.5, boxShadow: 'none', containerType: 'inline-size' },
  };

  return (
    <CustomDialog
      open
      title="Concession Policy"
      titleInfo="Review the selected policy version's calculation rules and application scope before entering concession values."
      maxWidth="sm"
      hasForm={false}
      guardUnsavedChanges={false}
      handleClose={onClose}
    >
      <DialogScrollContent sx={{ p: 1.5 }}>
        <Stack spacing={1.5}>
          <FormSectionCard
            {...sectionProps}
            title="General Information"
            icon={GlobalIcons.notebook}
            descriptionTooltip="The policy and immutable version selected for this concession request."
            action={<Label color="default">v{policy.version}</Label>}
          >
            <DetailGrid desktopColumns={2}>
              {field('Policy name', policy.policyName)}
              {field('Policy code', policy.policyCode)}
            </DetailGrid>
          </FormSectionCard>
          <FormSectionCard
            {...sectionProps}
            title="Calculation Rules"
            icon={GlobalIcons.receiptIcon}
            descriptionTooltip="How concession values are determined and the maximum permitted by this policy."
          >
            <DetailGrid desktopColumns={2}>
              {field(
                'Value source',
                concessionOptionLabel(CONCESSION_VALUE_SOURCES, policy.valueSource)
              )}
              {field(
                'Calculation method',
                concessionOptionLabel(CONCESSION_METHODS, policy.calculationMethod)
              )}
              {policy.calculationMethod !== 'FullWaiver' &&
                field(
                  fixed ? 'Concession value' : 'Maximum allowed',
                  value == null
                    ? fixed
                      ? '—'
                      : 'Up to the eligible fee amount'
                    : percentage
                      ? `${value}%`
                      : formatNumber(value, 'INR'),
                  !fixed
                    ? percentage
                      ? 'The sum of concession percentages across all selected installments must stay within this request limit.'
                      : 'This limit applies across all selected installments in the request.'
                    : undefined
                )}
            </DetailGrid>
          </FormSectionCard>
          <FormSectionCard
            {...sectionProps}
            title="Application Scope"
            icon={GlobalIcons.assigned}
            descriptionTooltip="Which installments this policy includes and how any paid concession is refunded."
          >
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {field('Apply concession on', scope?.label, scope?.caption)}
              {policy.applyOn === 'AllFees' &&
                field(
                  'Refund creation',
                  policy.autoCreateRefund == null
                    ? '—'
                    : policy.autoCreateRefund
                      ? 'Automatic'
                      : 'Manual',
                  'Applies to the refundable paid portion after concession approval.'
                )}
            </Box>
          </FormSectionCard>
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

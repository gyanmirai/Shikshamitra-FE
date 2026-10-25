import type { ConcessionRequestPreview } from 'src/redux/finance/ConcessionManagement/types';

import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Stack, Divider, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export default function ConcessionImpactSummary({
  preview,
  concessionName,
  selectedFeeHeadCount,
  loading = false,
}: {
  preview?: ConcessionRequestPreview | null;
  concessionName?: string;
  selectedFeeHeadCount: number;
  loading?: boolean;
}) {
  return (
    <FormSectionCard
      title="Concession Impact"
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      icon={GlobalIcons.usage}
      iconContainerSize={28}
      contentSpacing={1}
      sx={{ p: 1.5, bgcolor: 'background.paper', minWidth: 0 }}
      descriptionTooltip={`Server-calculated totals for ${selectedFeeHeadCount} selected fee head${selectedFeeHeadCount === 1 ? '' : 's'}${concessionName ? ` under ${concessionName}` : ''}. Net payable is the eligible fee amount after concession.`}
    >
      <Stack spacing={1} aria-busy={loading} aria-live="polite" aria-atomic="true">
        {[
          { label: 'Before concession', amount: preview?.totalEligibleBase },
          { label: 'Concession', amount: preview?.totalConcessionAmount },
        ].map(({ label, amount }) => (
          <Stack key={label} direction="row" justifyContent="space-between" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
            >
              {amount == null
                ? '—'
                : `${label === 'Concession' ? '−' : ''}${formatNumber(amount, 'INR')}`}
            </Typography>
          </Stack>
        ))}
        <Divider />
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            After concession
          </Typography>
          <Typography
            component="p"
            variant="h5"
            sx={{
              overflowWrap: 'anywhere',
              fontVariantNumeric: 'tabular-nums',
              textAlign: 'right',
            }}
          >
            {preview ? formatNumber(preview.netPayable, 'INR') : '—'}
          </Typography>
        </Stack>
        {(loading || !preview) && (
          <Box
            component="span"
            role="status"
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clipPath: 'inset(50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {loading
              ? 'Calculating fee impact…'
              : !preview
                ? 'Select fees and enter concession values.'
                : ''}
          </Box>
        )}
      </Stack>
    </FormSectionCard>
  );
}

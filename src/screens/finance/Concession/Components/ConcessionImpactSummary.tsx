import type { ConcessionRequestPreview } from 'src/redux/finance/ConcessionManagement/types';

import { Box, Stack, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
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
  const savings =
    preview && preview.totalEligibleBase > 0
      ? ((preview.totalConcessionAmount / preview.totalEligibleBase) * 100).toFixed(1)
      : '0';

  return (
    <FormSectionCard
      icon="mdi:eye-outline"
      title="Concession review"
      descriptionTooltip="Review the server-calculated fee impact before submitting the request."
    >
      <Stack spacing={1.5} aria-busy={loading}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={0.5}>
          <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
            {concessionName || 'Concession'}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            role="status"
            sx={{ minHeight: '1.5em' }}
          >
            {loading
              ? 'Calculating fee impact…'
              : preview
                ? `${savings}% reduction · ${selectedFeeHeadCount} fee head${selectedFeeHeadCount === 1 ? '' : 's'}`
                : 'Enter concession values to calculate the impact.'}
          </Typography>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'Eligible fee amount', amount: preview?.totalEligibleBase },
            { label: 'Concession reduction', amount: preview?.totalConcessionAmount },
            { label: 'Net payable', amount: preview?.netPayable },
          ].map((metric, index) => (
            <Box
              key={metric.label}
              sx={{
                p: 1.5,
                minWidth: 0,
                bgcolor: index === 2 ? 'background.neutral' : 'transparent',
                borderLeftWidth: { xs: 0, sm: index > 0 ? 1 : 0 },
                borderLeftStyle: 'solid',
                borderTopWidth: { xs: index > 0 ? 1 : 0, sm: 0 },
                borderTopStyle: 'solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {metric.label}
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {metric.amount == null ? '—' : formatNumber(metric.amount, 'INR')}
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </FormSectionCard>
  );
}
